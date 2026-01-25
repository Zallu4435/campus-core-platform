import React, { useState } from 'react';
import { Payment } from './Payment/Payment';
import { Button } from '../base/Button';
import {
  FaExclamationCircle,
  FaFileAlt,
  FaUserCircle,
  FaGraduationCap,
  FaClipboardList,
  FaHeartbeat,
  FaBalanceScale,
  FaAward,
  FaCheckCircle,
  FaEye,
} from 'react-icons/fa';
import DocumentViewModal from './Documents/DocumentViewModal';
import { questions as achievementQuestions } from './Achievements/options';
import type {
  DocumentUpload,
  FormData,
  ProgrammeChoice,
  Subject,
  Achievement
} from '../../../domain/types/application';

interface SubmissionStatus {
  success: boolean;
  message: string;
}

interface FormValue {
  [key: string]: string | number | boolean | FormValue | (string | number | boolean | FormValue)[] | null | undefined;
}

interface FormSubmissionFlowProps {
  formData: FormData;
  onBackToForm: () => void;
  onLogout?: () => void;
}

interface InternationalSubject {
  subject: string;
  otherSubject?: string;
  marksObtained: string;
  maxMarks: string;
}

interface IeltsData {
  date?: string;
  overall?: string;
  reading?: string;
  writing?: string;
}

interface ToeflData {
  date?: string;
  grade?: string;
  type?: string;
}

interface SatData {
  date?: string;
  math?: string;
  reading?: string;
  essay?: string;
}

interface ActData {
  date?: string;
  composite?: string;
  english?: string;
  math?: string;
  reading?: string;
  science?: string;
}

interface ApSubject {
  subject: string;
  score: string;
}

interface ApData {
  subjects: ApSubject[];
}

interface ExtendedInternationalEducation {
  schoolName: string;
  country: string;
  from: string;
  to: string;
  examination: string;
  examMonthYear: string;
  resultType: 'actual' | 'predicted';
  subjects: InternationalSubject[];
  ielts?: IeltsData;
  toefl?: ToeflData;
  sat?: SatData;
  act?: ActData;
  ap?: ApData;
}

