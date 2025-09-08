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
              className="bg-white rounded-lg max-w-6xl w-full p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] flex"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>

              {/* Left Side - Job Description */}
              <div className="w-2/3 pr-6">
                <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
                <p className="text-gray-600 mb-1">
                  <strong>Company:</strong> {selectedJob.company.display_name}
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Location:</strong> {selectedJob.location.display_name}
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-line mb-4">
                  {selectedJob.description}
                </p>
                <a
                  href={selectedJob.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  View Job Posting
                </a>
              </div>

              {/* Right Side - Match Score */}
              {jobScore && (
                <div className="w-1/3">
                  <div className="w-90 flex flex-col items-start">
                    {/* Fit Score */}
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

                    {/* Reason box */}
                    <div className="bg-gray-50 p-4 border rounded text-sm text-gray-800 whitespace-pre-wrap w-full">
                      <strong>Why:</strong>
                      <p className="mt-2">{jobScore.reason}</p>
                    </div>
                  </div>
                </div>
              )}
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
