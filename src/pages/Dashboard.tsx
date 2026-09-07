import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from '@/features/auth/authSlice';
import { api } from '@/services/api';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(api.util.resetApiState());
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">HomeSplit</h1>
          <Button variant="outline" onClick={handleLogout}>Log out</Button>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Welcome{user?.firstName ? `, ${user.firstName}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You’re signed in. Household and expense features are coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
