import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, FileText, Calendar } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { getWeeklySummaries } from '@/lib/api';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    const today = new Date();
    return {
      from: subWeeks(startOfWeek(today), 4),
      to: endOfWeek(today)
    };
  });

  // Fetch weekly summaries when date range changes
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getWeeklySummaries(
          dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
          dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
        );
        
        // Handle the response format from the API
        // API returns { success: true, data: [...], error: null }
        const weeklyData = response?.data || [];
        
        // Transform the data to match the expected format
        const transformedReports = Array.isArray(weeklyData) ? weeklyData.map((report: any) => ({
          week: `${report.week_start} to ${report.week_end}`,
          profit: report.net_profit || 0,
          totalIncome: report.total_income || 0,
          totalExpense: report.total_expense || 0,
          analysis: 'AI analysis not yet available for this week',
          reportUrl: report.pdf_url || '#',
          signedPdfUrl: report.signed_pdf_url || null
        })) : [];
        
        setReports(transformedReports);
      } catch (err: any) {
        console.error('Error fetching weekly reports:', err);
        setError(err.message || 'Failed to load reports');
        showError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [dateRange]);

  const handleDownload = async (reportUrl: string, week: string) => {
    // Mock download functionality
    showSuccess(`Downloading report for ${week}`);
    console.log(`Would download: ${reportUrl}`);
  };

  const formatDateRange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range || !range.from || !range.to) return "Filter";
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Weekly business performance reports with AI analysis</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading reports...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Weekly business performance reports with AI analysis</p>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Weekly business performance reports with AI analysis</p>
          </div>
          <div className="flex-shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatDateRange(dateRange)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <Badge 
                    variant={report.profit > 0 ? 'default' : 'destructive'}
                    className={report.profit > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {report.profit > 0 ? 'Profitable' : 'Loss'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">Week Report</CardTitle>
                <CardDescription>{report.week}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profit Summary */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {report.profit > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Net Profit</span>
                  </div>
                  <span className={`font-bold text-lg ${
                    report.profit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {report.profit > 0 ? '+' : ''}{report.profit.toLocaleString()} ETB
                  </span>
                </div>

                {/* Income/Expense Summary */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-green-50 rounded text-green-800">
                    <div className="font-medium">Income</div>
                    <div>{report.totalIncome.toLocaleString()} ETB</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded text-red-800">
                    <div className="font-medium">Expense</div>
                    <div>{report.totalExpense.toLocaleString()} ETB</div>
                  </div>
                </div>

                {/* AI Analysis */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {report.analysis}
                  </p>
                </div>

                {/* Download Button */}
                <Button 
                  onClick={() => handleDownload(report.reportUrl, report.week)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!report.reportUrl || report.reportUrl === '#'}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-500">No reports available for the selected date range</div>
          </div>
        )}

        {/* Summary Card */}
        {reports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reports Summary</CardTitle>
              <CardDescription>Overview of all generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
                  <div className="text-sm text-blue-800">Total Reports</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.profit > 0).length}
                  </div>
                  <div className="text-sm text-green-800">Profitable Weeks</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-2xl font-bold text-amber-600">
                    {reports.reduce((sum, r) => sum + r.profit, 0).toLocaleString()} ETB
                  </div>
                  <div className="text-sm text-amber-800">Total Profit</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Reports;