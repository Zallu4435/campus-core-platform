import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../application/services/auth.service';
import { RegisterResponse } from '../../domain/types/auth/Register';
import { LoginResponse } from '../../domain/types/auth/Login';
import { useDispatch } from 'react-redux';
import { logout } from '../../appStore/authSlice';
import { useNavigate } from 'react-router-dom';

export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    RegisterResponse,
    Error,
    { firstName: string; lastName: string; email: string; password: string }
  >({
    mutationFn: authService.registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, { email: string; password: string }>({
    mutationFn: authService.loginUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Even if backend fails, clear local state and redirect
      dispatch(logout());
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};