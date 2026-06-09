'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { api, ActivityLog } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { user, fetchProfile } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ name: '', mobile: '', currency: 'INR', timezone: 'Asia/Kolkata' });
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [message, setMessage] = useState('');
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        mobile: user.mobile || '',
        currency: user.currency || 'INR',
        timezone: user.timezone || 'Asia/Kolkata',
      });
    }
  }, [user]);

  const saveProfile = async () => {
    await api.updateProfile(profile);
    await fetchProfile();
    setMessage('Profile updated');
  };

  const changePassword = async () => {
    await api.changePassword(passwords.current, passwords.new);
    setPasswords({ current: '', new: '' });
    setMessage('Password changed');
  };

  const loadActivity = async () => {
    try {
      const res = await api.getActivityHistory();
      setActivity(res.data);
    } catch {
      setActivity([]);
    }
  };

  const exportData = async () => {
    const res = await api.exportUserData();
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense-data-backup.json';
    a.click();
  };

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {message && <div className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200 p-3 rounded-md text-sm">{message}</div>}

        <Tabs defaultValue="profile" onValueChange={(v) => { if (v === 'activity') loadActivity(); }}>
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ''} disabled /></div>
                <div className="space-y-2"><Label>Mobile</Label><Input value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} /></div>
                <Button onClick={saveProfile}>Save Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} /></div>
                <Button onClick={changePassword}>Change Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={profile.currency} onValueChange={(v) => setProfile({ ...profile, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['INR', 'USD', 'EUR', 'GBP'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={saveProfile}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader><CardTitle>Backup & Restore</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={exportData}><Download className="h-4 w-4 mr-2" /> Export Data (JSON)</Button>
                <div className="space-y-2">
                  <Label>Import Data</Label>
                  <Input type="file" accept=".json" />
                  <p className="text-xs text-muted-foreground">Upload a previously exported JSON backup file</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader><CardTitle>Activity History</CardTitle></CardHeader>
              <CardContent className="p-0 divide-y max-h-96 overflow-y-auto">
                {activity.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground text-sm">No activity recorded yet</p>
                ) : (
                  activity.map((log) => (
                    <div key={log._id} className="flex justify-between p-4 text-sm">
                      <div>
                        <p className="font-medium capitalize">{log.action} {log.entity}</p>
                        <p className="text-muted-foreground">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
