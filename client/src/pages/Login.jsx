import React, { useState } from 'react';
import { authService } from '../services/api';
import { Lock, Mail, Loader } from 'lucide-react';
import Header from '../components/MainHeader';

const Login = ({ onSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const credentials = {
        email: identifier,
        identifier: identifier,
        password: password
      };
      
      const response = await authService.login(credentials);
      const { token } = response;
      
      if (!token) {
        throw new Error('No token returned');
      }
      
      localStorage.setItem('authToken', token);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to your admin dashboard</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-8">
              {error && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="admin@example.com or admin"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" /> 
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;



