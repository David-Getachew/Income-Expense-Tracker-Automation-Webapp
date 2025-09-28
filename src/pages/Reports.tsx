import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { getWeeklySummaries } from '@/lib/api';

const Reports: React.FC = () => {
  const [weeklyReports, setWeeklyReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weekly reports on component mount
  useEffect(() => {
    fetchWeeklyReports();
  }, []);

  const fetchWeeklyReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const reportsArray = await getWeeklySummaries();
      // getWeeklySummaries already returns a safe array
      
      // Map the reports to the correct format with safe fallbacks
      const mappedReports = reportsArray.map((report: any) => ({
        ...report,
        weekStart: report.week_start || '',
        weekEnd: report.week_end || '',
        netProfit: report.net_profit || 0,
        analysis: report.analysis || '',
        pdfUrl: report.pdf_url || '',
        signedPdfUrl: report.signed_pdf_url || report.download_url || report.pdf_url || ''
      }));
      
      setWeeklyReports(mappedReports);
    } catch (err: any) {
      console.error('Error fetching weekly reports:', err);
      setError('Reports unavailable. Check server connection and try again.');
      showError('Failed to load reports');
      // Set empty array to prevent crashes
      setWeeklyReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (report: any) => {
    try {
      // Use the signed PDF URL if available, otherwise use the regular PDF URL
      const pdfUrl = report.signedPdfUrl || report.download_url || report.pdfUrl;
      
      if (pdfUrl) {
        // Open the PDF in a new tab with security attributes
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        showSuccess(`Opening report for ${report.weekStart} to ${report.weekEnd}`);
      } else {
        showError('No PDF available for this report');
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      showError('Failed to open report');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading reports...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="text-lg text-red-500 text-center">{error}</div>
          <Button 
            onClick={fetchWeeklyReports}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Weekly business performance reports with AI analysis</p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {weeklyReports.map((report, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <Badge 
                    variant={report.netProfit > 0 ? 'default' : 'destructive'}
                    className={report.netProfit > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {report.netProfit > 0 ? 'Profitable' : 'Loss'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">Week Report</CardTitle>
                <CardDescription>{`${report.weekStart} to ${report.weekEnd}`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profit Summary */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {report.netProfit > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Net Profit</span>
                  </div>
                  <span className={`font-bold text-lg ${
                    report.netProfit > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {report.netProfit > 0 ? '+' : ''}{report.netProfit.toLocaleString()} ETB
                  </span>
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
                  onClick={() => handleDownload(report)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!report.signedPdfUrl && !report.download_url && !report.pdfUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {report.signedPdfUrl || report.download_url || report.pdfUrl ? 'View PDF Report' : 'No Report'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Reports Summary</CardTitle>
            <CardDescription>Overview of all generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{weeklyReports.length}</div>
                <div className="text-sm text-blue-800">Total Reports</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-2xl font-bold text-green-600">
                  {weeklyReports.filter(r => r.netProfit > 0).length}
                </div>
                <div className="text-sm text-green-800">Profitable Weeks</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="text-2xl font-bold text-amber-600">
                  {weeklyReports.reduce((sum, r) => sum + r.netProfit, 0).toLocaleString()} ETB
                </div>
                <div className="text-sm text-amber-800">Total Profit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;