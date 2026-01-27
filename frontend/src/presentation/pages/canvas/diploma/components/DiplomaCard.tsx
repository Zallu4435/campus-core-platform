import React from 'react';
import { FiUsers, FiStar, FiBook } from 'react-icons/fi';
import { DiplomaCardProps } from '../../../../../domain/types/canvas/diploma';

export const DiplomaCard: React.FC<DiplomaCardProps> = ({
  course,
  index,
  styles,
  completedChapters,
  onViewDetails,
  onStartCourse
}) => {
  const displayDepartment = course.department || course.category || 'General';
  const displayInstructor = course.instructor as string | undefined;

  const totalVideosFromCourse = course.videoCount ||
    (course.chapters ? course.chapters.length : 0) ||
    (course.totalVideos as number || 0);

  const completedCount = course.completedVideoCount ||
    (course.chapters ? course.chapters.filter(chapter => completedChapters.has(String(chapter.id))).length : 0) ||
    0;

  const validCompletedCount = Math.max(0, Number(completedCount) || 0);
  const totalVideosValue = Math.max(0, Number(totalVideosFromCourse) || 0);
  const validTotalVideos = Math.max(totalVideosValue, validCompletedCount);

  const progressPercentage = validTotalVideos > 0 ? (validCompletedCount / validTotalVideos) * 100 : 0;

  let progressColor = 'bg-red-500';
  let progressTextColor = 'text-red-600';
  if (progressPercentage > 66) {
    progressColor = 'bg-green-500';
    progressTextColor = 'text-green-600';
  } else if (progressPercentage > 33) {
    progressColor = 'bg-yellow-500';
    progressTextColor = 'text-yellow-600';
  }

  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`group relative flex flex-col h-full rounded-2xl transition-all duration-300 hover:-translate-y-2 ${styles.cardHover} overflow-hidden border ${styles.border} ${styles.card.background} shadow-lg hover:shadow-2xl`}
      style={{
        animation: 'fade-in-up 0.5s ease-out forwards',
        animationDelay: `${index * 100}ms`
      }}
      onClick={() => onViewDetails(course)}
    >
      <div className="p-6 sm:p-7 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${styles.accent} flex items-center justify-center ${styles.textPrimary} shadow-md overflow-hidden bg-opacity-10`}>
            {course.thumbnail && !imgError ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={`${styles.textPrimary} opacity-70`}>
                <FiBook className="w-6 h-6" />
              </div>
            )}
          </div>

          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${course.status === 'published'
            ? 'bg-green-500/10 text-green-600 border border-green-500/20'
            : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
            }`}>
            {course.status as string}
          </span>
        </div>

        <div className="flex-grow">
          <h3 className={`text-lg font-bold ${styles.textPrimary} leading-tight mb-2.5 group-hover:text-blue-500 transition-colors`}>
            {course.title}
          </h3>
          <p className={`${styles.textSecondary} text-xs leading-relaxed mb-5 line-clamp-2 opacity-80`}>
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {displayInstructor && (
              <div className="flex items-center gap-1.5 min-w-0">
                <FiUsers className={`w-4 h-4 ${styles.icon?.secondary || 'text-gray-400'}`} />
                <span className={`${styles.textSecondary} text-xs truncate`}>{displayInstructor}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FiStar className="w-4 h-4 text-yellow-500" />
              <span className={`${styles.textSecondary} text-xs`}>{displayDepartment as string}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {validTotalVideos > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[9px] uppercase tracking-wider font-bold opacity-60 ${styles.textSecondary}`}>
                  {validCompletedCount}/{validTotalVideos} Lessons
                </span>
                <span className={`text-[10px] font-bold ${progressPercentage === 100 ? 'text-green-600' : progressTextColor}`}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPercentage === 100 ? 'bg-green-500' : progressColor
                    }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          <button
            className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${validTotalVideos > 0
              ? `${styles.button?.primary || 'bg-blue-600 text-white'} hover:shadow-lg active:scale-95`
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-300 dark:border-gray-700'
              }`}
            disabled={validTotalVideos === 0}
            onClick={e => {
              e.stopPropagation();
              if (validTotalVideos > 0) onStartCourse(course.id);
            }}
          >
            {validTotalVideos === 0
              ? 'Unavailable'
              : progressPercentage > 0
                ? 'Continue'
                : 'Enroll Now'
            }
          </button>
        </div>
      </div>
    </div>
  );
};