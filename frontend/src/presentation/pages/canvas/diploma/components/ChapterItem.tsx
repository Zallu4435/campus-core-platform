import React from 'react';
import { FiLock, FiCheckCircle, FiBookmark, FiPlay } from 'react-icons/fi';
import { getChapterTypeIcon } from '../utils/diplomaUtils';
import { ChapterItemProps, ChapterType } from '../../../../../domain/types/canvas/diploma';

export const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  courseId,
  styles,
  isFirst,
  isPrevCompleted,
  isCompleted,
  isBookmarked,
  onViewChapter,
  onBookmark
}) => {
  const isAccessible = isFirst || isPrevCompleted;
  const TypeIcon = getChapterTypeIcon(chapter.type as ChapterType);

  return (
    <div
      className={`group relative flex items-center p-4 sm:p-6 mb-4 rounded-3xl border transition-all duration-300 ${isAccessible
        ? `${styles.card.background} ${styles.border} hover:shadow-xl hover:-translate-y-1 cursor-pointer`
        : 'bg-gray-100/50 dark:bg-gray-800/50 border-transparent opacity-60 cursor-not-allowed shadow-none'
        }`}
      onClick={() => isAccessible && onViewChapter(chapter)}
    >
      <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 mr-4 sm:mr-6 ${isCompleted
        ? 'bg-emerald-500/10 text-emerald-500'
        : isAccessible
          ? `${styles.accent} bg-opacity-10 text-blue-500`
          : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
        }`}>
        {isCompleted ? (
          <FiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
        ) : !isAccessible ? (
          <FiLock className="w-6 h-6 sm:w-8 sm:h-8" />
        ) : (
          <TypeIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
        )}
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h4 className={`text-sm sm:text-base font-bold truncate ${isAccessible ? styles.textPrimary : 'text-gray-400'
            }`}>
            {chapter.title}
          </h4>
          {isCompleted && (
            <span className="hidden sm:inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              Full Mastery
            </span>
          )}
        </div>

        <p className={`text-[11px] sm:text-xs line-clamp-1 opacity-60 font-medium ${styles.textSecondary}`}>
          {chapter.description}
        </p>

        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <FiPlay className={`w-3.5 h-3.5 ${isAccessible ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isAccessible ? styles.textSecondary : 'text-gray-400'}`}>
              {chapter.type || 'Video'} Lesson
            </span>
          </div>
          {chapter.duration && (
            <div className={`h-1 w-1 rounded-full bg-gray-400 opacity-30`} />
          )}
          {chapter.duration && (
            <span className={`text-[10px] sm:text-xs font-bold opacity-60 ${styles.textSecondary}`}>
              {String(chapter.duration)}
            </span>
          )}
        </div>
      </div>

      {isAccessible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(courseId, chapter.id || chapter._id || '');
          }}
          className={`ml-4 p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-90 ${isBookmarked
            ? 'bg-rose-500/10 text-rose-500 shadow-sm'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
            }`}
        >
          <FiBookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  );
};