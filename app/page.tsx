'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { validateExamId } from './actions';

export default function LandingPage() {
  const [examId, setExamId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) {
      setError('Examination ID is required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const examDetails = await validateExamId(examId);
      
      if (examDetails) {
        setIsSuccess(true);
        setShowModal(true);
      } else {
        setIsSuccess(false);
        setShowModal(true);
        setError('Invalid Examination ID');
      }
    } catch (error) {
      setIsSuccess(false);
      setShowModal(true);
      setError('Connection error. Please try again.');
    }
    
    setLoading(false);
  };

  const handleBeginExam = () => {
    setShowModal(false);
    router.push(`/exam/phaseone?examId=${examId}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Adon Assessment</h1>
          <p className="text-gray-600">Enter your examination ID</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examination ID
            </label>
            <input
              type="text"
              value={examId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExamId(e.target.value.toUpperCase())}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Enter your code"
              maxLength={20}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              'Proceed to Assessment'
            )}
          </button>
        </form>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={handleCloseModal}>
            <div className="bg-white rounded-lg p-6 w-full max-w-sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {isSuccess ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <h3 className={`text-lg font-semibold text-center mb-4 ${
                isSuccess ? 'text-green-800' : 'text-red-800'
              }`}>
                {isSuccess ? 'Success!' : 'Error'}
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                {isSuccess ? 'Click below to start your exam.' : error}
              </p>

              <div className="space-y-2">
                {isSuccess ? (
                  <button
                    onClick={handleBeginExam}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700"
                  >
                    Begin Exam
                  </button>
                ) : (
                  <button
                    onClick={handleCloseModal}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}