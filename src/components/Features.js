import { FiCheck, FiShield, FiClock, FiDollarSign } from 'react-icons/fi';

export default function Features() {
  const features = [
    {
      icon: <FiCheck className="w-6 h-6" />,
      title: "Quality Work",
      description: "Access top-rated freelancers and get high-quality deliverables"
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Payment protection and guaranteed satisfaction"
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Quick Delivery",
      description: "Fast turnaround times with on-time delivery guarantee"
    },
    {
      icon: <FiDollarSign className="w-6 h-6" />,
      title: "Best Rates",
      description: "Competitive pricing and flexible payment options"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Why Choose Us</h2>
        <p className="text-gray-600 text-center mb-12">Experience the best freelance services with our platform</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
