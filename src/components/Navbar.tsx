'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Find Job', path: '/find-job' },
    { name: 'Check CV', path: '/check-cv' },
  ];

  return (
    <nav 
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl mx-auto transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg rounded-2xl py-2' : 'bg-white/60 backdrop-blur-sm shadow-md rounded-xl py-1'
      }`}
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              JobSearch
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  (pathname === link.path || (link.path === '/home' && pathname === '/'))
                    ? 'bg-blue-50 text-blue-600 shadow-inner font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button className="ml-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-100 transition-all duration-200">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${mobileMenuOpen ? 'max-h-64' : 'max-h-0'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`block px-4 py-2 text-base font-medium ${
                (pathname === link.path || (link.path === '/home' && pathname === '/')) 
                  ? 'text-blue-600 bg-blue-50 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              } rounded-md`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <button className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-base font-medium rounded-lg hover:shadow-lg hover:shadow-blue-100 transition-all duration-200">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
