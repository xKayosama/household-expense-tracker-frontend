import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Car,
  CircleDollarSign,
  Film,
  HeartPulse,
  Home,
  MoreHorizontal,
  Receipt,
  Search,
  ShoppingBag,
  ShoppingCart,
  Utensils,
  Wifi,
  Zap,
} from 'lucide-react';
import { endOfDay, format, isWithinInterval, startOfDay } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { useAppSelector } from '@/app/hooks';

import { useGetExpensesQuery } from '@/features/expenses/expenseApi';

import AddExpenseDialog from '@/features/expenses/components/AddExpenseDialog';
import ExpenseDetailsDialog from '@/features/expenses/components/ExpenseDetailsDialog';
import EditExpenseDialog from '@/features/expenses/components/EditExpenseDialog';
import DeleteExpenseDialog from '@/features/expenses/components/DeleteExpenseDialog';

import type { Expense, ExpenseCategory } from '@/features/expenses/types';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

const categoryIcons: Record<ExpenseCategory, typeof Receipt> = {
  FOOD: Utensils,
  RENT: Home,
  UTILITIES: Zap,
  INTERNET: Wifi,
  TRANSPORTATION: Car,
  GROCERIES: ShoppingCart,
  HEALTHCARE: HeartPulse,
  ENTERTAINMENT: Film,
  SHOPPING: ShoppingBag,
  OTHERS: MoreHorizontal,
};

const categoryLabels: Record<ExpenseCategory, string> = {
  FOOD: 'Food',
  RENT: 'Rent',
  UTILITIES: 'Utilities',
  INTERNET: 'Internet',
  TRANSPORTATION: 'Transportation',
  GROCERIES: 'Groceries',
  HEALTHCARE: 'Healthcare',
  ENTERTAINMENT: 'Entertainment',
  SHOPPING: 'Shopping',
  OTHERS: 'Others',
};

