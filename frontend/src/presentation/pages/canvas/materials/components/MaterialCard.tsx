import React from 'react';
import { usePreferences } from '../../../../../application/context/PreferencesContext';
import {
    FiDownload, FiHeart, FiBookmark,
    FiUser, FiClock, FiCalendar, FiBook, FiLock, FiEye
} from 'react-icons/fi';
import { getFileIcon, getDifficultyColor, formatDate, formatNumber } from '../utils/materialUtils';
import { MaterialCardProps } from '../../../../../domain/types/canvas/materials';


const MaterialCard: React.FC<MaterialCardProps> = ({
    material,
    onDownload,
    onBookmark,
    onLike,
    isBookmarked,
    isLiked
}) => {
    const { styles } = usePreferences();

    const materialData = material.props || material;

    const getSemesterName = (semester: string) => {
        const currentYear = new Date().getFullYear();
        const semesterNames: { [key: string]: string } = {
            '1': `Fall ${currentYear}`,
            '2': `Spring ${currentYear + 1}`,
            '3': `Summer ${currentYear + 1}`,
            '4': `Fall ${currentYear + 1}`,
            '5': `Spring ${currentYear + 2}`,
            '6': `Summer ${currentYear + 2}`,
            '7': `Fall ${currentYear + 2}`,
            '8': `Spring ${currentYear + 3}`
        };
        return semesterNames[semester] || `Semester ${semester}`;
    };

    return (
        <div className={`group rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ${styles.card.border} overflow-hidden transform hover:-translate-y-1 flex flex-col h-[500px] sm:h-[600px] w-full ${styles.card.background} ${styles.card.hover}`}>
            <div className="relative h-36 sm:h-48 aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {materialData.thumbnailUrl ? (
                    <img
                        src={materialData.thumbnailUrl || ''}
                        alt={materialData.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <div className="flex items-center gap-2 text-slate-500">
                            {React.createElement(getFileIcon(materialData.type), { className: 'w-5 h-5' })}
                            <span className="text-xs font-medium">No preview</span>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center space-x-1.5 sm:space-x-2">
                    {(materialData.isNewMaterial || materialData.isNew) && (
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg animate-pulse">
                            NEW
                        </span>
                    )}
                    {materialData.isRestricted && (
                        <div className="bg-black/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5">
                            <FiLock className="text-white w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                    )}
                </div>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center space-x-1">
                    <button
                        onClick={() => onBookmark(materialData.id)}
                        className={`p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${isBookmarked || materialData.isBookmarked
                            ? styles.button.primary
                            : 'bg-black/20 text-white hover:bg-black/40'
                            }`}
                        aria-label={`Bookmark ${materialData.title}`}
                    >
                        <FiBookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={isBookmarked || materialData.isBookmarked ? "currentColor" : "none"} />
                    </button>
                </div>
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getDifficultyColor(materialData.difficulty)}`}>
                        {materialData.difficulty}
                    </span>
                </div>
                <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                    <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center">
                        {React.createElement(getFileIcon(materialData.type), { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" })}
                        <span className="ml-1">{materialData.type}</span>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex-1">
                        <h3 className={`text-base sm:text-lg font-bold ${styles.textPrimary} mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors`}>
                            {materialData.title}
                        </h3>
                        <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm mb-2">
                            <span className={`flex items-center ${styles.button.secondary} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full truncate max-w-[120px] sm:max-w-[150px]`}>
                                <FiBook className={`w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 ${styles.icon.primary}`} />
                                {materialData.course}
                            </span>
                            <span className={`${styles.textSecondary} truncate max-w-[120px] sm:max-w-[150px]`}>{materialData.subject}</span>
                        </div>
                    </div>
                </div>

                <p className={`text-xs sm:text-sm ${styles.textSecondary} mb-3 sm:mb-4 line-clamp-3 leading-relaxed flex-grow`}>
                    {materialData.description}
                </p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {materialData.tags.slice(0, 3).map(tag => (
                        <span key={tag} className={`text-[10px] sm:text-xs ${styles.button.secondary} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full truncate max-w-[80px] sm:max-w-[100px]`}>
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 text-center">
                    <div className="text-xs sm:text-sm">
                        <div className={`flex items-center justify-center ${styles.icon.secondary} mb-0.5 sm:mb-1`}>
                            <FiDownload className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div className={`font-semibold ${styles.textPrimary}`}>{formatNumber(materialData.downloads)}</div>
                        <div className={`text-[10px] sm:text-xs ${styles.textTertiary}`}>Downloads</div>
                    </div>
                    <div className="text-xs sm:text-sm">
                        <div className={`flex items-center justify-center ${styles.icon.secondary} mb-0.5 sm:mb-1`}>
                            <FiEye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                        <div className={`font-semibold ${styles.textPrimary}`}>{formatNumber(materialData.views)}</div>
                        <div className={`text-[10px] sm:text-xs ${styles.textTertiary}`}>Views</div>
                    </div>
                </div>

                <div className={`space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm ${styles.textSecondary}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center truncate max-w-[150px] sm:max-w-[200px]">
                            <FiUser className={`w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2 ${styles.icon.primary}`} />
                            <span className="truncate">{materialData.uploadedBy}</span>
                        </div>
                        <div className={`flex items-center ${styles.textTertiary} truncate max-w-[150px] sm:max-w-[200px]`}>
                            <FiCalendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                            <span className="truncate">{formatDate(materialData.uploadedAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center truncate max-w-[150px] sm:max-w-[200px]">
                            <FiClock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2 ${styles.icon.primary}`} />
                            <span className="truncate">{materialData.estimatedTime}</span>
                        </div>
                        <div className={`flex items-center ${styles.textTertiary} truncate max-w-[150px] sm:max-w-[200px]`}>
                            <FiBook className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                            <span className="truncate">{getSemesterName(materialData.semester.toString())}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-1.5 sm:space-x-2 mt-auto">
                    <button
                        onClick={() => onDownload(material)}
                        className={`flex-1 ${styles.button.primary} px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200`}
                        aria-label={`Download ${materialData.title}`}
                    >
                        <FiDownload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        Download
                    </button>
                    <button
                        onClick={() => onLike(materialData.id)}
                        className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 ${isLiked || materialData.isLiked
                            ? `${styles.status.error} ${styles.button.primary}`
                            : styles.button.secondary
                            }`}
                        aria-label={`Like ${materialData.title}`}
                    >
                        <FiHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={isLiked || materialData.isLiked ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={() => onBookmark(materialData.id)}
                        className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 ${isBookmarked || materialData.isBookmarked
                            ? styles.button.primary
                            : styles.button.secondary
                            }`}
                        aria-label={`Bookmark ${materialData.title}`}
                    >
                        <FiBookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={isBookmarked || materialData.isBookmarked ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialCard; 