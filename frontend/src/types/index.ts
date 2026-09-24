export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SALES';
}

export interface HospitalContact {
  id: string;
  hospitalId: string;
  name: string;
  designation?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
}

export interface Hospital {
  id: string;
  name: string;
  websiteUrl: string;
  location: string;
  googleMapsUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  createdAt: string;
  updatedAt: string;
  contacts?: HospitalContact[];
  audits?: AuditSummary[];
}

export interface DimensionScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL_GAPS';
  components?: Array<{
    name: string;
    weight: number;
    score: number;
    maxScore: number;
    reason: string;
  }>;
}

export interface ComprehensiveScores {
  overallOpportunity: 'HIGH' | 'MEDIUM' | 'LOW';
  overallOpportunityScore: number;
  technicalHealth: DimensionScore;
  seoReadiness: DimensionScore;
  healthcareContent: DimensionScore;
  doctorAuthority: DimensionScore;
  patientJourney: DimensionScore;
  conversionReadiness: DimensionScore;
  localPresence: DimensionScore;
  contentOpportunity: DimensionScore;
}

export interface TechnicalFinding {
  id: string;
  auditId: string;
  checkId: string;
  name: string;
  category: 'Technical' | 'SEO' | 'Security' | 'Performance' | 'Mobile';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  evidence: string;
  affectedUrlsJson?: string;
  explanation: string;
  recommendation: string;
  createdAt: string;
}

export interface HealthcareFinding {
  id: string;
  auditId: string;
  category: string;
  title: string;
  status: 'DETECTED' | 'PARTIAL' | 'NOT_DETECTED' | 'DISCOVERY_REQUIRED';
  evidence: string;
  detailsJson?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  auditId: string;
  name: string;
  specialty?: string;
  qualifications?: string;
  experienceYears?: number;
  profileUrl?: string;
  photoUrl?: string;
  hasAppointmentCta: boolean;
  hasDedicatedPage: boolean;
  contentWordCount: number;
  hasSchema: boolean;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  auditId: string;
  title: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  effort: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string;
  whyItMatters: string;
  recommendedAction: string;
  iamoninModule: string;
  isTop5: boolean;
  createdAt: string;
}

export interface Competitor {
  id: string;
  auditId: string;
  name: string;
  websiteUrl: string;
  location?: string;
  scoresJson?: string;
  comparisonGapsJson?: string;
  createdAt: string;
}

export interface OutreachItem {
  id: string;
  auditId: string;
  channel: 'EMAIL' | 'LINKEDIN' | 'WHATSAPP' | 'CALL_SCRIPT';
  subject?: string;
  content: string;
  keyFindingsUsedJson?: string;
  createdAt: string;
}

export interface AuditSummary {
  id: string;
  hospitalId: string;
  status: 'PENDING' | 'CRAWLING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  pagesCrawled: number;
  totalPagesDiscovered: number;
  overallOpportunity: 'HIGH' | 'MEDIUM' | 'LOW';
  technicalHealthScore: number;
  seoReadinessScore: number;
  healthcareContentScore: number;
  doctorAuthorityScore: number;
  patientJourneyScore: number;
  conversionReadinessScore: number;
  localPresenceScore: number;
  contentOpportunityScore: number;
  scoresJson?: string;
  executiveSummary?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  hospital: Hospital;
  opportunities?: Opportunity[];
}

export interface FullAuditDetail extends AuditSummary {
  technicalFindings: TechnicalFinding[];
  healthcareFindings: HealthcareFinding[];
  doctors: Doctor[];
  opportunities: Opportunity[];
  outreaches: OutreachItem[];
  competitors: Competitor[];
  report?: {
    id: string;
    reportDataJson: string;
    pdfPath?: string;
  };
  pages?: Array<{
    url: string;
    finalUrl?: string;
    statusCode: number;
    depth: number;
    title?: string;
    wordCount: number;
    imagesCount: number;
    isDoctorPage: boolean;
    isSpecialtyPage: boolean;
    hasAppointmentCta: boolean;
  }>;
}

export interface DashboardStats {
  kpis: {
    totalHospitals: number;
    totalAudits: number;
    completedAudits: number;
    inProgressAudits: number;
    highOpportunityCount: number;
    mediumOpportunityCount: number;
    reportsCount: number;
    outreachCount: number;
  };
  recentAudits: FullAuditDetail[];
}

export interface CrawlProgressEvent {
  step: string;
  message: string;
  pagesCrawled: number;
  totalPagesDiscovered: number;
  currentUrl?: string;
  progressPercent: number;
}
