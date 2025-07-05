import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';

const NextPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { records = [], patientName, patientDob } = location.state || {};
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  if (!records || records.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <h2 className="text-xl font-medium text-gray-800 mb-4">No Records Available</h2>
        <button
          onClick={() => navigate('/insurance')}
          className="bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 hidden md:flex flex-col space-y-10 shadow-lg">
        <div className="text-2xl font-bold flex items-center gap-2">
          <span>📡</span>
          <span>INSURANCE</span>
        </div>
        <nav className="flex flex-col gap-4 text-base font-medium">
          <button className="text-left hover:text-blue-200 transition">📊 Dashboard</button>
          <button className="text-left hover:text-blue-200 transition">📄 Records</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="flex justify-between items-center p-6 bg-white border-b shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold text-blue-800">Patient Vitals Records</h2>
            <p className="text-sm text-gray-600 mt-1">
              Name: <strong>{patientName}</strong> | DOB: <strong>{patientDob}</strong>
            </p>
          </div>
          <div className="flex items-center gap-4 text-blue-700">
            <Bell className="w-5 h-5 cursor-pointer hover:text-blue-900 transition" />
            <User className="w-5 h-5 cursor-pointer hover:text-blue-900 transition" />
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <div className="overflow-x-auto bg-white shadow-md rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-blue-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Device ID</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Checked At</th>
                  <th className="px-4 py-3 text-left">Recorded Time</th>
                  <th className="px-4 py-3 text-left">Total Vitals</th>
                  <th className="px-4 py-3 text-left">Mismatches</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {records.map((rec, i) => (
                  <React.Fragment key={rec.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{i + 1}</td>
                      <td className="px-4 py-3">{rec.deviceId}</td>
                      <td className="px-4 py-3 capitalize">
                        <span className={`px-2 py-1 rounded text-white text-xs font-medium ${
                          rec.status === 'match' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{new Date(rec.checkedAt).toLocaleString()}</td>
                      <td className="px-4 py-3">{new Date(rec.recordedTimeStamp).toLocaleString()}</td>
                      <td className="px-4 py-3">{rec.totalNoOfVitals}</td>
                      <td className="px-4 py-3">
                        {rec.NoOfMismatch > 0 ? (
                          <span className="text-red-600 font-semibold">{rec.NoOfMismatch}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {rec.status === 'mismatch' && (
                          <button
                            onClick={() => toggleExpand(rec.id)}
                            className="text-blue-600 underline hover:text-blue-800 text-xs font-medium transition"
                          >
                            {expandedRow === rec.id ? 'Hide Details' : 'View Details'}
                          </button>
                        )}
                      </td>
                    </tr>

                    {expandedRow === rec.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="8" className="px-6 py-4">
                          <div className="bg-white border border-red-200 rounded-md shadow-sm p-4 max-w-xl mx-auto">
                            <h4 className="text-sm font-semibold text-red-700 mb-3">⚠ Mismatched Vitals</h4>
                            <div className="space-y-2 text-sm">
                              {Object.entries(rec.mismatchvitals || {}).map(([vitalName, values]) => (
                                <div
                                  key={vitalName}
                                  className="flex justify-between items-center border border-red-100 rounded px-3 py-2 bg-red-50"
                                >
                                  <div className="text-gray-700 capitalize font-medium">
                                    {vitalName.replace(/_/g, ' ')}
                                  </div>
                                  <div className="flex gap-4 text-xs">
                                    <div className="text-blue-800">
                                      <span className="font-semibold">CSV:</span> {values.csv}
                                    </div>
                                    <div className="text-red-700">
                                      <span className="font-semibold">DB:</span> {values.db}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NextPage;
