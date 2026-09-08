import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Scale,
  Settings,
  Users,
} from 'lucide-react';
import { useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { clearSelectedHousehold } from '@/features/household/householdSlice';

const navigation = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Expenses',
    path: '/expenses',
    icon: Receipt,
  },
  {
    label: 'Bills',
    path: '/bills',
    icon: FileText,
  },
  {
    label: 'Members',
    path: '/members',
    icon: Users,
  },
  {
    label: 'Balances',
    path: '/balances',
    icon: Scale,
  },
  {
    label: 'Settlements',
    path: '/settlements',
    icon: ArrowLeftRight,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearSelectedHousehold());

    navigate('/login', { replace: true });
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-white lg:flex">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-6">
        <div className="flex items-center gap-1 text-xl font-semibold tracking-tight text-[#173f35]">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#d5ebaa] text-[#173f35]">
            <span className="text-sm font-bold">H</span>
          </span>

          <span>
            HomeSplit<span className="text-[#51705d]">.</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-[#51705d] uppercase">
          Main
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#173f35] text-white shadow-sm'
                      : 'text-slate-600 hover:bg-[#f1f5eb] hover:text-[#173f35]',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={[
                        'size-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-[#d5ebaa]'
                          : 'text-[#51705d] group-hover:text-[#173f35]',
                      ].join(' ')}
                      strokeWidth={1.8}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-[#51705d] uppercase">
            Account
          </p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-[#f1f5eb] text-[#173f35]'
                  : 'text-slate-600 hover:bg-[#f1f5eb] hover:text-[#173f35]',
              ].join(' ')
            }
          >
            <Settings
              className="size-4 text-[#51705d] group-hover:text-[#173f35]"
              strokeWidth={1.8}
            />

            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="group mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut
              className="size-4 text-slate-400 transition-colors group-hover:text-red-500"
              strokeWidth={1.8}
            />

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
