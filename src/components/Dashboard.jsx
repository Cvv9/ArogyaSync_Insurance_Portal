import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hospital, MapPin, Hash, Bell, User, Calendar, Wallet
} from 'lucide-react'; // ✅ added icons

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    try {
      const response = await fetch(
        'https://csvchecker-eufzfuchhjd5b2dk.centralindia-01.azurewebsites.net/getAllpatients'
      );
      const result = await response.json();
      setPatients(result);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation(); // Prevent navigation
    setExpanded(prev => (prev === id ? null : id));
  };

  const handleCardClick = (id) => {
    navigate(`/devices/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 hidden md:flex flex-col space-y-8">
        <div className="text-2xl font-bold flex items-center gap-2">
          <span>📡</span>
          <span>INSURANCE</span>
        </div>
        <nav className="flex flex-col gap-4 text-base font-medium">
          <button className="text-left hover:text-blue-200">📊 Dashboard</button>
          <button className="text-left hover:text-blue-200">💻 Patients</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="flex justify-between items-center p-6 bg-white border-b">
          <h2 className="text-xl font-semibold text-blue-800">Registered Patients</h2>
          <div className="flex items-center gap-4 text-blue-700">
            <Bell className="w-5 h-5 cursor-pointer hover:text-blue-900" />
            <User className="w-5 h-5 cursor-pointer hover:text-blue-900" />
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <p className="text-blue-600 font-medium">Loading patients...</p>
          ) : patients.length === 0 ? (
            <p className="text-red-600 font-medium">No patients found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.map((patient) => {
                const isExpanded = expanded === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => handleCardClick(patient.id)}
                    className={`group bg-white p-5 rounded-xl border border-gray-200 shadow-md transition-all duration-300 
                                hover:shadow-lg hover:border-blue-400 cursor-pointer 
                                ${isExpanded ? 'h-auto' : 'h-28'} overflow-hidden relative`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {patient.name || 'Unnamed Patient'}
                      </h3>
                      <button
                        onClick={(e) => toggleExpand(e, patient.id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="text-sm space-y-1 animate-fade-in mt-2">
                        <p className="flex items-center gap-2">
                          <Hash size={16} className="text-blue-500" />
                          <span className="font-medium">ID:</span> {patient.id}
                        </p>
                        <p className="flex items-center gap-2">
                          <Wallet size={16} className="text-blue-500" />
                          <span className="font-medium">Insurance:</span> {patient.insurance_id || 'N/A'}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-500" />
                          <span className="font-medium">DOB:</span>{' '}
                          {new Date(patient.dob).toLocaleDateString('en-IN')}
                        </p>
                        <p className="flex items-center gap-2">
                          <User size={16} className="text-blue-500" />
                          <span className="font-medium">Gender:</span> {patient.gender}
                        </p>
                        <p className="flex items-center gap-2">
                          <Hospital size={16} className="text-blue-500" />
                          <span className="font-medium">Hospital:</span>{' '}
                          {patient.hospital_name || `#${patient.hospital_id}`}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-500" />
                          <span className="font-medium">Location:</span> {patient.location || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
