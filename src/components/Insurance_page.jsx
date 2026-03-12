import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CalendarDays, IdCard } from 'lucide-react';
import { API_URL, API_KEY } from '../api';

const InsurancePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    insuranceId: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/getPatientTest`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await res.json();
      if (res.ok) {
        navigate('/next-page', {
          state: {
            records: data,
            patientName: formData.name,
            patientDob: formData.dob
          }
        });
      } else {
        setError(data?.error || 'Invalid insurance details. Please check and try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Panel */}
        <div className="bg-blue-900 text-white p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Patient Insurance Portal</h2>
            <p className="text-blue-100 text-sm mb-6">
              Verify a patient's insurance by submitting the required details.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5" />
                <span>Secure & Encrypted Submission</span>
              </div>
              <div className="flex items-center gap-3">
                <IdCard className="w-5 h-5" />
                <span>Verify via Insurance ID</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5" />
                <span>Check coverage date records</span>
              </div>
            </div>
          </div>

          <p className="text-xs mt-8 text-blue-200">© 2026 Insurance Portal • All Rights Reserved</p>
        </div>

        {/* Right Panel */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 text-center">Enter Patient Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance ID</label>
            <input
              type="text"
              name="insuranceId"
              value={formData.insuranceId}
              onChange={handleChange}
              required
              placeholder="INS123456"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg font-medium transition ${
              loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit & View Records'}
          </button>

          {/* Feedback */}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default InsurancePage;
