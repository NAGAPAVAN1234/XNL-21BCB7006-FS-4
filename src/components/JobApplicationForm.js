'use client'
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function JobApplicationForm({ jobId, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    coverLetter: '',
    bidAmount: '',
    deliveryTime: '',
    attachments: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${jobId}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          freelancer: user._id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit proposal');
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter
        </label>
        <textarea
          className="w-full h-40 p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          placeholder="Explain why you're the best fit for this job..."
          value={formData.coverLetter}
          onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bid Amount ($)
          </label>
          <input
            type="number"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
            placeholder="Your bid amount"
            value={formData.bidAmount}
            onChange={(e) => setFormData({ ...formData, bidAmount: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Time (days)
          </label>
          <input
            type="number"
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
            placeholder="Estimated delivery time"
            value={formData.deliveryTime}
            onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 border rounded-xl hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Proposal'}
        </button>
      </div>
    </form>
  );
}
