'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, ReportData } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const params: Record<string, string> = { period };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (category) params.category = category;

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReport(params);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: string) => {
    const blob = await api.exportReport({ ...params, format });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report.${format === 'excel' ? 'xlsx' : format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary;
  const expenses = report?.expenses || [];
  const income = report?.income || [];

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and export financial reports</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Report Filters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Optional" /></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={generateReport} disabled={loading}>
                <FileText className="h-4 w-4 mr-2" /> {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}><Download className="h-4 w-4 mr-2" /> CSV</Button>
              <Button variant="outline" onClick={() => handleExport('excel')}><Download className="h-4 w-4 mr-2" /> Excel</Button>
              <Button variant="outline" onClick={() => handleExport('pdf')}><Download className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </CardContent>
        </Card>

        {report && summary && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Income</p><p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total EMI</p><p className="text-2xl font-bold">{formatCurrency(summary.totalEmi)}</p></CardContent></Card>
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Net Savings</p><p className="text-2xl font-bold text-primary">{formatCurrency(summary.netSavings)}</p></CardContent></Card>
            </div>

            <Tabs defaultValue="expenses">
              <TabsList>
                <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
                <TabsTrigger value="income">Income ({income.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="expenses">
                <Card>
                  <CardContent className="p-0 divide-y">
                    {expenses.map((e, i) => (
                      <div key={i} className="flex justify-between p-4">
                        <div><p className="font-medium">{String(e.title)}</p><p className="text-sm text-muted-foreground">{String(e.category)} · {formatDate(String(e.date))}</p></div>
                        <span className="font-semibold text-destructive">{formatCurrency(Number(e.amount))}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="income">
                <Card>
                  <CardContent className="p-0 divide-y">
                    {income.map((item, i) => (
                      <div key={i} className="flex justify-between p-4">
                        <div><p className="font-medium capitalize">{String(item.source)}</p><p className="text-sm text-muted-foreground">{formatDate(String(item.date))}</p></div>
                        <span className="font-semibold text-green-600">{formatCurrency(Number(item.amount))}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
  );
}
