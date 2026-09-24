import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import {
  createHospital,
  getHospitals,
  getHospitalById,
  deleteHospital,
} from '../controllers/hospitalController.js';
import {
  startAudit,
  getAuditById,
  getAuditProgressStream,
  reanalyzeAudit,
  deleteAudit,
} from '../controllers/auditController.js';
import { getReport, downloadPdf } from '../controllers/reportController.js';
import { getOutreaches, regenerateOutreach } from '../controllers/outreachController.js';
import { addAndAnalyzeCompetitor, getCompetitors } from '../controllers/competitorController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { getSettings, addCustomDictionaryItem } from '../controllers/settingsController.js';
import { exportAuditCsv, exportAuditJson } from '../controllers/exportController.js';
import { authMiddleware } from '../middleware/auth.js';

export const apiRouter = Router();

// Auth Routes
apiRouter.post('/auth/login', login);
apiRouter.get('/auth/me', authMiddleware, getMe);

// Dashboard
apiRouter.get('/dashboard', authMiddleware, getDashboardStats);

// Hospitals
apiRouter.post('/hospitals', authMiddleware, createHospital);
apiRouter.get('/hospitals', authMiddleware, getHospitals);
apiRouter.get('/hospitals/:id', authMiddleware, getHospitalById);
apiRouter.delete('/hospitals/:id', authMiddleware, deleteHospital);

// Audits
apiRouter.post('/audits/start', authMiddleware, startAudit);
apiRouter.get('/audits/:id', authMiddleware, getAuditById);
apiRouter.get('/audits/:id/progress', getAuditProgressStream); // SSE stream open
apiRouter.post('/audits/:id/reanalyze', authMiddleware, reanalyzeAudit);
apiRouter.delete('/audits/:id', authMiddleware, deleteAudit);

// Reports & Exports
apiRouter.get('/audits/:id/report', authMiddleware, getReport);
apiRouter.get('/audits/:id/pdf', downloadPdf);
apiRouter.get('/audits/:id/export/csv', exportAuditCsv);
apiRouter.get('/audits/:id/export/json', exportAuditJson);

// Outreach
apiRouter.get('/audits/:auditId/outreaches', authMiddleware, getOutreaches);
apiRouter.post('/audits/:auditId/outreaches/regenerate', authMiddleware, regenerateOutreach);

// Competitor Analysis
apiRouter.post('/competitors/analyze', authMiddleware, addAndAnalyzeCompetitor);
apiRouter.get('/competitors/:auditId', authMiddleware, getCompetitors);

// Settings & Healthcare Dictionaries
apiRouter.get('/settings', authMiddleware, getSettings);
apiRouter.post('/settings/dictionary', authMiddleware, addCustomDictionaryItem);
