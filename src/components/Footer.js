import Link from 'next/link';
import { FiGithub, FiTwitter, FiLinkedin, FiFacebook } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/press">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/guides">Guides</Link></li>
              <li><Link href="/help">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/security">Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white"><FiGithub className="w-6 h-6" /></Link>
              <Link href="#" className="hover:text-white"><FiTwitter className="w-6 h-6" /></Link>
              <Link href="#" className="hover:text-white"><FiLinkedin className="w-6 h-6" /></Link>
              <Link href="#" className="hover:text-white"><FiFacebook className="w-6 h-6" /></Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p>© {new Date().getFullYear()} Your Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
