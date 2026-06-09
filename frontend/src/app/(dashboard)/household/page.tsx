'use client';

import { useEffect, useState } from 'react';
import { Home, Copy, UserPlus, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, HouseholdInfo } from '@/lib/api';
import { useHouseholdStore } from '@/store/householdStore';

export default function HouseholdPage() {
  const invalidate = useHouseholdStore((s) => s.invalidate);
  const fetchHouseholdStore = useHouseholdStore((s) => s.fetchHousehold);
  const [household, setHousehold] = useState<HouseholdInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [homeName, setHomeName] = useState('Our Home');
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');

  const fetchHousehold = () => {
    api.getHousehold()
      .then((res) => { setHousehold(res.data); setHomeName(res.data?.name || 'Our Home'); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHousehold(); }, []);

  const createHome = async () => {
    await api.createHousehold(homeName);
    setMessage('Home created! Share invite code with your partner.');
    invalidate();
    await fetchHouseholdStore(true);
    fetchHousehold();
  };

  const joinHome = async () => {
    await api.joinHousehold(inviteCode);
    setMessage('Joined home successfully!');
    setInviteCode('');
    invalidate();
    await fetchHouseholdStore(true);
    fetchHousehold();
  };

  const copyCode = () => {
    if (household?.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      setMessage('Invite code copied!');
    }
  };

  const leaveHome = async () => {
    if (!confirm('Leave this home?')) return;
    await api.leaveHousehold();
    invalidate();
    setHousehold(null);
    setMessage('Left home');
  };

  const removeMember = async (id: string) => {
    if (!confirm('Remove this member?')) return;
    await api.removeHouseholdMember(id);
    invalidate();
    await fetchHouseholdStore(true);
    fetchHousehold();
  };

  if (loading) {
    return (
      <div className="flex justify-center h-64 items-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
        </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8 text-primary" />
            Home / Household
          </h1>
          <p className="text-muted-foreground">Manage shared finances for your family (husband & wife)</p>
        </div>

        {message && <div className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200 p-3 rounded-md text-sm">{message}</div>}

        {!household ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Create Home</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Start a new household and invite your partner</p>
                <div className="space-y-2">
                  <Label>Home Name</Label>
                  <Input value={homeName} onChange={(e) => setHomeName(e.target.value)} placeholder="Our Home" />
                </div>
                <Button onClick={createHome} className="w-full">Create Home</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Join Home</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter invite code from your partner</p>
                <div className="space-y-2">
                  <Label>Invite Code</Label>
                  <Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="ABC123" />
                </div>
                <Button onClick={joinHome} variant="outline" className="w-full">
                  <UserPlus className="h-4 w-4 mr-2" /> Join Home
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{household.name}</CardTitle>
                <Button variant="outline" size="sm" onClick={leaveHome}>
                  <LogOut className="h-4 w-4 mr-1" /> Leave
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Invite Code (share with partner)</p>
                    <p className="font-mono text-xl font-bold tracking-widest">{household.inviteCode}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Switch to <strong>Home (Combined)</strong> view on Dashboard to see total income, expenses & cards for everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Members ({household.members.length})</CardTitle></CardHeader>
              <CardContent className="divide-y">
                {household.members.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs capitalize px-2 py-1 bg-muted rounded">{m.role}</span>
                      {household.isOwner && m.role !== 'owner' && (
                        <Button variant="ghost" size="icon" onClick={() => removeMember(m.userId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
  );
}