const Expenses = () => {
  const householdId = useAppSelector(
    (state) => state.household.selectedHousehold?.id,
  );

  /*
   * Filters
   */
  const [search, setSearch] = useState('');

  const [category, setCategory] = useState<ExpenseCategory | 'ALL'>('ALL');

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  /*
   * Expense Details
   */
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [page, setPage] = useState(1);

  const limit = 50;

  /*
   * Expenses API
   */
  const { data, isLoading, isFetching, isError } = useGetExpensesQuery(
    {
      householdId: householdId ?? '',
      page,
      limit,

      category: category === 'ALL' ? undefined : category,

      ...(dateRange?.from && dateRange?.to
        ? {
            startDate: format(dateRange.from, 'yyyy-MM-dd'),
            endDate: format(dateRange.to, 'yyyy-MM-dd'),
          }
        : {}),
    },
    {
      skip: !householdId,
    },
  );

  const expenses = data?.data.expenses ?? [];

  const pagination = data?.pagination;

  const totalPages = pagination?.totalPages ?? 1;

  const totalExpenseCount = pagination?.total ?? 0;

  const hasNextPage = pagination?.hasNextPage ?? false;

  const hasPreviousPage = pagination?.hasPreviousPage ?? false;

  useEffect(() => {
    setPage(1);
  }, [category, dateRange]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(totalPages, 1));
    }
  }, [page, totalPages]);

  /*
   * Filter Expenses
   */
  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        expense.description.toLowerCase().includes(query) ||
        `${expense.paidBy.firstName} ${expense.paidBy.lastName}`
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === 'ALL' || expense.category === category;

      const matchesDate =
        !dateRange?.from ||
        !dateRange?.to ||
        isWithinInterval(new Date(expense.date), {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [expenses, search, category, dateRange]);

  /*
   * Total Expenses
   */
  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) => total + expense.amount,
      0,
    );
  }, [filteredExpenses]);

  /*
   * Format Currency
   */
  const formatAmount = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /*
   * Format Date
   */
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /*
   * Get Category Icon
   */
  const getCategoryIcon = (expenseCategory: ExpenseCategory) => {
    return categoryIcons[expenseCategory] ?? CircleDollarSign;
  };

  /*
   * Clear Filters
   */
  const clearFilters = () => {
    setSearch('');
    setCategory('ALL');
    setDateRange(undefined);
  };

  /*
   * Open Expense Details
   */
  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsOpen(true);
  };

  /*
   * Close Expense Details
   */
  const handleDetailsOpenChange = (value: boolean) => {
    setIsDetailsOpen(value);

    if (!value) {
      setSelectedExpense(null);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleEditOpenChange = (value: boolean) => {
    setIsEditOpen(value);

    if (!value) {
      setSelectedExpense(null);
    }
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDetailsOpen(false);
    setIsDeleteOpen(true);
  };

  const handleDeleteOpenChange = (value: boolean) => {
    setIsDeleteOpen(value);

    if (!value) {
      setSelectedExpense(null);
    }
  };

  const getPaginationItems = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 4) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 3) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);

    return pages;
  };

  if (!householdId) {
    return null;
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-330">
      {/* ========================================
          PAGE HEADER
      ======================================== */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Label
            htmlFor="Household finances"
            className="text-xs font-semibold tracking-[0.18em] text-primary uppercase"
          >
            Household finances
          </Label>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Expenses
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Keep track of everything your household spends.
          </p>
        </div>

        <AddExpenseDialog householdId={householdId} />
      </div>

      {/* ========================================
          SUMMARY
      ======================================== */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Expenses */}
        <Card className="gap-0 rounded-2xl border-slate-200 shadow-none">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CircleDollarSign className="size-4 text-[#51705d]" />
              Total Expenses
            </CardTitle>
          </CardHeader>

          <CardContent className="px-5 pb-5">
            <p className="break-words text-2xl font-semibold tracking-tight text-slate-900">
              {formatAmount(totalExpenses)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {filteredExpenses.length}{' '}
              {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
            </p>
          </CardContent>
        </Card>

        {/* Showing */}
        <Card className="gap-0 rounded-2xl border-slate-200 shadow-none">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Receipt className="size-4 text-[#51705d]" />
              Showing
            </CardTitle>
          </CardHeader>

          <CardContent className="px-5 pb-5">
            <p className="break-words text-2xl font-semibold tracking-tight text-slate-900">
              {totalExpenseCount}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total matching expenses
            </p>
          </CardContent>
        </Card>

        {/* Current View */}
        <Card className="gap-0 rounded-2xl border-slate-200 shadow-none sm:col-span-2 lg:col-span-1">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays className="size-4 text-[#51705d]" />
              Current view
            </CardTitle>
          </CardHeader>

          <CardContent className="px-5 pb-5">
            <p className="break-words text-2xl font-semibold tracking-tight text-slate-900">
              {dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, 'MMM d')} - ${format(
                      dateRange.to,
                      'MMM d',
                    )}`
                  : format(dateRange.from, 'MMM d, yyyy')
                : 'All time'}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {dateRange?.from
                ? 'Selected date range'
                : 'All household expenses'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================
          FILTERS
      ======================================== */}
      <Card className="mb-6 gap-0 rounded-2xl border-slate-200 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Search */}
            <div className="w-full min-w-0 sm:basis-full xl:flex-1 xl:basis-0">
              <InputGroup className="h-10 flex-1 border-slate-200 bg-white">
                <InputGroupAddon>
                  <Search className="size-4 text-slate-400" />
                </InputGroupAddon>

                <InputGroupInput
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search expenses..."
                  aria-label="Search expenses"
                  className="text-base focus-visible:ring-0 sm:text-sm"
                />
              </InputGroup>
            </div>

            {/* Category */}
            <NativeSelect
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ExpenseCategory | 'ALL')
              }
              aria-label="Filter by category"
              className="w-full sm:w-48 [&_select]:text-base sm:[&_select]:text-sm"
            >
              <NativeSelectOption value="ALL">
                All categories
              </NativeSelectOption>

              {Object.entries(categoryLabels).map(([value, label]) => (
                <NativeSelectOption key={value} value={value}>
                  {label}
                </NativeSelectOption>
              ))}
            </NativeSelect>

            <div className="flex min-w-0 flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center sm:justify-end">
              {/* Date Range */}
              <Popover>
                <PopoverTrigger
                  render={<Button variant="outline" />}
                  className="h-11 w-full min-w-0 justify-start rounded-xl font-normal sm:h-10 sm:w-auto"
                >
                  <CalendarDays className="size-4" />

                  <span className="min-w-0 truncate">
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'MMM d, yyyy')} -{' '}
                          {format(dateRange.to, 'MMM d, yyyy')}
                        </>
                      ) : (
                        format(dateRange.from, 'MMM d, yyyy')
                      )
                    ) : (
                      'Select date range'
                    )}
                  </span>
                </PopoverTrigger>

                <PopoverContent
                  className="max-h-[min(80dvh,42rem)] w-auto max-w-[calc(100vw-2rem)] overflow-auto p-0"
                  align="end"
                >
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              {(search || category !== 'ALL' || dateRange?.from) && (
                <Button
                  variant="ghost"
                  size="xl"
                  onClick={clearFilters}
                  className="h-11 w-full rounded-xl sm:h-10 sm:w-auto"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================
          LOADING
      ======================================== */}
      {isLoading && (
        <Card className="rounded-2xl border-slate-200 shadow-none">
          <CardContent className="flex min-h-56 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 size-7 animate-spin rounded-full border-2 border-slate-200 border-t-[#173f35]" />

              <p className="text-sm text-slate-500">Loading expenses...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================
          ERROR
      ======================================== */}
      {isError && !isLoading && (
        <Card className="rounded-2xl border-red-100 shadow-none">
          <CardContent className="flex min-h-56 items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-red-600">
                Failed to load expenses.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================
          EMPTY STATE
      ======================================== */}
      {!isLoading && !isError && filteredExpenses.length === 0 && (
        <Card className="rounded-2xl border-slate-200 shadow-none">
          <CardContent className="flex min-h-72 items-center justify-center">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f1f5eb] text-[#173f35]">
                <Receipt className="size-5" />
              </div>

              <h2 className="mt-4 text-base font-semibold text-slate-900">
                {search || category !== 'ALL' || dateRange?.from
                  ? 'No matching expenses'
                  : 'No expenses yet'}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {search || category !== 'ALL' || dateRange?.from
                  ? 'Try changing your search, category, or date range filter.'
                  : 'Add your first household expense to start tracking your spending.'}
              </p>

              {!search && category === 'ALL' && !dateRange?.from && (
                <div className="mt-4">
                  <AddExpenseDialog householdId={householdId} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================
          EXPENSE LIST
      ======================================== */}
      {!isLoading && !isError && filteredExpenses.length > 0 && (
        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Recent Expenses
              </CardTitle>

              {isFetching && (
                <div className="size-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#173f35]" />
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredExpenses.map((expense: Expense) => {
                const Icon = getCategoryIcon(expense.category);

                return (
                  <div
                    key={expense._id}
                    onClick={() => handleViewExpense(expense)}
                    className="grid cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:flex sm:items-center sm:gap-4 sm:px-5"
                  >
                    {/* Icon */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f5eb] text-[#173f35]">
                      <Icon className="size-4" strokeWidth={1.8} />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-slate-900 sm:truncate">
                        {expense.description}
                      </p>

                      <div className="mt-1 flex flex-col items-start gap-x-2 gap-y-1 break-words text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:items-center">
                        <span>{categoryLabels[expense.category]}</span>

                        <span className="hidden sm:inline" aria-hidden="true">
                          •
                        </span>

                        <span>
                          Paid by {expense.paidBy.firstName}{' '}
                          {expense.paidBy.lastName}
                        </span>

                        <span className="hidden sm:inline" aria-hidden="true">
                          •
                        </span>

                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="col-start-2 flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 sm:block sm:shrink-0 sm:text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatAmount(expense.amount)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {expense.splitType}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                {/* Result count */}
                <p className="shrink-0 text-xs text-slate-400">
                  Showing{' '}
                  <span className="font-medium text-slate-600">
                    {(page - 1) * limit + 1}
                  </span>
                  {' - '}
                  <span className="font-medium text-slate-600">
                    {Math.min(page * limit, totalExpenseCount)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-slate-600">
                    {totalExpenseCount}
                  </span>{' '}
                  expenses
                </p>

                {/* Pagination */}
                <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();

                          if (!hasPreviousPage || isFetching) {
                            return;
                          }

                          setPage((current) => Math.max(1, current - 1));
                        }}
                        className={
                          !hasPreviousPage || isFetching
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPaginationItems().map((item, index) => {
                      if (item === 'ellipsis') {
                        return (
                          <PaginationItem key={`ellipsis-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }

                      return (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={page === item}
                            onClick={(event) => {
                              event.preventDefault();

                              if (isFetching) {
                                return;
                              }

                              setPage(item);
                            }}
                            className={
                              page === item
                                ? 'cursor-pointer border-[#173f35] bg-[#173f35] text-white hover:bg-[#245646] hover:text-white'
                                : 'cursor-pointer'
                            }
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();

                          if (!hasNextPage || isFetching) {
                            return;
                          }

                          setPage((current) =>
                            Math.min(totalPages, current + 1),
                          );
                        }}
                        className={
                          !hasNextPage || isFetching
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================
          EXPENSE DETAILS DIALOG
      ======================================== */}
      <ExpenseDetailsDialog
        expense={selectedExpense}
        householdId={householdId}
        open={isDetailsOpen}
        onOpenChange={handleDetailsOpenChange}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      <EditExpenseDialog
        expense={selectedExpense}
        householdId={householdId}
        open={isEditOpen}
        onOpenChange={handleEditOpenChange}
      />

      <DeleteExpenseDialog
        expense={selectedExpense}
        open={isDeleteOpen}
        onOpenChange={handleDeleteOpenChange}
      />
    </div>
  );
};

export default Expenses;
