import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import { FiUsers, FiTarget, FiGlobe } from 'react-icons/fi';

const NavBar = dynamic(() => import('@/components/NavBar'), {
  loading: () => <Loading />
});

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<Loading />}>
        <NavBar />
      </Suspense>

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About FreelanceHub
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting talented freelancers with amazing projects worldwide
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {aboutCards.map((card, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-blue-600 mb-4">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{card.title}</h3>
                <p className="text-gray-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const aboutCards = [
  {
    icon: <FiUsers className="w-8 h-8 mx-auto" />,
    title: "Our Mission",
    description: "To create opportunities for talented individuals worldwide..."
  },
  // Add more cards...
];
