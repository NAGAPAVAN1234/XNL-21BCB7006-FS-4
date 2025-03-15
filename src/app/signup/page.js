'use client'
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'freelancer',
    // Additional fields for freelancers
    hourlyRate: '',
    skills: [],
    bio: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.accountType,
          hourlyRate: formData.accountType === 'freelancer' ? formData.hourlyRate : null,
          skills: formData.accountType === 'freelancer' ? formData.skills : [],
          bio: formData.accountType === 'freelancer' ? formData.bio : ''
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Automatically log in the user after successful signup
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('token', loginData.token);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create an Account
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300
                         placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300
                         placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300
                         placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300
                         placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              className={`flex-1 py-4 px-4 rounded-xl ${
                formData.accountType === 'freelancer' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setFormData({...formData, accountType: 'freelancer'})}
            >
              Freelancer
            </button>
            <button
              type="button"
              className={`flex-1 py-4 px-4 rounded-xl ${
                formData.accountType === 'client' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setFormData({...formData, accountType: 'client'})}
            >
              Client
            </button>
          </div>

          {/* Conditional fields for freelancers */}
          {formData.accountType === 'freelancer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300"
                  placeholder="Your hourly rate"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300"
                  placeholder="React, Node.js, Python"
                  onChange={(e) => setFormData({
                    ...formData,
                    skills: e.target.value.split(',').map(skill => skill.trim())
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 border border-gray-300"
                  placeholder="Tell us about yourself"
                  rows="4"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl
                     shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing up...' : 'Sign up'}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
