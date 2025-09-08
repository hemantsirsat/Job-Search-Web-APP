interface JobLocation {
  area: string[];           // e.g. ["Deutschland","Bayern","Coburg (Kreis)","Coburg"]
  display_name: string;     // e.g. "Coburg, Coburg (Kreis)"
  __CLASS__: string;        // e.g. "Adzuna::API::Response::Location"
}

interface JobCompany {
  __CLASS__: string;        // e.g. "Adzuna::API::Response::Company"
  display_name: string;     // e.g. "HUK-COBURG Versicherungsgruppe"
}

interface JobCategory {
  tag: string;              // e.g. "scientific-qa-jobs"
  __CLASS__: string;        // e.g. "Adzuna::API::Response::Category"
  label: string;            // e.g. "Stellen aus Wissenschaft & Qualitätssicherung"
}

interface score {
    score: string;
    reason: string;
}

export interface Job {
  redirect_url: string;
  title: string;
  longitude: number;
  latitude: number;
  adref: string;
  location: JobLocation;
  company: JobCompany;
  description: string;
  created: string;             // ISO date string
  salary_is_predicted: string; // "0" or "1" (string)
  id: string;
  category: JobCategory;
  __CLASS__: string;
}

interface ScoredJob {
  redirect_url: string;
  title: string;
  longitude: number;
  latitude: number;
  adref: string;
  location: JobLocation;
  company: JobCompany;
  description: string;
  created: string;             // ISO date string
  salary_is_predicted: string; // "0" or "1" (string)
  id: string;
  category: JobCategory;
  __CLASS__: string;
  score: score
}

export interface ScoredJobBody {
    body: ScoredJob;
    message: string;
}

interface Education {
  degree: string;
  institution: string;
}

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
}

interface ParsedCV {
  "Full Name": string;
  Email: string;
  Skills: string;
  Education: Education[];
  "Work Experience": WorkExperience[];
}

export interface LambdaApiResponse {
  body: string; // always a string in your case
}
