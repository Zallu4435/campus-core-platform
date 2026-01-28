import React, { useState } from 'react';
import { FiX, FiUser, FiEdit2, FiUsers, FiLock, FiMessageSquare, FiTrash2, FiLogOut, FiBell, FiBellOff, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useChatQueries } from '../hooks/useChatQueries';
import { useChatMutations } from '../hooks/useChatMutations';
import { toast } from 'react-hot-toast';
import { GroupSettingsModalProps, User, Chat, GroupSettingKey, SettingConfig } from '../../../../../domain/types/canvas/chat';
import { settingsConfig } from '../utils/chatUtils';

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  onClose,
  chat,
  currentUser,
  onLeaveGroup,
}) => {
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isMuted, setIsMuted] = useState(chat.isMuted || false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDescription, setNewDescription] = useState(chat.description || '');
  const [newName, setNewName] = useState(chat.name || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const { chatDetails, isLoadingChatDetails, searchUsers } = useChatQueries({ chatId: chat.id, query: debouncedSearchQuery, chatsPage: 1, chatsLimit: 20 });
  const {
    addGroupMember,
    removeGroupMember,
    updateGroupAdmin,
    updateGroupSettings,
    updateGroupInfo,
    toggleMute,
  } = useChatMutations(chat.id, currentUser.id);

  const group = (chatDetails as any)?.chat || chat;

  if (isLoadingChatDetails || !group || !group.participants) return <div>Loading...</div>;

  const participantIds = (group?.participants ?? []).map((p: User) => p.id);
  const filteredSearchResults = (searchUsers?.data || searchUsers?.items || []).filter((user: User) => !participantIds.includes(user.id));

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close modal when chat changes
  const initialChatId = React.useRef(chat.id);
  React.useEffect(() => {
    if (initialChatId.current !== chat.id) {
      onClose();
    }
  }, [chat.id, onClose]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleUserSelect = (user: User) => {
    if (participantIds.includes(user.id)) {
      toast.error('User is already a member');
      return;
    }
    setSelectedUsers(prev => [
      ...prev,
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        isOnline: user.isOnline ?? false,
      }
    ]);
    setSearchQuery('');
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleAddSelectedMembers = async () => {
    for (const user of selectedUsers) {
      await addGroupMember.mutateAsync(user.id);
    }
    setSelectedUsers([]);
    setShowMemberSearch(false);
    setSearchQuery('');
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute.mutateAsync(chat.id);
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'Notifications unmuted' : 'Notifications muted');
    } catch (error) {
      toast.error('Failed to toggle notifications');
    }
  };

  const currentUserIsAdmin = group.admins?.includes(currentUser.id);


  const handleSaveName = () => {
    if (newName.trim() && newName !== group.name) {
      updateGroupInfo.mutate({ name: newName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveDescription = () => {
    if (newDescription !== group.description) {
      updateGroupInfo.mutate({ description: newDescription.trim() });
    }
    setIsEditingDescription(false);
  };

  const handleSettingToggle = (settingKey: GroupSettingKey, currentValue: boolean) => {
    if (!currentUserIsAdmin) return;

    const updates: Partial<Chat['settings']> = { [settingKey]: !currentValue };
    updateGroupSettings.mutate(updates, {
      onSuccess: () => {
        toast.success('Group settings updated successfully');
      },
      onError: (error) => {
        console.error('updateGroupSettings error:', error);
      }
    });
  };

  return (
    <div className="relative h-full w-full flex flex-col bg-white dark:bg-[#1f2937] border-l border-gray-200 dark:border-gray-700 overflow-x-visible">
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your group preferences and members
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
        >
          <FiX size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
        </button>
      </div>
      <div className="relative flex-1 h-0 min-h-0">
        <div
          className={`absolute inset-0 right-0 bg-white dark:bg-[#1f2937] z-20 transition-transform duration-300 ${showMemberSearch ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-[#2a3942] bg-white dark:bg-[#1f2937]">
            <input
              type="text"
              placeholder="Search users to add..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2c3e50] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowMemberSearch(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a3942]"
              title="Back"
            >
              <FiArrowRight size={20} />
            </button>
          </div>
          <div className="p-2">
            {searchQuery ? (
              filteredSearchResults.length > 0 ? (
                <div className="space-y-2">
                  {filteredSearchResults.map((user: User) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a3942]"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                        ) : (
                          <FiUser size={20} className="text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left items-start">
                        <div className="font-medium text-gray-900 dark:text-white w-full whitespace-normal break-words text-left">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 w-full whitespace-normal break-words text-left">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-gray-500 dark:text-gray-400">No users found</div>
              )
            ) : null}
            {selectedUsers.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}
                      </span>
                      <button
                        onClick={() => handleUserRemove(user.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddSelectedMembers}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium"
                >
                  Add Selected Members
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={`absolute inset-0 w-full h-full overflow-y-auto px-6 py-4 space-y-8 transition-all duration-300 ${showMemberSearch ? 'opacity-50 pointer-events-none' : ''}`}
          style={{ maxHeight: '100%' }}>
          <div className="space-y-6">
            <div className="rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2">
                  <FiUsers className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Group Name</span>
                </label>
                {(currentUserIsAdmin || !group.settings?.onlyAdminsCanChangeInfo) && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <FiEdit2 className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500" />
                  </button>
                )}
              </div>
              {isEditingName ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter group name..."
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveName}
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-lg font-medium text-gray-900 dark:text-white">{group.name}</p>
              )}
            </div>

            <div className="rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2">
                  <FiMessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</span>
                </label>
                {(currentUserIsAdmin || !group.settings?.onlyAdminsCanChangeInfo) && (
                  <button
                    onClick={() => setIsEditingDescription(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                  >
                    <FiEdit2 className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500" />
                  </button>
                )}
              </div>
              {isEditingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="Enter group description..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveDescription}
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingDescription(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">{group.description || 'No description set'}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <FiUsers className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span>Members</span>
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({group.participants.length})</span>
              </h3>
              {(currentUserIsAdmin || !group.settings?.onlyAdminsCanAddMembers) && (
                <button
                  onClick={() => setShowMemberSearch(true)}
                  className="p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {group.participants.map((participant: User) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                        {participant.avatar ? (
                          <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            {participant.firstName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {Array.isArray(group.admins) && group.admins.includes(participant.id) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <FiUser className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {participant.firstName} {participant.lastName}
                        {participant.id === currentUser.id && (
                          <span className="text-xs text-blue-500 ml-2">(You)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {participant.email}
                      </div>
                    </div>
                  </div>
                  {currentUserIsAdmin && participant.id !== currentUser.id && (
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {!Array.isArray(group.admins) || !group.admins.includes(participant.id) ? (
                        <button
                          onClick={() => updateGroupAdmin.mutate({ userId: participant.id, isAdmin: true })}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="Make Admin"
                        >
                          <FiUser className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateGroupAdmin.mutate({ userId: participant.id, isAdmin: false })}
                          className="p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all duration-200"
                          title="Remove Admin"
                        >
                          <FiUser className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeGroupMember.mutate(participant.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        title="Remove Member"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Group Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FiLock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span>Permissions</span>
            </h3>
            <div className="space-y-3">
              {(settingsConfig as SettingConfig[]).map((setting) => {
                const IconComponent = setting.icon;
                const checked = !!group.settings?.[setting.key];
                return (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group cursor-pointer"
                    style={{ userSelect: 'none', opacity: !currentUserIsAdmin ? 0.5 : 1 }}
                    onClick={() => handleSettingToggle(setting.key, checked)}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (!currentUserIsAdmin) return;
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSettingToggle(setting.key, checked);
                      }
                    }}
                    role="button"
                    aria-pressed={checked}
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{setting.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</div>
                      </div>
                    </div>
                    <div className="relative select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="sr-only"
                        tabIndex={-1}
                      />
                      <div className={`w-12 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'} ${!currentUserIsAdmin ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <FiBell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span>Notifications</span>
            </h3>
            <button
              onClick={handleToggleMute}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                {isMuted ? (
                  <FiBellOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Danger Zone */}
      <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
        <h3 className="text-sm font-semibold text-red-500 mb-4 flex items-center space-x-2">
          <FiTrash2 className="w-5 h-5 text-red-500" />
          <span>Danger Zone</span>
        </h3>
        <div className="space-y-2">
          <button
            onClick={onLeaveGroup}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Leave Group</span>
          </button>
          {/* {isCreator && (
            <button
              onClick={onDeleteGroup}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 font-medium"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Group</span>
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;