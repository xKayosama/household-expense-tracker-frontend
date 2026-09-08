import { Navigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useGetDashboardQuery } from '@/features/dashboard/dashboardApi';
import { useAppSelector } from '@/app/hooks';

const Dashboard = () => {
  const householdId = useAppSelector(
    (state) => state.household.selectedHousehold?.id
  );
  
  const {
    currentData: data,
    isFetching,
    isError,
  } = useGetDashboardQuery(householdId ?? '', {
    skip: !householdId,
  });

  if (!householdId) {
    return <Navigate to="/households" replace />;
  }

  if (isFetching && !data) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-red-600">
          Failed to load dashboard.
        </p>
      </div>
    );
  }

  const {
    summary,
    balances,
    bills,
    recentExpenses,
    upcomingBills,
  } = data.data;

  return (
    <div className="mx-auto w-full max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here's an overview of your household expenses.
          </p>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Expenses
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                ₱{summary.totalExpenses.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Paid
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                ₱{summary.totalPaid.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Owed
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                ₱{summary.totalOwed.toLocaleString()}
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Balances</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {balances.map((balance) => (
                  <div
                    key={balance.user._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {balance.user.firstName} {balance.user.lastName}
                      </p>

                      <p className="text-sm text-slate-500">
                        Paid ₱{balance.paid.toLocaleString()}
                      </p>
                    </div>

                    <p
                      className={
                        balance.net >= 0
                          ? 'font-semibold text-green-600'
                          : 'font-semibold text-red-600'
                      }
                    >
                      {balance.net >= 0 ? '+' : '-'}₱
                      {Math.abs(balance.net).toLocaleString()}
                    </p>
                  </div>
                ))}

                {!balances.length && (
                  <p className="text-sm text-slate-500">
                    No balances available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {expense.description}
                      </p>

                      <p className="text-sm text-slate-500">
                        {expense.category}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900">
                      ₱{expense.amount.toLocaleString()}
                    </p>
                  </div>
                ))}

                {!recentExpenses.length && (
                  <p className="text-sm text-slate-500">
                    No recent expenses.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bills */}
          <Card>
            <CardHeader>
              <CardTitle>Bills</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Pending
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {bills.pending}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Overdue
                  </p>

                  <p className="mt-1 text-xl font-bold text-red-600">
                    {bills.overdue}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Paid
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-600">
                    {bills.paid}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Bills */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bills</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {upcomingBills.map((bill) => (
                  <div
                    key={bill._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {bill.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {new Date(
                          bill.dueDate
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="font-semibold text-slate-900">
                      ₱{bill.amount.toLocaleString()}
                    </p>
                  </div>
                ))}

                {!upcomingBills.length && (
                  <p className="text-sm text-slate-500">
                    No upcoming bills.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
    </div>
  );
};

export default Dashboard;
