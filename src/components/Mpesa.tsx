import { useState } from 'react';
import { Phone, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function MpesaCheckout() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const sanitizePhoneNumber = (value: string) => {
  
    return value.replace(/\D/g, '');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhoneNumber(e.target.value);
    
    // Limit to 9 digits 
    setPhoneNumber(sanitized.slice(0, 9));
  };

  const getFormattedPhoneNumber = () => {
    const sanitized = sanitizePhoneNumber(phoneNumber);
    return '254' + sanitized;
  };

  const handleSubmit = async () => {
    if (!isValidPhone || !isValidAmount) return;
    
    const formattedPhone = getFormattedPhoneNumber();
    
    setLoading(true);
    setStatus('idle');
    setMessage('');

    // Simulate API call
    // In production, send formattedPhone to your M-Pesa API
    console.log('Sending payment request:', {
      phone: formattedPhone,
      amount: parseFloat(amount)
    });

    setTimeout(() => {
      // Demo: randomly succeed or fail
      const success = Math.random() > 0.3;
      
      if (success) {
        setStatus('success');
        setMessage(`Payment request of KES ${amount} sent to ${formattedPhone}. Please check your phone to complete the transaction.`);
      } else {
        setStatus('error');
        setMessage('Payment failed. Please try again or check your M-Pesa balance.');
      }
      setLoading(false);
    }, 2000);
  };

  const isValidPhone = () => {
    const sanitized = sanitizePhoneNumber(phoneNumber);
    return sanitized.length === 9;
  };
  
  const isValidAmount = parseFloat(amount) > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">M-Pesa Payment</h1>
          <p className="text-gray-600">Enter your details to complete payment</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-700 font-medium">+254</span>
              </div>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="712345678"
                className="block w-full pl-16 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter your Safaricom number</p>
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KES)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">KES</span>
              </div>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                min="1"
                step="1"
                className="block w-full pl-14 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                required
              />
            </div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{message}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !isValidPhone() || !isValidAmount}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay KES {amount || '0'}
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            You will receive an M-Pesa prompt on your phone. Enter your PIN to complete the payment.
          </p>
        </div>
      </div>
    </div>
  );
}