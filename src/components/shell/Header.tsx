import {
  UserCircle,
} from 'lucide-react';

import { useAppSelector } from '@/app/hooks';
import HouseholdSelector from '@/features/household/components/HouseholdSelector';

const Header = () => {
  const user = useAppSelector(
    (state) => state.auth.user
  );

  return (
    <header className="relative flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
      {/* Household */}
      <HouseholdSelector />

      {/* User */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {user
              ? `${user.firstName} ${user.lastName}`
              : 'User'}
          </p>

          <p className="text-xs text-slate-400">
            Household Member
          </p>
        </div>

        {/* Avatar */}
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="size-9 rounded-full object-cover ring-2 ring-[#f1f5eb]"
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-[#173f35] text-sm font-semibold text-[#d5ebaa]">
            {user?.firstName ? (
              user.firstName.charAt(0).toUpperCase()
            ) : (
              <UserCircle className="size-5" />
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;