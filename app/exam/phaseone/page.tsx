
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { submitPhaseOneExam } from '@/app/actions';

export default function PhaseOneExam() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  
  const [answers, setAnswers] = useState({
    acquisitionAccount: '',
    acquisitionSecurity: '',
    landecStatus: '',
    heliosName: '',
    heliosSecurity: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Timer
  useEffect(() => {
    if (countdown > 0 && !isSubmitted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isSubmitted]);

  const questions = [
    {
      id: 'acquisitionAccount',
      question: "Which is the correct version of Acquisition Global's account number?",
      options: ['11465789', '11546789', '11456879', '11456789', '14156789']
    },
    {
      id: 'acquisitionSecurity',
      question: "Which of these combinations appears within Acquisition Global's security code?",
      options: ['TnA', 'Avx', 'Nv8', 'UOR', 'v8x']
    },
    {
      id: 'landecStatus',
      question: "Which is the correct version of Landec Limited's status?",
      options: ['Active', 'Inactive', 'Activity', 'Inactivity', 'Inacvite']
    },
    {
      id: 'heliosName',
      question: "Which of these is Helios' correct company name?",
      options: [
        'Helios Incoprorated',
        'Helios Incorporated',
        'Helios Insights',
        'Helios Industries',
        'Helois Incorporated'
      ]
    },
    {
      id: 'heliosSecurity',
      question: "Which of these combinations does not appear within Helios Incorporated's security code?",
      options: ['RRC', 'R2t', 's6R', 'RrC', 'tRR']
    }
  ];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId as keyof typeof prev]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitPhaseOneExam(examId || '', answers);
    setLoading(false);
    setIsSubmitted(true);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!examId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Invalid Exam Access</h1>
          <p className="text-gray-600 mb-6">Please return to the main page and enter a valid examination ID.</p>
          <a href="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Phase One: Attention to Detail Test</h1>
            <div className={`px-4 py-2 rounded-lg font-bold ${countdown > 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              ⏰ {formatTime(countdown)}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-semibold">Instructions:</p>
            <p className="text-red-600 font-semibold">⚠️ ONE-TIME EXAM - No retries allowed!</p>
            <p>Identify correct data from options. Case sensitive. Work quickly & accurately.</p>
            <p><strong>Pass Mark:</strong> <span className="text-red-600 font-bold">60% (3/5 correct)</span></p>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Reference Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Company Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Account Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Authorization Code</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-800">Acquisition Global</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800">11456789</td>
                  <td className="px-4 py-2 text-sm text-gray-800">Active</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800">TnAv8xUOr</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-800">Landec Limited</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800">12178957</td>
                  <td className="px-4 py-2 text-sm text-gray-800">Inactive</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800">z2aRt8dIz</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-800">Helios Incorporated</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800">11356790</td>
                  <td className="px-4 py-2 text-sm text-gray-800">Active</td>
                  <td className="px-4 py-2 text-sm font-mono text-gray-800">Ws6R2tRrC</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Questions Form or Submission Confirmation */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {index + 1}. {question.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {question.options.map((option, optIndex) => (
                    <label key={optIndex} className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id as keyof typeof answers] === option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        className="mr-3 h-4 w-4 text-blue-500"
                        required
                      />
                      <span className="text-sm text-gray-800">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-red-600 font-semibold mb-4">⚠️ This exam can only be submitted ONCE!</p>
              <button
                type="submit"
                disabled={loading || countdown === 0}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Final Answers'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your answers have been submitted!</h2>
            <p className="text-gray-600 mb-6">Proceed to the next phase of the exam.</p>
            <button
              onClick={() => window.location.href = `/exam/phasetwo?examId=${examId}`}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
            >
              Proceed to Phase Two →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
