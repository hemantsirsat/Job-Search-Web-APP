'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiArrowRight, FiFilter, FiCalendar, FiCheckCircle, FiChevronDown, FiUpload } from 'react-icons/fi';

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

export default function FindJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
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
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [selectedCountry, setSelectedCountry] = useState({
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪'
  });
  
  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchJobs = async (page = 1) => {
    if (!jobTitle.trim()) return;
    
    setLoadingJobs(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/search-jobs', {
        params: {
          jobTitle: jobTitle,
          country: selectedCountry.code.toLowerCase(),
          page: page,
          jobPerPage: itemsPerPage,
          sort_by: sortBy
        }
      });
      console.log(response.data);
      setJobs(response.data.results || []);
      setTotalItems(response.data.count || 0);
      setTotalJobs(response.data.count || 0);
      setCurrentPage(page);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchJobs(1);
  };

  const handlePageChange = (page: number) => {
    searchJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadState('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload and parsing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUploadState('parsing');
      
      // Simulate parsing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock parsed CV data
      setParsedCV({
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experience: 5,
        education: [
          { degree: 'BSc Computer Science', year: 2018 },
          { degree: 'MSc Software Engineering', year: 2020 }
        ]
      });
      
      setUploadState('success');
      
      // Reset upload state after 3 seconds
      const timer = setTimeout(() => {
        setUploadState('idle');
      }, 3000);
      
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
    <div className="w-full">
      {/* Header with Search */}
      <header className="bg-gradient-to-r from-blue-50 to-blue-50 sticky top-0 z-10 pt-30 pb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
              <form onSubmit={handleSearch} className="w-full sm:flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-2.5 border-0 rounded-xl shadow-md placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-50 transition-all text-base text-gray-800"
                    placeholder="Job title, keywords, or company"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </form>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                  <button 
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-all w-full sm:w-auto justify-between"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                      <span className="font-medium">{selectedCountry.name}</span>
                    </div>
                    <svg className="ml-2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute right-0 z-50 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center transition-colors ${
                            selectedCountry.code === country.code 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryDropdown(false);
                          }}
                        >
                          <span className="text-lg mr-3">{country.flag}</span>
                          <span className="font-medium">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                  <button 
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-all w-full sm:w-auto justify-between"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                  >
                    <div className="flex items-center">
                      <FiFilter className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Sort: {sortBy === 'relevance' ? 'Relevance' : 'Date'}</span>
                    </div>
                    <svg className="ml-2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showSortDropdown && (
                    <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 ring-1 ring-black ring-opacity-5">
                      <button
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center transition-colors ${
                          sortBy === 'relevance' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSortBy('relevance');
                          setShowSortDropdown(false);
                        //   searchJobs(1);
                        }}
                      >
                        <FiFilter className="mr-2 h-4 w-4" />
                        <span>Relevance</span>
                      </button>
                      <button
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center transition-colors ${
                          sortBy === 'date' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSortBy('date');
                          setShowSortDropdown(false);
                        //   searchJobs(1);
                        }}
                      >
                        <FiCalendar className="mr-2 h-4 w-4" />
                        <span>Date</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <label className="cursor-pointer w-full sm:w-auto">
                  <div className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all w-full">
                    {getUploadButtonContent()}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVUpload}
                  />
                </label>
                
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!jobTitle.trim() || loadingJobs}
                  className={`px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all ${
                    (!jobTitle.trim() || loadingJobs) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loadingJobs ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    <FiSearch className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Section */}
        {jobs.length > 0 && (
          <div className="mb-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-xl p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <FiBriefcase className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">Jobs Found</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{totalJobs.toLocaleString()}</dd>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-xl p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-50 text-green-600">
                    <FiCheckCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Filters</dt>
                    <dd className="text-2xl font-semibold text-gray-900">2</dd>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-xl p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                    <FiMapPin className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">Location</dt>
                    <dd className="text-lg font-medium text-gray-900 truncate">{selectedCountry.name}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {searched && jobs.length === 0 && !loadingJobs && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="mt-1 text-base font-medium text-blue-600">{job.company.display_name}</p>
                    </div>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="ml-4 flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <FiMapPin className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                    <span className="font-medium">{job.location.display_name}</span>
                  </div>
                  
                  {(job.salary_min || job.salary_max) && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <FiDollarSign className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {job.salary_min && job.salary_max
                          ? `${job.salary_currency || ''} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}/year`
                          : job.salary_min
                          ? `From ${job.salary_currency || ''} ${job.salary_min.toLocaleString()}`
                          : `Up to ${job.salary_currency || ''} ${job.salary_max?.toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  
                  {job.contract_time && (
                    <div className="mt-2 flex items-center">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FiClock className="mr-1 h-3 w-3" />
                        {job.contract_time.charAt(0).toUpperCase() + job.contract_time.slice(1)}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Posted {new Date(job.created).toLocaleDateString()}
                      </span>
                      <a
                        href={job.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                      >
                        Apply Now
                        <FiArrowRight className="ml-1.5 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {totalItems > itemsPerPage && (
          <div className="mt-12 flex flex-col items-center">
            <div className="text-sm text-gray-500 mb-4">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-medium">{totalItems}</span> results
            </div>
            <nav className="flex items-center space-x-1" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* First Page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      1 === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="px-2 py-1.5 text-gray-500">...</span>
                  )}
                </>
              )}
              
              {/* Page Numbers */}
              {Array.from(
                { 
                  length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) 
                }, 
                (_, i) => {
                  let pageNum;
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= Math.ceil(totalItems / itemsPerPage) - 2) {
                    pageNum = Math.ceil(totalItems / itemsPerPage) - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= Math.ceil(totalItems / itemsPerPage)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                }
              )}
              
              {/* Last Page */}
              {currentPage < Math.ceil(totalItems / itemsPerPage) - 2 && (
                <>
                  {currentPage < Math.ceil(totalItems / itemsPerPage) - 3 && (
                    <span className="px-2 py-1.5 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => handlePageChange(Math.ceil(totalItems / itemsPerPage))}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      Math.ceil(totalItems / itemsPerPage) === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {Math.ceil(totalItems / itemsPerPage)}
                  </button>
                </>
              )}
              
              <button
                onClick={() => handlePageChange(Math.min(Math.ceil(totalItems / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
                className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </main>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                      <p className="mt-1 text-lg text-gray-600">{selectedJob.company.display_name}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        <FiMapPin className="inline mr-1" />
                        {selectedJob.location.display_name}
                      </p>
                      
                      {(selectedJob.salary_min || selectedJob.salary_max) && (
                        <p className="mt-2 text-sm text-gray-700">
                          <FiDollarSign className="inline mr-1" />
                          {selectedJob.salary_min && selectedJob.salary_max
                            ? `${selectedJob.salary_currency || ''} ${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max.toLocaleString()} per year`
                            : selectedJob.salary_min
                            ? `From ${selectedJob.salary_currency || ''} ${selectedJob.salary_min.toLocaleString()}`
                            : `Up to ${selectedJob.salary_currency || ''} ${selectedJob.salary_max?.toLocaleString()}`}
                        </p>
                      )}
                      
                      {selectedJob.contract_time && (
                        <p className="mt-1 text-sm text-gray-700">
                          <FiClock className="inline mr-1" />
                          {selectedJob.contract_time.charAt(0).toUpperCase() + selectedJob.contract_time.slice(1)}
                        </p>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedJob(null)}
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900">Job Description</h4>
                    <div 
                      className="mt-2 prose prose-sm max-w-none text-gray-500"
                      dangerouslySetInnerHTML={{ __html: selectedJob.description || 'No description available.' }}
                    />
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <a
                      href={selectedJob.redirect_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Apply on Company Site
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
