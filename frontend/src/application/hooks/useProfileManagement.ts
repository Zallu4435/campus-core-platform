import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../appStore/authSlice';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profile.service';
import { PasswordChangeData, ProfileData } from '../../domain/types/settings/user';

export const useProfileManagement = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { data: profile, isLoading, error } = useQuery<ProfileData, Error>({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    staleTime: 30 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { mutateAsync: updateProfile, isPending: isUpdating, error: updateError } = useMutation({
    mutationFn: (data: ProfileData) => profileService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const { mutateAsync: changePassword, isPending: isChangingPassword, error: passwordError } = useMutation({
    mutationFn: (data: PasswordChangeData) => profileService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password');
    },
  });

  const { mutateAsync: updateProfilePicture } = useMutation({
    mutationFn: (file: File) => profileService.updateProfilePicture(file),
    onSuccess: (url: string) => {
      queryClient.setQueryData(['profile'], (oldData: ProfileData | undefined) =>
        oldData ? { ...oldData, profilePicture: url } : oldData
      );
      dispatch(updateUser({ profilePicture: url }));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile picture');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    profile: profile,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    updateProfile,
    isUpdating,
    updateError,
    changePassword,
    isChangingPassword,
    passwordError,
    updateProfilePicture,
  };
};