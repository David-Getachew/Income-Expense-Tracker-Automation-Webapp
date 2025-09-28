import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { createTransaction } from '@/lib/api';
import { showSuccess, showError } from '@/utils/toast';

// Validation schema
const transactionSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  price_per_quantity: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  item_type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Please select Income or Expense' })
  }),
  date: z.date({
    required_error: 'Date is required'
  })
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Transaction {
  id?: string;
  item_name: string;
  quantity: number;
  price_per_quantity: number;
  category: string;
  item_type: 'income' | 'expense';
  date: string;
}

const categoryOptions = [
  { value: 'Food', label: 'Food' },
  { value: 'Beverage', label: 'Beverage' },
  { value: 'Labor', label: 'Labor' },
  { value: 'Supply', label: 'Supply' },
  { value: 'Other', label: 'Other' }
];

const Forms: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customCategory, setCustomCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateTransaction, setDuplicateTransaction] = useState<Transaction | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date()
    }
  });

  const watchedValues = watch();

  // Load today's transactions from localStorage on component mount
  useEffect(() => {
    loadTodayTransactions();
  }, []);

  // Update form date when selectedDate changes
  useEffect(() => {
    setValue('date', selectedDate);
  }, [selectedDate, setValue]);

  const loadTodayTransactions = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const key = `lookback-${today}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const transactions = JSON.parse(stored);
        setTodayTransactions(Array.isArray(transactions) ? transactions : []);
      } catch (error) {
        console.error('Error parsing stored transactions:', error);
        setTodayTransactions([]);
      }
    }
  };

  const saveTodayTransactions = (transactions: Transaction[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const key = `lookback-${today}`;
    localStorage.setItem(key, JSON.stringify(transactions));
    setTodayTransactions(transactions);
  };

  const checkForDuplicate = (transaction: Transaction): Transaction | null => {
    return todayTransactions.find(t => 
      t.item_name === transaction.item_name && 
      t.date === transaction.date
    ) || null;
  };

  const onSubmit = async (data: TransactionFormData) => {
    const transaction: Transaction = {
      item_name: data.item_name,
      quantity: parseFloat(data.quantity.toString()),
      price_per_quantity: parseFloat(data.price_per_quantity.toString()),
      category: data.category === 'Other' ? customCategory : data.category,
      item_type: data.item_type,
      date: format(data.date, 'yyyy-MM-dd')
    };

    // Check for duplicates in today's buffer
    const duplicate = checkForDuplicate(transaction);
    if (duplicate) {
      setDuplicateTransaction(duplicate);
      setShowDuplicateWarning(true);
      return;
    }

    await submitTransaction(transaction);
  };

  const submitTransaction = async (transaction: Transaction) => {
    setIsSubmitting(true);
    try {
      // Log the transaction data for debugging
      console.log('Submitting transaction:', transaction);
      
      const response = await createTransaction(transaction);
      console.log('Transaction response:', response);
      
      if (response.success || response.row) {
        // Add to today's buffer
        const newTransactions = [...todayTransactions, { ...transaction, id: Date.now().toString() }];
        saveTodayTransactions(newTransactions);
        
        // Reset form
        reset();
        setSelectedDate(new Date());
        setCustomCategory('');
        setShowDuplicateWarning(false);
        setDuplicateTransaction(null);
        
        showSuccess('Transaction added successfully!');
      } else {
        throw new Error(response.error || 'Failed to create transaction');
      }
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      showError(error.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicateConfirm = async () => {
    if (duplicateTransaction) {
      const formData = getValues();
      const transaction: Transaction = {
        item_name: formData.item_name,
        quantity: formData.quantity,
        price_per_quantity: formData.price_per_quantity,
        category: formData.category === 'Other' ? customCategory : formData.category,
        item_type: formData.item_type,
        date: format(formData.date, 'yyyy-MM-dd')
      };
      
      await submitTransaction(transaction);
    }
  };

  const removeFromBuffer = (id: string) => {
    const newTransactions = todayTransactions.filter(t => t.id !== id);
    saveTodayTransactions(newTransactions);
    showSuccess('Transaction removed from today\'s list');
  };

  const calculateTotal = (transactions: Transaction[], type: 'income' | 'expense') => {
    return transactions
      .filter(t => t.item_type === type)
      .reduce((sum, t) => sum + (t.quantity * t.price_per_quantity), 0);
  };

  const todayIncome = calculateTotal(todayTransactions, 'income');
  const todayExpense = calculateTotal(todayTransactions, 'expense');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Entry</h1>
          <p className="text-gray-600">Add new income and expense transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Transaction</CardTitle>
              <CardDescription>Enter transaction details below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="item_name">Item name</Label>
                  <Input
                    id="item_name"
                    {...register('item_name')}
                    placeholder="Enter item name"
                    className={errors.item_name ? 'border-red-500' : ''}
                  />
                  {errors.item_name && (
                    <p className="text-sm text-red-500">{errors.item_name.message}</p>
                  )}
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      {...register('quantity', { valueAsNumber: true })}
                      placeholder="1"
                      className={errors.quantity ? 'border-red-500' : ''}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-500">{errors.quantity.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_per_quantity">Price per unit</Label>
                    <Input
                      id="price_per_quantity"
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      {...register('price_per_quantity', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={errors.price_per_quantity ? 'border-red-500' : ''}
                    />
                    {errors.price_per_quantity && (
                      <p className="text-sm text-red-500">{errors.price_per_quantity.message}</p>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={watchedValues.category || ''}
                    onValueChange={(value) => setValue('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {watchedValues.category === 'Other' && (
                    <Input
                      placeholder="Specify category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  )}
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>

                {/* Item Type */}
                <div className="space-y-2">
                  <Label htmlFor="item_type">Type</Label>
                  <Select
                    value={watchedValues.item_type || ''}
                    onValueChange={(value: 'income' | 'expense') => setValue('item_type', value)}
                  >
                    <SelectTrigger className={errors.item_type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.item_type && (
                    <p className="text-sm text-red-500">{errors.item_type.message}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground',
                          errors.date && 'border-red-500'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>

                {/* Live Preview */}
                {watchedValues.item_name && watchedValues.quantity && watchedValues.price_per_quantity && (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                    <div className="text-sm text-gray-600">
                      <p><strong>Item:</strong> {watchedValues.item_name}</p>
                      <p><strong>Quantity:</strong> {watchedValues.quantity}</p>
                      <p><strong>Price per unit:</strong> {watchedValues.price_per_quantity} ETB</p>
                      <p><strong>Total:</strong> {(watchedValues.quantity * watchedValues.price_per_quantity).toLocaleString()} ETB</p>
                      <div><strong>Type:</strong> 
                        <Badge 
                          variant={watchedValues.item_type === 'income' ? 'default' : 'destructive'}
                          className="ml-2"
                        >
                          {watchedValues.item_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Duplicate Warning */}
                {showDuplicateWarning && duplicateTransaction && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <p className="font-medium">Duplicate transaction detected!</p>
                      <p className="text-sm mt-1">
                        You already have "{duplicateTransaction.item_name}" for {format(new Date(duplicateTransaction.date), 'PPP')}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          onClick={handleDuplicateConfirm}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Add Anyway
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowDuplicateWarning(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Transaction
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Today's Transactions Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Transactions</CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Total Income</div>
                  <div className="text-lg font-bold text-green-700">
                    {todayIncome.toLocaleString()} ETB
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                  <div className="text-lg font-bold text-red-700">
                    {todayExpense.toLocaleString()} ETB
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              {todayTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No transactions added today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price/Unit</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.item_name}
                          </TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>{transaction.price_per_quantity.toLocaleString()} ETB</TableCell>
                          <TableCell>
                            <Badge 
                              variant={transaction.item_type === 'income' ? 'default' : 'destructive'}
                              className={transaction.item_type === 'income' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}
                            >
                              {transaction.item_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(transaction.quantity * transaction.price_per_quantity).toLocaleString()} ETB
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromBuffer(transaction.id!)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Forms;

