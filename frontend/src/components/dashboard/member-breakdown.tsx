import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface MemberSummary {
  userId: string;
  name: string;
  email?: string;
  role?: string;
  totalIncome: number;
  totalExpenses: number;
  grossSavings: number;
  monthlyEmi: number;
  availableBalance: number;
  cardUsed: number;
  cardLimit: number;
}

interface MemberBreakdownProps {
  members: MemberSummary[];
  combinedIncome: number;
}

export function MemberBreakdown({ members, combinedIncome }: MemberBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Member-wise Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((m) => {
          const share = combinedIncome > 0 ? Math.round((m.totalIncome / combinedIncome) * 100) : 0;
          return (
            <div key={m.userId} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{m.role || 'member'}</p>
                </div>
                <span className="text-sm text-muted-foreground">{share}% of home income</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 sm:gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Income</p>
                  <p className="font-medium text-green-600">{formatCurrency(m.totalIncome)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Expenses</p>
                  <p className="font-medium text-destructive">{formatCurrency(m.totalExpenses)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Savings</p>
                  <p className="font-medium">{formatCurrency(m.grossSavings)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Card Used</p>
                  <p className="font-medium">{formatCurrency(m.cardUsed)}</p>
                </div>
              </div>
              {combinedIncome > 0 && <Progress value={share} className="h-1.5" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
