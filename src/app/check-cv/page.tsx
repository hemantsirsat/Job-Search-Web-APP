'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CheckCVPage() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-50">
            <svg
              className="h-12 w-12 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Feature Coming Soon
          </h1>
          
          <p className="mt-4 text-xl text-gray-600">
            We're working hard to bring you an amazing CV checking experience.
            Stay tuned for updates!
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Back to Home
            </Link>
            <Link
              href="/find-job"
              className="rounded-md bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
          
          <div className="mt-10 flex items-center justify-center space-x-6">
            <p className="text-sm text-gray-500">
              Want to be notified when we launch?
            </p>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
              Notify me
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
