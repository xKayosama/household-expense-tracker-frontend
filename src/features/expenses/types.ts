export type ExpenseCategory =
  | 'FOOD'
  | 'RENT'
  | 'UTILITIES'
  | 'INTERNET'
  | 'TRANSPORTATION'
  | 'GROCERIES'
  | 'HEALTHCARE'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'OTHERS';

export type ExpenseSplitType =
  | 'EQUAL'
  | 'EXACT'
  | 'PERCENTAGE';

export interface ExpenseParticipant {
  userId: string;
  amount: number;
  percentage: number | null;
}

export interface ExpenseUser {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface Expense {
  _id: string;
  householdId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: ExpenseUser;
  splitType: ExpenseSplitType;
  participants: ExpenseParticipant[];
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ExpensesResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    expenses: Expense[];
  };
  pagination: ExpensePagination;
}