import type { NextApiRequest, NextApiResponse } from 'next';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import fetch from 'node-fetch';
import { URL } from 'url';
import { LambdaApiResponse } from "../../app/types";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cv_text } = req.body;

  if (!cv_text) {
    return res.status(400).json({ error: 'cv_text is required' });
  }

  try {
    const apiUrl = 'https://kehys4vl78.execute-api.eu-central-1.amazonaws.com/development-env';
    const parsedUrl = new URL(apiUrl);

    const credentials = defaultProvider();
    const signer = new SignatureV4({
      credentials,
      region: 'eu-central-1',
      service: 'execute-api',
      sha256: Sha256,
    });

    const body = JSON.stringify({ cv_text });

    const signedRequest = await signer.sign({
      method: 'POST',
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    const lambdaResponse = await fetch(apiUrl, {
      method: signedRequest.method,
      headers: signedRequest.headers,
      body: signedRequest.body,
    });

    const lambdaData = await lambdaResponse.json() as LambdaApiResponse;
    const parsedBody =
      typeof lambdaData.body === 'string'
        ? JSON.parse(lambdaData.body)
        : lambdaData.body;

    return res.status(200).json({
      message: 'Parsed CV data',
      parsed_cv: parsedBody.parsed_cv,
    });
  } catch (error: unknown) {
    console.error('Lambda call failed:', error);
    return res.status(500).json({ error: 'Lambda call failed' });
  }
}