import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

const AppShell = () => {
  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
