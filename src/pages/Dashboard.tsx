import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import KPICard from '@/components/KPICard';
import DateFilter from '@/components/DateFilter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { getTransactions, getDashboardData, getKpis, getTopRevenueItems, getExpensesByCategory } from '@/lib/api';
import { format, isWithinInterval, subMonths, startOfMonth, endOfMonth, differenceInDays, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const Dashboard: React.FC = () => {
  // Independent filter states
  const [graphFilter, setGraphFilter] = useState<{ 
    start: Date | undefined; 
    end: Date | undefined;
    granularity: 'auto' | 'daily' | 'weekly';
  }>(() => {
    const today = new Date();
    return {
      start: subDays(today, 30),
      end: today,
      granularity: 'auto'
    };
  });

  const [kpiFilter, setKpiFilter] = useState<{ 
    start: Date | undefined; 
    end: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      start: subDays(today, 30),
      end: today
    };
  });

  const [topItemsFilter, setTopItemsFilter] = useState<{ 
    start: Date | undefined; 
    end: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      start: subDays(today, 30),
      end: today
    };
  });

  const [expensesFilter, setExpensesFilter] = useState<{ 
    start: Date | undefined; 
    end: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      start: subDays(today, 30),
      end: today
    };
  });

  const [transactionsFilter, setTransactionsFilter] = useState<{ 
    start: Date | undefined; 
    end: Date | undefined 
  }>(() => {
    const today = new Date();
    return {
      start: subDays(today, 30),
      end: today
    };
  });

  // Wrapper functions to handle type conversion for Calendar onSelect handlers
  const handleGraphFilterSelect = (range: { start: Date | undefined; end?: Date | undefined } | undefined) => {
    if (range) {
      setGraphFilter(prev => ({ 
        ...prev,
        start: range.start, 
        end: range.end || range.start 
      }));
    } else {
      setGraphFilter(prev => ({ ...prev, start: undefined, end: undefined }));
    }
  };

  const handleKpiFilterSelect = (range: { start: Date | undefined; end?: Date | undefined } | undefined) => {
    if (range) {
      setKpiFilter({ 
        start: range.start, 
        end: range.end || range.start 
      });
    } else {
      setKpiFilter({ start: undefined, end: undefined });
    }
  };

  const handleTopItemsFilterSelect = (range: { start: Date | undefined; end?: Date | undefined } | undefined) => {
    if (range) {
      setTopItemsFilter({ 
        start: range.start, 
        end: range.end || range.start 
      });
    } else {
      setTopItemsFilter({ start: undefined, end: undefined });
    }
  };

  const handleExpensesFilterSelect = (range: { start: Date | undefined; end?: Date | undefined } | undefined) => {
    if (range) {
      setExpensesFilter({ 
        start: range.start, 
        end: range.end || range.start 
      });
    } else {
      setExpensesFilter({ start: undefined, end: undefined });
    }
  };

  const handleTransactionsFilterSelect = (range: { start: Date | undefined; end?: Date | undefined } | undefined) => {
    if (range) {
      setTransactionsFilter({ 
        start: range.start, 
        end: range.end || range.start 
      });
    } else {
      setTransactionsFilter({ start: undefined, end: undefined });
    }
  };

  // Transaction sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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

  // Fetch KPIs when kpiFilter changes
  useEffect(() => {
    const fetchKpis = async () => {
      setLoading(prev => ({ ...prev, kpis: true }));
      setError(prev => ({ ...prev, kpis: null }));
      
      try {
        const kpiData = await getKpis(
          kpiFilter.start ? format(kpiFilter.start, 'yyyy-MM-dd') : undefined,
          kpiFilter.end ? format(kpiFilter.end, 'yyyy-MM-dd') : undefined
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
  }, [kpiFilter]);

  // Fetch graph data when graphFilter changes
  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(prev => ({ ...prev, graph: true }));
      setError(prev => ({ ...prev, graph: null }));
      
      try {
        const response = await getDashboardData(
          graphFilter.start ? format(graphFilter.start, 'yyyy-MM-dd') : undefined,
          graphFilter.end ? format(graphFilter.end, 'yyyy-MM-dd') : undefined,
          graphFilter.granularity
        );
        
        // Handle the response format from the API
        // API returns { success: true, data: [...], error: null }
        const dashboardData = response?.data || [];
        
        // Map dashboard data to match chart expectations
        const mappedDashboardData = Array.isArray(dashboardData) ? dashboardData.map((stat: any) => ({
          date: stat.label || stat.date,
          totalIncome: stat.totalIncome || 0,
          totalExpense: stat.totalExpense || 0
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
  }, [graphFilter]);

  // Fetch top items when topItemsFilter changes
  useEffect(() => {
    const fetchTopItems = async () => {
      setLoading(prev => ({ ...prev, topItems: true }));
      setError(prev => ({ ...prev, topItems: null }));
      
      try {
        const topItemsData = await getTopRevenueItems(
          topItemsFilter.start ? format(topItemsFilter.start, 'yyyy-MM-dd') : undefined,
          topItemsFilter.end ? format(topItemsFilter.end, 'yyyy-MM-dd') : undefined,
          5
        ) || [];
        
        // Map top items to match chart expectations
        const mappedTopItems = Array.isArray(topItemsData) ? topItemsData.map((item: any) => ({
          itemName: item.item || item.itemName,
          revenue: item.revenue || item.total_revenue || 0
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
  }, [topItemsFilter]);

  // Fetch expenses by category when expensesFilter changes
  useEffect(() => {
    const fetchExpensesByCategory = async () => {
      setLoading(prev => ({ ...prev, expenses: true }));
      setError(prev => ({ ...prev, expenses: null }));
      
      try {
        const categoryBreakdownData = await getExpensesByCategory(
          expensesFilter.start ? format(expensesFilter.start, 'yyyy-MM-dd') : undefined,
          expensesFilter.end ? format(expensesFilter.end, 'yyyy-MM-dd') : undefined
        ) || [];
        
        // Map category breakdown to match chart expectations
        const mappedCategoryBreakdown = Array.isArray(categoryBreakdownData) ? categoryBreakdownData.map((item: any) => ({
          category: item.category,
          value: item.amount || item.value || 0,
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
  }, [expensesFilter]);

  // Fetch transactions when transactionsFilter changes
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(prev => ({ ...prev, transactions: true }));
      setError(prev => ({ ...prev, transactions: null }));
      
      try {
        const transactionsData = await getTransactions({
          start: transactionsFilter.start ? format(transactionsFilter.start, 'yyyy-MM-dd') : undefined,
          end: transactionsFilter.end ? format(transactionsFilter.end, 'yyyy-MM-dd') : undefined
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
  }, [transactionsFilter]);

  // Sort transaction history
  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortConfig.direction === 'asc' ? 
          dateA.getTime() - dateB.getTime() : 
          dateB.getTime() - dateA.getTime();
      } else if (sortConfig.key === 'item_name') {
        return sortConfig.direction === 'asc' ?
          a.item_name.localeCompare(b.item_name) :
          b.item_name.localeCompare(a.item_name);
      } else if (sortConfig.key === 'item_type') {
        return sortConfig.direction === 'asc' ?
          a.item_type.localeCompare(b.item_type) :
          b.item_type.localeCompare(a.item_type);
      } else if (sortConfig.key === 'amount') {
        const amountA = a.quantity * a.price_per_quantity;
        const amountB = b.quantity * b.price_per_quantity;
        return sortConfig.direction === 'asc' ?
          amountA - amountB :
          amountB - amountA;
      }
      return 0;
    });
  }, [transactions, sortConfig]);

  // Paginate transactions
  const paginatedTransactions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTransactions, currentPage]);

  // Colors for charts
  const COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Format date range for display
  const formatDateRange = (range: { start: Date | undefined; end: Date | undefined } | undefined) => {
    if (!range || !range.start) return "Filter";
    if (!range.end) return format(range.start, "MMM dd");
    return `${format(range.start, "MMM dd")} - ${format(range.end, "MMM dd")}`;
  };

  // Format daily stats description
  const formatDailyStatsDescription = () => {
    if (!graphFilter.start || !graphFilter.end) return "All time performance";
    return `${format(graphFilter.start, "MMM dd")} - ${format(graphFilter.end, "MMM dd, yyyy")} performance`;
  };

  // Handle sort request
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle graph granularity change
  const handleGranularityChange = (value: 'auto' | 'daily' | 'weekly') => {
    setGraphFilter(prev => ({ ...prev, granularity: value }));
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
        </div>

        {/* KPI Cards with KPI Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-grow">
            <KPICard
              title="Total Income"
              value={`${kpiData.totalIncome.toLocaleString()} ETB`}
              icon={DollarSign}
              isPositive={true}
            />
            <KPICard
              title="Total Expenses"
              value={`${kpiData.totalExpenses.toLocaleString()} ETB`}
              icon={TrendingDown}
              isPositive={false}
            />
            <KPICard
              title="Profit/Loss"
              value={`${kpiData.netProfit.toLocaleString()} ETB`}
              icon={kpiData.netProfit >= 0 ? TrendingUp : TrendingDown}
              isPositive={kpiData.netProfit >= 0}
            />
            <KPICard
              title="Profit Margin"
              value={`${kpiData.profitMargin.toFixed(1)}%`}
              icon={Percent}
              isPositive={kpiData.profitMargin >= 0}
            />
          </div>
          <div className="flex-shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>{formatDateRange(kpiFilter)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: kpiFilter.start, to: kpiFilter.end }}
                  onSelect={(range) => handleKpiFilterSelect(range as any)}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Daily Income vs Expenses - Full width */}
        <div className="w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Income vs Expenses</CardTitle>
                <CardDescription>{formatDailyStatsDescription()}</CardDescription>
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
                      <span>{formatDateRange(graphFilter)}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={{ from: graphFilter.start, to: graphFilter.end }}
                      onSelect={(range) => handleGraphFilterSelect(range as any)}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Select 
                  value={graphFilter.granularity} 
                  onValueChange={handleGranularityChange}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Granularity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading.graph ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg">Loading graph data...</div>
                </div>
              ) : error.graph ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg text-red-500">{error.graph}</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
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
                      dataKey="totalIncome" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Income"
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalExpense" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Expenses"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Items by Revenue and Expenses by Category - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <span>{formatDateRange(topItemsFilter)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: topItemsFilter.start, to: topItemsFilter.end }}
                    onSelect={(range) => handleTopItemsFilterSelect(range as any)}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              {loading.topItems ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg">Loading top items...</div>
                </div>
              ) : error.topItems ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg text-red-500">{error.topItems}</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="itemName" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} ETB`, 'Revenue']}
                      labelFormatter={(label) => `Item: ${label}`}
                    />
                    <Bar dataKey="revenue" name="Revenue (ETB)">
                      {topItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

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
                    <span>{formatDateRange(expensesFilter)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: expensesFilter.start, to: expensesFilter.end }}
                    onSelect={(range) => handleExpensesFilterSelect(range as any)}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              {loading.expenses ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg">Loading expenses data...</div>
                </div>
              ) : error.expenses ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg text-red-500">{error.expenses}</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="category"
                      label={({ category, percent }) => `${category} ${percent.toFixed(0)}%`}
                    >
                      {categoryBreakdown.map((entry, index) => (
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
                      {categoryBreakdown
                        .reduce((sum, item) => sum + item.value, 0)
                        .toLocaleString()} ETB
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History Table - Full width */}
        <div className="w-full">
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
                      <span>{formatDateRange(transactionsFilter)}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={{ from: transactionsFilter.start, to: transactionsFilter.end }}
                      onSelect={(range) => handleTransactionsFilterSelect(range as any)}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              {loading.transactions ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg">Loading transactions...</div>
                </div>
              ) : error.transactions ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-lg text-red-500">{error.transactions}</div>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('date')}>
                          Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('item_name')}>
                          Item {sortConfig.key === 'item_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('item_type')}>
                          Type {sortConfig.key === 'item_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="text-right cursor-pointer" onClick={() => requestSort('amount')}>
                          Amount (ETB) {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-nowrap">{transaction.date}</TableCell>
                          <TableCell className="font-medium">{transaction.item_name}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={transaction.item_type.toLowerCase() === 'income' ? 'default' : 'destructive'}
                              className={transaction.item_type.toLowerCase() === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {transaction.item_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(transaction.quantity * transaction.price_per_quantity).toLocaleString()} ETB
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;