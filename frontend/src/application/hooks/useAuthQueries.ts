import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../application/services/auth.service';
import { RegisterResponse } from '../../domain/types/auth/Register';
import { LoginResponse } from '../../domain/types/auth/Login';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
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
      toast.success('Registration successful! Please login.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    }
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
      toast.success('Logged out successfully');
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

export const useLogoutAll = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
      toast.success('Logged out from all sessions');
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('Logout all failed:', error);
      dispatch(logout());
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};