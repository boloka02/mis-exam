
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { submitPhaseTwoExam } from '@/app/actions';

export default function PhaseTwoExam() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  
  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: '',
    q8: '',
    q9: '',
    q10: ''
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
      id: 'q1',
      question: "How much do you spend a week _____ average?",
      options: ['in', 'on', 'out of', 'of']
    },
    {
      id: 'q2',
      question: "‘Can I speak to Jenny, please?’ ‘I’m afraid she’s _____ to lunch. Can I take a message?’",
      options: ['going', 'gone', 'been', 'being']
    },
    {
      id: 'q3',
      question: "I’ve never _____ to Australia, but I’d like to go.",
      options: ['went', 'gone', 'been', 'being']
    },
    {
      id: 'q4',
      question: "‘When’s your holiday?’ ‘We’ve already _____. We went to France.’",
      options: ['gone', 'were', 'being', 'been']
    },
    {
      id: 'q5',
      question: "‘Where’s Harry these days?’ ‘Didn’t you know? He’s _____ to another company.’",
      options: ['went', 'gone', 'been', 'being']
    },
    {
      id: 'q6',
      question: "Watch your step with Dad. He’s _____ a terrible mood.",
      options: ['in', 'on', 'out of', 'of']
    },
    {
      id: 'q7',
      question: "Could you take a photo _____ me, please?",
      options: ['in', 'on', 'with', 'of']
    },
    {
      id: 'q8',
      question: "I had a crash this morning. Fortunately, I didn’t do much damage _____ my car.",
      options: ['in', 'on', 'out of', 'to']
    },
    {
      id: 'q9',
      question: "I’m small. I wish I _____ small.",
      options: ['am not', 'was', 'were', 'weren’t']
    },
    {
      id: 'q10',
      question: "I’m small. If only I _____ taller.",
      options: ['were', 'wasn’t', 'am', 'have']
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
    const result = await submitPhaseTwoExam(examId || '', answers);
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
            <h1 className="text-2xl font-bold text-gray-800">Phase Two: Grammar and Reading Comprehension Exam</h1>
            <div className={`px-4 py-2 rounded-lg font-bold ${countdown > 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              ⏰ {formatTime(countdown)}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-semibold">Instructions:</p>
            <p className="text-red-600 font-semibold">⚠️ ONE-TIME EXAM - No retries allowed!</p>
            <p>Answer all questions carefully using Australian English. Select the correct option for each question.</p>
            <p><strong>Pass Mark:</strong> <span className="text-red-600 font-bold">60% (6/10 correct)</span></p>
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
              onClick={() => window.location.href = `/exam/phasethree?examId=${examId}`}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
            >
              Proceed to Phase Three →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
