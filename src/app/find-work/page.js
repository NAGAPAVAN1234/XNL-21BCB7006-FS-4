import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiSearch, FiFilter } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />,
});

export default function FindWork({ projects, error }) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: router.query.search || '',
    category: router.query.category || 'all',
    budget: router.query.budget || 'all',
  });

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'web', label: 'Web Development' },
    { id: 'mobile', label: 'Mobile Development' },
    { id: 'design', label: 'Design' },
    { id: 'writing', label: 'Writing' },
    { id: 'marketing', label: 'Digital Marketing' },
    { id: 'video', label: 'Video & Animation' },
    { id: 'music', label: 'Music & Audio' },
    { id: 'data', label: 'Data Science' },
  ];

  const NoProjects = () => (
    <div className="text-center py-12">
      <div className="bg-white rounded-xl p-8 max-w-md mx-auto">
        <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your filters or search terms to find more projects.
        </p>
        <button
          onClick={() =>
            router.push('/find-work', undefined, { shallow: true })
          }
          className="text-blue-600 hover:underline"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="text-center text-red-600 py-4">{error}</div>
          ) : projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${project.budget.minAmount}</p>
                      <p className="text-gray-600">Fixed Price</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NoProjects />
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Server-Side Rendering (SSR)
export async function getServerSideProps(context) {
  try {
    const { search = '', category = 'all', budget = 'all' } = context.query;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (category && category !== 'all') queryParams.append('category', category);
    if (budget && budget !== 'all') queryParams.append('budget', budget);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/projects?${queryParams.toString()}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Failed to fetch projects');

    const projects = await response.json();

    return {
      props: {
        projects: Array.isArray(projects) ? projects : [],
        error: null,
      },
    };
  } catch (error) {
    console.error('SSR Error:', error);
    return {
      props: {
        projects: [],
        error: 'Failed to load projects',
      },
    };
  }
}
