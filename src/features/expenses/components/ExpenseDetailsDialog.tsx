import {
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Trash2,
  Receipt,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';

import type {
  Expense,
  ExpenseCategory,
  ExpenseSplitType,
} from '@/features/expenses/types';

import { useGetHouseholdMembersQuery } from '@/features/members/memberApi';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExpenseDetailsDialogProps {
  expense: Expense | null;
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

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

const splitTypeLabels: Record<ExpenseSplitType, string> = {
  EQUAL: 'Split equally',
  EXACT: 'Exact amounts',
  PERCENTAGE: 'Percentage',
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  });
};

const ExpenseDetailsDialog = ({
  expense,
  householdId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ExpenseDetailsDialogProps) => {
  const { data: membersData } = useGetHouseholdMembersQuery(householdId, {
    skip: !householdId || !open,
  });

  const members = membersData?.data.members ?? [];

  if (!expense) {
    return null;
  }

  const getParticipantId = (
    userId: Expense['participants'][number]['userId'],
  ) => {
    return typeof userId === 'string' ? userId : userId._id;
  };

  const getParticipantName = (
    userId: Expense['participants'][number]['userId'],
  ) => {
    if (typeof userId !== 'string') {
      return `${userId.firstName} ${userId.lastName}`;
    }

    const member = members.find((item) => item.userId._id === userId);

    if (!member) {
      return 'Household member';
    }

    return `${member.userId.firstName} ${member.userId.lastName}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 sm:max-w-lg flex  flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 px-6 py-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Expense details
              </DialogTitle>

              <DialogDescription>
                View the complete information for this household expense.
              </DialogDescription>
            </DialogHeader>

            {/* Main Expense */}
            <section className="rounded-2xl bg-[#f4f7f2] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#51705d]">
                    {categoryLabels[expense.category]}
                  </p>

                  <h3 className="mt-1 truncate text-lg font-semibold text-slate-900">
                    {expense.description}
                  </h3>
                </div>

                <Receipt className="size-5 shrink-0 text-[#51705d]" />
              </div>

              <p className="mt-4 text-3xl font-bold tracking-tight text-[#173f35]">
                {formatCurrency(expense.amount)}
              </p>
            </section>

            {/* Expense Information */}
            <section className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Expense information
              </h4>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Paid By */}
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <UserRound className="size-4" />
                    Paid by
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {expense.paidBy.firstName} {expense.paidBy.lastName}
                  </p>
                </div>

                {/* Date */}
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays className="size-4" />
                    Date
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {format(new Date(expense.date), 'MMM dd, yyyy')}
                  </p>
                </div>

                {/* Category */}
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Receipt className="size-4" />
                    Category
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {categoryLabels[expense.category]}
                  </p>
                </div>

                {/* Split Type */}
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CircleDollarSign className="size-4" />
                    Split method
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800">
                    {splitTypeLabels[expense.splitType]}
                  </p>
                </div>
              </div>
            </section>

            {/* Participants */}
            <section className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <UsersRound className="size-4 text-[#51705d]" />

                  <h4 className="text-sm font-semibold text-slate-900">
                    Split between
                  </h4>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {expense.participants.length}{' '}
                  {expense.participants.length === 1
                    ? 'participant'
                    : 'participants'}
                </p>
              </div>

              <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
                {expense.participants.map((participant) => (
                  <div
                    key={getParticipantId(participant.userId)}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {getParticipantName(participant.userId)}
                      </p>

                      {expense.splitType === 'PERCENTAGE' &&
                        participant.percentage !== null && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {participant.percentage}%
                          </p>
                        )}
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-[#173f35]">
                      {formatCurrency(participant.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Notes */}
            {expense.notes && (
              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900">Notes</h4>

                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  {expense.notes}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-100 bg-white px-6 py-4 gap-2 sm:gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(expense)}
            className="rounded-xl"
            size="xl"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>

          <Button
            type="button"
            onClick={() => onEdit(expense)}
            className="rounded-xl px-4"
            size="xl"
          >
            <Pencil className="size-4" />
            Edit Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailsDialog;
