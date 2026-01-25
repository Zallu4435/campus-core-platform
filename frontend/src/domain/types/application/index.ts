import { getThemeStyles } from "../../../frameworks/config/themeConfig";
import { ThemeType } from "../config/types";

export interface PersonalInfo {
    salutation: string;
    fullName: string;
    familyName: string;
    givenName: string;
    gender: string;
    dateOfBirth: string;
    postalCode: string;
    blockNumber: string;
    streetName: string;
    buildingName: string;
    floorNumber: string;
    unitNumber: string;
    stateCity: string;
    country: string;
    citizenship: string;
    residentialStatus: string;
    race: string;
    religion: string;
    maritalStatus: string;
    passportNumber: string;
    emailAddress: string;
    alternativeEmail: string;
    mobileCountry: string;
    mobileArea: string;
    mobileNumber: string;
    phoneCountry: string;
    phoneArea: string;
    phoneNumber: string;
    alternateContactName: string;
    relationshipWithApplicant: string;
    occupation: string;
    altMobileCountry: string;
    altMobileArea: string;
    altMobileNumber: string;
    altPhoneCountry: string;
    altPhoneArea: string;
    altPhoneNumber: string;
}

export interface ChoiceOfStudyProps {
    initialData?: ProgrammeChoice[];
    onSave: (data: ProgrammeChoice[]) => void;
}

export interface ChoiceOfStudyRef {
    trigger: () => Promise<boolean>;
    getValues: () => ProgrammeChoice[];
}

export interface ProgrammeChoice {
    programme: string;
    preferredMajor?: string;
}

export type StudentType = 'local' | 'transfer' | 'international';

export interface LocalEducationData {
    schoolName: string;
    country: string;
    from: string;
    to: string;
    nationalID: string;
    localSchoolCategory: string;
    stateOrProvince: string;
}

export interface TransferEducationData {
    schoolName: string;
    country: string;
    from: string;
    to: string;
    previousUniversity: string;
    otherUniversity?: string;
    creditsEarned: string;
    gpa: string;
    programStudied: string;
    reasonForTransfer: string;
}

export interface Subject {
    subject: string;
    grade: string;
}

export interface InternationalEducationData {
    schoolName: string;
    country: string;
    from: string;
    to: string;
    examination: string;
    examMonthYear: string;
    resultType: 'actual' | 'predicted';
    subjects: Subject[];
}

export interface EducationData {
    studentType: StudentType;
    local?: LocalEducationData;
    transfer?: TransferEducationData;
    international?: InternationalEducationData;
}

export interface ReferenceContact {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    phone: {
        country: string;
        area: string;
        number: string;
    };
}

export interface Achievement {
    activity: string;
    level: string;
    levelOfAchievement: string;
    positionHeld: string;
    organizationName: string;
    fromDate: string;
    toDate: string;
    description: string;
    reference: ReferenceContact;
}

export interface AchievementListProps {
    achievements: Achievement[];
    onAdd: () => void;
    onEdit: (achievement: Achievement, index: number) => void;
    onRemove: (index: number) => void;
    max: number;
    hasNoAchievements: boolean;
    onToggleNoAchievements: () => void;
}

export interface AchievementSection {
    questions: {
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
    };
    achievements?: Achievement[];
    hasNoAchievements: boolean;
    newAchievement?: Achievement;
}

export interface AchievementsProps {
    initialData?: AchievementSection;
    onSave: (data: AchievementSection) => void;
}

export interface HealthInfo {
    medicalConditions: string;
    disabilities: string;
    specialNeeds: string;
}

export interface LegalInfo {
    criminalRecord: string;
    legalProceedings: string;
}

export interface OtherInformationSection {
    health: HealthInfo;
    legal: LegalInfo;
}

export interface DocumentUpload {
    id: string;
    name: string;
    fileName?: string;
    fileType?: string;
    cloudinaryUrl?: string;
}

export interface DocumentUploadSection {
    documents: DocumentUpload[];
}

export interface DeclarationSection {
    privacyPolicy: boolean;
    marketingEmail: boolean;
    marketingCall: boolean;
}

