import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Home, Plus, Users } from 'lucide-react';

import { useGetHouseholdsQuery } from '@/features/household/householdApi';
import { useAppDispatch } from '@/app/hooks';
import { setSelectedHousehold } from '@/features/household/householdSlice';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

const Households = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data, isLoading, isError } = useGetHouseholdsQuery();

  const households = data?.data.households ?? [];

  const handleSelectHousehold = (household: (typeof households)[number]) => {
    dispatch(setSelectedHousehold(household));

    navigate('/dashboard', {
      replace: true,
    });
  };

  if (isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#f8f9f6] px-4">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#d5ebaa] text-[#173f35]">
            <Home className="size-5" strokeWidth={1.8} />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-700">
            Loading your households...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Getting everything ready for you.
          </p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#f8f9f6] px-4">
        <Card className="w-full max-w-md rounded-3xl border-red-100 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Home className="size-5" strokeWidth={1.8} />
            </div>

            <CardTitle className="mt-2 text-xl">Something went wrong</CardTitle>

            <CardDescription>
              We couldn't load your households. Please try again.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              className="h-11 w-full rounded-xl bg-[#173f35] font-semibold text-white hover:bg-[#245646]"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-[#f8f9f6] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Brand */}
            <div className="mb-6 flex items-center gap-1 text-lg font-semibold tracking-tight text-[#173f35]">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#d5ebaa] text-[#173f35]">
                <Home className="size-4" strokeWidth={2} />
              </span>

              <span>
                HomeSplit
                <span className="text-[#51705d]">.</span>
              </span>
            </div>

            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#51705d] uppercase">
              Welcome back
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Choose your household
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
              Select the household you want to manage. Your expenses, bills,
              balances, and members will be organized here.
            </p>
          </div>

          {/* Create Household */}
          <Button
            type="button"
            className="h-11 shrink-0 rounded-xl bg-[#173f35] px-5 font-semibold text-white shadow-sm hover:bg-[#245646]"
          >
            <Plus className="size-4" strokeWidth={2} />
            Create Household
          </Button>
        </div>

        {/* Household Count */}
        {households.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#d5ebaa] text-[#173f35]">
              <Users className="size-3.5" strokeWidth={2} />
            </div>

            <p className="text-sm font-medium text-slate-600">
              {households.length}{' '}
              {households.length === 1 ? 'household' : 'households'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {households.length === 0 ? (
          <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#f1f5eb] text-[#173f35]">
                <Home className="size-7" strokeWidth={1.7} />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                No households yet
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Create your first household and start keeping shared expenses
                organized.
              </p>

              <Button
                type="button"
                className="mt-6 h-11 rounded-xl bg-[#173f35] px-6 font-semibold text-white hover:bg-[#245646]"
              >
                <Plus className="size-4" strokeWidth={2} />
                Create Household
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Household Cards */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {households.map((household) => (
              <Card
                key={household.id}
                className="group relative overflow-hidden rounded-2xl border-slate-200 bg-white py-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9dcb0] hover:shadow-md"
              >
                {/* Accent */}
                <div className="h-1 bg-[#d5ebaa]" />

                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f5eb] text-[#173f35] transition-colors group-hover:bg-[#d5ebaa]">
                      <Home className="size-5" strokeWidth={1.8} />
                    </div>

                    <span className="flex size-7 items-center justify-center rounded-full bg-[#f1f5eb] text-[#51705d]">
                      <Check className="size-3.5" strokeWidth={2} />
                    </span>
                  </div>

                  <div className="pt-3">
                    <CardTitle className="truncate text-lg font-semibold tracking-tight text-slate-900">
                      {household.name}
                    </CardTitle>

                    <CardDescription className="mt-1">
                      Shared household
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5">
                  {/* Currency */}
                  <div className="mb-4 flex items-center justify-between rounded-xl bg-[#f8f9f6] px-3.5 py-3">
                    <span className="text-xs font-medium text-slate-400">
                      Currency
                    </span>

                    <span className="text-sm font-semibold text-[#173f35]">
                      {household.currency}
                    </span>
                  </div>

                  <Button
                    type="button"
                    className="h-11 w-full rounded-xl bg-[#173f35] font-semibold text-white transition-colors hover:bg-[#245646]"
                    onClick={() => handleSelectHousehold(household)}
                  >
                    Open Household
                    <ArrowRight
                      className="ml-1 size-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          One home. Shared expenses. Less stress.
        </p>
      </div>
    </main>
  );
};

export default Households;
