import { useState, useEffect } from "react";
import { FaCheck, FaEye, FaEyeSlash, FaShieldAlt, FaTimes } from "react-icons/fa";
import { PasswordChangeModalProps } from "../../../../domain/types/settings/user";

export const PasswordChangeModal = ({
  isOpen,
  onClose,
  onPasswordChange,
  isLoading,
  error,
}: PasswordChangeModalProps) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePasswordUpdate = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      passwords.currentPassword &&
      passwords.newPassword &&
      passwords.newPassword === passwords.confirmPassword
    ) {
      try {
        await onPasswordChange(passwords);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
        // Error is handled via props and displayed in UI
      }
    }
  };

  const handleClose = () => {
    onClose();
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field as keyof typeof prev]: !prev[field as keyof typeof prev] }));
  };

  const isValid =
    passwords.currentPassword &&
    passwords.newPassword &&
    passwords.newPassword === passwords.confirmPassword;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-sky-50 to-slate-50 -m-6 mb-4 p-4 rounded-t-2xl border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-sm">
                <FaShieldAlt className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
                <p className="text-slate-600 text-xs">Update your account password</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center text-sm animate-shake">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <FaTimes className="w-3 h-3 text-red-600" />
              </div>
              {error.message}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-800 text-sm font-medium">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.currentPassword ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={(e) => handlePasswordUpdate('currentPassword', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('currentPassword')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                {showPasswords.currentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-800 text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                value={passwords.newPassword}
                onChange={(e) => handlePasswordUpdate('newPassword', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('newPassword')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                {showPasswords.newPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-slate-800 text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                value={passwords.confirmPassword}
                onChange={(e) => handlePasswordUpdate('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all duration-200"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                {showPasswords.confirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
              <p className="text-red-500 text-xs">Passwords do not match</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className={`flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium ${isLoading ? 'opacity-70' : ''
                }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <FaCheck className="w-3.5 h-3.5 mr-1.5" />
              )}
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
            >
              <FaTimes className="w-3.5 h-3.5 mr-1.5" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};