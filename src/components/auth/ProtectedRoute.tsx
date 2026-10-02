import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetMeQuery } from '@/features/auth/authApi';
import { logout, setUser } from '@/features/auth/authSlice';

const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const { data, isError, isFetching, isLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || !!user,
  });

  useEffect(() => {
    if (data?.data.user) {
      dispatch(setUser(data.data.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(logout());
    }
  }, [dispatch, isError]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user && (isLoading || isFetching)) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
