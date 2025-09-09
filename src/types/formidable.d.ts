import { IncomingForm } from 'formidable';

declare module 'formidable' {
  export interface File {
    size: number;
    filepath: string;
    originalFilename: string | null;
    newFilename: string | null;
    mimetype: string | null;
    mtime?: Date;
  }

  export interface Fields {
    [key: string]: string | string[] | undefined;
  }

  export interface Files {
    [key: string]: File | File[] | undefined;
  }
}
