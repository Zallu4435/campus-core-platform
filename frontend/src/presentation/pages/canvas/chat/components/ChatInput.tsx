import React, { useState, useRef, useEffect } from 'react';
import { FiSmile, FiPaperclip, FiX, FiSend, FiMic } from 'react-icons/fi';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentMenu } from './AttachmentMenu';
import { MediaPreview } from './MediaPreview';
import LiveWaveform from './LiveWaveform';
import { ChatInputProps } from '../../../../../domain/types/canvas/chat';

export const ChatInput: React.FC<ChatInputProps & { disabled?: boolean }> = ({
  onSendMessage,
  onTyping,
  styles,
  replyToMessage,
  onCancelReply,
  selectedChatId,
  disabled = false
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
      onSendMessage(message.trim(), selectedFiles.length > 0 ? selectedFiles[0] : undefined, replyToMessage || undefined);
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
    onSendMessage(media[0]?.caption || '', selectedFiles[0], replyToMessage || undefined);
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

  return (
    <div className="relative bg-white dark:bg-[#202c33] p-2">
      {replyToMessage && (
        <div className="absolute bottom-full left-0 right-0 p-3 bg-gray-50 dark:bg-[#111b21] border-t border-x border-gray-200 dark:border-[#2a3942] rounded-t-xl z-[40] shadow-lg">
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

      {selectedFiles.length > 0 && selectedFiles.every(file => !(file.type.startsWith('image/') || file.type.startsWith('video/'))) && (
        <div className="absolute bottom-full left-0 right-0 p-2 md:p-3 bg-white dark:bg-[#2a3942] border border-gray-200 dark:border-[#2a3942] rounded-t-xl max-w-xs mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">{selectedFiles.map(f => f.name).join(', ')}</span>
            <button
              onClick={clearSelectedFiles}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <FiX className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-1 md:space-x-2 p-2 border-t border-gray-200 dark:border-[#2a3942] bg-white dark:bg-[#202c33]">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          multiple
        />

        <button
          ref={attachmentRef}
          type="button"
          onClick={handleAttachmentClick}
          className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c3e50] flex-shrink-0"
        >
          <FiPaperclip className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button
          ref={emojiRef}
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c3e50] flex-shrink-0"
        >
          <FiSmile className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {!recording && !audioBlob && (
          <button type="button" onClick={startRecording} className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c3e50] flex-shrink-0" title="Record Audio">
            <FiMic className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
        {recording && (
          <div className="flex items-center space-x-2 mb-2 w-full">
            <LiveWaveform stream={mediaStream} isRecording={recording} />
            <span className="text-xs text-red-500">Recording: {recordingTime}s</span>
            <button type="button" onClick={stopRecording} className="p-1.5 md:p-2 rounded-full bg-red-500 text-white hover:bg-red-600">Stop</button>
            <button type="button" onClick={cancelRecording} className="p-1.5 md:p-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400">Cancel</button>
          </div>
        )}
        {audioBlob && !recording && (
          <div className="flex items-center space-x-2">
            <audio controls src={URL.createObjectURL(audioBlob)} className="h-8" />
            <button type="button" onClick={sendAudio} className="p-1.5 md:p-2 rounded-full bg-green-500 text-white hover:bg-green-600">Send</button>
            <button type="button" onClick={cancelRecording} className="p-1.5 md:p-2 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400">Cancel</button>
          </div>
        )}

        <input
          type="text"
          value={message}
          onChange={handleChange}
          className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-gray-100 dark:bg-[#2c3e50] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm md:text-base"
          placeholder={disabled ? 'You blocked this user.' : 'Type a message...'}
          disabled={disabled}
        />

        <button
          type="submit"
          className="p-2 md:p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
          disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
        >
          <FiSend className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </form>

      {showEmojiPicker && (
        <div
          className="absolute left-0 bottom-full mb-75 md:mb-100 z-30 w-full rounded-xl shadow-xl bg-white dark:bg-[#202c33]"
        >
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
        <div
          className="absolute bottom-full left-0 transform translate-x-0"
          style={{ transform: 'translateX(-50%)' }}
        >
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