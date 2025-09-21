import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, RotateCcw } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Transaction } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

const DataEntry: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem('foodBizTransactions');
    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);
      // Check if transactions are from today
      if (parsed.date && isToday(new Date(parsed.date))) {
        return parsed.transactions;
      }
    }
    return [];
  });
  
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    pricePerUnit: '',
    entryType: '',
    category: '',
    customCategory: '',
    date: new Date()
  });

  const categories = ['Food', 'Beverages', 'Labor', 'Supply', 'Other'];

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('foodBizTransactions', JSON.stringify({
      transactions,
      date: new Date().toISOString()
    }));
  }, [transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item || !formData.quantity || !formData.pricePerUnit || !formData.entryType || !formData.category) {
      showError('Please fill in all required fields');
      return;
    }

    if (formData.category === 'Other' && !formData.customCategory) {
      showError('Please specify the custom category');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now(),
      item: formData.item,
      quantity: parseInt(formData.quantity),
      pricePerUnit: parseFloat(formData.pricePerUnit),
      entryType: formData.entryType as 'Income' | 'Expense',
      category: formData.category === 'Other' ? formData.customCategory as any : formData.category as any,
      date: format(formData.date, 'yyyy-MM-dd')
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        setTransactions([newTransaction, ...transactions]);
        // Reset form
        setFormData({
          item: '',
          quantity: '',
          pricePerUnit: '',
          entryType: '',
          category: '',
          customCategory: '',
          date: new Date()
        });

        showSuccess('Transaction added successfully!');
      } else {
        throw new Error(await response.text());
      }
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      // Parse detailed error message if available
      let errorMessage = 'Failed to add transaction. Please try again.';
      try {
        // The error message is a JSON stringified object
        const errorDetails = JSON.parse(err.message);
        if (errorDetails.details && Array.isArray(errorDetails.details)) {
          errorMessage = `Missing or invalid fields: ${errorDetails.details.join(', ')}`;
        } else if (errorDetails.error) {
          errorMessage = errorDetails.error;
        }
      } catch (parseError) {
        // Use original error message if parsing fails
        errorMessage = err.message || errorMessage;
      }
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearSessionTransactions = () => {
    setTransactions([]);
    showSuccess('Session transactions cleared');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Entry</h1>
          <p className="text-gray-600">Add new income and expense transactions</p>
        </div>

        {/* Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
            <CardDescription>Enter the details of your business transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="item">Item Name *</Label>
                  <Input
                    id="item"
                    value={formData.item}
                    onChange={(e) => handleInputChange('item', e.target.value)}
                    placeholder="e.g., Injera, Oil, Labor"
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                {/* Price per Unit */}
                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit">Price per Unit (ETB) *</Label>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerUnit}
                    onChange={(e) => handleInputChange('pricePerUnit', e.target.value)}
                    placeholder="Enter price"
                    required
                  />
                </div>

                {/* Entry Type */}
                <div className="space-y-2">
                  <Label>Entry Type *</Label>
                  <Select value={formData.entryType} onValueChange={(value) => handleInputChange('entryType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Date of Entry *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleInputChange('date', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Custom Category Input */}
              {formData.category === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="customCategory">Specify Category *</Label>
                  <Input
                    id="customCategory"
                    value={formData.customCategory}
                    onChange={(e) => handleInputChange('customCategory', e.target.value)}
                    placeholder="Enter custom category"
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Transactions you've added in this session</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSessionTransactions}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Clear Session
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.item}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{transaction.pricePerUnit} ETB</TableCell>
                      <TableCell className="font-medium">
                        {(transaction.quantity * transaction.pricePerUnit).toLocaleString()} ETB
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.entryType === 'Income' ? 'default' : 'destructive'}
                          className={transaction.entryType === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {transaction.entryType}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DataEntry;