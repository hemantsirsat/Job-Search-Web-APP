import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { jobTitle } = req.query;
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  if (!APP_ID || !APP_KEY) {
    return res.status(500).json({ error: 'API credentials not set' });
  }

  try {
    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/de/search/1', {
      params: {
        app_id: APP_ID,
        app_key: APP_KEY,
        what: jobTitle,
        results_per_page: 100,
        max_days_old:1,
      },
    });
    res.status(200).json(response.data);
  } catch (_error: unknown) {
    if (_error.response) {
      console.error('Adzuna API response error:', _error.response.data);
      res.status(_error.response.status).json(_error.response.data);
    } else {
      console.error('Adzuna API error:', _error.message);
      res.status(500).json({ _error: _error.message });
    }
  }
}
