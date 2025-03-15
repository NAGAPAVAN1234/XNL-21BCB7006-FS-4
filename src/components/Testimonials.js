import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Project Manager",
      avatar: "/user.avif",
      quote: "The quality of freelancers on this platform is exceptional. We found the perfect developer for our project.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Startup Founder",
      avatar: "/user.avif",
      quote: "Great experience working with talented professionals. The platform made hiring super easy.",
      rating: 5
    },
    {
      name: "Emily Brown",
      role: "Marketing Director",
      avatar: "/user.avif",
      quote: "Impressed by the quality and professionalism. Will definitely use again for future projects.",
      rating: 5
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Client Testimonials</h2>
        <p className="text-gray-600 text-center mb-12">Hear what our clients have to say about their experience</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5" />
                ))}
              </div>
              <p className="text-gray-700">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
