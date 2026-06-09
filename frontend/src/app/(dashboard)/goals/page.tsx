'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api, Goal } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goalName: '', targetAmount: '', currentAmount: '0' });

  const fetchGoals = () => {
    api.getGoals().then((res) => setGoals(res.data)).catch(console.error);
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createGoal({
      goalName: form.goalName,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount),
    });
    setShowForm(false);
    fetchGoals();
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Financial Goals</h1>
            <p className="text-muted-foreground">Track your savings goals</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Add Goal</Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Create Goal</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2"><Label>Goal Name</Label><Input value={form.goalName} onChange={(e) => setForm({ ...form, goalName: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Target Amount</Label><Input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Current Amount</Label><Input type="number" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} /></div>
                <div className="sm:col-span-3"><Button type="submit">Save Goal</Button></div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal._id}>
              <CardHeader className="flex flex-row items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-base flex-1">{goal.goalName}</CardTitle>
                <Button variant="ghost" size="icon" onClick={async () => { await api.deleteGoal(goal._id); fetchGoals(); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <Progress value={goal.progress} className="h-3" />
                <p className="text-center text-lg font-bold mt-2">{goal.progress}%</p>
                <Button size="sm" variant="outline" className="w-full mt-2" onClick={async () => {
                  const amount = prompt('Amount to add:');
                  if (amount) { await api.addToGoal(goal._id, parseFloat(amount)); fetchGoals(); }
                }}>
                  Add Funds
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
  );
}
