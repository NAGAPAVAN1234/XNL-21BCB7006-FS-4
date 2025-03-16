'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiFilter } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

export default function FindWork() {
  const router = useRouter();
  const { query } = router;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: query.search || '',
    category: query.category || 'all',
    budget: query.budget || 'all'
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert filters to query parameters while avoiding undefined values
      const queryParams = Object.entries(filters)
        .filter(([_, value]) => value !== '') // Exclude empty values
        .map(([key, value]) => ${encodeURIComponent(key)}=${encodeURIComponent(value)})
        .join('&');

      const response = await fetch(/api/projects/search?${queryParams}, {
        headers: {
          'Authorization': Bearer ${localStorage.getItem('token')}
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError(error.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };

    // Update state
    setFilters(updatedFilters);

    // Update URL parameters
    router.push({
      pathname: '/find-work',
      query: updatedFilters
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => updateFilters('search', e.target.value)}
                className="p-3 border rounded-xl"
              />

              <select
                value={filters.category}
                onChange={(e) => updateFilters('category', e.target.value)}
                className="p-3 border rounded-xl"
              >
                <option value="all">All Categories</option>
                <option value="web">Web Development</option>
                <option value="mobile">Mobile Development</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="marketing">Digital Marketing</option>
                <option value="video">Video & Animation</option>
                <option value="music">Music & Audio</option>
                <option value="data">Data Science</option>
              </select>

              <select
                value={filters.budget}
                onChange={(e) => updateFilters('budget', e.target.value)}
                className="p-3 border rounded-xl"
              >
                <option value="all">All Budgets</option>
                <option value="low">$0 - $500</option>
                <option value="medium">$500 - $2000</option>
                <option value="high">$2000+</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center text-red-600 py-4">{error}</div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map(project => (
                <div key={project._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <p className="text-gray-600">{project.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">No Projects Found</div>
          )}
        </div>
      </div>
    </div>
  );
}
