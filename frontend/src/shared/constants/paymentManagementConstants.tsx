import { FiDollarSign, FiCreditCard, FiFileText, FiAward, FiSearch, FiX } from 'react-icons/fi';
import { Payment, FinancialAidApplication, ScholarshipApplication, Charge } from '../../domain/types/management/financialmanagement';
import React from 'react';

export const STATUSES = [
  'All Statuses',
  'Pending',
  'Completed',
  'Failed',
];
export const TERMS = ['All Terms', 'Fall 2024', 'Spring 2025', 'Summer 2025'];

export const paymentColumns = [
  {
    header: 'Student',
    key: 'studentName',
    render: (payment: Payment) => (
      <div className="flex items-center text-gray-300">
        <FiCreditCard size={14} className="text-purple-400 mr-2" />
        <span className="text-sm font-medium">{payment.studentName || payment.studentId || 'N/A'}</span>
      </div>
    ),
    width: '20%',
  },
  {
    header: 'Date',
    key: 'date',
    render: (payment: Payment) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{new Date(payment.date).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    header: 'Method',
    key: 'method',
    render: (payment: Payment) => (
      <div className="flex items-center text-gray-300">
        <FiCreditCard size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{payment.method?.charAt(0).toUpperCase() + payment.method?.slice(1)}</span>
      </div>
    ),
  },
  {
    header: 'Amount',
    key: 'amount',
    render: (payment: Payment) => (
      <div className="flex items-center text-gray-300">
        <FiDollarSign size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">${payment.amount.toFixed(2)}</span>
      </div>
    ),
  },
  {
    header: 'Status',
    key: 'status',
    render: (payment: Payment) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{payment.status}</span>
      </div>
    ),
  },
];

export const financialAidColumns = [
  {
    header: 'Student ID',
    key: 'studentId',
    render: (app: FinancialAidApplication) => (
      <div className="flex items-center text-gray-300">
        <FiCreditCard size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{app.studentId}</span>
      </div>
    ),
    width: '15%',
  },
  {
    header: 'Term',
    key: 'term',
    render: (app: FinancialAidApplication) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{app.term}</span>
      </div>
    ),
  },
  {
    header: 'Type',
    key: 'type',
    render: (app: FinancialAidApplication) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{app.type}</span>
      </div>
    ),
  },
  {
    header: 'Amount',
    key: 'amount',
    render: (app: FinancialAidApplication) => (
      <div className="flex items-center text-gray-300">
        <FiDollarSign size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">${app.amount.toFixed(2)}</span>
      </div>
    ),
  },
  {
    header: 'Status',
    key: 'status',
    render: (app: FinancialAidApplication) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{app.status}</span>
      </div>
    ),
  },
  {
    header: 'Date',
    key: 'applicationDate',
    render: (app: FinancialAidApplication) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{new Date((app).applicationDate).toLocaleDateString()}</span>
      </div>
    ),
  },
];

export const scholarshipColumns = [
  {
    header: 'Student ID',
    key: 'studentId',
    render: (app: ScholarshipApplication) => (
      <div className="flex items-center text-gray-300">
        <FiCreditCard size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{app.studentId}</span>
      </div>
    ),
    width: '15%',
  },
  {
    header: 'Scholarship ID',
    key: 'scholarshipId',
    render: (app: ScholarshipApplication) => (
      <div className="flex items-center text-gray-300">
        <FiAward size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{app.scholarshipId}</span>
      </div>
    ),
  },
  {
    header: 'Status',
    key: 'status',
    render: (app: ScholarshipApplication) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{app.status}</span>
      </div>
    ),
  },
  {
    header: 'Date',
    key: 'applicationDate',
    render: (app: ScholarshipApplication) => (
      <div className="flex items-center text-gray-300">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{new Date((app).applicationDate).toLocaleDateString()}</span>
      </div>
    ),
  },
];

export const getChargeColumns = (handleView: (charge: Charge) => void, handleEdit: (charge: Charge) => void, handleDelete: (charge: Charge) => void) => [
  {
    header: 'Title',
    key: 'title',
    render: (charge: Charge) => (
      <div className="flex items-center text-purple-100">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{charge.title}</span>
      </div>
    ),
  },
  {
    header: 'Amount',
    key: 'amount',
    render: (charge: Charge) => (
      <div className="flex items-center text-purple-100">
        <FiDollarSign size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">${charge.amount.toFixed(2)}</span>
      </div>
    ),
  },
  {
    header: 'Term',
    key: 'term',
    render: (charge: Charge) => (
      <div className="flex items-center text-purple-100">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{charge.term}</span>
      </div>
    ),
  },
  {
    header: 'Due Date',
    key: 'dueDate',
    render: (charge: Charge) => (
      <div className="flex items-center text-purple-100">
        <FiFileText size={14} className="text-purple-400 mr-2" />
        <span className="text-sm">{new Date(charge.dueDate).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    header: 'Actions',
    key: 'actions',
    render: (charge: Charge) => (
      <div className="flex items-center gap-3">
        <button title="View" onClick={() => handleView(charge)} className="p-1 hover:bg-purple-500/20 rounded-full">
          <FiSearch size={18} className="text-purple-400" />
        </button>
        <button title="Edit" onClick={() => handleEdit(charge)} className="p-1 hover:bg-purple-500/20 rounded-full">
          <FiFileText size={18} className="text-purple-400" />
        </button>
        <button title="Delete" onClick={() => handleDelete(charge)} className="p-1 hover:bg-red-500/20 rounded-full">
          <FiX size={18} className="text-red-400" />
        </button>
      </div>
    ),
  },
];

export const computeDateRange = (range: string) => {
  const today = new Date();
  let startDate = '';
  let endDate = '';
  if (range === 'last_week') {
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    startDate = lastWeek.toISOString().slice(0, 10);
    endDate = today.toISOString().slice(0, 10);
  } else if (range === 'last_month') {
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    startDate = lastMonth.toISOString().slice(0, 10);
    endDate = today.toISOString().slice(0, 10);
  } else if (range === 'last_3_months') {
    const last3Months = new Date(today);
    last3Months.setMonth(today.getMonth() - 3);
    startDate = last3Months.toISOString().slice(0, 10);
    endDate = today.toISOString().slice(0, 10);
  }
  return { startDate, endDate };
};

export const ghostParticles = Array(30)
  .fill(0)
  .map((_) => ({
    size: Math.random() * 10 + 5,
    top: Math.random() * 100,
    left: Math.random() * 100,
    animDuration: Math.random() * 10 + 15,
    animDelay: Math.random() * 5,
  }));

export const formattedDate = (date: string) => {
  const dateObj = new Date(date);
  return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
};

export const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    completed: {
      bg: 'bg-green-600/30',
      text: 'text-green-100',
      border: 'border-green-500/50',
    },
    pending: {
      bg: 'bg-yellow-600/30',
      text: 'text-yellow-100',
      border: 'border-yellow-500/50',
    },
    failed: {
      bg: 'bg-red-600/30',
      text: 'text-red-100',
      border: 'border-red-500/50',
    },
  };

  const config = statusConfig[status?.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
    </span>
  );
};

export const InfoCard = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number | string; className?: string }>; label: string; value: string }) => (
  <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
    <div className="flex items-center mb-2">
      <Icon size={18} className="text-purple-400" />
      <span className="ml-2 text-sm font-medium text-gray-300">{label}</span>
    </div>
    <p className="text-white font-semibold">{value || 'N/A'}</p>
  </div>
);