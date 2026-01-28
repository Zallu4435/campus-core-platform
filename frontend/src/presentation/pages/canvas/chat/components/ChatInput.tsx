import React, { useState, useRef, useEffect } from 'react';
import { FiSmile, FiPaperclip, FiX, FiSend, FiMic } from 'react-icons/fi';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentMenu } from './AttachmentMenu';
import { MediaPreview } from './MediaPreview';
import LiveWaveform from './LiveWaveform';
import { ChatInputProps } from '../../../../../domain/types/canvas/chat';

export const ChatInput: React.FC<ChatInputProps & { disabled?: boolean; disabledReason?: string }> = ({
  onSendMessage,
  onTyping,
  styles,
  replyToMessage,
  onCancelReply,
  selectedChatId,
  disabled = false,
  disabledReason
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attachmentRef = useRef<HTMLButtonElement>(null);
  const emojiRef = useRef<HTMLButtonElement>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (message.trim() || selectedFiles.length > 0) {
      onSendMessage(message.trim(), selectedFiles.length > 0 ? selectedFiles : undefined, replyToMessage || undefined);
      setMessage('');
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }


    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    onTyping(false);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      setSelectedFiles(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      if (files.some(file => file.type.startsWith('image/') || file.type.startsWith('video/'))) {
        setShowMediaPreview(true);
      }
    }
  };



  const handleAttachmentClick = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  const clearSelectedFiles = () => {
    selectedFiles.forEach((_, idx) => {
      if (previewUrls[idx]) URL.revokeObjectURL(previewUrls[idx]);
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
  };


  const handleCloseMediaPreview = () => {
    setShowMediaPreview(false);
    clearSelectedFiles();
  };

  const handleAddMoreFiles = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendAllMedia = async (media: { url: string; name: string; type: string; caption: string }[]) => {
    if (!selectedChatId || selectedFiles.length === 0) return;
    onSendMessage(media[0]?.caption || '', selectedFiles, replyToMessage || undefined);
    setMessage('');
    clearSelectedFiles();
    setShowMediaPreview(false);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMediaStream(stream);
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      setAudioBlob(new Blob(chunks, { type: 'audio/webm' }));
      stream.getTracks().forEach(track => track.stop());
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setMediaStream(null);
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
    setMediaStream(null);
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecording(false);
    setRecordingTime(0);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setMediaStream(null);
    setAudioUrl(null);
  };

  const sendAudio = () => {
    if (audioBlob) {
      // Convert Blob to File for compatibility
      const audioFile = new File([audioBlob], `audio-message-${Date.now()}.webm`, { type: 'audio/webm' });
      onSendMessage('', audioFile, replyToMessage || undefined);
      setAudioBlob(null);
      setRecordingTime(0);
      setAudioUrl(null);
    }
  };

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-white dark:bg-[#202c33] border-t border-gray-200 dark:border-[#2a3942]">
      {replyToMessage && (
        <div className="absolute bottom-full left-0 right-0 p-3 bg-gray-50 dark:bg-[#111b21] border-t border-x border-gray-200 dark:border-[#2a3942] rounded-t-xl z-[40] shadow-lg animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 border-l-4 border-green-500 pl-2 w-full overflow-hidden">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-green-600 dark:text-green-500">
                  {replyToMessage.senderName}
                </span>
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {replyToMessage.type === 'image' ? '[Image]' :
                    replyToMessage.type === 'audio' ? '[Audio]' :
                      replyToMessage.type === 'video' ? '[Video]' :
                        replyToMessage.type === 'document' || replyToMessage.type === 'file' ? `[File] ${replyToMessage.fileName || ''}` :
                          replyToMessage.content || '...'}
                </span>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] text-gray-500 dark:text-gray-400 transition-colors ml-2"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showMediaPreview && selectedFiles.length > 0 && (
        <MediaPreview
          message={{
            id: 'temp',
            chatId: selectedChatId || 'temp',
            senderId: 'temp',
            senderName: 'You',
            content: '',
            type: 'text',
            status: 'sending',
            reactions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            attachments: selectedFiles.map((file, idx) => ({ url: previewUrls[idx], name: file.name, type: file.type.startsWith('image/') ? 'image' : 'video' }))
          }}
          onClose={handleCloseMediaPreview}
          styles={styles}
          onAddMore={handleAddMoreFiles}
          onRemoveMedia={handleRemoveMedia}
          onSendMedia={handleSendAllMedia}
        />
      )}

      {/* Disabled Message */}
      {disabled && disabledReason && (
        <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
            🔒 {disabledReason}
          </p>
        </div>
      )}

      <div className="relative px-2 py-2 flex items-center min-h-[64px]">
        {/* Recording Overlay */}
        {recording && (
          <div className="absolute inset-0 bg-white dark:bg-[#202c33] z-50 flex items-center px-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="flex items-center space-x-3 w-full">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                <span className="text-sm font-medium dark:text-white min-w-[40px] tabular-nums">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <div className="flex-1 overflow-hidden h-8 bg-gray-100 dark:bg-[#2c3e50] rounded-full px-2 flex items-center">
                <LiveWaveform stream={mediaStream} isRecording={recording} />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                  title="Discard"
                >
                  <FiX className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md transform hover:scale-105 transition-all"
                  title="Review Recording"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio Preview Overlay */}
        {audioBlob && !recording && (
          <div className="absolute inset-0 bg-white dark:bg-[#202c33] z-50 flex items-center px-4 animate-in fade-in duration-200">
            <div className="flex items-center space-x-3 w-full bg-gray-50 dark:bg-[#111b21] p-2 rounded-xl border border-gray-100 dark:border-[#2a3942]">
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                <FiMic className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <audio
                  controls
                  src={URL.createObjectURL(audioBlob)}
                  className="w-full h-8 custom-audio-player"
                />
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                >
                  <FiX className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={sendAudio}
                  className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-lg transition-transform active:scale-95"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Standard Input Row */}
        <div className={`flex items-center space-x-1 md:space-x-2 w-full transition-opacity duration-200 ${(recording || audioBlob) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            multiple
          />

          <div className="flex items-center">
            <button
              ref={attachmentRef}
              type="button"
              onClick={handleAttachmentClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c3e50] text-gray-600 dark:text-gray-400 transition-colors"
            >
              <FiPaperclip className="w-5 h-5" />
            </button>

            <button
              ref={emojiRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c3e50] text-gray-600 dark:text-gray-400 transition-colors"
            >
              <FiSmile className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={handleChange}
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-[#2c3e50] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 text-[15px] border-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              placeholder={disabled ? 'Chat is disabled' : 'Type a message...'}
              disabled={disabled}
            />

            {!message.trim() && selectedFiles.length === 0 ? (
              <button
                type="button"
                onClick={startRecording}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2c3e50] rounded-full transition-all active:scale-90"
                title="Voice Message"
              >
                <FiMic className="w-6 h-6" />
              </button>
            ) : (
              <button
                type="submit"
                className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
                disabled={disabled}
              >
                <FiSend className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>
      </div>

      {showEmojiPicker && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
          <EmojiPicker
            show={showEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
            styles={styles}
            position="bottom"
          />
        </div>
      )}

      {showAttachmentMenu && (
        <div className="absolute bottom-full left-4 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AttachmentMenu
            styles={styles}
            showAttachmentMenu={showAttachmentMenu}
            onFileSelect={handleFileSelect}
            onClose={() => setShowAttachmentMenu(false)}
          />
        </div>
      )}
    </div>
  );
};