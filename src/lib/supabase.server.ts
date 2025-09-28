// src/lib/supabase.server.ts
// Secure server-side Supabase client with helper functions
// This file should NEVER be imported in client-side code

import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Ensure these environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create Supabase client with service role key for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Validation schemas
const DailyTransactionSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  price_per_quantity: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  item_type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Item type must be either "income" or "expense"' })
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  processed: z.boolean().default(false)
});

type DailyTransaction = z.infer<typeof DailyTransactionSchema>;

/**
 * Validates and inserts a daily transaction into the database
 * @param tx - Transaction data to insert
 * @returns Promise with the inserted row or error
 */
export async function insertDailyTransaction(tx: Partial<DailyTransaction>) {
  try {
    // Validate the transaction data
    const validatedTx = DailyTransactionSchema.parse({
      ...tx,
      processed: false // Always set to false
    });

    // Insert into daily_income_expense table
    const { data, error } = await supabaseAdmin
      .from('daily_income_expense')
      .insert([validatedTx])
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting daily transaction:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true, data, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return { 
        success: false, 
        data: null, 
        error: `Validation error: ${validationErrors.join(', ')}` 
      };
    }
    
    console.error('Unexpected error in insertDailyTransaction:', err);
    return { 
      success: false, 
      data: null, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Fetches weekly summaries from the database
 * @returns Promise with array of weekly summaries
 */
export async function fetchWeeklySummaries() {
  try {
    // Query weekly_summaries table ordered by most recent first
    const { data, error } = await supabaseAdmin
      .from('weekly_summaries')
      .select('*')
      .order('week_start', { ascending: false });

    if (error) {
      console.error('Error fetching weekly summaries:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    // Process the data to include download URLs
    const processedData = await Promise.all((data || []).map(async (row) => {
      let download_url = row.pdf_url || '';
      
      // If pdf_url points to Supabase Storage, generate a signed URL
      if (row.pdf_url && row.pdf_url.startsWith('storage/')) {
        try {
          const pathParts = row.pdf_url.split('/');
          if (pathParts.length >= 3) {
            const bucket = pathParts[1];
            const filePath = pathParts.slice(2).join('/');
            
            const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
              .storage
              .from(bucket)
              .createSignedUrl(filePath, 3600); // 1 hour expiry
            
            if (!signedUrlError && signedUrlData?.signedUrl) {
              download_url = signedUrlData.signedUrl;
            }
          }
        } catch (err) {
          console.error('Error generating signed URL:', err);
          // Keep the original URL if signing fails
        }
      }
      
      return {
        ...row,
        download_url
      };
    }));

    return { success: true, data: processedData, error: null };
  } catch (err) {
    console.error('Unexpected error in fetchWeeklySummaries:', err);
    return { 
      success: false, 
      data: [], 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Checks for duplicate transactions (same item_name, date, and price_per_quantity)
 * @param tx - Transaction data to check
 * @returns Promise with boolean indicating if duplicate exists
 */
export async function checkForDuplicate(tx: { item_name: string; date: string; price_per_quantity: number }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('daily_income_expense')
      .select('id')
      .eq('item_name', tx.item_name)
      .eq('date', tx.date)
      .eq('price_per_quantity', tx.price_per_quantity)
      .limit(1);

    if (error) {
      console.error('Error checking for duplicate:', error);
      return false; // Assume no duplicate if error occurs
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('Unexpected error in checkForDuplicate:', err);
    return false; // Assume no duplicate if error occurs
  }
}

export { supabaseAdmin };

