'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUpload, FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiFilter } from 'react-icons/fi';

type Job = {
  id: string;
  title: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
  };
  description: string;
  created: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  contract_time?: string;
  category?: {
    label: string;
  };
  redirect_url: string;
};

export default function JobSearchApp() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 15;
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [parsedCV, setParsedCV] = useState<any>(null);
  const [jobScore, setJobScore] = useState<{ score: number; reason: string } | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'parsing' | 'success'>('idle');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪'
  });
  
  
  const countries = [
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' }
  ];
  
  const uploadStateRef = useRef(uploadState);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Keep the ref in sync with state
  useEffect(() => {
    uploadStateRef.current = uploadState;
  }, [uploadState]);

  const [allJobs, setAllJobs] = useState<Job[]>([]);

  const handleSearch = async (page: number = 1): Promise<void> => {
    if (!jobTitle.trim()) return;
    
    setLoadingJobs(true);
    setError(null);
    setSearched(true);
    setCurrentPage(page);

    try {
      const response = await axios.get('/api/search-jobs', {
        params: { 
          jobTitle,
          countryCode: selectedCountry.code.toLowerCase(),
          page: page,
          itemsPerPage: itemsPerPage,
        },
      });
      
      setJobs(response.data.results || []);
      setTotalItems(response.data.count || 0);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentJobs = jobs;

  const handlePageChange = (newPage: number): void => {
    if (newPage < 1 || newPage > totalPages) return;
    handleSearch(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPageButtons = 10;
  const halfMaxButtons = Math.floor(maxPageButtons / 2);
  
  let startPage = Math.max(1, currentPage - halfMaxButtons);
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const scoreJob = async (job: Job) => {
    if (!parsedCV) {
      setError('Please upload and parse your CV first.');
      return;
    }

    try {
      setIsScoring(true);
      const response = await axios.post('/api/score-job', {
        jobs: [job],
        cv: parsedCV,
      });
      
      const parsedScore = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      const scoreReason = typeof parsedScore.score === 'string' ? JSON.parse(parsedScore.score) : parsedScore.score;
      
      setJobScore({
        score: scoreReason.score,
        reason: scoreReason.reason
      });
    } catch (err) {
      setError('Failed to score the selected job.');
    } finally {
      setIsScoring(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadState('uploading');
      setError(null);
      
      // Simulate upload time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadState('parsing');
      const response = await axios.post('/api/upload-resume', formData);
      
      // Simulate parsing time
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setParsedCV(response.data);
      setUploadState('success');
      
      // After 5 seconds, switch to update state if still in success state
      const timer = setTimeout(() => {
        if (uploadStateRef.current === 'success') {
          setUploadState('idle');
        }
      }, 5000);
      
      // Clean up timer if component unmounts or upload happens again
      return () => clearTimeout(timer);
    } catch (err) {
      setError('Failed to upload and parse CV.');
      setUploadState('idle');
    }
  };

  const getUploadButtonContent = () => {
    switch (uploadState) {
      case 'uploading':
        return (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </div>
        );
      case 'parsing':
        return (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing CV...
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            CV Ready!
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <FiUpload className="mr-2" />
            {parsedCV ? 'Update CV' : 'Upload CV'}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Search */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                JobFinder
              </h1>
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button 
                    className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <span className="mr-1.5">{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-50 mt-1 w-48 bg-white rounded-md shadow-lg py-1">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${selectedCountry.code === country.code ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryDropdown(false);
                          }}
                        >
                          <span className="mr-2">{country.flag}</span>
                          <span>{country.name} ({country.code})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.button 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      uploadState === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : parsedCV && uploadState === 'idle'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : uploadState === 'uploading' || uploadState === 'parsing'
                        ? 'bg-blue-600 text-white cursor-wait'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => document.getElementById('cv-upload')?.click()}
                    disabled={uploadState === 'uploading' || uploadState === 'parsing'}
                  >
                    {getUploadButtonContent()}
                  </motion.button>
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploadState === 'uploading' || uploadState === 'parsing'}
                  />
                  {uploadState === 'success' && (
                    <motion.div 
                      className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job title, keywords, or company"
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  disabled={loadingJobs || !jobTitle.trim()}
                  className={`inline-flex items-center px-6 py-2.5 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    loadingJobs || !jobTitle.trim()
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {loadingJobs ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FiSearch className="mr-2" />
                      Search Jobs
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Filters - Removed as per requirements */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!loadingJobs && searched && jobs.length === 0 && !error && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">We couldn't find any jobs matching "{jobTitle}". Try different keywords.</p>
          </div>
        )}

        {/* Job Listings */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingJobs ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            ))
          ) : (
            currentJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={async () => {
                  setSelectedJob(job);
                  setJobScore(null);
                  await scoreJob(job);
                }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{job.company?.display_name || 'Company not specified'}</p>
                    </div>
                    {job.company?.display_name && (
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 ml-3">
                        {job.company.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMapPin className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">{job.location?.display_name || 'Location not specified'}</span>
                    </div>

                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FiDollarSign className="mr-1.5 flex-shrink-0" />
                        <span>
                          {job.salary_min?.toLocaleString()}
                          {job.salary_max && ` - ${job.salary_max.toLocaleString()}`}
                          {' '}{job.salary_currency || 'EUR'}
                        </span>
                      </div>
                    )}

                    {job.contract_time && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="mr-1.5 flex-shrink-0" />
                        <span className="capitalize">{job.contract_time.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Posted {new Date(job.created).toLocaleDateString()}
                    </span>
                    <button 
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                        setJobScore(null);
                        scoreJob(job);
                      }}
                    >
                      View details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {jobs.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-medium">{totalItems}</span> results
            </p>
            
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="First page"
              >
                «
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                ‹
              </button>

              <div className="flex items-center space-x-1">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                      currentPage === number
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    } transition-colors`}
                    aria-current={currentPage === number ? 'page' : undefined}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                ›
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Last page"
              >
                »
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                    <p className="text-blue-100 mt-1">{selectedJob.company?.display_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    &times;
                  </button>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {selectedJob.location?.display_name && (
                    <div className="flex items-center">
                      <FiMapPin className="mr-1.5 flex-shrink-0" />
                        <span className="truncate">{selectedJob.location.display_name}</span>
                    </div>
                  )}
                  
                  {(selectedJob.salary_min || selectedJob.salary_max) && (
                    <div className="flex items-center">
                      <FiDollarSign className="mr-1.5" />
                      {selectedJob.salary_min?.toLocaleString()}
                      {selectedJob.salary_max && ` - ${selectedJob.salary_max.toLocaleString()}`}
                      {' '}{selectedJob.salary_currency || 'EUR'}
                    </div>
                  )}
                  
                  <a
                    href={selectedJob.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Apply Now
                  </a>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Side - Job Description */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h3>
                    <div className="text-gray-800 whitespace-pre-line text-sm leading-relaxed text-justify">
                      {selectedJob.description}
                    </div>
                    
                    {(selectedJob.contract_time || selectedJob.category) && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {selectedJob.contract_time && (
                            <div>
                              <p className="text-gray-700 font-semibold">Contract Type</p>
                              <p className="font-medium text-gray-900 capitalize">{selectedJob.contract_time.replace('_', ' ')}</p>
                            </div>
                          )}
                          {selectedJob.category && (
                            <div>
                              <p className="text-gray-700 font-semibold">Category</p>
                              <p className="font-medium text-gray-900">{selectedJob.category.label}</p>
                            </div>
                          )}
                          {selectedJob.created && (
                            <div>
                              <p className="text-gray-700 font-semibold">Posted</p>
                              <p className="font-medium text-gray-900">{new Date(selectedJob.created).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Match Score */}
                <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
                  <div className="flex flex-col h-full">
                    {isScoring ? (
                      // Skeleton loading state
                      <div className="space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                      </div>
                    ) : jobScore ? (
                      // Score display
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-800">Your Match Score</h3>
                          <span 
                            className="text-white px-3 py-1 rounded-full text-sm font-bold shadow"
                            style={{
                              backgroundColor: `hsl(${jobScore.score * 1.2}, 70%, 45%)`,
                            }}
                          >
                            {jobScore.score}/100
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="font-medium text-gray-800 mb-2">Why this score?</h4>
                          <p className="text-gray-600 text-sm">{jobScore.reason}</p>
                        </div>
                      </div>
                    ) : (
                      // Empty state when no CV is uploaded
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                        <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-4">Upload your CV to see your match score</p>
                        <button
                          onClick={() => document.getElementById('cv-upload')?.click()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiUpload className="mr-2" />
                          Upload CV
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}