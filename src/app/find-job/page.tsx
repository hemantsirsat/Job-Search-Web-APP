'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiArrowRight, FiFilter, FiCalendar, FiCheckCircle, FiChevronDown, FiUpload, FiTag, FiX } from 'react-icons/fi';

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
  const [jobScore, setJobScore] = useState<{ overall_score: number; skills_score: number; experience_score: number; education_score: number; industry_score: number; satisfied_reason: Array<string>;  unsatisfied_reason: Array<string>;} | null>(null);
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

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node) &&
          sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
        setShowSortDropdown(false);
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
    //   console.log(response.data);
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
      
      const parsedScore = JSON.parse(response.data.score);
      
      const scores = parsedScore.score;
      const reason = parsedScore.reason;
      
      setJobScore({
        skills_score: scores.skills,
        experience_score: scores.experience,
        education_score: scores.education,
        industry_score: scores.industry,
        overall_score: scores.overall,
        satisfied_reason: reason.satisfied,
        unsatisfied_reason: reason.missing,
      });
      
    } catch (err) {
      setError('Failed to score the selected job.');
    } finally {
      setIsScoring(false);
    }
  };  

  const handleJobSelect = async (job: Job) => {
    setSelectedJob(job);
    if (parsedCV) {
      await scoreJob(job);
    }
  };

  const handlePageChange = (page: number) => {
    searchJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadStateRef = useRef(uploadState);
  
  // Keep the ref in sync with state
  useEffect(() => {
    uploadStateRef.current = uploadState;
  }, [uploadState]);

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                <div className="relative w-full sm:w-auto" ref={countryDropdownRef}>
                  <button 
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-all w-full sm:w-auto justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCountryDropdown(!showCountryDropdown);
                      setShowSortDropdown(false);
                    }}
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

                <div className="relative w-full sm:w-auto" ref={sortDropdownRef}>
                  <button 
                    className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-lg shadow-sm hover:shadow-md transition-all w-full sm:w-auto justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSortDropdown(!showSortDropdown);
                      setShowCountryDropdown(false);
                    }}
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
                onClick={() => handleJobSelect(job)}
                className="cursor-pointer group bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
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
            <div className="min-h-screen flex items-center justify-center p-4">
              <div 
                className="fixed inset-0 bg-black/30 transition-opacity" 
                onClick={() => setSelectedJob(null)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  type: 'spring',
                  damping: 25,
                  stiffness: 300
                }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Fixed Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-600 text-white flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <h2 className="text-xl font-bold text-white line-clamp-1">{selectedJob.title}</h2>
                      <div className="mt-1 flex flex-wrap items-center text-sm text-blue-100">
                        <span className="mr-4 flex items-center">
                          <FiBriefcase className="mr-1 h-4 w-4 flex-shrink-0" />
                          <span className="truncate max-w-xs">{selectedJob.company.display_name}</span>
                        </span>
                        <span className="flex items-center">
                          <FiMapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                          <span className="truncate max-w-xs">{selectedJob.location.display_name}</span>
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedJob(null)}
                      className="text-white hover:text-blue-100 transition-colors"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Salary Information */}
                  {(selectedJob.salary_min || selectedJob.salary_max) && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FiDollarSign className="mr-2 h-4 w-4 text-blue-600" />
                        Salary
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedJob.salary_min && selectedJob.salary_max
                          ? `${selectedJob.salary_currency || ''} ${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max.toLocaleString()} per year`
                          : selectedJob.salary_min
                          ? `From ${selectedJob.salary_currency || ''} ${selectedJob.salary_min.toLocaleString()}`
                          : `Up to ${selectedJob.salary_currency || ''} ${selectedJob.salary_max?.toLocaleString()}`}
                      </p>
                    </div>
                  )}

                  {/* Job Description */}
                  <div className="prose prose-blue max-w-none mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedJob.description || 'No description available.'
                      }} 
                    />
                  </div>

                  {/* Job Details */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                          <FiCalendar className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Date Posted</p>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedJob.created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {selectedJob.contract_time && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                            <FiClock className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Job Type</p>
                            <p className="text-sm text-gray-900">
                              {selectedJob.contract_time.charAt(0).toUpperCase() + selectedJob.contract_time.slice(1)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                          <FiMapPin className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-sm text-gray-900">
                            {selectedJob.location.display_name}
                          </p>
                        </div>
                      </div>

                      {selectedJob.category?.label && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-6 w-6 text-blue-600">
                            <FiTag className="h-5 w-5" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Category</p>
                            <p className="text-sm text-gray-900">
                              {selectedJob.category.label}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CV Matching Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FiCheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                      CV Match Score
                    </h3>
                    
                    {isScoring ? (
                      <div className="space-y-4">
                        {/* Skeleton Loading State */}
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 rounded w-10 animate-pulse"></div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-gray-300 h-2.5 rounded-full animate-pulse" 
                                style={{ width: '100%' }}
                              ></div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-start">
                                <div className="h-4 w-4 bg-gray-200 rounded-full mt-1 mr-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="mt-6 p-4 bg-white rounded-lg border border-blue-100">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                          <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="flex items-start">
                                <div className="h-4 w-4 bg-gray-200 rounded-full mt-1 mr-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : jobScore ? (
                      <div className="space-y-4">
                        {/* Overall Match Score */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Overall Match</span>
                            <span className="text-sm font-semibold text-blue-700">
                              {Math.round(jobScore.overall_score)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                jobScore.overall_score >= 0.7 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                jobScore.overall_score >= 0.4 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ width: `${jobScore.overall_score}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Skills Match */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Skills Match</span>
                            <span className="text-sm font-semibold text-blue-700">
                              {Math.round(jobScore.skills_score)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                jobScore.skills_score >= 0.7 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                jobScore.skills_score >= 0.4 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ width: `${jobScore.skills_score}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Experience Level */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Experience</span>
                            <span className="text-sm font-semibold text-blue-700">
                              {Math.round(jobScore.experience_score)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                jobScore.experience_score >= 0.7 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                jobScore.experience_score >= 0.4 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ width: `${jobScore.experience_score}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Education */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">Education</span>
                            <span className="text-sm font-semibold text-blue-700">
                              {Math.round(jobScore.education_score)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                jobScore.education_score >= 0.7 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                jobScore.education_score >= 0.4 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                              style={{ width: `${jobScore.education_score}%` }}
                            ></div>
                          </div>
                        </div>
                      
                        <div className="space-y-6 mt-6">
                          {jobScore.satisfied_reason?.length > 0 && (
                            <div className="p-4 bg-white rounded-lg border border-green-50 bg-green-50/30">
                              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                                <FiCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                Your Strengths
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-1.5">
                                {jobScore.satisfied_reason.map((reason, index) => (
                                  <li key={`satisfied-${index}`} className="flex items-start">
                                    <span className="text-green-500 mr-2">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {jobScore.unsatisfied_reason?.length > 0 && (
                            <div className="p-4 bg-white rounded-lg border border-amber-50 bg-amber-50/30">
                              <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
                                <FiCheckCircle className="h-4 w-4 text-amber-500 mr-2" />
                                Areas for Improvement
                              </h4>
                              <ul className="text-sm text-gray-700 space-y-1.5">
                                {jobScore.unsatisfied_reason.map((reason, index) => (
                                  <li key={`unsatisfied-${index}`} className="flex items-start">
                                    <span className="text-amber-500 mr-2">•</span>
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-3">
                          <FiUpload className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Upload Your CV to See Match Score</h4>
                        <p className="text-sm text-gray-500 mb-4">Get personalized insights on how well your CV matches this job.</p>
                        <label className="cursor-pointer inline-block">
                          <div className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all">
                            {getUploadButtonContent()}
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.doc,.docx"
                            onChange={handleCVUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3 flex-shrink-0">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href={selectedJob.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Apply Now <FiArrowRight className="inline ml-1 h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
