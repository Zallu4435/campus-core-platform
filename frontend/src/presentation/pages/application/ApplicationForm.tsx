import React, { useEffect, useState, useRef } from 'react';
import { FormTabs } from '../../components/application/formTabs';
import { PersonalParticularsForm } from '../../components/application/Personal_Particulars/PersonalParticularsForm';
import { ChoiceOfStudy } from '../../components/application/Choice_of_Studies/ChoiceOfStudy';
import { Education } from '../../components/application/Education/Education';
import { Achievements } from '../../components/application/Achievements/Achievements';
import { Documents } from '../../components/application/Documents/Documents';
import { Declaration } from '../../components/application/Declaration';
import type {
  FormData,
  ApplicationFormProps,
  ProgrammeChoice,
  PersonalInfo,
  EducationData,
  AchievementSection,
  OtherInformationSection,
  DeclarationSection,
  DocumentUploadSection,
  Achievement,
  OtherInfoRef
} from '../../../domain/types/application';
import Other_Info from '../../components/application/Other_Information/Other_Info';
import { FormSubmissionFlow } from '../../components/application/FormSubmissionFlow';
import { useApplicationForm, useApplicationData } from '../../../application/hooks/useApplicationForm';
import styles from './css/ApplicationForm.module.css';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../appStore/store';
import { logout } from '../../../appStore/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';

