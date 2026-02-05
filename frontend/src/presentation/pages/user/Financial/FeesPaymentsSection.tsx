import { useState, useEffect } from 'react';
import { FaMoneyCheckAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { usePaymentsManagement } from '../../../../application/hooks/useFinancial';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import PaymentReceiptModal from './PaymentReceiptModal';
import type { Payment, FeesPaymentsSectionProps, ExtendedCharge } from '../../../../domain/types/user/financial';
import { financialService } from '../../../../application/services/financialService';

export default function FeesPaymentsSection({ studentInfo, paymentHistory, onPaymentSuccess }: FeesPaymentsSectionProps) {
  const { createPayment, isCreatingPayment, createPaymentError } = usePaymentsManagement(1, 10, {}, '', 'all', false);
  const { styles, theme } = usePreferences();
  const [selectedCharge, setSelectedCharge] = useState<ExtendedCharge | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay'>('Razorpay');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showPaidCharges, setShowPaidCharges] = useState(false);

  const pendingCharges = studentInfo.filter((charge: ExtendedCharge) =>
    charge.status === 'Pending' || !charge.status
  );

  const paidCharges = studentInfo.filter((charge: ExtendedCharge) =>
    charge.status === 'Paid'
  );

  const getDisplayedHistory = () => {
    if (showFullHistory) {
      return paymentHistory;
    }
    return paymentHistory.slice(0, 3);
  };

  const displayedHistory = getDisplayedHistory();

  const getPaymentAmount = (): number => {
    return selectedCharge?.amount || 0;
  };

  const paymentAmount = getPaymentAmount();

  const toggleFullHistory = () => {
    setShowFullHistory(!showFullHistory);
  };

  const togglePaidCharges = () => {
    setShowPaidCharges(!showPaidCharges);
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedPayment(null);
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const cleanupPendingPayment = async () => {
      try {
        await financialService.clearPendingPayment();
      } catch (error) {
        console.error('Failed to cleanup pending payment:', error);
      }
    };

    const handleBeforeUnload = () => {
      cleanupPendingPayment();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupPendingPayment();
    };
  }, []);



  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCharge) {
      setAmountError('Please select a charge to pay.');
      return;
    }

    const amount = selectedCharge.amount || 0;
    if (amount <= 0) {
      setAmountError('The selected charge has an invalid amount. Please contact support.');
      return;
    }
    setAmountError(null);

    try {
      const hasPending = await financialService.checkPendingPayment();
      if (hasPending) {
        toast.error('You already have a pending payment. Please complete it before starting a new one.');
        return;
      }
    } catch (error) {
      toast.error('Failed to check pending payment status.');
      return;
    }

    try {
      const payment = {
        amount: paymentAmount,
        method: paymentMethod,
        term: selectedCharge.term || 'Spring 2025',
        chargeId: selectedCharge.id,
      };

      createPayment(payment, {
        onSuccess: (response) => {
          if (response && typeof response === 'object' && 'error' in response) {
            setAmountError((response as { error: string }).error || 'Payment validation failed.');
            return;
          }

          if ('orderId' in response) {
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID,
              amount: paymentAmount * 100,
              currency: 'INR',
              name: 'Your Institution Name',
              description: `Payment for ${studentInfo[0]?.term || 'Spring 2025'} Fees`,
              order_id: response.orderId as string,
              handler: (rzpResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                createPayment({
                  ...payment,
                  chargeId: selectedCharge.id,
                  razorpayPaymentId: rzpResponse.razorpay_payment_id,
                  razorpayOrderId: rzpResponse.razorpay_order_id,
                  razorpaySignature: rzpResponse.razorpay_signature,
                }, {
                  onSuccess: (verificationResponse) => {
                    if (verificationResponse && !('error' in verificationResponse)) {
                      toast.success('Payment successful! Your payment has been processed.');
                      if (onPaymentSuccess) {
                        onPaymentSuccess();
                      }
                    } else {
                      setAmountError('Payment verification failed. Please contact support.');
                    }
                  },
                  onError: (err) => {
                    console.error('Payment verification error:', err);
                    setAmountError('Payment verification failed. Please contact support.');
                  }
                });
              },
              prefill: {
                name: studentInfo[0]?.name || 'Student Name',
                email: studentInfo[0]?.email || '',
                contact: studentInfo[0]?.contact || '',
              },
              theme: {
                color: '#F59E0B',
              },
              modal: {
                ondismiss: async () => {
                  try {
                    await financialService.clearPendingPayment();
                    toast('Payment cancelled. You can try again anytime.');
                  } catch (error) {
                    console.error('Failed to clear pending payment on modal dismiss:', error);
                  }
                }
              }
            };

            const rzp = new (window as Window & typeof globalThis).Razorpay(options);
            rzp.on('payment.failed', async (...args: unknown[]) => {
              const rzpResponse = args[0] as { error: { description: string } };
              try {
                await financialService.clearPendingPayment();
              } catch (error) {
                console.error('Failed to clear pending payment on failure:', error);
              }
              setAmountError(`Payment failed: ${rzpResponse.error.description}`);
            });
            rzp.open();

          } else {
            toast.success('Payment successful! Your payment has been processed.');
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
          }
        },
        onError: (err: Error) => {
          console.error('Payment error:', err);
          setAmountError(err.message || 'Failed to initiate payment.');
        }
      });
    } catch (err: unknown) {
      console.error('Payment error:', err);
      setAmountError((err as Error).message || 'Failed to initiate payment.');
    }
  };

  return (
    <div className="relative w-full sm:px-4 md:px-6">
      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl bg-gradient-to-r ${styles.accent} group mb-6`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${styles.orb.primary}`}></div>
        <div className={`absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-24 h-24 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-2xl sm:blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-8 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-xl sm:blur-2xl animate-pulse delay-700`}></div>
        <div className="relative z-10 p-3 sm:p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <FaMoneyCheckAlt size={16} className="sm:w-5 sm:h-5 text-white relative z-10" />
              </div>
              <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            <div>
              <h3 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                Fee Payment Portal
              </h3>
              <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
            </div>
          </div>
          <span className={`bg-amber-200 text-orange-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium`}>
            Spring 2025
          </span>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-xl sm:rounded-2xl blur transition-all duration-300`}></div>
        <div className="relative z-10 p-3 sm:p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b ${styles.border} pb-2">
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Pending Charges
                </h4>
                {paidCharges.length > 0 && (
                  <button
                    onClick={togglePaidCharges}
                    className={`text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors`}
                  >
                    {showPaidCharges ? 'Hide Paid Charges' : 'Show Paid Charges'}
                  </button>
                )}
              </div>
              <div className={`relative overflow-hidden rounded-lg ${styles.card.background} p-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300 flex-1 min-h-[200px] flex flex-col justify-between`}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                <div className="relative z-10">
                  {pendingCharges.length === 0 ? (
                    <p className={`text-sm ${styles.textSecondary} text-center py-4`}>No pending charges.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingCharges.map((charge) => (
                        <div
                          key={charge.id}
                          onClick={() => setSelectedCharge(charge)}
                          className={`p-4 rounded-lg border ${styles.border} bg-gradient-to-r ${styles.card.background} hover:${styles.card.hover} transition-all duration-300 shadow-sm cursor-pointer ${selectedCharge?.id === charge.id ? `ring-2 ring-amber-500 ${styles.accent}` : ''
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className={`text-base font-semibold ${styles.textPrimary}`}>
                                {charge.chargeTitle || 'N/A'}
                              </h5>
                              {charge.chargeDescription && (
                                <p className={`text-sm ${styles.textSecondary} mt-1`}>
                                  {charge.chargeDescription}
                                </p>
                              )}
                              {charge.term && (
                                <p className={`text-sm ${styles.textSecondary} mt-1`}>
                                  <span className="font-medium">Term:</span> {charge.term}
                                </p>
                              )}
                              <p className={`text-sm ${styles.textSecondary} mt-1`}>
                                <span className="font-medium">Due Date:</span>{' '}
                                {charge.paymentDueDate
                                  ? new Date(charge.paymentDueDate).toLocaleDateString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: 'numeric',
                                  })
                                  : 'N/A'}
                              </p>
                            </div>
                            <div className={`text-right ${styles.textPrimary} font-bold text-base`}>
                              ₹{charge.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className={`p-4 rounded-lg border ${styles.border} bg-gradient-to-r ${styles.accent} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-base">Total Pending</span>
                          <span className="font-bold text-base">
                            ₹{pendingCharges.reduce((sum: number, charge: ExtendedCharge) => sum + (charge.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paid Charges Section */}
                  {showPaidCharges && paidCharges.length > 0 && (
                    <div className="mt-6">
                      <h5 className={`text-base font-semibold ${styles.textPrimary} mb-3 pb-2 border-b ${styles.border}`}>
                        Paid Charges
                      </h5>
                      <div className="space-y-4">
                        {paidCharges.map((charge) => (
                          <div
                            key={charge.id}
                            className={`p-4 rounded-lg border ${styles.border} bg-gradient-to-r ${styles.card.background} transition-all duration-300 shadow-sm`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <h5 className={`text-base font-semibold ${styles.textPrimary}`}>
                                    {charge.chargeTitle || 'N/A'}
                                  </h5>
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Paid</span>
                                </div>
                                {charge.chargeDescription && (
                                  <p className={`text-sm ${styles.textSecondary} mt-1`}>
                                    {charge.chargeDescription}
                                  </p>
                                )}
                                {charge.term && (
                                  <p className={`text-sm ${styles.textSecondary} mt-1`}>
                                    <span className="font-medium">Term:</span> {charge.term}
                                  </p>
                                )}
                                <p className={`text-sm ${styles.textSecondary} mt-1`}>
                                  <span className="font-medium">Paid Date:</span>{' '}
                                  {(charge as ExtendedCharge).paidAt
                                    ? new Date((charge as ExtendedCharge).paidAt!).toLocaleDateString('en-US', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      year: 'numeric',
                                    })
                                    : 'N/A'}
                                </p>
                              </div>
                              <div className={`text-right ${styles.textPrimary} font-bold text-base`}>
                                ₹{charge.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className={`p-4 rounded-lg border ${styles.border} bg-gradient-to-r ${styles.accent} ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-base">Total Paid</span>
                            <span className="font-bold text-base">
                              ₹{paidCharges.reduce((sum: number, charge: ExtendedCharge) => sum + (charge.amount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 border-b ${styles.border} pb-2`}>
                Pay Selected Charge
              </h4>
              <div className={`relative overflow-hidden rounded-lg ${styles.card.background} p-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300 flex-1 min-h-[200px] flex flex-col justify-between`}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
                <div className="relative z-10 flex flex-col h-full">
                  {createPaymentError && (
                    <div className={`mb-4 p-3 ${styles.status.error} rounded-lg text-sm`}>
                      {createPaymentError.message}
                    </div>
                  )}
                  {amountError && (
                    <div className={`mb-4 p-3 ${styles.status.error} rounded-lg text-sm`}>
                      {amountError}
                    </div>
                  )}
                  <form onSubmit={handlePayment} className="flex flex-col h-full justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${styles.textPrimary} mb-1`}>
                          Selected Charge
                        </label>
                        <div className={`block w-full px-4 py-2 ${styles.input.background} border ${styles.input.border} rounded-full text-sm sm:text-base ${styles.textSecondary} bg-gray-100`}>
                          {selectedCharge ? selectedCharge.chargeTitle : 'No charge selected'}
                        </div>
                        {selectedCharge && (
                          <p className={`text-xs ${styles.textSecondary} mt-1`}>
                            Term: {selectedCharge.term} | Due: {selectedCharge.paymentDueDate ? new Date(selectedCharge.paymentDueDate).toLocaleDateString() : 'N/A'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${styles.textPrimary} mb-1`}>
                          Payment Amount (₹)
                        </label>
                        <div className={`block w-full px-4 py-2 ${styles.input.background} border ${styles.input.border} rounded-full text-sm sm:text-base ${styles.textSecondary} bg-gray-100`}>
                          ₹{paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className={`text-xs ${styles.textSecondary} mt-1`}>
                          Amount is based on the selected charge
                        </p>
                      </div>
                      <div>
                        <p className={`block text-sm font-medium ${styles.textPrimary} mb-2`}>Payment Method</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap">
                          <label className={`flex items-center text-sm ${styles.textSecondary} cursor-pointer`}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="Razorpay"
                              checked={paymentMethod === 'Razorpay'}
                              onChange={() => setPaymentMethod('Razorpay')}
                              className={`mr-2 accent-amber-500 focus:ring-amber-500`}
                              disabled={isCreatingPayment}
                            />
                            Razorpay
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        disabled={isCreatingPayment || !selectedCharge || paymentAmount <= 0}
                        className={`group w-full bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white py-2 sm:py-3 px-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm sm:text-base`}
                      >
                        <span>{isCreatingPayment ? 'Processing...' : 'Proceed to Payment'}</span>
                        <FaMoneyCheckAlt size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 border-b ${styles.border} pb-2`}>
              Payment History
            </h4>
            <div className={`relative rounded-lg ${styles.card.background} p-3 sm:p-4 border ${styles.border} group/item hover:${styles.card.hover} transition-all duration-300`}>
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-lg blur transition-all duration-300`}></div>
              <div className="relative z-10">
                {displayedHistory.length === 0 ? (
                  <p className={`text-sm ${styles.textSecondary} text-center py-4`}>No payment history available.</p>
                ) : (
                  <>
                    {/* Fixed table header - outside scrollable container */}
                    <div className="min-w-[500px] sm:min-w-0">
                      <table className="min-w-full text-sm sm:text-base">
                        <thead>
                          <tr className={`${styles.card.background}`}>
                            <th className={`py-3 px-2 sm:px-4 text-left ${styles.textPrimary} font-semibold`}>Date</th>
                            <th className={`py-3 px-2 sm:px-4 text-left ${styles.textPrimary} font-semibold`}>Description</th>
                            <th className={`py-3 px-2 sm:px-4 text-left ${styles.textPrimary} font-semibold`}>Method</th>
                            <th className={`py-3 px-2 sm:px-4 text-right ${styles.textPrimary} font-semibold`}>Amount</th>
                            <th className={`py-3 px-2 sm:px-4 text-center ${styles.textPrimary} font-semibold`}>Receipt</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    {/* Scrollable table body - only when showing full history */}
                    <div className={`${showFullHistory ? 'overflow-y-auto max-h-[280px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' : ''}`}>
                      <div className="min-w-[500px] sm:min-w-0">
                        <table className="min-w-full text-sm sm:text-base">
                          <tbody>
                            {displayedHistory.map((payment, index) => (
                              <tr
                                key={payment.id || `${payment.date}-${payment.description}-${index}`}
                                className={`border-b ${styles.border} hover:bg-amber-100/50 transition-all duration-200`}
                              >
                                <td className={`py-2 px-2 sm:px-4 ${styles.textPrimary}`}>
                                  {payment.paidAt || payment.date
                                    ? new Date(payment.paidAt || payment.date || '').toLocaleDateString('en-US', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      year: 'numeric',
                                    })
                                    : 'N/A'}
                                </td>
                                <td className={`py-2 px-2 sm:px-4 ${styles.textSecondary}`}>
                                  {payment.chargeTitle || payment.description || 'N/A'}
                                </td>
                                <td className={`py-2 px-2 sm:px-4 ${styles.textSecondary}`}>
                                  {payment.method || 'N/A'}
                                </td>
                                <td className={`py-2 px-2 sm:px-4 text-right ${styles.textPrimary} font-medium`}>
                                  ₹{payment.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                                </td>
                                <td className="py-2 px-2 sm:px-4 text-center">
                                  <button
                                    onClick={() => handleViewReceipt(payment)}
                                    className={`${styles.status.warning} hover:${styles.status.error} underline text-sm transition-all duration-200`}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className={`text-sm ${styles.textSecondary} bg-gray-100 px-3 py-1 rounded-full`}>
                        {showFullHistory ? `${paymentHistory.length} payments total` : `Showing ${displayedHistory.length} of ${paymentHistory.length} payments`}
                      </div>

                      {paymentHistory.length > 3 && (
                        <button
                          onClick={toggleFullHistory}
                          className={`px-4 py-2 bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 text-sm`}
                        >
                          {showFullHistory ? 'Show Less' : 'View Full History'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentReceiptModal
        payment={selectedPayment}
        isOpen={showReceiptModal}
        onClose={closeReceiptModal}
      />
    </div>
  );
}