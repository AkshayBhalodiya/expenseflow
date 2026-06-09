import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Equal } from 'lucide-react';

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  grossSavings: number;
  monthlyEmi: number;
  availableBalance: number;
  loanOutstanding: number;
  totalEmiPaid: number;
}

function Row({
  label,
  amount,
  operator,
  highlight,
}: {
  label: string;
  amount: number;
  operator?: '−' | '=';
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? 'font-semibold border-t pt-3' : ''}`}>
      <div className="flex items-center gap-2 text-sm">
        {operator && (
          <span className="w-5 text-center text-muted-foreground font-mono">{operator}</span>
        )}
        {!operator && <span className="w-5" />}
        <span className={highlight ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
      </div>
      <span className={highlight ? 'text-lg font-bold text-primary' : 'font-medium'}>
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

export function FinancialSummary({
  totalIncome,
  totalExpenses,
  grossSavings,
  monthlyEmi,
  availableBalance,
  loanOutstanding,
  totalEmiPaid,
}: FinancialSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">How Your Balance is Calculated</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <Row label="Total Income" amount={totalIncome} />
        <Row label="Total Expenses" amount={totalExpenses} operator="−" />
        <Row label="Gross Savings (Income − Expenses)" amount={grossSavings} operator="=" highlight />
        <Row label="Monthly EMI (active loans)" amount={monthlyEmi} operator="−" />
        <Row label="Available Balance (after EMI)" amount={availableBalance} operator="=" highlight />

        <div className="mt-4 pt-4 border-t space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Loan Details (separate)</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Loan Outstanding (principal left)</span>
            <span className="font-medium text-orange-600">{formatCurrency(loanOutstanding)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total EMI Paid so far</span>
            <span className="font-medium text-green-600">{formatCurrency(totalEmiPaid)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
          <Equal className="h-3 w-3 mt-0.5 shrink-0" />
          When you mark EMI as paid, loan outstanding reduces by EMI amount. Available balance is your monthly cash left after expenses and EMI.
        </p>
      </CardContent>
    </Card>
  );
}