const useAuth = () => {
  const { user, collection } = useSelector((state: RootState) => state.auth);
  return { user, collection };
};

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('personalDetails');
  const [formProgress, setFormProgress] = useState(0);
  const [wavePosition, setWavePosition] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [validationAttempted, setValidationAttempted] = useState(false);

  const personalFormRef = useRef<{ trigger: () => Promise<boolean>, getValues: () => PersonalInfo }>(null);
  const educationFormRef = useRef<{ trigger: () => Promise<boolean> }>(null);
  const achievementsFormRef = useRef<{ trigger: () => Promise<boolean>; getValues: () => AchievementSection }>(null);

  const documentsFormRef = useRef<{ trigger: () => Promise<boolean>; getValues: () => DocumentUploadSection }>(null);
  const choiceOfStudyRef = useRef<{ trigger: () => Promise<boolean>; getValues: () => ProgrammeChoice[] }>(null);
  const otherInfoRef = useRef<OtherInfoRef>(null);

  const { user, collection } = useAuth();
  const dispatch = useDispatch();
  const [applicationId, setApplicationId] = useState<string | undefined>(undefined);

  if (!user || !user.id) {
    return <LoadingSpinner />;
  }

  const methods = useForm<FormData>({
    defaultValues: {
      applicationId: '',
      personalInfo: undefined,
      choiceOfStudy: [],
      education: undefined,
      achievements: {
        questions: { 1: '', 2: '', 3: '', 4: '', 5: '' },
        achievements: [],
        hasNoAchievements: false,
      },
      otherInformation: undefined,
      documents: undefined,
      declaration: { privacyPolicy: false, marketingEmail: false, marketingCall: false },
      registerId: user?.id,
    },
    mode: 'onSubmit',
  });

  const { setValue, watch, getValues } = methods;
  const formData = watch();

  const {
    createApplication,
    savePersonalInfo,
    saveChoiceOfStudy,
    saveEducation,
    saveAchievements,
    saveOtherInfo,
    saveDocuments,
    saveDeclaration,
    isLoading: isSaving,
  } = useApplicationForm();

  const { data: fetchedData, isLoading: isFetching, error: fetchError } = useApplicationData(user?.id);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (collection !== 'register') {
      switch (collection) {
        case 'admin':
          navigate('/admin');
          break;
        case 'user':
          navigate('/dashboard');
          break;
        case 'faculty':
          navigate('/faculty/courses');
          break;
        default:
          navigate('/');
      }
    }
  }, [user, collection, navigate]);

  useEffect(() => {
    const initializeApplication = async () => {
      if (isFetching) return;

      if (fetchError) {
        setSaveError('Failed to load application data. Please try again.');
        setIsInitializing(false);
        return;
      }

      if (fetchedData && fetchedData.applicationId) {
        setApplicationId(fetchedData.applicationId);
        setValue('applicationId', fetchedData.applicationId, { shouldValidate: false });
      } else {
        try {
          const response = await createApplication(user?.id || '');
          setApplicationId(response.applicationId);
          setValue('applicationId', response.applicationId, { shouldValidate: false });
        } catch (error) {
          console.error('Failed to create application:', error);
          setSaveError('Failed to initialize application. Please try again.');
        }
      }
      setIsInitializing(false);
    };
    initializeApplication();
  }, [fetchedData, isFetching, fetchError, user?.id, createApplication, setValue]);

  useEffect(() => {
    if (fetchedData) {
      setValue('applicationId', fetchedData?.applicationId ?? '', { shouldValidate: false });
      setValue('personalInfo', fetchedData?.personalInfo ?? undefined, { shouldValidate: false });
      setValue('choiceOfStudy', fetchedData?.choiceOfStudy ?? [], { shouldValidate: false });
      setValue('education', fetchedData?.education ?? undefined, { shouldValidate: false });
      setValue('achievements', fetchedData?.achievements ?? undefined, { shouldValidate: false });
      setValue('otherInformation', fetchedData?.otherInformation ?? undefined, { shouldValidate: false });
      setValue('documents', fetchedData?.documents ?? undefined, { shouldValidate: false });
      setValue('declaration', fetchedData?.declaration ?? undefined, { shouldValidate: false });
      calculateFormProgress(fetchedData);
    }
  }, [fetchedData, setValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWavePosition((prev) => (prev + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const calculateFormProgress = (data: FormData) => {
    const sections = ['personalInfo', 'choiceOfStudy', 'education', 'achievements', 'otherInformation', 'documents', 'declaration'];
    const completedSections = sections.filter(section => !!data[section as keyof FormData]);
    const progress = Math.floor((completedSections.length / sections.length) * 100);
    setFormProgress(progress);
  };

  const tabs = [
    { id: 'personalDetails', label: 'Personal Details', isActive: activeTab === 'personalDetails' },
    { id: 'choiceOfStudy', label: 'Choice of Study', isActive: activeTab === 'choiceOfStudy' },
    { id: 'education', label: 'Education', isActive: activeTab === 'education' },
    { id: 'achievements', label: 'Achievements', isActive: activeTab === 'achievements' },
    { id: 'otherInformation', label: 'Other Information', isActive: activeTab === 'otherInformation' },
    { id: 'documents', label: 'Documents', isActive: activeTab === 'documents' },
    { id: 'declaration', label: 'Declaration', isActive: activeTab === 'declaration' },
  ];

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
      setFormProgress(Math.floor(((currentIndex + 1) / (tabs.length - 1)) * 100));
      setValidationAttempted(false);
      setSaveError(null);
    }
  };

  const handleSavePersonalInfo = async () => {
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      return;
    }
    if (!personalFormRef.current) {
      setSaveError('Personal form reference is missing.');
      return;
    }
    const latestPersonalInfo = personalFormRef.current.getValues() as PersonalInfo;
    try {
      setSaveError(null);
      await savePersonalInfo({ applicationId: formData.applicationId, data: latestPersonalInfo });
      calculateFormProgress({ ...formData, personalInfo: latestPersonalInfo });
    } catch (error) {
      console.error('Error saving personalInfo:', error);
      setSaveError('Failed to save personal information. Please try again.');
    }
  };

  const handleUpdateChoiceOfStudy = async (choices: ProgrammeChoice[]) => {
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      return;
    }
    try {
      setSaveError(null);
      await saveChoiceOfStudy({ applicationId: formData.applicationId, data: choices });
      setValue('choiceOfStudy', choices, { shouldValidate: false });
      calculateFormProgress({ ...formData, choiceOfStudy: choices });
    } catch (error) {
      console.error('Error saving choiceOfStudy:', error);
      setSaveError('Failed to update choice of study. Please try again.');
      throw error;
    }
  };

  const handleUpdateEducation = async (data: EducationData) => {
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      return;
    }
    try {
      setSaveError(null);
      setValue('education', data, { shouldValidate: false });
      await saveEducation({ applicationId: formData.applicationId, data });
      calculateFormProgress({ ...formData, education: data });
    } catch (error) {
      console.error('Error saving education:', error);
      setSaveError('Failed to update education details. Please try again.');
    }
  };

  const handleUpdateAchievements = async (data: { questions: { 1: string; 2: string; 3: string; 4: string; 5: string; }; hasNoAchievements: boolean; achievements?: Achievement[] | undefined }) => {
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      return;
    }

    try {
      setSaveError(null);
      const payload: AchievementSection = {
        questions: data.questions,
        achievements: data.achievements || [],
        hasNoAchievements: data.hasNoAchievements,
      };
      await saveAchievements({ applicationId: formData.applicationId, data: payload });
      setValue('achievements', payload, { shouldValidate: false });
      calculateFormProgress({ ...formData, achievements: payload });
    } catch (error) {
      console.error('Error saving achievements:', error);
      setSaveError('Failed to update achievements. Please try again.');
      throw error;
    }
  };

  const handleUpdateOtherInformation = async (data: unknown) => {
    const otherInfoData = data as OtherInformationSection;
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      return;
    }
    try {
      setSaveError(null);
      setValue('otherInformation', otherInfoData, { shouldValidate: false });
      await saveOtherInfo({ applicationId: formData.applicationId, data: otherInfoData });
      calculateFormProgress({ ...formData, otherInformation: otherInfoData });
    } catch (error) {
      console.error('Error saving otherInformation:', error);
      setSaveError('Failed to update other information. Please try again.');
    }
  };

  const handleSaveDocuments = async (data: DocumentUploadSection) => {
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      return;
    }
    try {
      setSaveError(null);
      setValue('documents', data, { shouldValidate: false });
      await saveDocuments({ applicationId: formData.applicationId, data });
      setValue('documents', data, { shouldValidate: false });
      calculateFormProgress({ ...formData, documents: data });
      handleNextTab();
    } catch (error) {
      console.error('Error saving documents:', error);
      setSaveError('Failed to update documents. Please try again.');
    }
  };

  const handleUpdateDeclaration = async (data: DeclarationSection) => {
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      return;
    }
    try {
      setSaveError(null);
      setValue('declaration', data, { shouldValidate: false });
      await saveDeclaration({ applicationId: formData.applicationId, data });
      calculateFormProgress({ ...formData, declaration: data });
    } catch (error) {
      console.error('Error saving declaration:', error);
      setSaveError('Failed to update declaration. Please try again.');
    }
  };

  const handleDeclarationChange = (data: DeclarationSection) => {
    setValue('declaration', data, { shouldValidate: false });
  };

  const handleSaveCurrentTab = async () => {
    if (isInitializing) {
      return;
    }
    if (!formData.applicationId) {
      setSaveError('No application ID found.');
      console.error('applicationId missing in handleSaveCurrentTab');
      return;
    }

    if (activeTab === 'personalDetails') {
      setValidationAttempted(true);
      if (personalFormRef.current) {
        const isValid = await personalFormRef.current.trigger();
        if (isValid && formData.personalInfo && Object.values(formData.personalInfo).some(val => val !== '' && val !== undefined && val !== null)) {
          await handleSavePersonalInfo();
          handleNextTab();
        } else {
          toast.error('Please fill in the required personal information fields.');
        }
      } else {
        console.error('personalFormRef.current is null');
        toast.error('Personal form reference is missing. Please try again.');
      }
    } else if (activeTab === 'choiceOfStudy') {
      setValidationAttempted(true);
      if (choiceOfStudyRef.current) {
        const isValid = await choiceOfStudyRef.current.trigger();
        const currentChoices = choiceOfStudyRef.current.getValues();
        if (isValid) {
          try {
            await handleUpdateChoiceOfStudy(currentChoices);
            handleNextTab();
          } catch (error) {
            console.error('Error saving choice of study:', error);
            setSaveError('Failed to save choice of study. Please try again.');
          }
        } else {
          toast.error('Please add at least one programme choice.');
        }
      }
    } else if (activeTab === 'education') {
      setValidationAttempted(true);
      if (educationFormRef.current) {
        const isValid = await educationFormRef.current.trigger();
        const currentValues = getValues();
        const educationData = currentValues.education;

        if (isValid && educationData?.studentType) {
          await saveEducation({ applicationId: formData.applicationId, data: educationData });
          handleNextTab();
        } else {
          toast.error(
            educationData?.studentType === 'international' && !isValid
              ? 'Please complete all required education details, including at least one English proficiency test.'
              : 'Please complete all required education details, including student type.'
          );
        }
      } else {
        console.error('educationFormRef.current is null');
        toast.error('Education form reference is missing. Please try again.');
      }
    } else if (activeTab === 'achievements') {
      setValidationAttempted(true);
      if (achievementsFormRef.current) {
        const isValid = await achievementsFormRef.current.trigger();
        const latestAchievements = achievementsFormRef.current.getValues();
        if (isValid && latestAchievements) {
          try {
            await handleUpdateAchievements(latestAchievements);
            if (!saveError) {
              handleNextTab();
            }
          } catch (error) {
            console.error('Error saving achievements:', error);
            setSaveError('Failed to save achievements. Please try again.');
          }
        } else {
          toast.error(
            latestAchievements?.hasNoAchievements
              ? 'Please complete all required questions.'
              : 'Please add at least one achievement or select "No Achievements to Report".'
          );
        }
      } else {
        console.error('achievementsFormRef.current is null');
        toast.error('Achievements form reference is missing. Please try again.');
      }
    } else if (activeTab === 'otherInformation') {
      setValidationAttempted(true);
      if (otherInfoRef.current) {
        const isValid = await otherInfoRef.current.trigger();
        const latestOtherInfo = otherInfoRef.current.getValues();
        if (isValid && latestOtherInfo) {
          try {
            await handleUpdateOtherInformation(latestOtherInfo);
            handleNextTab();
          } catch (error) {
            console.error('Error saving other information:', error);
            setSaveError('Failed to save other information. Please try again.');
          }
        } else {
          toast.error('Please complete the Other Information section.');
        }
      }
    } else if (activeTab === 'documents') {
      setValidationAttempted(true);
      if (documentsFormRef.current) {
        const isValid = await documentsFormRef.current.trigger();
        const currentDocuments = documentsFormRef.current.getValues();
        if (isValid && currentDocuments) {
          await saveDocuments({ applicationId: formData.applicationId, data: currentDocuments });
          setValue('documents', currentDocuments, { shouldValidate: false });
          calculateFormProgress({ ...formData, documents: currentDocuments });
          handleNextTab();
        } else {
          toast.error('Please upload all required documents.');
        }
      } else {
        console.error('documentsFormRef.current is null');
        toast.error('Documents form reference is missing. Please try again.');
      }
    } else if (activeTab === 'declaration') {
      setValidationAttempted(true);
      const isValid = formData.declaration?.privacyPolicy === true;
      if (isValid && formData.declaration) {
        await saveDeclaration({ applicationId: formData.applicationId, data: formData.declaration });
        handleNextTab();
      } else {
        toast.error('Please agree to the Privacy Notice to proceed.');
      }
    }
  };

  const handleSubmitApplication = async () => {
    if (isInitializing) {
      return;
    }

    if (!formData.applicationId) {
      toast.error('No application ID found.');
      return;
    }
    const latestFormData = { ...formData };
    if (documentsFormRef.current) {
      const currentDocuments = documentsFormRef.current.getValues();
      latestFormData.documents = currentDocuments;
      setValue('documents', currentDocuments, { shouldValidate: false });
    }

    const validationResults = await Promise.all([
      Promise.resolve(!!latestFormData.personalInfo),
      Promise.resolve(!!(latestFormData.choiceOfStudy && latestFormData.choiceOfStudy.length > 0)),
      Promise.resolve(!!latestFormData.education),
      Promise.resolve(!!latestFormData.achievements),
      Promise.resolve(!!latestFormData.otherInformation),
      Promise.resolve(!!latestFormData.documents),
      Promise.resolve(!!latestFormData.declaration?.privacyPolicy),
    ]);


    if (validationResults.every(result => result === true)) {
      try {
        setSaveError(null);
        await handleUpdateDeclaration(latestFormData.declaration!);
        setShowSummary(true);
      } catch (error) {
        console.error('Error saving declaration:', error);
        setSaveError('Failed to submit application. Please try again.');
      }
    } else {
      setSaveError('Please complete all required fields in the form.');
      const invalidSectionIndex = validationResults.findIndex(result => result === false);
      if (invalidSectionIndex !== -1) {
        setActiveTab(tabs[invalidSectionIndex].id);
      }
    }
  };

  const handleLogout = onLogout || (() => dispatch(logout()));

  if (isInitializing || isFetching) {
    return <LoadingSpinner />;
  }

  if (fetchError || (saveError && validationAttempted)) {
    return <ErrorMessage message={fetchError ? 'Error loading your application. Please refresh the page or try again later.' : saveError || ''} />;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                You must be logged in to access the application form.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return (
      <FormSubmissionFlow
        formData={formData}
        onBackToForm={() => setShowSummary(false)}
        onLogout={handleLogout}
      />
    );
  }

  if (showPayment) {
    return (
      <FormSubmissionFlow
        formData={{
          ...formData,
          registerId: user?.id
        }}
        onBackToForm={() => {
          setShowPayment(false);
          setActiveTab('personalDetails');
          setApplicationId(undefined);
          setValue('applicationId', '', { shouldValidate: false });
          setValue('personalInfo', undefined, { shouldValidate: false });
          setValue('choiceOfStudy', [], { shouldValidate: false });
          setValue('education', undefined, { shouldValidate: false });
          setValue('achievements', undefined, { shouldValidate: false });
          setValue('otherInformation', undefined, { shouldValidate: false });
          setValue('documents', undefined, { shouldValidate: false });
          setValue('declaration', { privacyPolicy: false, marketingEmail: false, marketingCall: false }, { shouldValidate: false });
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div
          className="relative overflow-hidden bg-gradient-to-r from-cyan-100 to-blue-200 p-8 rounded-xl shadow-md mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(224,242,254,0.8) 0%, rgba(186,230,253,0.9) 100%)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div
              className={`absolute inset-x-0 bottom-0 h-16 bg-white/20 ${styles.wave}`}
              style={{
                transform: `translateX(${wavePosition}%)`,
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z\' fill=\'%23ffffff\'%3E%3C/path%3E%3C/svg%3E")',
                backgroundSize: '1200px 100%',
              }}
            ></div>
            <div
              className={`absolute inset-x-0 bottom-0 h-24 bg-white/10 ${styles.waveReverse}`}
              style={{
                transform: `translateX(-${wavePosition}%)`,
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' fill=\'%23ffffff\'%3E%3C/path%3E%3C/svg%3E")',
                backgroundSize: '1200px 100%',
              }}
            ></div>
          </div>
          <div className="relative">
            <h1 className="text-3xl font-bold text-cyan-800 mb-2 flex items-center">
              <span className="mr-2">Your Journey Begins Here</span>
              <span className="inline-block w-2 h-8 bg-cyan-400 animate-pulse"></span>
            </h1>
            <p className="text-cyan-700 text-lg font-light">Complete all sections to submit your application</p>
            <div className="w-full bg-cyan-200/70 rounded-full h-3 mt-6 overflow-hidden">
              <div
                className={`bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-700 relative ${styles.shimmer}`}
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
            <div className="text-right text-cyan-700 text-sm mt-2 font-light">{formProgress}% Complete</div>
          </div>
        </div>

        <FormTabs tabs={tabs} onTabClick={(tabId) => {
          setActiveTab(tabId);
          const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
          setFormProgress(Math.floor((currentIndex / (tabs.length - 1)) * 100));
        }} />
        <div className="bg-white shadow-sm p-6 rounded-xl border border-cyan-100 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cyan-50/10 -z-10"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(186,230,253,0.1) 0%, rgba(224,242,254,0.05) 35%, rgba(255,255,255,0) 70%)',
            }}
          ></div>
          <div className="mb-4 border-b border-cyan-50 pb-4">
            <h2 className="text-2xl font-bold text-cyan-800 flex items-center">
              <span>{tabs.find((tab) => tab.id === activeTab)?.label}</span>
              <span className="ml-2 text-cyan-300 text-lg font-light">/</span>
              <span className="ml-2 text-cyan-400 text-sm font-light">
                Step {tabs.findIndex((tab) => tab.id === activeTab) + 1} of {tabs.length}
              </span>
            </h2>
            <p className="text-cyan-600 mt-1 text-sm">
              {activeTab === 'personalDetails' && 'Tell us about yourself'}
              {activeTab === 'choiceOfStudy' && 'Select your preferred program'}
              {activeTab === 'education' && 'Share your educational background'}
              {activeTab === 'achievements' && 'Highlight your accomplishments'}
              {activeTab === 'otherInformation' && 'Additional details that might support your application'}
              {activeTab === 'documents' && 'Upload supporting documents'}
              {activeTab === 'declaration' && 'Review and confirm your application'}
            </p>
          </div>
          {activeTab === 'personalDetails' && (
            <PersonalParticularsForm
              initialData={formData.personalInfo}
              onChange={(data) => {
                setValue('personalInfo', data, { shouldValidate: false });
                calculateFormProgress({ ...formData, personalInfo: data });
              }}
              triggerValidation={personalFormRef}
            />
          )}
          {activeTab === 'choiceOfStudy' && (
            <ChoiceOfStudy
              initialData={formData.choiceOfStudy}
              onSave={handleUpdateChoiceOfStudy}
              ref={choiceOfStudyRef}
            />
          )}
          {activeTab === 'education' && (
            <Education
              initialData={formData.education}
              onSave={handleUpdateEducation}
              onNextTab={handleSaveCurrentTab}
              ref={educationFormRef}
            />
          )}
          {activeTab === 'achievements' && (
            <Achievements
              initialData={formData.achievements}
              onSave={handleUpdateAchievements}
              ref={achievementsFormRef}
            />
          )}
          {activeTab === 'otherInformation' && (
            <Other_Info
              initialData={formData.otherInformation}
              onSave={handleUpdateOtherInformation}
              onNextTab={handleSaveCurrentTab}
              ref={otherInfoRef}
            />
          )}
          {activeTab === 'documents' && (
            <Documents
              initialData={formData.documents}
              onSave={handleSaveDocuments}
              applicationId={applicationId || ''}
              ref={documentsFormRef}
            />
          )}
          {activeTab === 'declaration' && (
            <Declaration
              value={formData.declaration || { privacyPolicy: false, marketingEmail: false, marketingCall: false }}
              onChange={handleDeclarationChange}
            />
          )}
          <div className="flex justify-between mt-8 border-t border-cyan-50 pt-6">
            <button
              onClick={() => {
                const currentIndex = tabs.findIndex((tab) => tab.id === activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].id);
                  setFormProgress(Math.floor(((currentIndex - 1) / (tabs.length - 1)) * 100));
                }
              }}
              disabled={activeTab === 'personalDetails'}
              className={`px-6 py-3 rounded-lg flex items-center transition-all duration-300 ${activeTab === 'personalDetails'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200 hover:shadow-sm'
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Previous
            </button>
            {activeTab !== 'declaration' ? (
              <button
                onClick={handleSaveCurrentTab}
                disabled={isSaving}
                className={`px-6 py-3 rounded-lg flex items-center transition-all duration-300 shadow-sm relative overflow-hidden group ${isSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white hover:from-cyan-500 hover:to-blue-500'
                  }`}
              >
                <span className={`relative z-10 flex items-center ${styles.shimmer}`}>
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Next
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            ) : (
              <button
                className={`px-8 py-3 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white rounded-lg font-bold relative overflow-hidden group transition-all duration-300 shadow-sm ${!formData.declaration?.privacyPolicy || isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-500 hover:to-cyan-700'
                  }`}
                disabled={!formData.declaration?.privacyPolicy || isSaving}
                onClick={handleSubmitApplication}
              >
                <span className={`relative z-10 flex items-center ${styles.shimmer}`}>
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};