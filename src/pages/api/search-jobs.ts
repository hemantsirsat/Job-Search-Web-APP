import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

interface AdzunaSearchParams {
  what: string;
  where?: string;
  results_per_page: number;
  max_days_old?: number;
  page?: number;
  [key: string]: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobTitle, countryCode = 'de', page = 1, jobPerPage = 15 } = req.query;
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    return res.status(500).json({ error: 'API credentials not set' });
  }

  // Validate country code
  const validCountryCodes = ['de', 'us', 'gb', 'fr', 'es', 'it', 'nl', 'at', 'ch'];
  const country = validCountryCodes.includes(countryCode as string) 
    ? countryCode 
    : 'de';

  try {
    const pageNum = Number(page) || 1;
    const resultsPerPage = Number(jobPerPage) || 10;
    
    const params: AdzunaSearchParams = {
      app_id: APP_ID,
      app_key: APP_KEY,
      what: jobTitle as string,
      results_per_page: resultsPerPage,
      max_days_old: 7,
      sort_by: 'date',
    };


    // First, get the total count
    const countResponse = await axios.get(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`, {
      params: {
        ...params,
        results_per_page: 1 // Just need the count
      },
      paramsSerializer: (p) => {
        return Object.entries(p)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join('&');
      },
    });

    const totalCount = countResponse.data?.count || 0;
    const totalPages = Math.ceil(totalCount / resultsPerPage);

    // Then get the actual results for the requested page
    const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/${country}/search/${pageNum}`, {
      params: {
        ...params,
        results_per_page: resultsPerPage
      },
      paramsSerializer: (p) => {
        return Object.entries(p)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
          .join('&');
      },
    });

    return res.status(200).json({
      results: response.data?.results || [],
      count: totalCount,
      currentPage: pageNum,
      totalPages: totalPages,
      hasMore: pageNum < totalPages
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch jobs from Adzuna',
      details: error.response?.data || error.message,
    });
  }
}
