import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from './store';

// SEND something to Redux
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// GET something from Redux
export const useAppSelector = useSelector.withTypes<RootState>();
