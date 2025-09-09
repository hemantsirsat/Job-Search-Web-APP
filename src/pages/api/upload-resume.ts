import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { uploadPdfToS3 } from '@/lib/s3Upload';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import fetch from 'node-fetch';
import { URL } from 'url';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing failed' });

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : (files.file as File | undefined);

    if (!uploadedFile || !uploadedFile.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = fs.readFileSync(uploadedFile.filepath);

    try {
      const fileName = uploadedFile.originalFilename || 'resume.pdf';

      const { bucket, key, url } = await uploadPdfToS3(buffer, fileName);
      console.log('Bucket', bucket, key, url);

      const apiUrl = 'https://ryqg4jgfxk.execute-api.eu-central-1.amazonaws.com/development-env';
      const parsedUrl = new URL(apiUrl);

      const credentials = defaultProvider();
      const signer = new SignatureV4({
        credentials,
        region: 'eu-central-1',
        service: 'execute-api',
        sha256: Sha256,
      });

      const body = JSON.stringify({ bucket, key });

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

      const lambdaData = (await lambdaResponse.json()) as { body: unknown };

      const parsedBody =
        typeof lambdaData.body === 'string'
          ? JSON.parse(lambdaData.body)
          : lambdaData.body;

      return res.status(200).json({
        message: 'Upload succeeded',
        key,
        bucket,
        url,
        cv_text: parsedBody.cv_text,
      });
    } catch (_error) {
      return res.status(500).json({ error: 'Upload or Lambda call failed' });
    }
  });
}