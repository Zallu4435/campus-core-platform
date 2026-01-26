import React from 'react';
import { FiDollarSign, FiX, FiFileText, FiCalendar } from 'react-icons/fi';
import { ChargeDetailsModalProps } from '../../../../domain/types/management/financialmanagement';
import ReactDOM from 'react-dom';
import { formattedDate } from '../../../../shared/constants/paymentManagementConstants';

const APPLICABLE_FOR_LABELS: Record<string, string> = {
  'all_students': 'All Students',
  'batch_2024': 'Batch 2024',
  'batch_2025': 'Batch 2025',
  'cs_department': 'CS Department',
  'admission_applicant': 'Admission Applicant',
};

const ChargeDetailsModal: React.FC<ChargeDetailsModalProps> = ({ charge, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getApplicableForLabel = (val: string | Record<string, unknown> | undefined) => {
    let slug = '';
    if (typeof val === 'object' && val !== null) {
      slug = (val.type as string) || (val.slug as string) || JSON.stringify(val);
    } else {
      slug = String(val || '');
    }
    return APPLICABLE_FOR_LABELS[slug] || slug;
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-md rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-tl-full" />
        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg border border-purple-500/30 bg-purple-600/20">
                <FiDollarSign size={22} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-100">Charge Details</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/20 rounded-full transition-colors"
            >
              <FiX size={22} className="text-purple-300" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 text-purple-100">
          <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2">
              <FiFileText className="text-purple-400" />
              <span className="font-semibold">Status:</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${charge.status === 'Active'
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
              {charge.status || 'Active'}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <FiFileText size={16} className="text-purple-400" />
              <span className="font-semibold">Title</span>
            </div>
            <p className="text-white pl-6">{charge.title}</p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <FiFileText size={16} className="text-purple-400" />
              <span className="font-semibold">Description</span>
            </div>
            <p className="text-white pl-6 text-sm leading-relaxed">{charge.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <FiDollarSign size={16} className="text-purple-400" />
                <span className="font-semibold">Amount</span>
              </div>
              <p className="text-white pl-6 font-mono">${charge.amount.toFixed(2)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <FiCalendar size={16} className="text-purple-400" />
                <span className="font-semibold">Due Date</span>
              </div>
              <p className="text-white pl-6">{new Date(charge.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <FiFileText size={16} className="text-purple-400" />
              <span className="font-semibold">Term</span>
            </div>
            <p className="text-white pl-6">{charge.term}</p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-purple-300">
              <FiFileText size={16} className="text-purple-400" />
              <span className="font-semibold">Applicable For</span>
            </div>
            <p className="text-white pl-6">{getApplicableForLabel(charge.applicableFor)}</p>
          </div>

          <div className="pt-4 border-t border-purple-500/20 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-purple-400 font-semibold mb-1 uppercase tracking-wider">Created By</p>
              <p className="text-purple-100">{charge.creatorName || 'System'}</p>
            </div>
            <div className="text-right">
              <p className="text-purple-400 font-semibold mb-1 uppercase tracking-wider">Created At</p>
              <p className="text-purple-100">{formattedDate(charge.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChargeDetailsModal; 