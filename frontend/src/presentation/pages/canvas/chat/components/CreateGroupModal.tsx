import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiUser, FiCheck, FiMessageSquare, FiUsers, FiImage, FiLock, FiCamera, FiArrowLeft } from 'react-icons/fi';
import { CreateGroupModalProps, User } from '../../../../../domain/types/canvas/chat';

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  onClose,
  onCreateGroup,
  onSearch
}) => {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);

  const [step, setStep] = useState<'participants' | 'info'>('participants');
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState({
    onlyAdminsCanPost: false,
    onlyAdminsCanAddMembers: false,
    onlyAdminsCanChangeInfo: false,
    onlyAdminsCanPinMessages: false,
    onlyAdminsCanSendMedia: false,
    onlyAdminsCanSendLinks: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [groupAvatarPreview, setGroupAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);
    setFieldErrors({});
    if (query.trim()) {
      try {
        const result = await onSearch(query);
        let usersArray: User[] = [];
        if (result && typeof result === 'object') {
          if ('items' in result && Array.isArray(result.items)) {
            usersArray = result.items;
          } else if ('data' in result && Array.isArray(result.data)) {
            usersArray = result.data;
          }
        }
        const mappedUsers = usersArray.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          avatar: user.avatar
        }));
        const filteredUsers = mappedUsers.filter((user) => !selectedUsers.some(selected => selected.id === user.id));
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u.id !== user.id));
    setError(null);
    setFieldErrors({});
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleNext = () => {
    if (selectedUsers.length > 0) {
      setStep('info');
      setError(null);
      setFieldErrors({});
    } else {
      setError('Please select at least one participant');
    }
  };

  const handleBack = () => {
    setStep('participants');
    setError(null);
    setFieldErrors({});
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setGroupAvatar(file);
    if (file) {
      setGroupAvatarPreview(URL.createObjectURL(file));
    } else {
      setGroupAvatarPreview(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    const newFieldErrors: { name?: string; description?: string } = {};

    // Frontend Validation
    if (!groupName.trim()) {
      newFieldErrors.name = 'Group subject is required';
    } else if (groupName.trim().length < 3) {
      newFieldErrors.name = 'Group subject must be at least 3 characters';
    }

    if (!description.trim()) {
      newFieldErrors.description = 'Group description is required';
    } else if (description.trim().length < 10) {
      newFieldErrors.description = 'Description must be at least 10 characters';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError('Please fix the errors below');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('At least one participant is required');
      setStep('participants');
      return;
    }

    setIsSubmitting(true);
    const params = {
      name: groupName.trim(),
      description: description.trim(),
      participants: selectedUsers.map(user => user.id),
      settings,
      avatar: groupAvatar ? groupAvatar : undefined,
    };

    try {
      await onCreateGroup(params);
    } catch (err: any) {
      console.error('Error in CreateGroupModal handleSubmit:', err);
      // Handle backend errors
      const backendMessage = err.response?.data?.message || err.message || 'Failed to create group. Please try again.';
      setError(backendMessage);

      // Try to map backend error to fields if possible
      if (backendMessage.toLowerCase().includes('name')) {
        setFieldErrors(prev => ({ ...prev, name: backendMessage }));
      } else if (backendMessage.toLowerCase().includes('description')) {
        setFieldErrors(prev => ({ ...prev, description: backendMessage }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderParticipantsStep = () => {
    return (
      <>
        <div className="flex items-center px-6 py-4 bg-[#00a884] text-white">
          <button onClick={onClose} className="mr-6">
            <FiX size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-medium">Add participants</h2>
            <p className="text-sm opacity-90">{selectedUsers.length} selected</p>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a3942]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Type contact name"
              className="w-full py-2 px-0 text-lg bg-transparent border-0 border-b-2 border-[#00a884] focus:outline-none focus:border-[#00a884] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a3942]">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <FiUser size={20} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <button
                      onClick={() => handleUserRemove(user.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center"
                    >
                      <FiX size={12} className="text-white" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-[60px] truncate">
                    {user.name?.split(' ')[0] || user.firstName || 'User'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && step === 'participants' && (
          <div className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border-b border-red-200 dark:border-red-800 flex items-center">
            <FiX className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="w-full flex items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-[#2c3e50] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden mr-4">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || user.firstName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <FiUser size={20} className="text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-gray-900 dark:text-white font-medium">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </button>
            ))
          ) : searchQuery ? (
            <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No contacts found
            </div>
          ) : null}
        </div>

        {/* Next Button */}
        {selectedUsers.length > 0 && (
          <div className="p-4">
            <button
              onClick={handleNext}
              className="w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center ml-auto hover:bg-[#008a72] transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 18L8 16.6l4.6-4.6L8 7.4L9.4 6l6 6z" />
              </svg>
            </button>
          </div>
        )}
      </>
    );
  };

  const renderInfoStep = () => {
    return (
      <>
        <div className="flex items-center px-6 py-4 bg-[#00a884] text-white">
          <button onClick={handleBack} className="mr-6">
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-medium">New group</h2>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {error && step === 'info' && (
            <div className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border-b border-red-200 dark:border-red-800 flex items-center">
              <FiX className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 border-b border-gray-200 dark:border-[#2a3942]">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    {groupAvatarPreview ? (
                      <img src={groupAvatarPreview} alt="Group avatar preview" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <FiCamera size={24} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <label
                    htmlFor="group-avatar-upload"
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center cursor-pointer"
                    title="Upload group avatar"
                  >
                    <FiCamera size={12} className="text-white" />
                    <input
                      id="group-avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => {
                      setGroupName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                      setError(null);
                    }}
                    placeholder="Group subject"
                    className={`w-full py-2 px-0 text-lg bg-transparent border-0 border-b ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} dark:border-[#2a3942] focus:outline-none ${fieldErrors.name ? 'focus:border-red-500' : 'focus:border-[#00a884]'} text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                    required
                    maxLength={25}
                  />
                  {fieldErrors.name && (
                    <div className="text-xs text-red-500 mt-1">
                      {fieldErrors.name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {25 - groupName.length} characters remaining
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a3942]">
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: undefined }));
                    setError(null);
                  }}
                  placeholder="Group description (required)"
                  className={`w-full py-2 px-0 bg-transparent border-0 border-b ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'} dark:border-[#2a3942] focus:outline-none ${fieldErrors.description ? 'focus:border-red-500' : 'focus:border-[#00a884]'} text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none`}
                  rows={1}
                  maxLength={512}
                />
                {fieldErrors.description && (
                  <div className="text-xs text-red-500 mt-1">
                    {fieldErrors.description}
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {512 - description.length} characters remaining
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a3942]">
              <div className="text-[#00a884] text-sm font-medium mb-3">
                Participants: {selectedUsers.length}
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <FiUser size={14} className="text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">{user.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUserRemove(user.id)}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-[#00a884] text-sm font-medium">Group settings</span>
                <svg
                  className={`w-4 h-4 text-[#00a884] transition-transform ${showSettings ? 'rotate-180' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showSettings && (
                <div className="mt-4 space-y-3">
                  <label className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <FiMessageSquare size={16} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Send messages</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!settings.onlyAdminsCanPost}
                      onChange={(e) => setSettings(prev => ({ ...prev, onlyAdminsCanPost: !e.target.checked }))}
                      className="w-4 h-4 text-[#00a884] border-gray-300 rounded focus:ring-[#00a884]"
                    />
                  </label>

                  <label className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <FiUsers size={16} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Add other members</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!settings.onlyAdminsCanAddMembers}
                      onChange={(e) => setSettings(prev => ({ ...prev, onlyAdminsCanAddMembers: !e.target.checked }))}
                      className="w-4 h-4 text-[#00a884] border-gray-300 rounded focus:ring-[#00a884]"
                    />
                  </label>

                  <label className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <FiImage size={16} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Send media</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!settings.onlyAdminsCanSendMedia}
                      onChange={(e) => setSettings(prev => ({ ...prev, onlyAdminsCanSendMedia: !e.target.checked }))}
                      className="w-4 h-4 text-[#00a884] border-gray-300 rounded focus:ring-[#00a884]"
                    />
                  </label>

                  <label className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <FiLock size={16} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Edit group info</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!settings.onlyAdminsCanChangeInfo}
                      onChange={(e) => setSettings(prev => ({ ...prev, onlyAdminsCanChangeInfo: !e.target.checked }))}
                      className="w-4 h-4 text-[#00a884] border-gray-300 rounded focus:ring-[#00a884]"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 mt-auto">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !groupName.trim()}
              className="w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center ml-auto hover:bg-[#008a72] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiCheck size={20} />
              )}
            </button>
          </div>
        </div>
      </>
    );
  };

// Create portal to render modal at the top of DOM
const modalContent = (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-white dark:bg-[#111b21] w-full max-w-md h-[90vh] max-h-[600px] flex flex-col shadow-xl rounded-lg overflow-hidden">
      {step === 'participants' ? renderParticipantsStep() : renderInfoStep()}
    </div>
  </div>
);

// Use portal to render at the top of DOM tree
return createPortal(modalContent, document.body);
};

export default CreateGroupModal;