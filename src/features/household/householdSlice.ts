import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Household } from './householdApi';

// Redux will remember the currently selected household.
interface HouseholdState {
  selectedHousehold: Household | null;
}

export const parseStoredHousehold = (
  storedHousehold: string | null,
): Household | null => {
  if (!storedHousehold) return null;

  try {
    const household: unknown = JSON.parse(storedHousehold);
    if (
      typeof household === 'object' &&
      household !== null &&
      'id' in household &&
      typeof household.id === 'string' &&
      household.id.length > 0 &&
      'name' in household &&
      typeof household.name === 'string' &&
      'currency' in household &&
      typeof household.currency === 'string'
    ) {
      return household as Household;
    }
  } catch {
    // Older selections may contain an ID or invalid JSON instead of a household.
  }

  return null;
};

// This gets the household from localStorage when your app starts.
// parseStoredHousehold() converts that string back into a JavaScript object.
const initialState: HouseholdState = {
  selectedHousehold: parseStoredHousehold(
    localStorage.getItem('selectedHousehold'),
  ),
};

const householdSlice = createSlice({
  name: 'household',

  initialState,

  reducers: {
    // Select this household.
    setSelectedHousehold: (state, action: PayloadAction<Household>) => {
      state.selectedHousehold = action.payload;

      localStorage.setItem('selectedHousehold', JSON.stringify(action.payload));
    },

    // Remove the selected household. from Redux and localStorage
    clearSelectedHousehold: (state) => {
      state.selectedHousehold = null;

      localStorage.removeItem('selectedHousehold');
    },
  },
});

export const { setSelectedHousehold, clearSelectedHousehold } =
  householdSlice.actions;

export default householdSlice.reducer;
