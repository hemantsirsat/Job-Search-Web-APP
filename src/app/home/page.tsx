'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiSearch, FiFileText, FiCheckCircle, FiGlobe, FiArrowRight, FiUsers, FiBriefcase, FiAward } from 'react-icons/fi';

const features = [
  {
    icon: <FiSearch className="h-8 w-8 text-blue-600" />,
    title: 'Find Your Dream Job',
    description: 'Search through thousands of job listings across multiple countries and industries.'
  },
  {
    icon: <FiFileText className="h-8 w-8 text-blue-600" />,
    title: 'CV Analysis',
    description: 'Get instant feedback on your CV and improve your chances of getting hired.'
  },
  {
    icon: <FiCheckCircle className="h-8 w-8 text-blue-600" />,
    title: 'Application Tracking',
    description: 'Keep track of all your job applications in one place.'
  },
  {
    icon: <FiGlobe className="h-8 w-8 text-blue-600" />,
    title: 'Global Opportunities',
    description: 'Find job opportunities from around the world.'
  }
];

const stats = [
  { id: 1, name: 'Jobs Available', value: '10,000+', icon: FiBriefcase },
  { id: 2, name: 'Companies Hiring', value: '1,200+', icon: FiUsers },
  { id: 3, name: 'Successful Placements', value: '5,000+', icon: FiAward },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Find Your Dream Job with <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">JobSearch</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The easiest way to find your next career opportunity. Search jobs, analyze your CV, and track your applications all in one place.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              href="/find-job"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link 
              href="/check-cv"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Check Your CV
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-md bg-blue-50 text-blue-600">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500">{stat.name}</dt>
                    <dd className="text-3xl font-semibold text-gray-900">{stat.value}</dd>
                  </div>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need for your job search
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Powerful features to help you find and land your next job
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-50 text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
            Ready to find your next opportunity?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of professionals who found their dream jobs with JobSearch.
          </p>
          <Link 
            href="/find-job"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
          >
            Get Started
            <FiArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
