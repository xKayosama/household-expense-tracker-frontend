import { useState } from 'react';
import { Check, ChevronDown, Home, LoaderCircle } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setSelectedHousehold } from '@/features/household/householdSlice';
import { useGetHouseholdsQuery } from '@/features/household/householdApi';

const HouseholdSelector = () => {
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const selectedHousehold = useAppSelector(
    (state) => state.household.selectedHousehold,
  );

  const { data, isLoading, isError } = useGetHouseholdsQuery();

  const households = data?.data.households ?? [];

  const handleSelectHousehold = (household: (typeof households)[number]) => {
    dispatch(setSelectedHousehold(household));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-secondary"
      >
        {/* Icon */}
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Home className="size-4" strokeWidth={1.8} />
        </span>

        {/* Household Name */}
        <div className="hidden text-left sm:block">
          <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            Household
          </p>

          <div className="flex items-center gap-1">
            <p className="max-w-48 truncate text-sm font-semibold text-foreground">
              {selectedHousehold?.name ?? 'Select Household'}
            </p>

            <ChevronDown
              className={[
                'size-3.5 text-muted-foreground transition-transform',
                isOpen ? 'rotate-180' : '',
              ].join(' ')}
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Mobile Chevron */}
        <ChevronDown
          className={[
            'size-4 text-muted-foreground transition-transform sm:hidden',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
          strokeWidth={2}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg"
          role="menu"
        >
          {/* Header */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
              Your Households
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose where you want to manage expenses.
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />

              <span>Loading households...</span>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium text-destructive">
                Failed to load households.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Please try again later.
              </p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && households.length === 0 && (
            <div className="px-4 py-6 text-center">
              <Home className="mx-auto size-5 text-muted-foreground/50" />

              <p className="mt-2 text-sm font-medium text-foreground">
                No households found.
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Create or join a household to get started.
              </p>
            </div>
          )}

          {/* Household List */}
          {!isLoading && !isError && households.length > 0 && (
            <div className="max-h-72 overflow-y-auto p-2">
              {households.map((household) => {
                const isSelected = selectedHousehold?.id === household.id;

                return (
                  <button
                    key={household.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelectHousehold(household)}
                    className={[
                      'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                      isSelected ? 'bg-secondary' : 'hover:bg-muted',
                    ].join(' ')}
                  >
                    {/* Icon */}
                    <span
                      className={[
                        'flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      <Home className="size-4" strokeWidth={1.8} />
                    </span>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={[
                          'truncate text-sm font-semibold',
                          isSelected
                            ? 'text-secondary-foreground'
                            : 'text-foreground',
                        ].join(' ')}
                      >
                        {household.name}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {household.currency}
                      </p>
                    </div>

                    {/* Selected */}
                    {isSelected && (
                      <Check
                        className="size-4 shrink-0 text-primary"
                        strokeWidth={2.2}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HouseholdSelector;