export const FormSubmissionFlow: React.FC<FormSubmissionFlowProps> = ({
  formData,
  onBackToForm,
  onLogout
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionStatus] = useState<SubmissionStatus>({ success: false, message: '' });
  const [selectedDocument, setSelectedDocument] = useState<DocumentUpload | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const formatValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic font-normal">Not Provided</span>;
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-400 italic font-normal">Not Provided</span>;
        // If it's an array of simple values
        if (typeof value[0] !== 'object') return value.join(', ');
        // If it's an array of objects (like conditions), show count
        return `${value.length} item(s)`;
      }

      // Standard object formatting (e.g., Reference Contact, Health Condition)
      const entries = Object.entries(value)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => `${capitalize(k)}: ${formatRawValue(v)}`);

      return entries.length > 0 ? entries.join('; ') : <span className="text-gray-400 italic font-normal">Not Provided</span>;
    }
    return String(value);
  };

  const formatRawValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const capitalize = (str: string) => {
    if (!str) return str;
    // Handle camelCase and replace with spaces
    const result = str.replace(/([A-Z])/g, ' $1').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const handleRedirectToHome = () => {
    localStorage.removeItem('applicationId');
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = '/login';
    }
  };

  const handleViewDocument = (document: DocumentUpload) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  const renderKeyValueSection = (
    title: string,
    data: Record<string, FormValue>,
    icon: React.ReactNode,
    excludeKeys: string[] = [],
    blockKeys: string[] = []
  ) => {
    if (!data) return (
      <div className="mb-6 bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden opacity-75">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100 flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-cyan-900">{title}</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-400 italic">No information available for this section</p>
        </div>
      </div>
    );

    const filteredEntries = Object.entries(data)
      .filter(([key]) => !excludeKeys.includes(key) && data[key] !== null && data[key] !== undefined)
      .filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return (value as string).trim() !== '';
        if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
        return true;
      });

    return (
      <div className="mb-6 bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100 flex items-center gap-3">
          {icon}
          <h3 className="text-lg font-semibold text-cyan-900">{title}</h3>
        </div>
        <div className="p-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-cyan-100">
              <p className="text-sm text-gray-400 italic font-medium">Nothing to report in this section</p>
            </div>
          ) : (
            filteredEntries.map(([key, value]) => {
              if (Array.isArray(value) || blockKeys.includes(key)) {
                return (
                  <div key={key} className="mb-4 last:mb-0">
                    <strong className="text-cyan-800 block mb-2">{capitalize(key)}:</strong>
                    <div className="bg-cyan-50/30 p-3 rounded-lg text-sm text-gray-700 border border-cyan-100/50 italic">
                      {Array.isArray(value) ? (
                        <div className="space-y-2">
                          {value.map((item, idx) => (
                            <div key={idx} className="border-b border-cyan-50 last:border-0 pb-2 last:pb-0">
                              {formatValue(item)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        formatValue(value)
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={key}
                  className="flex justify-between py-3 text-sm border-b border-cyan-50 last:border-0"
                >
                  <strong className="text-cyan-800">{capitalize(key)}</strong>
                  <span className="text-gray-900 font-medium max-w-[60%] text-right">
                    {formatValue(value)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {showConfirmation ? (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-cyan-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-6 text-center">
                <FaCheckCircle className="text-6xl mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Application Submitted!</h1>
                <p className="text-emerald-50 text-lg mb-4">
                  Your application has been successfully submitted. We will review your application and inform you of the next steps.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 inline-block">
                  <p className="text-white text-base">
                    Application ID: <span className="font-mono font-bold text-yellow-300">{formData.applicationId}</span>
                  </p>
                </div>
                <div className="flex justify-center space-x-6">
                  <Button
                    label="Return to Home"
                    onClick={handleRedirectToHome}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !showPayment ? (
        <div className="max-w-6xl mx-auto">
          {submissionStatus.success === true && submissionStatus.message && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg flex items-start gap-3">
              <FaExclamationCircle className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-green-800">{submissionStatus.message}</p>
              </div>
            </div>
          )}
          {submissionStatus.success === false && submissionStatus.message && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-start gap-3">
              <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm text-red-800">{submissionStatus.message}</p>
              </div>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-xl border border-cyan-100 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-6">
              <h2 className="text-2xl font-semibold">Application Summary</h2>
              <p className="text-cyan-100 text-lg mt-2">Please review your information before proceeding</p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 flex items-start gap-3">
              <FaExclamationCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-amber-800 font-medium">
                  Please carefully review your application details before final submission.
                  Once submitted, changes cannot be made.
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6 max-h-[70vh] overflow-auto pr-2">
                {renderKeyValueSection(
                  'Personal Information',
                  formData.personalInfo as unknown as Record<string, FormValue>,
                  <FaUserCircle className="text-cyan-600" size={20} />,
                  ['applicationId']
                )}

                {formData.choiceOfStudy && formData.choiceOfStudy.length > 0 && (
                  <div className="mb-6 bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100 flex items-center gap-3">
                      <FaGraduationCap className="text-cyan-600" size={20} />
                      <h3 className="text-lg font-semibold text-cyan-900">Choices of Study</h3>
                    </div>
                    <div className="p-6">
                      {formData.choiceOfStudy.map((choice: ProgrammeChoice, index: number) => (
                        <div
                          key={index}
                          className="mb-4 pb-4 border-b border-cyan-50 last:border-0"
                        >
                          <div className="flex justify-between mb-2">
                            <strong className="text-cyan-800">Programme {index + 1}:</strong>
                            <span className="text-gray-900 font-medium">{choice.programme}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Preferred Major:</strong>
                            <span className="text-gray-900 font-medium">{choice.preferredMajor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.education && (
                  <div className="mb-6 bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100 flex items-center gap-3">
                      <FaClipboardList className="text-cyan-600" size={20} />
                      <h3 className="text-lg font-semibold text-cyan-900">
                        {formData.education.studentType === 'local' && 'Local Student Education'}
                        {formData.education.studentType === 'transfer' && 'Transfer Student Education'}
                        {formData.education.studentType === 'international' && 'International Student Education'}
                      </h3>
                    </div>
                    <div className="p-6">
                      {formData.education.studentType === 'local' && formData.education.local && (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">School Name:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.local.schoolName)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Country:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.local.country)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Duration:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.local.from)} - {formatValue(formData.education.local.to)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">National ID:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.local.nationalID)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">School Category:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.local.localSchoolCategory)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">State/Province:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.local.stateOrProvince)}</span>
                          </div>
                        </div>
                      )}

                      {formData.education.studentType === 'transfer' && formData.education.transfer && (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">School Name:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.transfer.schoolName)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Country:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.transfer.country)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Duration:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.transfer.from)} - {formatValue(formData.education.transfer.to)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Previous University:</strong>
                            <span className="text-gray-900 font-medium">
                              {formData.education.transfer.previousUniversity === 'other'
                                ? formatValue(formData.education.transfer.otherUniversity)
                                : formatValue(formData.education.transfer.previousUniversity)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Credits Earned:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.transfer.creditsEarned)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">GPA:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.transfer.gpa)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Program Studied:</strong>
                            <span className="text-gray-900 font-medium">{formatValue(formData.education.transfer.programStudied)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong className="text-cyan-800">Reason for Transfer:</strong>
                            <span className="text-gray-900 font-medium max-w-[60%] text-right">{formatValue(formData.education.transfer.reasonForTransfer)}</span>
                          </div>
                        </div>
                      )}

                      {formData.education.studentType === 'international' && formData.education.international && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <strong className="text-cyan-800">School Name:</strong>
                              <span className="text-gray-900 font-medium">{formatValue(formData.education.international.schoolName)}</span>
                            </div>
                            <div className="flex justify-between">
                              <strong className="text-cyan-800">Country:</strong>
                              <span className="text-gray-900 font-medium">{formatValue(formData.education.international.country)}</span>
                            </div>
                            <div className="flex justify-between">
                              <strong className="text-cyan-800">Duration:</strong>
                              <span className="text-gray-900 font-medium">{formatValue(formData.education.international.from)} - {formatValue(formData.education.international.to)}</span>
                            </div>
                            <div className="flex justify-between">
                              <strong className="text-cyan-800">Examination:</strong>
                              <span className="text-gray-900 font-medium">{formatValue(formData.education.international.examination)}</span>
                            </div>
                            <div className="flex justify-between">
                              <strong className="text-cyan-800">Exam Month/Year:</strong>
                              <span className="text-gray-900 font-medium">{formatValue(formData.education.international.examMonthYear)}</span>
                            </div>
                            <div className="flex justify-between">
                              <strong className="text-cyan-800">Result Type:</strong>
                              <span className="text-gray-900 font-medium capitalize">{formatValue(formData.education.international.resultType)}</span>
                            </div>
                          </div>

                          {formData.education.international.subjects && formData.education.international.subjects.length > 0 && (
                            <div className="mt-4">
                              <strong className="text-cyan-800 block mb-2">Examination Subjects:</strong>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {formData.education.international.subjects.map((subject: Subject, index: number) => (
                                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                    <span className="text-gray-600">
                                      {subject.subject === 'other' ? (subject as unknown as InternationalSubject).otherSubject : subject.subject}
                                    </span>
                                    <span className="font-semibold text-cyan-700">
                                      {(subject as unknown as InternationalSubject).marksObtained && (subject as unknown as InternationalSubject).maxMarks
                                        ? `${(subject as unknown as InternationalSubject).marksObtained}/${(subject as unknown as InternationalSubject).maxMarks}`
                                        : ((subject as Subject).grade || 'Not Provided')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Proficiency Tests Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-cyan-50">
                            {(formData.education.international as unknown as ExtendedInternationalEducation).ielts && Object.values((formData.education.international as unknown as ExtendedInternationalEducation).ielts!).some(val => val) && (
                              <div className="bg-white p-3 rounded-lg border border-cyan-100">
                                <strong className="text-cyan-800 block mb-2 border-b border-cyan-50 pb-1">IELTS Proficiency</strong>
                                <div className="space-y-1 text-sm">
                                  {Object.entries((formData.education.international as unknown as ExtendedInternationalEducation).ielts!)
                                    .filter(([, v]) => v)
                                    .map(([k, v]) => (
                                      <div key={k} className="flex justify-between">
                                        <span className="text-gray-500 capitalize">{k}:</span>
                                        <span className="font-medium">{v}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {(formData.education.international as unknown as ExtendedInternationalEducation).toefl && Object.values((formData.education.international as unknown as ExtendedInternationalEducation).toefl!).some(val => val) && (
                              <div className="bg-white p-3 rounded-lg border border-cyan-100">
                                <strong className="text-cyan-800 block mb-2 border-b border-cyan-50 pb-1">TOEFL Proficiency</strong>
                                <div className="space-y-1 text-sm">
                                  {Object.entries((formData.education.international as unknown as ExtendedInternationalEducation).toefl!)
                                    .filter(([, v]) => v)
                                    .map(([k, v]) => (
                                      <div key={k} className="flex justify-between">
                                        <span className="text-gray-500 capitalize">{k}:</span>
                                        <span className="font-medium">{v}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {(formData.education.international as unknown as ExtendedInternationalEducation).sat && Object.values((formData.education.international as unknown as ExtendedInternationalEducation).sat!).some(val => val) && (
                              <div className="bg-white p-3 rounded-lg border border-cyan-100">
                                <strong className="text-cyan-800 block mb-2 border-b border-cyan-50 pb-1">SAT Results</strong>
                                <div className="space-y-1 text-sm">
                                  {Object.entries((formData.education.international as unknown as ExtendedInternationalEducation).sat!)
                                    .filter(([, v]) => v)
                                    .map(([k, v]) => (
                                      <div key={k} className="flex justify-between">
                                        <span className="text-gray-500 capitalize">{k}:</span>
                                        <span className="font-medium">{v}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}

                            {(formData.education.international as unknown as ExtendedInternationalEducation).act && Object.values((formData.education.international as unknown as ExtendedInternationalEducation).act!).some(val => val) && (
                              <div className="bg-white p-3 rounded-lg border border-cyan-100">
                                <strong className="text-cyan-800 block mb-2 border-b border-cyan-50 pb-1">ACT Results</strong>
                                <div className="space-y-1 text-sm">
                                  {Object.entries((formData.education.international as unknown as ExtendedInternationalEducation).act!)
                                    .filter(([, v]) => v)
                                    .map(([k, v]) => (
                                      <div key={k} className="flex justify-between">
                                        <span className="text-gray-500 capitalize">{k}:</span>
                                        <span className="font-medium">{v}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {(formData.education.international as unknown as ExtendedInternationalEducation).ap?.subjects && (formData.education.international as unknown as ExtendedInternationalEducation).ap!.subjects.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-cyan-50">
                              <strong className="text-cyan-800 block mb-2">AP Subjects:</strong>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {(formData.education.international as unknown as ExtendedInternationalEducation).ap!.subjects.map((subject: ApSubject, index: number) => (
                                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                                    <span className="text-gray-600">{subject.subject}</span>
                                    <span className="font-semibold text-cyan-700">{subject.score}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.achievements && (
                  <div className="mb-6 bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100 flex items-center gap-3">
                      <FaAward className="text-cyan-600" size={20} />
                      <h3 className="text-lg font-semibold text-cyan-900">Achievements</h3>
                    </div>
                    <div className="p-6">
                      {(!formData.achievements.questions && (!formData.achievements.achievements || formData.achievements.achievements.length === 0)) ? (
                        <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-cyan-100">
                          <p className="text-sm text-gray-400 italic">No achievements or reflective answers provided</p>
                        </div>
                      ) : (
                        <>
                          {formData.achievements.questions && (
                            <div className="mb-6">
                              <strong className="text-cyan-800 block mb-3">Reflective Questions:</strong>
                              <div className="space-y-4">
                                {Object.entries(formData.achievements.questions).map(([key, value]) => {
                                  const questionObj = achievementQuestions.find(q => String(q.id) === key);
                                  return (
                                    <div key={key} className="bg-cyan-50/50 p-4 rounded-lg border border-cyan-100">
                                      <p className="text-xs font-semibold text-cyan-600 uppercase mb-1">Question {key}</p>
                                      <p className="text-sm text-cyan-900 font-medium mb-2">{questionObj?.question || `Question ${key}`}</p>
                                      <p className="text-gray-700 text-sm italic">"{formatValue(value as string || '')}"</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {formData.achievements.achievements && formData.achievements.achievements.length > 0 && (
                            <div>
                              <strong className="text-cyan-800 block mb-3">List of Achievements:</strong>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.achievements.achievements.map((achievement: Achievement, index: number) => (
                                  <div key={index} className="p-4 bg-white border border-cyan-100 rounded-lg shadow-sm">
                                    <p className="font-semibold text-cyan-900">{achievement.activity}</p>
                                    <p className="text-sm text-cyan-700 mb-2">{achievement.level} • {achievement.levelOfAchievement}</p>
                                    <p className="text-xs text-gray-500 italic">"{achievement.description.substring(0, 100)}..."</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {formData.otherInformation && (
                  <>
                    {formData.otherInformation.health && (
                      renderKeyValueSection(
                        'Health Information',
                        formData.otherInformation.health as unknown as Record<string, FormValue>,
                        <FaHeartbeat className="text-cyan-600" size={20} />,
                        ['medicalConditions']
                      )
                    )}
                    {formData.otherInformation.legal && (
                      renderKeyValueSection(
                        'Legal Information',
                        formData.otherInformation.legal as unknown as Record<string, FormValue>,
                        <FaBalanceScale className="text-cyan-600" size={20} />,
                        [],
                        ['criminalRecord', 'legalProceedings']
                      )
                    )}
                  </>
                )}

                {formData.documents && formData.documents.documents && (
                  <div className="mb-6 bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-cyan-100 flex items-center gap-3">
                      <FaFileAlt className="text-cyan-600" size={20} />
                      <h3 className="text-lg font-semibold text-cyan-900">Uploaded Documents</h3>
                    </div>
                    <div className="p-6">
                      {(!formData.documents.documents || formData.documents.documents.length === 0) ? (
                        <div className="text-center py-4 bg-gray-50/50 rounded-lg border border-dashed border-cyan-100">
                          <p className="text-sm text-gray-400 italic">No documents have been uploaded yet</p>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {formData.documents.documents.map((doc: DocumentUpload, index: number) => (
                            <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex-1">
                                <strong className="text-cyan-800">{doc.name}:</strong>
                                <span className="ml-2 text-gray-700">
                                  {doc.fileName ? doc.fileName : <span className="text-red-500 italic">Not uploaded</span>}
                                </span>
                              </div>
                              {doc.fileName && (
                                <button
                                  onClick={() => handleViewDocument(doc)}
                                  className="ml-4 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-md hover:bg-cyan-200 transition-colors duration-200 flex items-center gap-2 text-sm"
                                >
                                  <FaEye size={14} />
                                  View
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {renderKeyValueSection(
                  'Declaration',
                  formData.declaration as unknown as Record<string, FormValue> || {},
                  <FaClipboardList className="text-cyan-600" size={20} />
                )}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-cyan-100">
                <Button
                  label="Back to Edit"
                  onClick={onBackToForm}
                  className="flex items-center gap-2 text-cyan-700 bg-white border border-cyan-300 hover:bg-cyan-50 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                />
                <Button
                  label="Proceed to Payment"
                  onClick={() => setShowPayment(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <FaFileAlt size={16} />
              Your information is secure and will only be used for application purposes
            </p>
          </div>
        </div>
      ) : (
        <Payment
          formData={formData as unknown as { [key: string]: unknown; applicationId: string; }}
          onComplete={() => setShowConfirmation(true)}
          onPrevious={() => setShowPayment(false)}
        />
      )}

      {/* Document View Modal */}
      <DocumentViewModal
        isOpen={showDocumentModal}
        document={selectedDocument}
        onClose={closeDocumentModal}
      />
    </>
  );
};