import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  Building2,
  FileText,
  Send,
  Download,
  Settings,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StatCards } from './components/dashboard/StatCards';
import { QuickAuditForm } from './components/dashboard/QuickAuditForm';
import { RecentAuditsTable } from './components/dashboard/RecentAuditsTable';
import { NewAuditModal } from './components/audit/NewAuditModal';
import { LiveCrawlProgressModal } from './components/audit/LiveCrawlProgressModal';
import { AuditDetailHeader } from './components/audit/AuditDetailHeader';
import { ScoreCardsGrid } from './components/audit/ScoreCardsGrid';
import { OverviewTab } from './components/audit/tabs/OverviewTab';
import { TechnicalSeoTab } from './components/audit/tabs/TechnicalSeoTab';
import { HealthcareStructureTab } from './components/audit/tabs/HealthcareStructureTab';
import { DoctorsTab } from './components/audit/tabs/DoctorsTab';
import { PatientJourneyTab } from './components/audit/tabs/PatientJourneyTab';
import { ContentTab } from './components/audit/tabs/ContentTab';
import { LocalSocialTab } from './components/audit/tabs/LocalSocialTab';
import { OpportunitiesTab } from './components/audit/tabs/OpportunitiesTab';
import { ReportTab } from './components/audit/tabs/ReportTab';
import { CompetitorsTab } from './components/audit/tabs/CompetitorsTab';
import { OutreachModal } from './components/outreach/OutreachModal';
import { DictionarySettings } from './components/settings/DictionarySettings';
import { api } from './services/api';
import { DashboardStats, FullAuditDetail } from './types';

