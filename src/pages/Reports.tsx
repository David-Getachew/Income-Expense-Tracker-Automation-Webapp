import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { mockWeeklyReports } from '@/data/mockData';
import { showSuccess } from '@/utils/toast';

const Reports: React.FC = () => {
  const handleDownload = (reportUrl: string, week: string) => {
    // Mock download functionality
    showSuccess(`Downloading report for ${week}`);
    console.log(`Would download: ${reportUrl}`);
  };

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
          {mockWeeklyReports.map((report, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <Badge variant={report.profit > 0 ? 'default' : 'destructive'}>
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
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Report
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
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mockWeeklyReports.length}</div>
                <div className="text-sm text-blue-800">Total Reports</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {mockWeeklyReports.filter(r => r.profit > 0).length}
                </div>
                <div className="text-sm text-green-800">Profitable Weeks</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {mockWeeklyReports.reduce((sum, r) => sum + r.profit, 0).toLocaleString()} ETB
                </div>
                <div className="text-sm text-orange-800">Total Profit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;