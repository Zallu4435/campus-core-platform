import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DocumentInstructions } from './DocumentInstructions';
import { DocumentUploadTable } from './DocumentUploadTable';
import { DocumentUpload, DocumentUploadSectionFormData, DocumentUploadSectionSchema } from '../../../../domain/validation/user/DocumentSchema';
import { DocumentUploadSection } from '../../../../domain/types/application';
import { toast } from 'react-hot-toast';
import { documentUploadService } from '../../../../application/services/documentUploadService';
import { getNestedError } from '../../../../shared/utils/formErrors';

export interface DocumentsRef {
  trigger: () => Promise<boolean>;
  getValues: () => DocumentUploadSection;
}

export interface DocumentsProps {
  initialData?: DocumentUploadSection;
  onSave: (data: DocumentUploadSection) => void;
  applicationId: string;
}

export const Documents = React.forwardRef<DocumentsRef, DocumentsProps>(
  ({ initialData, applicationId }, ref) => {

    const defaultDocuments: DocumentUpload[] = [
      { id: 'passport', name: 'Passport' },
      { id: 'birthCert', name: 'Birth Certificate (in lieu of Passport)' },
      { id: 'examResults', name: 'National Level High School Examination result slip' },
      { id: 'ccaRecords', name: 'Co-curricular Activity Records' },
      { id: 'achievements', name: 'Certificate of Achievement' },
      { id: 'testimonials', name: 'Testimonials/Referee Letters' },
    ];

    const methods = useForm<DocumentUploadSectionFormData>({
      resolver: zodResolver(DocumentUploadSectionSchema),
      defaultValues: {
        documents: initialData?.documents?.length === 6 ? initialData.documents : defaultDocuments,
      },
      mode: 'onChange',
    });

    const { setValue, formState: { errors }, watch, trigger } = methods;
    const currentDocuments = watch('documents');

    // Expose trigger method via ref
    React.useImperativeHandle(ref, () => ({
      trigger: async () => {
        const isValid = await trigger();

        if (isValid) {
          methods.clearErrors();
        }

        return isValid;
      },
      getValues: () => ({ documents: currentDocuments }),
    }));

    const handleFileUpload = async (id: string, file: File) => {

      if (!file) {
        console.error('Missing file');
        return;
      }

      if (!applicationId || applicationId === '') {
        console.error('Application ID is missing or empty:', applicationId);
        toast.error('Application ID is missing. Please refresh the page and try again.');
        return;
      }

      const validTypes = ['application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF files are allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB.');
        return;
      }

      try {
        const uploadResult = await documentUploadService.uploadDocument(applicationId, id, file);
        const documents = watch('documents');
        const updatedDocuments = documents.map(doc =>
          doc.id === id
            ? {
              ...doc,
              fileName: file.name,
              fileType: file.type,
              cloudinaryUrl: uploadResult.url
            }
            : doc
        );

        setValue('documents', updatedDocuments, { shouldValidate: true });
        toast.success('Document uploaded successfully!');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
        console.error('Error uploading document:', error);
        toast.error(errorMessage);
      }
    };

    const handleFileRemove = (id: string) => {
      const documents = watch('documents');
      const updatedDocuments = documents.map(doc =>
        doc.id === id ? { ...doc, fileName: undefined, fileType: undefined, cloudinaryUrl: undefined } : doc
      );
      setValue('documents', updatedDocuments, { shouldValidate: true });
    };

    return (
      <FormProvider {...methods}>
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl border border-cyan-100">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
            <h2 className="text-xl font-semibold text-cyan-900">Document Upload</h2>
          </div>

          <div className="p-6 space-y-6">
            {(getNestedError(errors, 'documents') || errors.documents) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-sm text-red-700">
                  {getNestedError(errors, 'documents') ||
                    (typeof errors.documents === 'object' && 'message' in (errors.documents as any) ? (errors.documents as any).message : null) ||
                    'Either Passport or Birth Certificate must be uploaded, and Educational result slip is required.'}
                </p>
              </div>
            )}
            <DocumentInstructions />
            <DocumentUploadTable
              documents={watch('documents')}
              onFileUpload={handleFileUpload}
              onFileRemove={handleFileRemove}
            />
          </div>
        </div>
      </FormProvider>
    );
  }
);

Documents.displayName = 'Documents';