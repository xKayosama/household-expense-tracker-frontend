import { useEffect, useState } from 'react';
import { CalendarDays, LoaderCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useCreateExpenseMutation } from '@/features/expenses/expenseApi';
import type { CreateExpenseRequest } from '@/features/expenses/expenseApi';

import type {
  ExpenseCategory,
  ExpenseSplitType,
} from '@/features/expenses/types';

import { useGetHouseholdMembersQuery } from '@/features/members/memberApi';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

interface AddExpenseDialogProps {
  householdId: string;
}

const categories: {
  value: ExpenseCategory;
  label: string;
}[] = [
  { value: 'FOOD', label: 'Food' },
  { value: 'RENT', label: 'Rent' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'INTERNET', label: 'Internet' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'GROCERIES', label: 'Groceries' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'SHOPPING', label: 'Shopping' },
  { value: 'OTHERS', label: 'Others' },
];

const splitTypes: {
  value: ExpenseSplitType;
  label: string;
}[] = [
  { value: 'EQUAL', label: 'Split equally' },
  { value: 'EXACT', label: 'Exact amounts' },
  { value: 'PERCENTAGE', label: 'Percentage' },
];

const AddExpenseDialog = ({ householdId }: AddExpenseDialogProps) => {
  const [open, setOpen] = useState(false);

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
    skip: !householdId,
  });

  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const members = membersData?.data.members ?? [];

  const numericAmount = Number(amount) || 0;

  const exactTotal = selectedParticipants.reduce(
    (total, userId) => total + Number(exactAmounts[userId] || 0),
    0,
  );

  const remainingExactAmount = numericAmount - exactTotal;

  useEffect(() => {
    if (!open || members.length === 0) {
      return;
    }

    if (!paidBy) {
      setPaidBy(members[0].userId._id);
    }

    if (selectedParticipants.length === 0) {
      setSelectedParticipants(members.map((member) => member.userId._id));
    }
  }, [open, members, paidBy, selectedParticipants.length]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('FOOD');
    setPaidBy('');
    setSplitType('EQUAL');
    setDate('');
    setNotes('');
    setSelectedParticipants([]);
    setExactAmounts({});
    setPercentages({});
    setErrorMessage('');
  };

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants((current) => {
      const isSelected = current.includes(userId);

      if (isSelected) {
        setExactAmounts((currentAmounts) => {
          const updated = { ...currentAmounts };

          delete updated[userId];

          return updated;
        });

        setPercentages((currentPercentages) => {
          const updated = { ...currentPercentages };

          delete updated[userId];

          return updated;
        });

        return current.filter((id) => id !== userId);
      }

      return [...current, userId];
    });
  };

  const handleOpenChange = (value: boolean) => {
    if (isLoading) {
      return;
    }

    setOpen(value);

    if (!value) {
      resetForm();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

    if (!members.length) {
      setErrorMessage('No household members are available.');

      return;
    }

    if (selectedParticipants.length === 0) {
      setErrorMessage('Please select at least one participant.');

      return;
    }

    let participants: CreateExpenseRequest['participants'];

    if (splitType === 'EQUAL') {
      participants = selectedParticipants.map((userId) => ({
        userId,
        amount: 0,
        percentage: null,
      }));
    } else if (splitType === 'EXACT') {
      const submitExactTotal = selectedParticipants.reduce(
        (total, userId) => total + Number(exactAmounts[userId] || 0),
        0,
      );

      if (
        Number(submitExactTotal.toFixed(2)) !== Number(submitAmount.toFixed(2))
      ) {
        setErrorMessage(
          'Exact split amounts must equal the total expense amount.',
        );

        return;
      }

      participants = selectedParticipants.map((userId) => ({
        userId,
        amount: Number(exactAmounts[userId] || 0),
        percentage: null,
      }));
    } else {
      const submitPercentageTotal = selectedParticipants.reduce(
        (total, userId) => total + Number(percentages[userId] || 0),
        0,
      );

      if (Number(submitPercentageTotal.toFixed(2)) !== 100) {
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
      await createExpense({
        householdId,
        description: description.trim(),
        amount: submitAmount,
        category,
        paidBy,
        splitType,
        participants,
        ...(date && {
          date,
        }),
        ...(notes.trim() && {
          notes: notes.trim(),
        }),
      }).unwrap();

      setOpen(false);
      resetForm();
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const apiError = error as {
          data?: {
            message?: string;
          };
        };

        setErrorMessage(apiError.data?.message || 'Failed to create expense.');
      } else {
        setErrorMessage('Something went wrong while creating the expense.');
      }
    }
  };

  const percentageTotal = selectedParticipants.reduce(
    (total, userId) => total + Number(percentages[userId] || 0),
    0,
  );

  const remainingPercentage = 100 - percentageTotal;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className="h-10 rounded-xl  px-4 text-sm font-semibold text-white " />
        }
      >
        <Plus className="size-4" />
        Add Expense
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 sm:max-w-lg">
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Add Expense
              </DialogTitle>

              <DialogDescription>
                Record a shared household expense.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>

                <Input
                  id="expense-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="e.g. Grocery shopping"
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>

                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-400">
                    ₱
                  </span>

                  <Input
                    id="expense-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="0.00"
                    className="h-11 rounded-xl pl-8"
                    required
                  />
                </div>
              </div>

              {/* Category + Date */}
              <div className="grid items-center gap-5 sm:grid-cols-2">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="expense-category">Category</Label>

                  <NativeSelect
                    id="expense-category"
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

                {/* Date */}
                <div className="space-y-2">
                  <Label>Date</Label>

                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-full justify-start rounded-xl text-left font-normal"
                        />
                      }
                    >
                      <CalendarDays className="size-4 text-slate-400" />

                      {date ? (
                        format(new Date(`${date}T00:00:00`), 'MMM dd, yyyy')
                      ) : (
                        <span className="text-slate-400">Select date</span>
                      )}
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
                        onSelect={(selectedDate) => {
                          setDate(
                            selectedDate
                              ? format(selectedDate, 'yyyy-MM-dd')
                              : '',
                          );
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Paid By */}
              <div className="space-y-2">
                <Label htmlFor="paid-by">Paid by</Label>

                <NativeSelect
                  id="paid-by"
                  value={paidBy}
                  onChange={(event) => setPaidBy(event.target.value)}
                  disabled={isLoadingMembers || members.length === 0}
                  className="h-11 w-full rounded-xl"
                >
                  <NativeSelectOption value="" disabled>
                    {isLoadingMembers ? 'Loading members...' : 'Select member'}
                  </NativeSelectOption>

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
                <Label htmlFor="split-type">Split expense</Label>

                <NativeSelect
                  id="split-type"
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

              {/* Split Between */}
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
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-slate-50"
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

                        {/* Paid Badge */}
                        {paidBy === user._id && (
                          <span className="rounded-full bg-[#f1f5eb] px-2 py-1 text-[10px] font-medium text-[#51705d]">
                            Paid
                          </span>
                        )}

                        {/* Exact Amount */}
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
                              placeholder="0.00"
                              className="h-9 rounded-lg pl-7 text-right"
                            />
                          </div>
                        )}

                        {/* Percentage Input */}
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
                              placeholder="0"
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

                <p className="text-xs text-slate-400">
                  {selectedParticipants.length}{' '}
                  {selectedParticipants.length === 1 ? 'member' : 'members'}{' '}
                  selected
                </p>

                {/* Exact Total */}
                {splitType === 'EXACT' && numericAmount > 0 && (
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Assigned</span>

                      <span className="font-semibold text-slate-700">
                        ₱
                        {exactTotal.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        {' / '}₱
                        {numericAmount.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {remainingExactAmount !== 0 && (
                      <p
                        className={`mt-1 text-xs ${
                          remainingExactAmount > 0
                            ? 'text-amber-600'
                            : 'text-red-500'
                        }`}
                      >
                        {remainingExactAmount > 0
                          ? `₱${remainingExactAmount.toFixed(2)} remaining`
                          : `₱${Math.abs(remainingExactAmount).toFixed(
                              2,
                            )} over`}
                      </p>
                    )}

                    {remainingExactAmount === 0 && (
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        Fully assigned
                      </p>
                    )}
                  </div>
                )}

                {/* Percentage */}
                {splitType === 'PERCENTAGE' && (
                  <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Percentage assigned
                      </span>

                      <span className="font-semibold text-slate-700">
                        {percentageTotal.toFixed(2)} / 100%
                      </span>
                    </div>

                    {remainingPercentage > 0 && (
                      <p className="mt-1 text-xs text-amber-600">
                        {remainingPercentage.toFixed(2)}% remaining
                      </p>
                    )}

                    {remainingPercentage < 0 && (
                      <p className="mt-1 text-xs text-red-500">
                        {Math.abs(remainingPercentage).toFixed(2)}% over
                      </p>
                    )}

                    {remainingPercentage === 0 && (
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        Fully assigned
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="expense-notes">
                  Notes
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </Label>

                <textarea
                  id="expense-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any additional details..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#51705d] focus:ring-3 focus:ring-[#51705d]/10"
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                  size="xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isLoading || isLoadingMembers || members.length === 0
                  }
                  className="rounded-xl bg-[#173f35] text-white hover:bg-[#245646]"
                  size="xl"
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" />
                      Add Expense
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

export default AddExpenseDialog;
