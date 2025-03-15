'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import { FiBriefcase, FiDollarSign, FiStar, FiUsers, FiClock, FiX, FiFileText, FiUser, FiCheckSquare } from 'react-icons/fi';
import CollaborationSpace from '@/components/CollaborationSpace';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

const fetchClientStats = async (userId, token) => {
  try {
    // Fetch projects
    const projectsResponse = await fetch(`/api/projects?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await projectsResponse.json();

    // Update stats calculation with defaults
    const stats = {
      activeProjects: projects.filter(p => p.status === 'in-progress').length || 0,
      totalProjects: projects.length || 0,
      totalSpent: projects.reduce((sum, p) => {
        const completedProposals = p.proposals?.filter(prop => prop.status === 'completed') || [];
        return sum + completedProposals.reduce((s, prop) => s + (prop.bidAmount || 0), 0);
      }, 0),
      avgRating: projects.length ? 
        (projects.reduce((sum, p) => sum + (Number(p.clientRating) || 0), 0) / projects.length).toFixed(1) : 
        '0.0'
    };

    return { stats, projects };
  } catch (error) {
    console.error('Error fetching client stats:', error);
    throw error;
  }
};

const calculateAverageRating = (proposals) => {
  const ratedProposals = proposals.filter(p => p.rating);
  if (!ratedProposals.length) return '0.0';
  
  const totalRating = ratedProposals.reduce((sum, p) => sum + (Number(p.rating) || 0), 0);
  return (totalRating / ratedProposals.length).toFixed(1);
};

const calculateSuccessRate = (proposals) => {
  const completedOrCancelled = proposals.filter(p => ['completed', 'cancelled'].includes(p.status));
  if (!completedOrCancelled.length) return '0%';

  const completed = proposals.filter(p => p.status === 'completed').length;
  return `${Math.round((completed / completedOrCancelled.length) * 100)}%`;
};

const fetchFreelancerStats = async (userId, token) => {
  try {
    const response = await fetch('/api/proposals/freelancer', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new TypeError("Received non-JSON response");
    }

    const data = await response.json();
    return {
      stats: {
        activeProjects: data.filter(p => p.status === 'accepted').length || 0,
        completedProjects: data.filter(p => p.status === 'completed').length || 0,
        totalEarnings: data.reduce((sum, p) => 
          p.status === 'completed' ? sum + (Number(p.bidAmount) || 0) : sum, 0),
        avgRating: calculateAverageRating(data),
        successRate: calculateSuccessRate(data)
      },
      proposals: data
    };
  } catch (error) {
    console.error('Error fetching freelancer stats:', error);
    return {
      stats: {
        activeProjects: 0,
        completedProjects: 0,
        totalEarnings: 0,
        avgRating: '0.0',
        successRate: '0%'
      },
      proposals: []
    };
  }
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalProjects: 0,
    totalSpent: 0,
    totalEarnings: 0,
    avgRating: '0.0',
    successRate: '0%',
    proposals: 0
  });
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const projectsResponse = await fetch(`/api/projects?userId=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projects = await projectsResponse.json();

      setStats({
        activeProjects: projects.filter(p => p.status === 'open').length,
        earnings: projects.reduce((sum, p) => sum + (p.budget.maxAmount || 0), 0),
        proposals: projects.reduce((sum, p) => sum + (p.proposals?.length || 0), 0),
        rating: user.rating || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects?userId=${user._id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError("Received non-JSON response");
      }

      const projectsData = await response.json();
      setProjects(projectsData);

      // Fetch all proposals across projects
      const allProposals = projectsData.reduce((acc, project) => {
        return acc.concat(project.proposals.map(proposal => ({
          ...proposal,
          projectTitle: project.title,
          projectId: project._id
        })));
      }, []);
      setProposals(allProposals);

      // Update stats
      setStats({
        activeProjects: projectsData.filter(p => p.status === 'open').length,
        totalProjects: projectsData.length,
        totalProposals: allProposals.length,
        acceptedProposals: allProposals.filter(p => p.status === 'accepted').length
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
      setProjects([]);
      setProposals([]);
      setStats({
        activeProjects: 0,
        totalProjects: 0,
        totalProposals: 0,
        acceptedProposals: 0
      });
    }
  };

  const fetchFreelancerData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch proposals submitted by freelancer
      const proposalsResponse = await fetch(`/api/proposals?freelancerId=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const proposalsData = await proposalsResponse.json();

      // Update stats and proposals
      setStats({
        activeProjects: proposalsData.filter(p => p.status === 'accepted').length,
        earnings: proposalsData.reduce((sum, p) => p.status === 'completed' ? sum + p.bidAmount : sum, 0),
        proposals: proposalsData.length,
        rating: user.rating || 0
      });
      setProposals(proposalsData);
    } catch (error) {
      console.error('Error fetching freelancer data:', error);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'client') {
      fetchClientData();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'freelancer') {
      fetchFreelancerData();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (user?.role === 'client') {
          const { stats: clientStats, projects } = await fetchClientStats(user._id, token);
          setStats(clientStats);
          setProjects(projects);
        } else {
          const { stats: freelancerStats, proposals } = await fetchFreelancerStats(user._id, token);
          setStats(freelancerStats);
          setProposals(proposals);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return null;

  const handleProposalAction = async (projectId, proposalId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });

      if (response.ok) {
        fetchClientData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating proposal:', error);
    }
  };

  const ProjectDetailsModal = ({ project, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Budget</h3>
              <p className="text-gray-600">${project.budget.minAmount} - ${project.budget.maxAmount}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Duration</h3>
              <p className="text-gray-600">{project.duration}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Proposals ({project.proposals.length})</h3>
            <div className="space-y-4">
              {project.proposals.map((proposal) => (
                <div key={proposal._id} 
                     className="border rounded-lg p-4 hover:bg-gray-50"
                     onClick={() => {
                       setSelectedProposal(proposal);
                       setSelectedProject(null);
                     }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-gray-400" />
                      <span className="font-medium">{proposal.freelancer.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {project.proposals.some(p => p.status === 'accepted') && (
            <div className="mt-8">
              <Link 
                href={`/projects/${project._id}/workspace`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                <FiBriefcase className="mr-2" />
                Go to Project Workspace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ProposalDetailsModal = ({ proposal, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Proposal Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Project</h3>
            <p className="text-lg">{proposal.projectTitle}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Freelancer</h3>
            <div className="flex items-center gap-3">
              <FiUser className="text-gray-400" />
              <span>{proposal.freelancer.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Bid Amount</h3>
              <p className="text-2xl font-bold text-blue-600">${proposal.bidAmount}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Delivery Time</h3>
              <p className="text-2xl font-bold text-gray-700">{proposal.deliveryTime} days</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Cover Letter</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600 whitespace-pre-line">{proposal.coverLetter}</p>
            </div>
          </div>

          {proposal.status === 'pending' && (
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  handleProposalAction(proposal.projectId, proposal._id, 'accepted');
                  onClose();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Accept Proposal
              </button>
              <button
                onClick={() => {
                  handleProposalAction(proposal.projectId, proposal._id, 'rejected');
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject Proposal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const statsItems = user?.role === 'client' ? [
    { icon: <FiBriefcase />, label: 'Active Projects', value: stats.activeProjects || 0 },
    { icon: <FiDollarSign />, label: 'Total Spent', value: `$${stats.totalSpent || 0}` },
    { icon: <FiCheckSquare />, label: 'Total Projects', value: stats.totalProjects || 0 },
    { icon: <FiStar />, label: 'Average Rating', value: stats.avgRating || '0.0' }
  ] : [
    { icon: <FiBriefcase />, label: 'Active Projects', value: stats.activeProjects || 0 },
    { icon: <FiDollarSign />, label: 'Total Earnings', value: `$${stats.totalEarnings || 0}` },
    { icon: <FiCheckSquare />, label: 'Success Rate', value: stats.successRate || '0%' },
    { icon: <FiStar />, label: 'Average Rating', value: stats.avgRating || '0.0' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              {user.role === 'freelancer' 
                ? "Here's an overview of your freelancing activity"
                : "Here's an overview of your projects"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statsItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-500">{item.label}</div>
                  {item.icon}
                </div>
                <div className="text-3xl font-bold">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Content based on user role */}
          {user.role === 'freelancer' ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Freelancer Content */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Proposals Section */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Your Proposals</h2>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Total: {proposals.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal._id} 
                         className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{proposal.projectTitle}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center text-sm text-gray-600">
                              <FiDollarSign className="mr-1 h-4 w-4" />
                              ${proposal.bidAmount}
                            </span>
                            <span className="flex items-center text-sm text-gray-600">
                              <FiClock className="mr-1 h-4 w-4" />
                              {proposal.deliveryTime} days
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {proposal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Projects */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Projects Section */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Active Projects</h2>
                  <Link href="/find-work" className="text-blue-600 hover:text-blue-700">
                    Find More Work
                  </Link>
                </div>
                <div className="space-y-4">
                  {proposals
                    .filter(p => p.status === 'accepted')
                    .map((project) => (
                      <div key={project._id} 
                           className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{project.projectTitle}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center text-sm text-gray-600">
                                <FiDollarSign className="mr-1 h-4 w-4" />
                                ${project.bidAmount}
                              </span>
                            </div>
                          </div>
                          <Link 
                            href={`/projects/${project.projectId}/workspace`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                          >
                            Workspace
                          </Link>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Client Content */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Posted Projects Section */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Your Posted Projects</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Total: {projects.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project._id} 
                         onClick={() => setSelectedProject(project)}
                         className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600">
                            Posted {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center text-sm text-gray-600">
                              <FiUsers className="mr-1 h-4 w-4" />
                              {project.proposals.length} proposals
                            </span>
                            <span className="flex items-center text-sm text-gray-600">
                              <FiDollarSign className="mr-1 h-4 w-4" />
                              ${project.budget.minAmount}-${project.budget.maxAmount}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          project.status === 'open' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                {/* Proposals Section */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Recent Proposals</h2>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    Total: {proposals.length}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal._id}
                         onClick={() => setSelectedProposal(proposal)}
                         className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                      {/* Proposal Content */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{proposal.projectTitle}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center text-sm text-gray-600">
                              <FiDollarSign className="mr-1 h-4 w-4" />
                              ${proposal.bidAmount}
                            </span>
                            <span className="flex items-center text-sm text-gray-600">
                              <FiClock className="mr-1 h-4 w-4" />
                              {proposal.deliveryTime} days
                            </span>
                          </div>
                        </div>
                        {proposal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProposalAction(proposal.projectId, proposal._id, 'accepted');
                              }}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProposalAction(proposal.projectId, proposal._id, 'rejected');
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
      
      {selectedProposal && (
        <ProposalDetailsModal proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
      )}
    </div>
  );
}