export interface DeclarationProps {
    value: DeclarationSection;
    onChange: (data: DeclarationSection) => void;
}

export interface FormData {
    applicationId?: string;
    personalInfo?: PersonalInfo;
    choiceOfStudy?: ProgrammeChoice[];
    education?: EducationData;
    achievements?: AchievementSection;
    otherInformation?: OtherInformationSection;
    documents?: DocumentUploadSection;
    declaration?: DeclarationSection;
    registerId?: string;
}

export interface ApplicationFormProps {
    onLogout?: () => void;
}

export interface FormSubmissionFlowProps {
    formData: unknown;
    onPaymentComplete: () => void;
    onBackToForm?: () => void;
    onConfirm?: () => void;
    onLogout?: () => void;
}

export interface FormTab {
    id: string;
    label: string;
    isActive: boolean;
}

export interface FormTabsProps {
    tabs: FormTab[];
    onTabClick: (tabId: string) => void;
}

export interface PersonalParticularsFormProps {
    initialData?: PersonalInfo;
    onChange?: (data: PersonalInfo) => void;
    triggerValidation?: unknown;
}

export interface PaymentProps {
    formData: {
        applicationId: string;
        [key: string]: unknown;
    };
    onComplete: () => void;
    onPrevious: () => void;
}

export interface PaymentDetailsProps {
    method: string;
    amount: number;
    currency: string;
    onSubmit: (details: { paymentMethodId: string }) => void;
}

export interface PaymentMethodsProps {
    selectedMethod: string;
    onMethodSelect: (method: string) => void;
}

export interface PaymentSummaryProps {
    amount: number;
    currency: string;
    description: string;
}

export interface HealthCondition {
    condition: string;
    details: string;
}

export interface HealthConditionFormProps {
    onAddCondition: (condition: HealthCondition, index?: number) => void;
    showModal: boolean;
    onClose: () => void;
    condition?: HealthCondition | null;
    index?: number | null;
}

export interface HealthConditionTableProps {
    conditions: HealthCondition[];
    onRemove: (index: number) => void;
    onEdit: (index: number) => void;
}

export interface OtherInfoOneProps {
    onNext: () => void;
}

export interface OtherInfoTwoProps {
    onBack: () => void;
    onNext: () => void;
}

export interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export interface OtherInfoProps {
    initialData?: unknown;
    onSave: (data: unknown) => void;
    onNextTab?: () => void;
}

export interface OtherInfoRef {
    trigger: () => Promise<boolean>;
    getValues: () => any;
}

export interface ProgrammeModalProps {
    showModal: boolean;
    onClose: () => void;
    onSubmit: (data: unknown) => void;
    choices: { programme: string; preferredMajor: string }[];
}

export interface AchievementModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

export interface Question {
    id: number;
    question: string;
    maxLength: number;
    hint?: string;
}

export interface AchievementQuestionsProps {
    questions: Question[];
}

export interface PaymentResult {
    paymentId: string;
    status: string;
    message?: string;
    clientSecret?: string;
    stripePaymentIntentId?: string;
}

export interface SubmissionResult {
    message: string;
    admission: unknown;
}

export interface AdmissionFormContextType {
    formData: FormData;
    updateFormData: (data: Partial<FormData>) => void;
}

export interface ApplicationIdContextType {
    applicationId: string | null;
    setApplicationId: (id: string) => void;
    resetApplicationId: () => void;
}

export interface ApplicationIdProviderProps {
    children: React.ReactNode;
}

export interface PreferencesContextType {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    resetPreferences: () => void;
    styles: ReturnType<typeof getThemeStyles>;
}

export interface ApplicationResponse {
    data: {
        draft: FormData | null;
    };
}


export interface DocumentUploadResult {
    url: string;
    publicId: string;
    fileName: string;
    fileType: string;
}

export interface MultipleDocumentUploadResult {
    documents: DocumentUploadResult[];
}

export interface DocumentViewResult {
    pdfData: string;
    fileName: string;
    fileType: string;
}