import { AlertTriangle, LoaderCircle, Trash2 } from 'lucide-react';

import { useDeleteExpenseMutation } from '@/features/expenses/expenseApi';
import type { Expense } from '@/features/expenses/types';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

const DeleteExpenseDialog = ({
  expense,
  open,
  onOpenChange,
  onDeleted,
}: DeleteExpenseDialogProps) => {
  const [deleteExpense, { isLoading }] = useDeleteExpenseMutation();

  const handleDelete = async () => {
    if (!expense) {
      return;
    }

    try {
      await deleteExpense(expense._id).unwrap();

      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  if (!expense) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-2xl bg-white p-0 sm:max-w-md">
        <div className="px-6 pt-6">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="size-6 text-red-600" />
          </div>

          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold text-slate-900">
              Delete expense?
            </DialogTitle>

            <DialogDescription className="text-sm leading-6 text-slate-500">
              This expense will be permanently removed from your household
              records.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <Trash2 className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {expense.description}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 mb-1 border-t border-slate-100 bg-slate-50/50 px-9">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
            size="xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isLoading}
            onClick={handleDelete}
            variant="destructive"
            size="xl"
          >
            {isLoading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete expense
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteExpenseDialog;
