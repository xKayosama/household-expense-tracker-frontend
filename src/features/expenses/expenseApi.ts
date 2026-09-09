import { api } from '@/services/api';

import type {
  ExpenseCategory,
  ExpenseSplitType,
  ExpensesResponse,
} from './types';

export interface GetExpensesParams {
  householdId: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface ExpensesParticipants {
  userId: string;
  amount: number;
}

export interface CreateExpenseRequest {
  householdId: string;
  description: string;
  amount: number;
  category: string;
  paidBy: string;
  splitType: string;
  participants: ExpensesParticipants[];
  date?: string;
  notes?: string;
}

export const expenseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<ExpensesResponse, GetExpensesParams>({
      query: ({
        householdId,
        page = 1,
        limit = 10,
        category,
        startDate,
        endDate,
      }) => ({
        url: `/households/${householdId}/expenses`,
        params: {
          page,
          limit,
          category,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),

      providesTags: ['Expense'],
    }),

    createExpense: builder.mutation<unknown, CreateExpenseRequest>({
      query: ({ householdId, ...body }) => ({
        url: `/households/${householdId}/expenses`,
        method: 'POST',
        body,
      }),

      invalidatesTags: ['Expense', 'Balance', 'Settlement', 'Dashboard'],
    }),
  }),
});

export const { useGetExpensesQuery, useCreateExpenseMutation } = expenseApi;
