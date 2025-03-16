'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Only run verification when router is ready
    if (!router.isReady) return;

    const verifyPayment = async () => {
      try {
        const sessionId = router.query.session_id;
        if (!sessionId) {
          router.push('/');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`/api/stripe/verify/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();
        setPaymentDetails(data);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying payment:', error);
        router.push('/');
      }
    };

    verifyPayment();
  }, [router.isReady, router.query]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            {paymentDetails && (
              <div className="mb-6 text-left bg-gray-50 p-4 rounded-xl">
                <h2 className="font-semibold mb-2">Payment Details</h2>
                <p className="text-gray-600">Amount: ${paymentDetails.amount}</p>
                <p className="text-gray-600">Package: {paymentDetails.packageName}</p>
                <p className="text-gray-600">Transaction ID: {paymentDetails.transactionId}</p>
              </div>
            )}
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. The freelancer has been notified and will contact you shortly.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push(`/messages/${paymentDetails?.freelancerId}`)}
                className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl hover:bg-blue-50"
              >
                Message Freelancer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
