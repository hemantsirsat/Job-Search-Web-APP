'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Job } from './types';

export default function JobSearchApp() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 15; // Number of jobs to show per page
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingCV, setLoadingCV] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [parsedCV, setParsedCV] = useState<any | null>(null);
  const [jobScore, setJobScore] = useState<{ score: number; reason: string } | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  const handleSearch = async () => {
    if (!jobTitle.trim()) return;
    setLoadingJobs(true);
    setError(null);
    setSearched(true);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const response = await axios.get('/api/search-jobs', {
        params: { jobTitle },
      });
      setJobs(response.data.results || []);
    } catch (_err) {
      setError('Failed to fetch jobs.');
    } finally {
      setLoadingJobs(false);
    }
  };
  
  // Get current jobs for the current page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPageButtons = 5; // Maximum number of page buttons to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
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
      const job_score_response = await axios.post('/api/score-job', {
        jobs:[job],
        cv: parsedCV,
      });

      const parsed_score = typeof job_score_response.data === 'string' ? JSON.parse(job_score_response.data) : job_score_response.data;
      const score_reason = typeof parsed_score.score === 'string' ? JSON.parse(parsed_score.score) : parsed_score.score;
      setJobScore({
        score: score_reason.score,
        reason: score_reason.reason
      });
    } catch (_err) {
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
      setError(null);

      const response = await axios.post('/api/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { cv_text } = response.data;
      
      setLoadingCV(true)

      const parseResponse = await axios.post('/api/parse-cv', { cv_text });
      const { parsed_cv} = parseResponse.data;
      setParsedCV(parsed_cv);

    } catch (_err) {
      setError('Failed to upload resume or invoke processing.');
    } finally {
      // setLoadingCV(false);
    }
  };

  const getLabel = () => {
    if (!loadingCV) return 'Upload CV';
    if (loadingCV && parsedCV === null) return 'Parsing CV...';
    if (parsedCV) return 'CV Uploaded';
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Search Jobs in Germany</h1>
        <div className="flex gap-2 mb-8 justify-center items-center">
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-1/2"
            placeholder="Enter job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <button
            onClick={handleSearch}
            disabled={loadingJobs}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          >
            {loadingJobs ? 'Searching...' : 'Search'}
          </button>
          
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleUpload(e)}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
          >
            {getLabel()}

          </label>
        </div>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {!loadingJobs && searched && jobs.length === 0 && !error && (
          <p className="text-center text-gray-500">No jobs found for "{jobTitle}".</p>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentJobs.map((job: Job) => (
            <div
              key={job.id}
              onClick={async () => {
                setSelectedJob(job);
                await scoreJob(job); 
              }}

              className="bg-gray-100 rounded p-4 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              <h2 className="text-lg font-semibold mb-1">{job.title}</h2>
              <p className="text-sm text-gray-600">{job.company.display_name}</p>
              <p className="text-sm text-gray-500 mb-2">{job.location.display_name}</p>
              <p className="text-sm mb-2">{job.description.slice(0, 150)}...</p>
              <span className="text-blue-600 underline text-sm">Click to view more</span>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        {jobs.length > jobsPerPage && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              «
            </button>
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              ‹
            </button>
            
            {startPage > 1 && (
              <span className="px-3 py-1">...</span>
            )}
            
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === number 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {number}
              </button>
            ))}
            
            {endPage < totalPages && (
              <span className="px-3 py-1">...</span>
            )}
            
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              ›
            </button>
            <button
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
            >
              »
            </button>
            
            <div className="flex items-center ml-4 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>

      {/* AnimatePresence + Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg max-w-6xl w-full p-0 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] mx-4 my-8"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedJob.title}</h2>
                    <p className="text-blue-100">{selectedJob.company.display_name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-white hover:text-gray-200 text-2xl font-bold"
                  >
                    &times;
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedJob.location.display_name}
                  </div>
                  {selectedJob.salary_min && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {selectedJob.salary_min.toLocaleString()} {selectedJob.salary_currency || 'EUR'}
                      {selectedJob.salary_max && ` - ${selectedJob.salary_max.toLocaleString()} ${selectedJob.salary_currency || 'EUR'}`}
                    </div>
                  )}
                  <a
                    href={selectedJob.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
              {/* Content area with scroll */}
              <div className="flex flex-1 overflow-hidden flex-col md:flex-row h-[calc(100%-180px)]">
                {/* Left Side - Job Description */}
                <div className="w-full md:w-2/3 p-4 md:p-6 overflow-y-auto">
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Description</h3>
                    <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                      {selectedJob.description}
                    </div>
                    
                    {selectedJob.contract_time && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Job Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Contract Type</p>
                            <p className="font-medium">{selectedJob.contract_time}</p>
                          </div>
                          {selectedJob.category && (
                            <div>
                              <p className="text-gray-500">Category</p>
                              <p className="font-medium">{selectedJob.category.label}</p>
                            </div>
                          )}
                          {selectedJob.created && (
                            <div>
                              <p className="text-gray-500">Posted</p>
                              <p className="font-medium">{new Date(selectedJob.created).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side - Match Score */}
              <div className="w-full md:w-1/3 p-4 md:p-6 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto overflow-x-hidden h-full">
                <div className="w-full flex flex-col h-full">
                  {isScoring ? (
                    // Skeleton loading state
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-2 w-full">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : jobScore ? (
                    // Actual score content
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800">Fit Score:</h3>
                        <span
                          className="text-white px-3 py-1 rounded-full text-sm font-bold shadow"
                          style={{
                            backgroundColor: `hsl(120, 70%, ${100 - jobScore.score / 2}%)`,
                          }}
                        >
                          {jobScore.score}/100
                        </span>
                      </div>
                      <div className="bg-white p-4 border rounded text-sm text-gray-800 whitespace-pre-wrap w-full break-words">
                        <strong>Why:</strong>
                        <p className="mt-2">{jobScore.reason}</p>
                      </div>
                    </>
                  ) : (
                    // Empty state when no CV is uploaded
                    <div className="text-center w-full text-gray-500 p-4 h-full flex items-center justify-center">
                      <p>Upload your CV to see your match score</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-gray-100 text-gray-600 text-center text-sm py-4 border-t mt-8">
        Jobs are fetched from the Adzuna API. We do not take responsibility for any inaccurate or misleading information.
      </footer>
    </div>
  );
}
