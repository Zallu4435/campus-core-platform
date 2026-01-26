import { useState, useEffect } from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';
import FinancialTabs from './FinancialTabs';
import FeesPaymentsSection from './FeesPaymentsSection';
import FinancialAidSection from './FinancialAidSection';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { MdCurrencyRupee } from 'react-icons/md';
import { formatDateTime } from '../../../../shared/utils/dateUtils';
import { financialService } from '../../../../application/services/financialService';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';
import { Charge, FinancialState, Payment } from '../../../../domain/types/user/financial';

export default function Financial() {
  const { styles, theme } = usePreferences();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [activeTab, setActiveTab] = useState('Fees and Payments');
  const [studentInfo, setStudentInfo] = useState<FinancialState>({
    info: [],
    history: [],
    financialAidStatus: '',
  });

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const response = await financialService.getStudentFinancialInfo();

      setStudentInfo({
        info: Array.isArray(response?.info) ? response.info as Charge[] : [],
        history: Array.isArray(response?.history) ? response.history as Payment[] : [],
        financialAidStatus: response?.financialAidStatus || '',
      });
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching financial data:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(String(err)));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message || 'An error occurred while loading financial data.'} />;
  }

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${styles.background}`}>
      <div className="relative z-10 w-full sm:px-4 md:px-6 py-6 sm:py-8">
        <div className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} hover:${styles.card.hover} transition-all duration-300`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-xl sm:rounded-2xl blur transition-all duration-300`}></div>
          <div className="relative z-10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                  <FaMoneyBillWave size={16} className="sm:w-5 sm:h-5 text-white relative z-10" />
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                  Financial Services
                </h2>
                <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
              </div>
            </div>
            <div className={`mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm ${styles.textSecondary}`}>
              <div className="flex items-center gap-1">
                <span className="font-medium">Account Balance:</span>
                <MdCurrencyRupee />
                <span>
                  {studentInfo?.info && studentInfo.info.length > 0
                    ? studentInfo.info.reduce((acc, charge) => acc + (charge.amount || 0), 0).toLocaleString()
                    : '0.00'}
                </span>
              </div>
              <div>
                <span className="font-medium">Payment Due:</span>{' '}
                {studentInfo?.info && studentInfo.info.length > 0
                  ? (() => {
                    const dueDates = studentInfo.info
                      .map(c => c.paymentDueDate ? new Date(c.paymentDueDate).getTime() : Infinity)
                      .filter(d => d !== Infinity);
                    if (dueDates.length === 0) return 'N/A';
                    const minDate = Math.min(...dueDates);
                    return formatDateTime(new Date(minDate).toISOString());
                  })()
                  : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Financial Aid Status:</span>{' '}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${studentInfo?.financialAidStatus === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {studentInfo?.financialAidStatus || 'Not Applied'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <FinancialTabs activeTab={activeTab} setActiveTab={setActiveTab} disabledTabs={['Financial Aid', 'Scholarships']} />
        </div>
        <div className="mt-6">
          {activeTab === 'Fees and Payments' && (
            <FeesPaymentsSection
              studentInfo={studentInfo?.info || []}
              paymentHistory={studentInfo?.history || []}
              onPaymentSuccess={fetchFinancialData}
            />
          )}
          {activeTab === 'Financial Aid' && <FinancialAidSection />}
        </div>
      </div>
    </div>
  );
}
