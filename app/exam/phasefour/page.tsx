'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { submitPhaseFourExam } from '@/app/actions';

export default function PhaseFourExam() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Timer
  useEffect(() => {
    if (countdown > 0 && !isSubmitted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isSubmitted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel' // .xls
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Only XLSX or XLS allowed.');
        setFile(null);
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10 MB.');
        setFile(null);
        return;
      }
    }
    setFile(selectedFile);
    setError(null);
    console.log('File selected:', selectedFile ? { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type } : 'No file');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) {
      setError('Invalid examination ID.');
      console.log('handleSubmit: Missing examId');
      return;
    }
    if (!file) {
      setError('Please upload a file.');
      console.log('handleSubmit: No file selected');
      return;
    }

    setLoading(true);
    setError(null);

    console.log('Submitting file for examId:', examId);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    try {
      const result = await submitPhaseFourExam(examId, file);
      console.log('submitPhaseFourExam result:', result);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit file.');
      }
    } catch (err: any) {
      console.error('submitPhaseFourExam error:', err);
      setError(`Failed to submit file: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-800">Phase Four: Google Sheets Test</h1>
            <div className={`px-4 py-2 rounded-lg font-bold ${countdown > 60 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              ⏰ {formatTime(countdown)}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-semibold">Instructions:</p>
            <p className="text-red-600 font-semibold">⚠️ ONE-TIME SUBMISSION - No retries allowed!</p>
            <p>Complete the Google Sheets test and upload your Excel file below.</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Google Sheets Test Instructions</h2>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-2">
            <li>
              Go to{' '}
              <a
                href="https://docs.google.com/spreadsheets/d/your-sheet-id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Google Sheets Test
              </a>
            </li>
            <li>Complete the tasks in the provided Google Sheet.</li>
            <li>
              Download the sheet as an Excel file (<strong>.xlsx</strong> or <strong>.xls</strong>), rename it to{' '}
              <strong>&lt;FULL NAME&gt;_Google_Sheets_Test</strong> (e.g., John_Doe_Google_Sheets_Test.xlsx), and upload it below.
            </li>
          </ol>
        </div>

        {/* Upload Form or Submission Confirmation */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Your Excel File</h3>
            <div className="mb-4">
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:font-semibold file:hover:bg-blue-600"
              />
              <p className="text-xs text-gray-500 mt-2">Upload 1 file (XLSX, XLS). Max 10 MB.</p>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
            <p className="text-red-600 font-semibold mb-4">⚠️ This submission can only be done ONCE!</p>
            <button
              type="submit"
              disabled={loading || countdown === 0 || !file}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Excel File'}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam submitted, please wait for further instructions</h2>
            <p className="text-gray-600 mb-6">Your Excel file has been submitted. Return to the home page for further instructions.</p>
            <a
              href="/"
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
            >
              Return to Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}