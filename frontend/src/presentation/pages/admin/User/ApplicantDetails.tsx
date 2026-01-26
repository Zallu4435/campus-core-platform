import React, { useState } from 'react';
import {
  FiUser,
  FiFileText,
  FiChevronRight,
  FiX,
  FiCalendar,
  FiBook,
  FiGlobe,
  FiCheckCircle,
  FiAlertCircle,
  FiMail,
  FiAward,
  FiUsers,
  FiShield,
  FiEye,
  FiDownload,
  FiInfo,
} from 'react-icons/fi';
import ApprovalModal from './ApprovalModal';
import RejectModal from '../../../components/admin/RejectModal';
import WarningModal from '../../../components/common/WarningModal';
import { useUserManagement } from '../../../../application/hooks/useUserManagement';
import { documentUploadService } from '../../../../application/services/documentUploadService';
import { ApplicantDetailsProps, AdmissionEducationSubject } from '../../../../domain/types/management/usermanagement';
import { usePreventBodyScroll } from '../../../../shared/hooks/usePreventBodyScroll';
import { formatDate } from '../../../../shared/utils/dateUtils';
import { DocumentUpload, ProgrammeChoice } from '../../../../domain/types/application';

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  selectedApplicant,
  showDetails,
  setShowDetails,
  onViewDocument,
  onDownloadDocument,
}) => {
  const { approveAdmission, rejectAdmission } = useUserManagement();
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    programs: false,
    education: false,
    achievements: false,
    otherInfo: false,
    documents: false,
    declaration: false,
    application: false,
  });

  usePreventBodyScroll(showDetails);

  if (!selectedApplicant || !showDetails) return null;

  const admissionData = selectedApplicant.admission || selectedApplicant;
  const personalData = admissionData?.personal;
  const documentsData = admissionData?.documents;
  const choiceOfStudyData = admissionData?.choiceOfStudy;
  const educationData = admissionData?.education;
  const achievementsData = admissionData?.achievements;
  const otherInformationData = admissionData?.otherInformation;
  const declarationData = admissionData?.declaration;
  const status = admissionData?.status || 'pending';
  const applicationId = admissionData?.applicationId;
  const createdAt = admissionData?.createdAt;
  const blocked = admissionData?.blocked;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleViewDocument = async (document: any) => {
    if (!document) {
      return;
    }
    if (!document.url) {
      return;
    }

    try {
      if (onViewDocument) {
        onViewDocument(document);
      } else {
        if (document.id) {
          const response = await documentUploadService.getAdminDocument(document.id, admissionData._id);
          if (response && response.pdfData) {
            const byteCharacters = atob(response.pdfData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          } else {
            window.open(document.url, '_blank', 'noopener,noreferrer');
          }
        } else {
          window.open(document.url, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (error) {
      console.error('[handleViewDocument] Error opening document:', error);
      try {
        window.open(document.url, '_blank', 'noopener,noreferrer');
      } catch (fallbackError) {
        console.error('[handleViewDocument] Error with fallback document opening:', fallbackError);
      }
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    if (!doc) {
      console.error('No document provided');
      return;
    }

    try {
      if (onDownloadDocument) {
        onDownloadDocument(doc);
      } else {
        if (doc.id) {
          const response = await documentUploadService.getAdminDocument(doc.id, admissionData._id);

          if (response && response.pdfData) {
            const byteCharacters = atob(response.pdfData);

            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(blob);

            const fileName = doc.fileName || doc.name || 'document.pdf';

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';

            document.body.appendChild(link);

            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
              window.URL.revokeObjectURL(url);
            }, 1000);

          } else {
            console.error('No PDF data in response');
          }
        } else {
          console.error('Missing document ID');
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const ghostParticles = Array(30)
    .fill(0)
    .map((_) => ({
      size: Math.random() * 10 + 5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      animDuration: Math.random() * 10 + 15,
      animDelay: Math.random() * 5,
    }));

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {ghostParticles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-500/20 blur-sm"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animation: `floatParticle ${particle.animDuration}s infinite ease-in-out`,
            animationDelay: `${particle.animDelay}s`,
          }}
        />
      ))}

      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-tl-full" />

        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border border-purple-500/30">
                <FiUser size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">
                  {personalData?.fullName || 'N/A'}
                </h2>
                <p className="text-purple-200 flex items-center mt-1">
                  <FiMail size={16} className="mr-2" />
                  {personalData?.emailAddress || 'N/A'}
                </p>
                <div className="flex items-center mt-2 space-x-4">
                  <StatusBadge status={status} />
                  <span className="text-sm text-purple-300">
                    ID: {applicationId || 'N/A'}
                  </span>
                  {blocked && (
                    <span className="bg-red-600/30 text-red-100 px-3 py-1 rounded-full text-sm font-medium border border-red-500/50">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="p-2 text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6 custom-scrollbar">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <QuickInfoCard
              icon={<FiCalendar className="text-purple-300" />}
              title="Applied On"
              value={formatDate(createdAt)}
            />
            <QuickInfoCard
              icon={<FiBook className="text-purple-300" />}
              title="Program"
              value={choiceOfStudyData?.[0]?.programme || 'N/A'}
            />
            <QuickInfoCard
              icon={<FiGlobe className="text-purple-300" />}
              title="Nationality"
              value={personalData?.citizenship || 'N/A'}
            />
          </div>

          <SectionCard
            title="Personal Information"
            icon={<FiUser className="text-purple-300" />}
            isOpen={expandedSections.personal}
            toggle={() => toggleSection('personal')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <InfoGroup title="Basic Information">
                <InfoRow label="Salutation" value={personalData?.salutation} />
                <InfoRow label="Full Name" value={personalData?.fullName} />
                <InfoRow label="Family Name" value={personalData?.familyName} />
                <InfoRow label="Given Name" value={personalData?.givenName} />
                <InfoRow label="Gender" value={personalData?.gender} />
                <InfoRow label="Date of Birth" value={personalData?.dateOfBirth} />
                <InfoRow label="Marital Status" value={personalData?.maritalStatus} />
              </InfoGroup>

              <InfoGroup title="Contact Information">
                <InfoRow
                  label="Mobile"
                  value={`${personalData?.mobileCountry || ''} ${personalData?.mobileArea || ''
                    } ${personalData?.mobileNumber || ''}`.trim()}
                />
                <InfoRow
                  label="Phone"
                  value={`${personalData?.phoneCountry || ''} ${personalData?.phoneArea || ''
                    } ${personalData?.phoneNumber || ''}`.trim()}
                />
                <InfoRow label="Alt Email" value={personalData?.alternativeEmail} />
                <InfoRow
                  label="Alternate Contact Name"
                  value={personalData?.alternateContactName}
                />
                <InfoRow
                  label="Relationship"
                  value={personalData?.relationshipWithApplicant}
                />
                <InfoRow label="Occupation" value={personalData?.occupation} />
                <InfoRow
                  label="Alternate Mobile"
                  value={`${personalData?.altMobileCountry || ''} ${personalData?.altMobileArea || ''
                    } ${personalData?.altMobileNumber || ''}`.trim()}
                />
                <InfoRow
                  label="Alternate Phone"
                  value={`${personalData?.altPhoneCountry || ''} ${personalData?.altPhoneArea || ''
                    } ${personalData?.altPhoneNumber || ''}`.trim()}
                />
              </InfoGroup>

              <InfoGroup title="Address">
                <InfoRow
                  label="Street"
                  value={`${personalData?.blockNumber || ''} ${personalData?.streetName || ''
                    }`.trim()}
                />
                <InfoRow label="Building" value={personalData?.buildingName} />
                <InfoRow
                  label="Unit"
                  value={`Floor ${personalData?.floorNumber || 'N/A'}, Unit ${personalData?.unitNumber || 'N/A'
                    }`}
                />
                <InfoRow label="City/State" value={personalData?.stateCity} />
                <InfoRow label="Country" value={personalData?.country} />
                <InfoRow label="Postal Code" value={personalData?.postalCode} />
                <InfoRow label="Citizenship" value={personalData?.citizenship} />
                <InfoRow
                  label="Residential Status"
                  value={personalData?.residentialStatus}
                />
                <InfoRow label="Race" value={personalData?.race} />
                <InfoRow label="Religion" value={personalData?.religion} />
                <InfoRow label="Passport Number" value={personalData?.passportNumber} />
              </InfoGroup>
            </div>
          </SectionCard>

          {/* Choice of Study */}
          <SectionCard
            title="Choice of Study"
            icon={<FiBook className="text-purple-300" />}
            isOpen={expandedSections.programs}
            toggle={() => toggleSection('programs')}
          >
            <div className="space-y-4">
              {choiceOfStudyData?.length ? (
                choiceOfStudyData.map((choice: ProgrammeChoice, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-800/80 p-4 rounded-lg border border-purple-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-100">{choice.programme}</h4>
                        <p className="text-purple-200 mt-1">Preferred Major: {choice.preferredMajor || 'N/A'}</p>
                      </div>
                      <span className="bg-purple-600/30 text-purple-100 px-3 py-1 rounded-full text-sm font-medium">
                        Choice {idx + 1}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-purple-300">No programs selected</p>
              )}
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard
            title="Education Background"
            icon={<FiUsers className="text-purple-300" />}
            isOpen={expandedSections.education}
            toggle={() => toggleSection('education')}
          >
            <div className="space-y-4">
              <InfoRow
                label="Student Type"
                value={educationData?.studentType || 'N/A'}
              />
              {educationData?.transfer && (
                <div className="bg-gray-800/80 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-purple-100 mb-3">Previous Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      label="School"
                      value={educationData.transfer.schoolName}
                    />
                    <InfoRow
                      label="Duration"
                      value={`${educationData.transfer.from} - ${educationData.transfer.to}`}
                    />
                    <InfoRow label="GPA" value={educationData.transfer.gpa} />
                    <InfoRow
                      label="Program"
                      value={educationData.transfer.programStudied}
                    />
                    <InfoRow
                      label="Country"
                      value={educationData.transfer.country}
                    />
                  </div>
                </div>
              )}
              {educationData?.local && (
                <div className="bg-gray-800/80 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-purple-100 mb-3">Local Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      label="School"
                      value={educationData.local.schoolName}
                    />
                    <InfoRow
                      label="Duration"
                      value={`${educationData.local.from} - ${educationData.local.to}`}
                    />
                    <InfoRow
                      label="National ID"
                      value={educationData.local.nationalID}
                    />
                    <InfoRow
                      label="Country"
                      value={educationData.local.country}
                    />
                  </div>
                </div>
              )}
              {educationData?.international && (
                <div className="bg-gray-800/80 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-purple-100 mb-3">International Education</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <InfoRow
                      label="School"
                      value={educationData.international.schoolName}
                    />
                    <InfoRow
                      label="Duration"
                      value={`${educationData.international.from} - ${educationData.international.to}`}
                    />
                    <InfoRow
                      label="Examination"
                      value={educationData.international.examination}
                    />
                    <InfoRow
                      label="Country"
                      value={educationData.international.country}
                    />
                  </div>

                  {/* Subjects */}
                  {educationData.international.subjects && educationData.international.subjects.length > 0 && (
                    <div className="mt-4 border-t border-purple-500/20 pt-4">
                      <h5 className="text-purple-200 font-medium mb-2">Subjects</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {educationData.international.subjects.map((subj: AdmissionEducationSubject, idx: number) => (
                          <div key={idx} className="bg-gray-900/50 px-2 rounded border border-purple-500/10">
                            <InfoRow label={subj.subject || subj.otherSubject || 'Subject'} value={subj.grade} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standardized Tests */}
                  <div className="mt-4 border-t border-purple-500/20 pt-4 space-y-4">
                    {educationData.international.ielts && (
                      <div>
                        <h5 className="text-purple-200 font-medium mb-2">IELTS ({educationData.international.ielts.date})</h5>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-gray-900/50 px-2 rounded border border-purple-500/10">
                            <InfoRow label="Overall" value={educationData.international.ielts.overall} />
                          </div>
                          <div className="bg-gray-900/50 px-2 rounded border border-purple-500/10">
                            <InfoRow label="Reading" value={educationData.international.ielts.reading} />
                          </div>
                          <div className="bg-gray-900/50 px-2 rounded border border-purple-500/10">
                            <InfoRow label="Writing" value={educationData.international.ielts.writing} />
                          </div>
                        </div>
                      </div>
                    )}

                    {educationData.international.toefl && (
                      <div>
                        <h5 className="text-purple-200 font-medium mb-2">TOEFL ({educationData.international.toefl.date})</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-900/50 px-2 rounded border border-purple-500/10">
                            <InfoRow label="Type" value={educationData.international.toefl.type} />
                          </div>
                          <div className="bg-gray-900/50 px-2 rounded border border-purple-500/10">
                            <InfoRow label="Score" value={educationData.international.toefl.grade} />
                          </div>
                        </div>
                      </div>
                    )}

                    {educationData.international.ap && educationData.international.ap.subjects && (
                      <div>
                        <h5 className="text-purple-200 font-medium mb-2">AP Exams ({educationData.international.ap.date})</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {educationData.international.ap.subjects.map((subj: AdmissionEducationSubject, idx: number) => (
                            <div key={idx} className="bg-gray-900/50 px-2 rounded border border-purple-500/10">
                              <InfoRow label={subj.subject} value={subj.score} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Achievements */}
          <SectionCard
            title="Achievements & Activities"
            icon={<FiAward className="text-purple-300" />}
            isOpen={expandedSections.achievements}
            toggle={() => toggleSection('achievements')}
          >
            <div className="space-y-4">
              {achievementsData?.questions && Object.keys(achievementsData.questions).length > 0 && (
                <div className="bg-gray-800/80 p-4 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-purple-100 mb-3">Questions</h4>
                  <div className="space-y-2">
                    {Object.entries(achievementsData.questions).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-purple-200">Q{key}:</span>
                        <span className="text-purple-100">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {achievementsData?.achievements && achievementsData.achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievementsData.achievements.map((achievement: {
                    activity: string;
                    level: string;
                    levelOfAchievement: string;
                    positionHeld: string;
                    organizationName: string;
                    fromDate: string;
                    toDate: string;
                    description?: string;
                  }, idx: number) => (
                    <div
                      key={idx}
                      className="bg-gray-800/80 p-4 rounded-lg border border-purple-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-100">{achievement.activity}</h4>
                        <span className="bg-purple-600/30 text-purple-100 px-2 py-1 rounded text-xs">
                          {achievement.level}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-purple-300">Level of Achievement:</span>
                          <span className="text-purple-100 ml-2">{achievement.levelOfAchievement}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Position:</span>
                          <span className="text-purple-100 ml-2">{achievement.positionHeld}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Organization:</span>
                          <span className="text-purple-100 ml-2">{achievement.organizationName}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Duration:</span>
                          <span className="text-purple-100 ml-2">
                            {achievement.fromDate} - {achievement.toDate}
                          </span>
                        </div>
                      </div>
                      {achievement.description && (
                        <p className="text-purple-200 mt-2 text-sm">{achievement.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-purple-300">No achievements listed</p>
              )}
            </div>
          </SectionCard>

          {/* Documents */}
          <SectionCard
            title="Uploaded Documents"
            icon={<FiFileText className="text-purple-300" />}
            isOpen={expandedSections.documents}
            toggle={() => toggleSection('documents')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documentsData?.documents?.filter((doc: DocumentUpload) => doc.cloudinaryUrl)?.length ? (
                documentsData.documents
                  .filter((doc: DocumentUpload) => doc.cloudinaryUrl)
                  .map((doc: DocumentUpload, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-800/80 rounded-lg border border-purple-500/30"
                    >
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-600/30 rounded-lg mr-3">
                          <FiFileText size={18} className="text-purple-300" />
                        </div>
                        <div>
                          <span className="text-purple-100 font-medium">{doc.name}</span>
                          <p className="text-xs text-purple-300">{doc.fileName}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument({
                            id: doc.id,
                            name: doc.name,
                            url: doc.cloudinaryUrl,
                            fileName: doc.fileName
                          })}
                          className="p-1 text-purple-300 hover:bg-purple-500/20 rounded transition-colors"
                          title="View Document"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument({
                            id: doc.id,
                            name: doc.name,
                            url: doc.cloudinaryUrl,
                            fileName: doc.fileName
                          })}
                          className="p-1 text-purple-300 hover:bg-purple-500/20 rounded transition-colors"
                          title="Download Document"
                        >
                          <FiDownload size={16} />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-purple-300">No documents uploaded</p>
              )}
            </div>
          </SectionCard>

          {/* Other Information */}
          <SectionCard
            title="Additional Information"
            icon={<FiInfo className="text-purple-300" />}
            isOpen={expandedSections.otherInfo}
            toggle={() => toggleSection('otherInfo')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoGroup title="Health Information">
                <InfoRow
                  label="Health Support Required"
                  value={otherInformationData?.health?.hasHealthSupport}
                />
                <InfoRow
                  label="Medical Conditions"
                  value={otherInformationData?.health?.medicalConditions}
                />
                <InfoRow
                  label="Disabilities"
                  value={otherInformationData?.health?.disabilities}
                />
                <InfoRow
                  label="Special Needs"
                  value={otherInformationData?.health?.specialNeeds}
                />
              </InfoGroup>

              <InfoGroup title="Legal Information">
                <InfoRow
                  label="Criminal Record"
                  value={otherInformationData?.legal?.hasCriminalRecord}
                />
                <InfoRow
                  label="Criminal Details"
                  value={otherInformationData?.legal?.criminalRecord}
                />
                <InfoRow
                  label="Legal Proceedings"
                  value={otherInformationData?.legal?.legalProceedings}
                />
              </InfoGroup>
            </div>
          </SectionCard>

          {/* Declaration */}
          <SectionCard
            title="Declarations & Consent"
            icon={<FiShield className="text-purple-300" />}
            isOpen={expandedSections.declaration}
            toggle={() => toggleSection('declaration')}
          >
            <div className="space-y-3">
              <ConsentRow
                label="Privacy Policy Agreement"
                value={declarationData?.privacyPolicy}
              />
              <ConsentRow
                label="Marketing Email Consent"
                value={declarationData?.marketingEmail}
              />
              <ConsentRow
                label="Marketing Call Consent"
                value={declarationData?.marketingCall}
              />
            </div>
          </SectionCard>

          {/* Application Details */}
          <SectionCard
            title="Application Details"
            icon={<FiInfo className="text-purple-300" />}
            isOpen={expandedSections.application}
            toggle={() => toggleSection('application')}
          >
            <InfoRow
              label="Applied On"
              value={formatDate(createdAt)}
            />
            <InfoRow
              label="Program"
              value={choiceOfStudyData?.[0]?.programme || 'N/A'}
            />
            <InfoRow
              label="Nationality"
              value={personalData?.citizenship || 'N/A'}
            />
          </SectionCard>
        </div>

        {/* Actions Footer */}
        {status === 'pending' && (
          <div className="border-t border-purple-500/30 bg-gray-900/80 ">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowApprovalModal(true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center border border-blue-500/50"
              >
                <FiCheckCircle size={20} className="mr-2" />
                Approve Application
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center border border-red-500/50"
              >
                <FiAlertCircle size={20} className="mr-2" />
                Reject Application
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showApprovalModal && (
          <ApprovalModal
            isOpen={showApprovalModal}
            onClose={() => {
              setShowApprovalModal(false);
            }}
            onApprove={async (data: any) => {
              try {
                const admissionId = admissionData._id;
                if (!admissionId) {
                  throw new Error('No admission ID found');
                }

                await approveAdmission({
                  id: admissionId,
                  approvalData: {
                    programDetails: data.programDetails || '',
                    startDate: data.startDate || '',
                    scholarshipInfo: data.scholarshipInfo || '',
                    additionalNotes: data.additionalNotes || '',
                  },
                });

                setShowApprovalModal(false);
                setShowDetails(false);
              } catch (error) {
                console.error('Error approving admission:', error);
              }
            }}
            onReject={() => {
              setShowApprovalModal(false);
              setShowRejectModal(true);
            }}
            onDelete={() => {
              setShowApprovalModal(false);
              setShowWarningModal(true);
            }}
            applicantName={personalData?.fullName}
          />
        )}

        {showRejectModal && (
          <RejectModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onReject={(reason: string) => {
              try {
                const admissionId = admissionData._id;
                if (!admissionId) {
                  throw new Error('No admission ID found');
                }

                rejectAdmission({
                  id: admissionId,
                  reason: reason || 'Application rejected',
                });

                setShowRejectModal(false);
                setShowDetails(false);
              } catch (error) {
                console.error('Error rejecting admission:', error);
              }
            }}
            applicantName={personalData?.fullName}
          />
        )}

        {showWarningModal && (
          <WarningModal
            isOpen={showWarningModal}
            onClose={() => setShowWarningModal(false)}
            onConfirm={() => {
              // Handle deletion logic here if needed
              setShowWarningModal(false);
              setShowDetails(false);
            }}
            title="Delete Application"
            message={`Are you sure you want to delete ${personalData?.fullName}'s application? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </div>

      <style>{`
        .no-scroll {
          overflow: hidden;
        }

        @keyframes floatParticle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          25% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.3;
          }
          75% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(128, 90, 213, 0.1);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

const QuickInfoCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-4 shadow-sm">
    <div className="flex items-center mb-2">
      {icon}
      <span className="ml-2 text-sm font-medium text-purple-300">{title}</span>
    </div>
    <p className="text-white font-semibold">{value || 'N/A'}</p>
  </div>
);

const SectionCard = ({
  title,
  icon,
  isOpen,
  toggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  toggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg shadow-sm overflow-hidden">
    <div
      className="p-4 bg-gray-900/60 cursor-pointer hover:bg-purple-900/20 transition-colors flex items-center justify-between"
      onClick={toggle}
    >
      <div className="flex items-center">
        {icon}
        <h3 className="ml-3 text-lg font-semibold text-purple-100">{title}</h3>
      </div>
      <FiChevronRight
        size={20}
        className={`text-purple-300 transition-transform ${isOpen ? 'rotate-90' : ''}`}
      />
    </div>
    {isOpen && <div className="p-6">{children}</div>}
  </div>
);

const InfoGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="font-semibold text-purple-100 mb-3 pb-2 border-b border-purple-500/30">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string | number | boolean | null | undefined }) => (
  <div className="flex justify-between py-1">
    <span className="text-purple-300 text-sm">{label}:</span>
    <span className="text-white text-sm font-medium text-right">
      {value === null || value === undefined || value === '' ? 'N/A' : String(value)}
    </span>
  </div>
);

const ConsentRow = ({ label, value }: { label: string; value: boolean | undefined }) => (
  <div className="flex items-center justify-between p-3 bg-gray-800/80 rounded-lg border border-purple-500/30">
    <span className="text-purple-100">{label}</span>
    <div className="flex items-center">
      {value ? (
        <div className="flex items-center text-blue-400">
          <FiCheckCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Accepted</span>
        </div>
      ) : (
        <div className="flex items-center text-red-400">
          <FiX size={16} className="mr-1" />
          <span className="text-sm">Not Accepted</span>
        </div>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-600/30', text: 'text-yellow-100', border: 'border-yellow-500/50' },
    approved: { bg: 'bg-green-600/30', text: 'text-green-100', border: 'border-green-500/50' },
    rejected: { bg: 'bg-red-600/30', text: 'text-red-100', border: 'border-red-500/50' },
    offered: { bg: 'bg-blue-600/30', text: 'text-blue-100', border: 'border-blue-500/50' },
  };

  const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default ApplicantDetails;