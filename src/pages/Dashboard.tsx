import React, { useState, useEffect } from 'react';
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
  format, 
  isWithinInterval, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  differenceInDays 
} from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { getTransactions, getDashboardData, getKpis, getTopRevenueItems, getExpensesByCategory } from '@/lib/api';

const Dashboard: React.FC = () => {
  // Global date filter state
  const [dateRange, setDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      from: subDays(today, 30),
      to: today
    };
  });

  // Section-specific date filter states
  const [topItemsDateRange, setTopItemsDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      from: subDays(today, 30),
      to: today
    };
  });

  const [categoryDateRange, setCategoryDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      from: subDays(today, 30),
      to: today
    };
  });

  const [topSellingDateRange, setTopSellingDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      from: subDays(today, 30),
      to: today
    };
  });

  // Transaction history filter state
  const [transactionDateRange, setTransactionDateRange] = useState<{ 
    from: Date | undefined; 
    to: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      from: subDays(today, 30),
      to: today
    };
  });

  // Data states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  
  // KPI states
  const [kpiData, setKpiData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  });
  
  // Loading states
  const [loading, setLoading] = useState({
    kpis: true,
    graph: true,
    topItems: true,
    expenses: true,
    transactions: true
  });
  
  // Error states
  const [error, setError] = useState({
    kpis: null,
    graph: null,
    topItems: null,
    expenses: null,
    transactions: null
  });

  // Transaction sorting state
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch KPIs when dateRange changes
  useEffect(() => {
    const fetchKpis = async () => {
      setLoading(prev => ({ ...prev, kpis: true }));
      setError(prev => ({ ...prev, kpis: null }));
      
      try {
        const kpiData = await getKpis(
          dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
          dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
        ) || { total_income: 0, total_expense: 0, net_income: 0 };
        
        const totalIncome = kpiData.total_income || 0;
        const totalExpenses = kpiData.total_expense || 0;
        const netProfit = kpiData.net_income || 0;
        const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100) : 0;
        
        setKpiData({
          totalIncome,
          totalExpenses,
          netProfit,
          profitMargin
        });
      } catch (err: any) {
        console.error('Error fetching KPIs:', err);
        setError(prev => ({ ...prev, kpis: err.message || 'Failed to load KPIs' }));
      } finally {
        setLoading(prev => ({ ...prev, kpis: false }));
      }
    };

    fetchKpis();
  }, [dateRange]);

  // Fetch graph data when dateRange changes
  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(prev => ({ ...prev, graph: true }));
      setError(prev => ({ ...prev, graph: null }));
      
      try {
        const response = await getDashboardData(
          dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
          dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
        );
        
        // Handle the response format from the API
        // API returns { success: true, data: [...], error: null }
        const dashboardData = response?.data || [];
        
        // Map dashboard data to match chart expectations
        const mappedDashboardData = Array.isArray(dashboardData) ? dashboardData.map((stat: any) => ({
          date: stat.label || stat.date,
          income: stat.totalIncome || 0,
          expense: stat.totalExpense || 0
        })) : [];
        setDailyStats(mappedDashboardData);
      } catch (err: any) {
        console.error('Error fetching graph data:', err);
        setError(prev => ({ ...prev, graph: err.message || 'Failed to load graph data' }));
      } finally {
        setLoading(prev => ({ ...prev, graph: false }));
      }
    };

    fetchGraphData();
  }, [dateRange]);

  // Fetch top items when topItemsDateRange changes
  useEffect(() => {
    const fetchTopItems = async () => {
      setLoading(prev => ({ ...prev, topItems: true }));
      setError(prev => ({ ...prev, topItems: null }));
      
      try {
        const topItemsData = await getTopRevenueItems(
          topItemsDateRange.from ? format(topItemsDateRange.from, 'yyyy-MM-dd') : undefined,
          topItemsDateRange.to ? format(topItemsDateRange.to, 'yyyy-MM-dd') : undefined,
          5
        ) || [];
        
        // Map top items to match chart expectations
        const mappedTopItems = Array.isArray(topItemsData) ? topItemsData.map((item: any) => ({
          item: item.item || item.itemName,
          total: item.revenue || item.total_revenue || 0
        })) : [];
        setTopItems(mappedTopItems);
      } catch (err: any) {
        console.error('Error fetching top items:', err);
        setError(prev => ({ ...prev, topItems: err.message || 'Failed to load top items' }));
      } finally {
        setLoading(prev => ({ ...prev, topItems: false }));
      }
    };

    fetchTopItems();
  }, [topItemsDateRange]);

  // Fetch expenses by category when categoryDateRange changes
  useEffect(() => {
    const fetchExpensesByCategory = async () => {
      setLoading(prev => ({ ...prev, expenses: true }));
      setError(prev => ({ ...prev, expenses: null }));
      
      try {
        const categoryBreakdownData = await getExpensesByCategory(
          categoryDateRange.from ? format(categoryDateRange.from, 'yyyy-MM-dd') : undefined,
          categoryDateRange.to ? format(categoryDateRange.to, 'yyyy-MM-dd') : undefined
        ) || [];
        
        // Map category breakdown to match chart expectations
        const mappedCategoryBreakdown = Array.isArray(categoryBreakdownData) ? categoryBreakdownData.map((item: any) => ({
          category: item.category,
          value: item.amount || item.total || item.value || 0,
          percent: item.percent || 0
        })) : [];
        setCategoryBreakdown(mappedCategoryBreakdown);
      } catch (err: any) {
        console.error('Error fetching expenses by category:', err);
        setError(prev => ({ ...prev, expenses: err.message || 'Failed to load expenses data' }));
      } finally {
        setLoading(prev => ({ ...prev, expenses: false }));
      }
    };

    fetchExpensesByCategory();
  }, [categoryDateRange]);

  // Fetch transactions when transactionDateRange changes
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(prev => ({ ...prev, transactions: true }));
      setError(prev => ({ ...prev, transactions: null }));
      
      try {
        const transactionsData = await getTransactions({
          start: transactionDateRange.from ? format(transactionDateRange.from, 'yyyy-MM-dd') : undefined,
          end: transactionDateRange.to ? format(transactionDateRange.to, 'yyyy-MM-dd') : undefined
        }) || { rows: [] };
        
        // Map transactions to correct format
        const mappedTransactions = Array.isArray(transactionsData.rows) ? transactionsData.rows.map((t: any) => ({
          id: t.id,
          item_name: t.item_name,
          quantity: t.quantity,
          price_per_quantity: t.price_per_quantity,
          item_type: t.item_type,
          category: t.category,
          date: t.date
        })) : [];
        setTransactions(mappedTransactions);
      } catch (err: any) {
        console.error('Error fetching transactions:', err);
        setError(prev => ({ ...prev, transactions: err.message || 'Failed to load transactions' }));
      } finally {
        setLoading(prev => ({ ...prev, transactions: false }));
      }
    };

    fetchTransactions();
  }, [transactionDateRange]);

  // Filter transaction history
  const filteredTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortDirection === 'asc' ? 
        dateA.getTime() - dateB.getTime() : 
        dateB.getTime() - dateA.getTime();
    });
  }, [transactions, sortDirection]);

  // Paginate transactions
  const paginatedTransactions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  // Colors for charts
  const COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Format date range for display
  const formatDateRange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range || !range.from || !range.to) return "Filter";
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`;
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

          {/* Top Items by Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Items by Revenue</CardTitle>
                <CardDescription>Best performing items</CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{formatDateRange(topItemsDateRange)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={topItemsDateRange}
                    onSelect={setTopItemsDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filterTopItemsByDate()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="item" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} ETB`, 'Revenue']}
                    labelFormatter={(label) => `Item: ${label}`}
                  />
                  <Bar dataKey="total" fill="#1E3A8A" name="Revenue (ETB)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses by Category */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Distribution of expense categories</CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{formatDateRange(categoryDateRange)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={categoryDateRange}
                    onSelect={setCategoryDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filterCategoryBreakdownByDate()}
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
                    {filterCategoryBreakdownByDate().map((entry, index) => (
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
                    {filterCategoryBreakdownByDate()
                      .reduce((sum, item) => sum + item.value, 0)
                      .toLocaleString()} ETB
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Selling Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>Best performing items by revenue and quantity</CardDescription>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>{formatDateRange(topSellingDateRange)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={topSellingDateRange}
                    onSelect={setTopSellingDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={filterTopSellingItemsByDate()}
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
                      name === 'revenue' ? `${value} ETB` : `${value} Units`,
                      name === 'revenue' ? 'Revenue' : 'Quantity Sold'
                    ]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#10B981" />
                  <Bar dataKey="quantity" name="Quantity Sold" fill="#1E3A8A" />
                </BarChart>
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
                    <span>{formatDateRange(transactionDateRange)}</span>
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