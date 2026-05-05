import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PinOverlay = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login, showPinOverlay } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    const success = login(pin);
    if (!success) {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setPin(value);
    setError('');
  };

  if (!showPinOverlay) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">Enter PIN to access the system</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              PIN
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={handleChange}
              placeholder="Enter 4-digit PIN"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
              maxLength={4}
              autoComplete="off"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Access System
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinOverlay;
