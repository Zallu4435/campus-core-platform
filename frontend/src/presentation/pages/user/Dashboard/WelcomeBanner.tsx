import { usePreferences } from '../../../../application/context/PreferencesContext';
import { StudentInfo } from '../../../../domain/types/dashboard/user';

interface WelcomeBannerProps {
  studentInfo?: StudentInfo;
}

export default function WelcomeBanner({ studentInfo }: WelcomeBannerProps) {
  const { styles, theme } = usePreferences();
  const fullName = studentInfo ? `${studentInfo.firstName ?? ''} ${studentInfo.lastName ?? ''}`.trim() : 'Student';
  const course = studentInfo?.course;
  const profilePicture = studentInfo?.profilePicture;

  return (
    <div className={`relative z-0 ${styles.backgroundSecondary} ${styles.borderSecondary} overflow-hidden`}>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {profilePicture && (
              <img src={profilePicture} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow" />
            )}
            <div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>Welcome back, {fullName}!</h2>
              <p className={`text-base sm:text-lg font-medium ${styles.textSecondary} mt-1`}>Let's continue your academic journey</p>
              {course && (
                <div className="text-sm sm:text-base text-gray-500 mt-1 font-medium">{course}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}