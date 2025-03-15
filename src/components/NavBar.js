'use client'
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function NavBar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg fixed w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo section */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo.jpg"
              alt="Freelancer Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FreelanceHub
              </span>
              <span className="text-xs text-gray-600">Connect with Top Talent</span>
            </div>
          </Link>

          {/* Main navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {user.role === 'freelancer' ? (
                  <Link href="/find-work" className="text-gray-700 hover:text-blue-600">
                    Find Work
                  </Link>
                ) : (
                  <Link href="/hire" className="text-gray-700 hover:text-blue-600">
                    Hire Freelancers
                  </Link>
                )}
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                {user.role === 'client' && (
                  <Link 
                    href="/post-project" 
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FiPlus className="w-4 h-4" />
                    Post Project
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/find-work" className="text-gray-700 hover:text-blue-600">
                  Find Work
                </Link>
                <Link href="/hire" className="text-gray-700 hover:text-blue-600">
                  Hire Freelancers
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600">
                  About
                </Link>
              </>
            )}
          </div>

          {/* Auth section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <button className="text-gray-700 hover:text-blue-600">
                    <FiBell className="w-6 h-6" />
                  </button>
                  <button 
                    className="flex items-center space-x-2"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <Image
                      src={user.avatar || "/user.avif"}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="text-gray-700">{user.name}</span>
                  </button>
                </div>

                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border">
                    <Link 
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <FiUser className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button 
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
