import { useState } from 'react';
import AcademicInfo from './AcademicInfo';
import AcademicsTabs from './AcademicsTabs';
import CourseRegistration from './CourseRegistration';
import { useStudentInfo, useGradeInfo, useCourses, useAcademicHistory, useProgramInfo, useProgressInfo, useRequirementsInfo } from '../../../../application/hooks/useAcademic';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

export default function Academics() {
  const [activeSubTab, setActiveSubTab] = useState('Course Registration');
  const { styles } = usePreferences();

  const { data: studentInfo, isLoading: isLoadingStudentInfo, error: studentInfoError } = useStudentInfo({});
  const { data: courses, isLoading: isLoadingCourses, error: coursesError } = useCourses({
    enabled: activeSubTab === 'Course Registration',
  });
  const { data: gradeInfo, isLoading: isLoadingGradeInfo, error: gradeInfoError } = useGradeInfo({
    enabled: activeSubTab === 'Academic Records',
  });
  const { data: academicHistory, isLoading: isLoadingHistory, error: academicHistoryError } = useAcademicHistory({
    enabled: activeSubTab === 'Academic Records',
  });
  const { data: programInfo, isLoading: isLoadingProgram, error: programInfoError } = useProgramInfo({
    enabled: activeSubTab === 'Degree Audit',
  });
  const { data: progressInfo, isLoading: isLoadingProgress, error: progressInfoError } = useProgressInfo({
    enabled: activeSubTab === 'Degree Audit',
  });
  const { data: requirementsInfo, isLoading: isLoadingRequirements, error: requirementsInfoError } = useRequirementsInfo({
    enabled: activeSubTab === 'Degree Audit',
  });


  const isLoadingCourseRegistration = isLoadingStudentInfo || isLoadingCourses;
  const isLoadingAcademicRecords = isLoadingStudentInfo || isLoadingGradeInfo || isLoadingHistory;
  const isLoadingDegreeAudit = isLoadingStudentInfo || isLoadingProgram || isLoadingProgress || isLoadingRequirements;

  const error = studentInfoError || coursesError || gradeInfoError || academicHistoryError || programInfoError || progressInfoError || requirementsInfoError;

  if (error) {
    return <ErrorMessage message={error.message || 'An error occurred while loading academic data.'} />;
  }

  if (
    (activeSubTab === 'Course Registration' && !isLoadingCourseRegistration && (!studentInfo || !courses)) ||
    (activeSubTab === 'Academic Records' && !isLoadingAcademicRecords && (!studentInfo || !gradeInfo || !academicHistory)) ||
    (activeSubTab === 'Degree Audit' && !isLoadingDegreeAudit && (!studentInfo || !programInfo || !progressInfo || !requirementsInfo))
  ) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${styles.background}`}>
      <div className="relative z-10 flex flex-col min-h-screen">
        <AcademicInfo
          major={studentInfo?.major}
          academicStanding={studentInfo?.academicStanding}
          advisor={studentInfo?.advisor}
          catalogYear={studentInfo?.catalogYear}
        />
        <AcademicsTabs activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} disabledTabs={['Academic Records', 'Degree Audit']} />
        <main className="flex-grow w-full sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
          {activeSubTab === 'Course Registration' && (
            isLoadingCourseRegistration ? (
              <LoadingSpinner />
            ) : (
              studentInfo && courses ? (
                <CourseRegistration
                  studentInfo={studentInfo}
                  courses={courses}
                  enrolledCredits={studentInfo?.credits}
                  waitlistedCredits={studentInfo?.pendingCredits}
                />
              ) : <LoadingSpinner />
            )
          )}
        </main>
      </div>
    </div>
  );
}