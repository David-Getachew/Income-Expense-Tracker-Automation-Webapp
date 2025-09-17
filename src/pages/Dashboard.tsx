import React, { useState } from 'react';
import Layout from '@/components/Layout';
import KPICard from '@/components/KPICard';
import DateFilter from '@/components/DateFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent,
  ChevronsUpDown,
  CalendarIcon
} from 'lucide-react';
import { 
  mockTransactions, 
  mockDailyStats, 
  mockCategoryBreakdown 
} from '@/data/mockData';
import { format, isWithinInterval } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Mock data for top selling items
const mockTopSellingItems = [
  { "item": "Cappuccino", "revenue": 1200, "quantity": 45 },
  { "item": "Falafel Sandwich", "revenue": 950, "quantity": 30 },
  { "item": "Potato Chips", "revenue": 780, "quantity": 50 },
  { "item": "Shiro Injera Plate", "revenue": 670, "quantity": 25 },
  { "item": "Green Tea", "revenue": 540, "quantity": 40 },
  { "item": "Samosa", "revenue": 430, "quantity": 35 }
];

// Mock data for category breakdown
const mockCategoryRevenue = [
  { "category": "Food", "revenue": 2250 },
  { "category": "Beverages", "revenue": 1740 }
];

const Dashboard: React.FC = () => {
  // Date filter state
  const [dateRange, setDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>({ from: undefined, to: undefined });

  // Transaction history filter state
  const [transactionDateRange, setTransactionDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>({ from: undefined, to: undefined });

  // Transaction sorting state
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter transactions based on date range
  const filterTransactionsByDate = () => {
    if (!dateRange.from || !dateRange.to) return mockTransactions;
    
    return mockTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, {
        start: dateRange.from!,
        end: dateRange.to!
      });
    });
  };

  // Filter daily stats based on date range
  const filterDailyStatsByDate = () => {
    if (!dateRange.from || !dateRange.to) return mockDailyStats;
    
    return mockDailyStats.filter(stat => {
      const statDate = new Date(stat.date);
      return isWithinInterval(statDate, {
        start: dateRange.from!,
        end: dateRange.to!
      });
    });
  };

  // Filter transaction history based on its own date filter
  const filterTransactionHistory = () => {
    if (!transactionDateRange.from || !transactionDateRange.to) return mockTransactions;
    
    return mockTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, {
        start: transactionDateRange.from!,
        end: transactionDateRange.to!
      });
    });
  };

  // Sort transaction history
  const sortedTransactions = React.useMemo(() => {
    const filtered = filterTransactionHistory();
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortDirection === 'asc' ? 
        dateA.getTime() - dateB.getTime() : 
        dateB.getTime() - dateA.getTime();
    });
  }, [transactionDateRange, sortDirection]);

  // Paginate transactions
  const paginatedTransactions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  // Calculate KPIs based on filtered data
  const filteredTransactions = filterTransactionsByDate();
  const totalIncome = filteredTransactions
    .filter(t => t.entryType === 'Income')
    .reduce((sum, t) => sum + (t.quantity * t.pricePerUnit), 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.entryType === 'Expense')
    .reduce((sum, t) => sum + (t.quantity * t.pricePerUnit), 0);
  
  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((profit / totalIncome) * 100) : 0;

  // Colors for charts
  const COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const CATEGORY_COLORS = ['#1E3A8A', '#10B981'];

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return "All Time";
    return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
  };

  // Format daily stats description
  const formatDailyStatsDescription = () => {
    if (!dateRange.from || !dateRange.to) return "All time performance";
    return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")} performance`;
  };

  // Handle sort direction toggle
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your food business performance</p>
          </div>
          <div className="flex items-center gap-2">
            <DateFilter dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Income"
            value={`${totalIncome.toLocaleString()} ETB`}
            icon={DollarSign}
            isPositive={true}
          />
          <KPICard
            title="Total Expenses"
            value={`${totalExpenses.toLocaleString()} ETB`}
            icon={TrendingDown}
            isPositive={false}
          />
          <KPICard
            title="Profit/Loss"
            value={`${profit.toLocaleString()} ETB`}
            icon={profit >= 0 ? TrendingUp : TrendingDown}
            isPositive={profit >= 0}
          />
          <KPICard
            title="Profit Margin"
            value={`${profitMargin.toFixed(1)}%`}
            icon={Percent}
            isPositive={profitMargin >= 0}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Income vs Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Income vs Expenses</CardTitle>
              <CardDescription>{formatDailyStatsDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filterDailyStatsByDate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} ETB`, '']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Income"
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Expenses"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Best performing items by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={mockTopSellingItems}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="item" 
                    type="category" 
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `${value} ETB` : `${value} units`,
                      name === 'revenue' ? 'Revenue' : 'Quantity'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue (ETB)" fill="#1E3A8A" />
                  <Bar dataKey="quantity" name="Quantity Sold" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <CardDescription>Distribution of expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockCategoryBreakdown.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="category"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockCategoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} ETB`, 'Amount']}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold"
                  >
                    {mockCategoryBreakdown
                      .filter(item => item.value > 0)
                      .reduce((sum, item) => sum + item.value, 0)
                      .toLocaleString()} ETB
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Food vs Beverages revenue distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockCategoryRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="revenue"
                    nameKey="category"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockCategoryRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} ETB`, 'Revenue']}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold"
                  >
                    {mockCategoryRevenue
                      .reduce((sum, item) => sum + item.revenue, 0)
                      .toLocaleString()} ETB
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History Table */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All business transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Filter Dates</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={transactionDateRange}
                    onSelect={setTransactionDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortDirection}
                className="flex items-center gap-2"
              >
                <ChevronsUpDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount (ETB)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-nowrap">{transaction.date}</TableCell>
                    <TableCell className="font-medium">{transaction.item}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.entryType === 'Income' ? 'default' : 'destructive'}
                        className={transaction.entryType === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {transaction.entryType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(transaction.quantity * transaction.pricePerUnit).toLocaleString()} ETB
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {sortedTransactions.length > itemsPerPage && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(itemsPerPage, sortedTransactions.length - (currentPage - 1) * itemsPerPage)} of {sortedTransactions.length} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sortedTransactions.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(sortedTransactions.length / itemsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;