export const App: React.FC = () => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'dashboard' | 'audit_detail' | 'settings'>('dashboard');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<string>('overview');

  // Data State
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<FullAuditDetail | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Modals
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);
  const [isCrawlProgressModalOpen, setIsCrawlProgressModalOpen] = useState(false);
  const [activeCrawlTarget, setActiveCrawlTarget] = useState<{ id: string; name: string; url: string } | null>(null);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [outreachTargetAudit, setOutreachTargetAudit] = useState<FullAuditDetail | null>(null);

  // Load Dashboard Data
  const loadDashboard = async () => {
    setIsLoadingDashboard(true);
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed loading dashboard:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Load Audit Detail
  const loadAuditDetail = async (auditId: string) => {
    setIsLoadingAudit(true);
    try {
      const data = await api.getAudit(auditId);
      setSelectedAudit(data);
      setSelectedAuditId(auditId);
      setCurrentView('audit_detail');
    } catch (err) {
      console.error('Failed loading audit:', err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Start Audit Handler
  const handleStartAudit = async (data: any) => {
    try {
      const result = await api.startAudit(data);
      setIsNewAuditModalOpen(false);
      setActiveCrawlTarget({
        id: result.auditId,
        name: data.hospitalName,
        url: data.websiteUrl,
      });
      setIsCrawlProgressModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start audit. Please verify the URL.');
    }
  };

  // On Crawl Complete
  const handleCrawlComplete = async () => {
    setIsCrawlProgressModalOpen(false);
    if (activeCrawlTarget) {
      await loadAuditDetail(activeCrawlTarget.id);
      loadDashboard();
    }
  };

  // Re-analyze Handler
  const handleReanalyze = async (auditId: string) => {
    try {
      const res = await api.reanalyzeAudit(auditId);
      const auditToReanalyze = dashboardData?.recentAudits.find((a) => a.id === auditId) || selectedAudit;
      setActiveCrawlTarget({
        id: auditId,
        name: auditToReanalyze?.hospital.name || 'Hospital Target',
        url: auditToReanalyze?.hospital.websiteUrl || '',
      });
      setIsCrawlProgressModalOpen(true);
    } catch (err) {
      console.error('Re-audit failed:', err);
    }
  };

  // Delete Handler
  const handleDeleteAudit = async (auditId: string) => {
    if (!confirm('Are you sure you want to delete this hospital audit?')) return;
    try {
      await api.deleteAudit(auditId);
      if (selectedAuditId === auditId) {
        setCurrentView('dashboard');
        setSelectedAuditId(null);
        setSelectedAudit(null);
      }
      loadDashboard();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Open Outreach Modal
  const handleOpenOutreach = (audit: FullAuditDetail) => {
    setOutreachTargetAudit(audit);
    setIsOutreachModalOpen(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'technical', label: 'Technical SEO (26 Checks)' },
    { id: 'healthcare', label: 'Healthcare Structure' },
    { id: 'doctors', label: 'Doctor Authority' },
    { id: 'journey', label: 'Patient Journey' },
    { id: 'content', label: 'Content & Keywords' },
    { id: 'local', label: 'Local & Social' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'report', label: 'Audit Report (12 Sec)' },
    { id: 'competitors', label: 'Competitor Gaps' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'dashboard') {
            loadDashboard();
          }
        }}
        onOpenNewAudit={() => setIsNewAuditModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Audit Hero Form */}
            <QuickAuditForm onStartAudit={handleStartAudit} />

            {/* KPI Stat Cards */}
            <StatCards stats={dashboardData?.kpis} />

            {/* Recent Audits Table */}
            <RecentAuditsTable
              audits={dashboardData?.recentAudits || []}
              onSelectAudit={loadAuditDetail}
              onOpenOutreach={handleOpenOutreach}
              onDeleteAudit={handleDeleteAudit}
              onReanalyze={handleReanalyze}
            />
          </div>
        )}

        {/* VIEW 2: HOSPITAL AUDIT DETAIL */}
        {currentView === 'audit_detail' && selectedAudit && (
          <div>
            {/* Audit Header Banner */}
            <AuditDetailHeader
              audit={selectedAudit}
              onBack={() => {
                setCurrentView('dashboard');
                loadDashboard();
              }}
              onOpenOutreach={() => handleOpenOutreach(selectedAudit)}
              onReanalyze={() => handleReanalyze(selectedAudit.id)}
            />

            {/* 8 Core Score Gauges */}
            <ScoreCardsGrid audit={selectedAudit} />

            {/* 10 Navigation Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle mb-6 overflow-hidden">
              <div className="flex items-center overflow-x-auto border-b border-slate-200 px-4 scrollbar-none">
                {tabs.map((tab) => {
                  const isActive = activeDetailTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id)}
                      className={`py-3.5 px-4 text-xs font-extrabold whitespace-nowrap border-b-2 transition-all ${
                        isActive
                          ? 'border-iamonin-orange text-iamonin-orange bg-orange-50/50'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tab Content */}
            <div>
              {activeDetailTab === 'overview' && (
                <OverviewTab
                  audit={selectedAudit}
                  onNavigateTab={(tabId) => setActiveDetailTab(tabId)}
                  onOpenOutreach={() => handleOpenOutreach(selectedAudit)}
                />
              )}

              {activeDetailTab === 'technical' && <TechnicalSeoTab audit={selectedAudit} />}

              {activeDetailTab === 'healthcare' && (
                <HealthcareStructureTab audit={selectedAudit} />
              )}

              {activeDetailTab === 'doctors' && <DoctorsTab audit={selectedAudit} />}

              {activeDetailTab === 'journey' && <PatientJourneyTab audit={selectedAudit} />}

              {activeDetailTab === 'content' && <ContentTab audit={selectedAudit} />}

              {activeDetailTab === 'local' && <LocalSocialTab audit={selectedAudit} />}

              {activeDetailTab === 'opportunities' && (
                <OpportunitiesTab audit={selectedAudit} />
              )}

              {activeDetailTab === 'report' && <ReportTab audit={selectedAudit} />}

              {activeDetailTab === 'competitors' && (
                <CompetitorsTab
                  audit={selectedAudit}
                  onRefreshAudit={() => loadAuditDetail(selectedAudit.id)}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: SETTINGS & DICTIONARIES */}
        {currentView === 'settings' && <DictionarySettings />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <NewAuditModal
        isOpen={isNewAuditModalOpen}
        onClose={() => setIsNewAuditModalOpen(false)}
        onSubmit={handleStartAudit}
      />

      {activeCrawlTarget && (
        <LiveCrawlProgressModal
          isOpen={isCrawlProgressModalOpen}
          auditId={activeCrawlTarget.id}
          hospitalName={activeCrawlTarget.name}
          websiteUrl={activeCrawlTarget.url}
          onComplete={handleCrawlComplete}
        />
      )}

      {outreachTargetAudit && (
        <OutreachModal
          isOpen={isOutreachModalOpen}
          onClose={() => setIsOutreachModalOpen(false)}
          audit={outreachTargetAudit}
        />
      )}
    </div>
  );
};
