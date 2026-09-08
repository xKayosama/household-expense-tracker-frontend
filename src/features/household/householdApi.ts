import { api } from '@/services/api';

export interface Household {
  id: string;
  name: string;
  currency: string;
  role: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  joinedAt: string;
}

export interface HouseholdResponse {
  success: boolean;
  message?: string;
  data: {
    households: Household[];
  };
}

export const householdApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHouseholds: builder.query<HouseholdResponse, void>({
      query: () => '/households',
      providesTags: ['Household'],
    }),
  }),
});

export const { useGetHouseholdsQuery } = householdApi;
