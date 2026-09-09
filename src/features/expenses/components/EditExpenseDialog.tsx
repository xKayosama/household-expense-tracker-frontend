import { useEffect, useState } from 'react';
import { CalendarDays, LoaderCircle, Pencil } from 'lucide-react';
import { format } from 'date-fns';

import { useUpdateExpenseMutation } from '@/features/expenses/expenseApi';

import type {
  Expense,
  ExpenseCategory,
  ExpenseSplitType,
} from '@/features/expenses/types';

import { useGetHouseholdMembersQuery } from '@/features/members/memberApi';

import { Calendar } from '@/components/ui/calendar';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

interface EditExpenseDialogProps {
  expense: Expense | null;
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

const categories: {
  value: ExpenseCategory;
  label: string;
}[] = [
  { value: 'FOOD', label: 'Food' },
  { value: 'RENT', label: 'Rent' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'INTERNET', label: 'Internet' },
  {
    value: 'TRANSPORTATION',
    label: 'Transportation',
  },
  { value: 'GROCERIES', label: 'Groceries' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  {
    value: 'ENTERTAINMENT',
    label: 'Entertainment',
  },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'OTHERS', label: 'Others' },
];

const splitTypes: {
  value: ExpenseSplitType;
  label: string;
}[] = [
  {
    value: 'EQUAL',
    label: 'Split equally',
  },
  {
    value: 'EXACT',
    label: 'Exact amounts',
  },
  {
    value: 'PERCENTAGE',
    label: 'Percentage',
  },
];

const EditExpenseDialog = ({
  expense,
  householdId,
  open,
  onOpenChange,
  onUpdated,
}: EditExpenseDialogProps) => {
  const [description, setDescription] = useState('');

  const [amount, setAmount] = useState('');

  const [category, setCategory] = useState<ExpenseCategory>('FOOD');

  const [paidBy, setPaidBy] = useState('');

  const [splitType, setSplitType] = useState<ExpenseSplitType>('EQUAL');

  const [date, setDate] = useState('');

  const [notes, setNotes] = useState('');

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );

  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});

  const [percentages, setPercentages] = useState<Record<string, string>>({});

  const [errorMessage, setErrorMessage] = useState('');

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    isError: isMembersError,
  } = useGetHouseholdMembersQuery(householdId, {
    skip: !householdId || !open,
  });

  const [updateExpense, { isLoading }] = useUpdateExpenseMutation();

  const members = membersData?.data.members ?? [];

  useEffect(() => {
    if (!open || !expense) {
      return;
    }

    setDescription(expense.description);

    setAmount(String(expense.amount));

    setCategory(expense.category);

    setPaidBy(expense.paidBy._id);

    setSplitType(expense.splitType);

    setDate(format(new Date(expense.date), 'yyyy-MM-dd'));

    setNotes(expense.notes ?? '');

    setSelectedParticipants(
      expense.participants.map((participant) =>
        typeof participant.userId === 'string'
          ? participant.userId
          : participant.userId._id,
      ),
    );

    const nextExactAmounts: Record<string, string> = {};

    const nextPercentages: Record<string, string> = {};

    expense.participants.forEach((participant) => {
      const userId =
        typeof participant.userId === 'string'
          ? participant.userId
          : participant.userId._id;

      nextExactAmounts[userId] = String(participant.amount);

      if (participant.percentage !== null) {
        nextPercentages[userId] = String(participant.percentage);
      }
    });

    setExactAmounts(nextExactAmounts);

    setPercentages(nextPercentages);

    setErrorMessage('');
  }, [open, expense]);

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((current) => {
      if (current.includes(userId)) {
        setExactAmounts((currentAmounts) => {
          const updated = {
            ...currentAmounts,
          };

          delete updated[userId];

          return updated;
        });

        setPercentages((currentPercentages) => {
          const updated = {
            ...currentPercentages,
          };

          delete updated[userId];

          return updated;
        });

        return current.filter((id) => id !== userId);
      }

      return [...current, userId];
    });
  };

  const numericAmount = Number(amount) || 0;

  const exactTotal = selectedParticipants.reduce(
    (total, userId) => total + Number(exactAmounts[userId] || 0),
    0,
  );

  const remainingExactAmount = Number((numericAmount - exactTotal).toFixed(2));

  const percentageTotal = selectedParticipants.reduce(
    (total, userId) => total + Number(percentages[userId] || 0),
    0,
  );

  const roundedPercentageTotal = Number(percentageTotal.toFixed(2));

  const remainingPercentage = Number((100 - roundedPercentageTotal).toFixed(2));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expense) {
      return;
    }

    setErrorMessage('');

    const submitAmount = Number(amount);

    if (!description.trim()) {
      setErrorMessage('Please enter an expense description.');

      return;
    }

    if (!submitAmount || submitAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');

      return;
    }

    if (!paidBy) {
      setErrorMessage('Please select who paid for this expense.');

      return;
    }

    if (selectedParticipants.length === 0) {
      setErrorMessage('Please select at least one participant.');

      return;
    }

    let participants: {
      userId: string;
      amount: number;
      percentage?: number;
    }[];

    if (splitType === 'EQUAL') {
      participants = selectedParticipants.map((userId) => ({
        userId,
        amount: 0,
      }));
    } else if (splitType === 'EXACT') {
      const total = selectedParticipants.reduce(
        (sum, userId) => sum + Number(exactAmounts[userId] || 0),
        0,
      );

      if (Number(total.toFixed(2)) !== Number(submitAmount.toFixed(2))) {
        setErrorMessage(
          'Exact split amounts must equal the total expense amount.',
        );

        return;
      }

      participants = selectedParticipants.map((userId) => ({
        userId,
        amount: Number(exactAmounts[userId] || 0),
      }));
    } else {
      const total = selectedParticipants.reduce(
        (sum, userId) => sum + Number(percentages[userId] || 0),
        0,
      );

      if (Number(total.toFixed(2)) !== 100) {
        setErrorMessage('Percentage split must total exactly 100%.');

        return;
      }

      participants = selectedParticipants.map((userId) => ({
        userId,
        amount: 0,
        percentage: Number(percentages[userId] || 0),
      }));
    }

    try {
      await updateExpense({
        expenseId: expense._id,
        description: description.trim(),
        amount: submitAmount,
        category,
        paidBy,
        splitType,
        participants,
        ...(date && {
          date,
        }),
        notes: notes.trim(),
      }).unwrap();

      onOpenChange(false);

      onUpdated?.();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const apiError = error as {
          data?: {
            message?: string;
          };
        };

        setErrorMessage(apiError.data?.message || 'Failed to update expense.');
      } else {
        setErrorMessage('Something went wrong while updating the expense.');
      }
    }
  };

  if (!expense) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (isLoading) {
          return;
        }

        onOpenChange(value);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 sm:max-w-lg">
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Edit Expense
              </DialogTitle>

              <DialogDescription>
                Update this shared household expense.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-expense-description">Description</Label>

                <Input
                  id="edit-expense-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="edit-expense-amount">Amount</Label>

                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                    ₱
                  </span>

                  <Input
                    id="edit-expense-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="h-11 rounded-xl pl-8"
                  />
                </div>
              </div>

              {/* Category + Date */}
              <div className="grid items-center gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>

                  <NativeSelect
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as ExpenseCategory)
                    }
                    className="w-full rounded-xl"
                  >
                    {categories.map((item) => (
                      <NativeSelectOption key={item.value} value={item.value}>
                        {item.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>

                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-full justify-start rounded-xl font-normal"
                        />
                      }
                    >
                      <CalendarDays className="size-4 text-slate-400" />

                      {date
                        ? format(new Date(`${date}T00:00:00`), 'MMM dd, yyyy')
                        : 'Select date'}
                    </PopoverTrigger>

                    <PopoverContent
                      className="w-auto bg-white p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          date ? new Date(`${date}T00:00:00`) : undefined
                        }
                        onSelect={(selectedDate) =>
                          setDate(
                            selectedDate
                              ? format(selectedDate, 'yyyy-MM-dd')
                              : '',
                          )
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Paid By */}
              <div className="space-y-2">
                <Label>Paid by</Label>

                <NativeSelect
                  value={paidBy}
                  onChange={(event) => setPaidBy(event.target.value)}
                  disabled={isLoadingMembers}
                  className="h-11 w-full rounded-xl"
                >
                  {members.map((member) => (
                    <NativeSelectOption
                      key={member._id}
                      value={member.userId._id}
                    >
                      {member.userId.firstName} {member.userId.lastName}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>

                {isMembersError && (
                  <p className="text-xs text-red-500">
                    Failed to load household members.
                  </p>
                )}
              </div>

              {/* Split Type */}
              <div className="space-y-2">
                <Label>Split expense</Label>

                <NativeSelect
                  value={splitType}
                  onChange={(event) =>
                    setSplitType(event.target.value as ExpenseSplitType)
                  }
                  className="h-11 w-full rounded-xl"
                >
                  {splitTypes.map((item) => (
                    <NativeSelectOption key={item.value} value={item.value}>
                      {item.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              {/* Participants */}
              <div className="space-y-3">
                <div>
                  <Label>Split between</Label>

                  <p className="mt-1 text-xs text-slate-400">
                    Select the household members included in this expense.
                  </p>
                </div>

                <div className="space-y-1 rounded-xl border border-slate-200 p-2">
                  {members.map((member) => {
                    const user = member.userId;

                    const checked = selectedParticipants.includes(user._id);

                    return (
                      <div
                        key={member._id}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleParticipant(user._id)}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="text-xs text-slate-400">
                            {member.role === 'OWNER'
                              ? 'Household owner'
                              : 'Member'}
                          </p>
                        </div>

                        {splitType === 'EXACT' && checked && (
                          <div className="relative w-28">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-slate-400">
                              ₱
                            </span>

                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={exactAmounts[user._id] ?? ''}
                              onChange={(event) =>
                                setExactAmounts((current) => ({
                                  ...current,
                                  [user._id]: event.target.value,
                                }))
                              }
                              className="h-9 rounded-lg pl-7 text-right"
                            />
                          </div>
                        )}

                        {splitType === 'PERCENTAGE' && checked && (
                          <div className="relative w-24">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={percentages[user._id] ?? ''}
                              onChange={(event) =>
                                setPercentages((current) => ({
                                  ...current,
                                  [user._id]: event.target.value,
                                }))
                              }
                              className="h-9 rounded-lg pr-7 text-right"
                            />

                            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">
                              %
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {splitType === 'EXACT' && (
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned</span>

                      <span className="font-semibold text-slate-700">
                        ₱{exactTotal.toFixed(2)} / ₱{numericAmount.toFixed(2)}
                      </span>
                    </div>

                    {remainingExactAmount > 0 && (
                      <p className="mt-1 text-amber-600">
                        ₱{remainingExactAmount.toFixed(2)} remaining
                      </p>
                    )}

                    {remainingExactAmount < 0 && (
                      <p className="mt-1 text-red-500">
                        ₱{Math.abs(remainingExactAmount).toFixed(2)} over
                      </p>
                    )}
                  </div>
                )}

                {splitType === 'PERCENTAGE' && (
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Percentage assigned
                      </span>

                      <span className="font-semibold text-slate-700">
                        {roundedPercentageTotal}
                        /100%
                      </span>
                    </div>

                    {remainingPercentage > 0 && (
                      <p className="mt-1 text-amber-600">
                        {remainingPercentage}% remaining
                      </p>
                    )}

                    {remainingPercentage < 0 && (
                      <p className="mt-1 text-red-500">
                        {Math.abs(remainingPercentage)}% over
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#51705d] focus:ring-3 focus:ring-[#51705d]/10"
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  disabled={isLoading}
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  size="xl"
                  disabled={isLoading || isLoadingMembers}
                  className="rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Pencil className="size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseDialog;
