import axios from 'axios';
import {
  DashboardStats,
  Hospital,
  FullAuditDetail,
  AuditSummary,
  OutreachItem,
  Competitor,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : '/api');

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('iamonin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Dashboard
  async getDashboard(): Promise<DashboardStats> {
    const res = await apiClient.get('/dashboard');
    return res.data;
  },

  // Hospitals
  async getHospitals(): Promise<Hospital[]> {
    const res = await apiClient.get('/hospitals');
    return res.data;
  },

  async getHospital(id: string): Promise<Hospital> {
    const res = await apiClient.get(`/hospitals/${id}`);
    return res.data;
  },

  async createHospital(data: Partial<Hospital>): Promise<Hospital> {
    const res = await apiClient.post('/hospitals', data);
    return res.data;
  },

  async deleteHospital(id: string): Promise<void> {
    await apiClient.delete(`/hospitals/${id}`);
  },

  // Audits
  async startAudit(data: {
    hospitalName: string;
    websiteUrl: string;
    location: string;
    googleMapsUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    youtubeUrl?: string;
    linkedinUrl?: string;
    contactName?: string;
    contactDesignation?: string;
    contactEmail?: string;
    contactPhone?: string;
    maxPages?: number;
    maxDepth?: number;
  }): Promise<{ auditId: string; hospitalId: string; status: string }> {
    const res = await apiClient.post('/audits/start', data);
    return res.data;
  },

  async getAudit(id: string): Promise<FullAuditDetail> {
    const res = await apiClient.get(`/audits/${id}`);
    return res.data;
  },

  async reanalyzeAudit(id: string): Promise<{ auditId: string; status: string }> {
    const res = await apiClient.post(`/audits/${id}/reanalyze`);
    return res.data;
  },

  async deleteAudit(id: string): Promise<void> {
    await apiClient.delete(`/audits/${id}`);
  },

  // Reports
  async getReport(auditId: string): Promise<any> {
    const res = await apiClient.get(`/audits/${auditId}/report`);
    return res.data;
  },

  getPdfUrl(auditId: string): string {
    return `${API_BASE}/audits/${auditId}/pdf`;
  },

  getCsvUrl(auditId: string): string {
    return `${API_BASE}/audits/${auditId}/export/csv`;
  },

  getJsonUrl(auditId: string): string {
    return `${API_BASE}/audits/${auditId}/export/json`;
  },

  // Outreach
  async getOutreaches(auditId: string): Promise<OutreachItem[]> {
    const res = await apiClient.get(`/audits/${auditId}/outreaches`);
    return res.data;
  },

  async regenerateOutreach(auditId: string, contactName?: string): Promise<any> {
    const res = await apiClient.post(`/audits/${auditId}/outreaches/regenerate`, { contactName });
    return res.data;
  },

  // Competitor
  async addCompetitor(data: {
    auditId: string;
    name: string;
    websiteUrl: string;
    location?: string;
  }): Promise<Competitor> {
    const res = await apiClient.post('/competitors/analyze', data);
    return res.data;
  },

  async getCompetitors(auditId: string): Promise<Competitor[]> {
    const res = await apiClient.get(`/competitors/${auditId}`);
    return res.data;
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await apiClient.get('/settings');
    return res.data;
  },

  async addDictionaryItem(data: { category: string; keyword: string; weight?: number }): Promise<any> {
    const res = await apiClient.post('/settings/dictionary', data);
    return res.data;
  },
};
