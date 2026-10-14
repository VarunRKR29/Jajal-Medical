import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LoginScreen } from './components/LoginScreen.js';
import { Navbar } from './components/Navbar.js';
import { Dashboard } from './components/Dashboard.js';
import { CaseList } from './components/CaseList.js';
import { CaseFormModal } from './components/CaseFormModal.js';
import { CaseDetailsModal } from './components/CaseDetailsModal.js';
import { TestRunnerModal } from './components/TestRunnerModal.js';
import { ApiConsoleModal } from './components/ApiConsoleModal.js';
import { DocsModal } from './components/DocsModal.js';
import { MedicalCase, PaginationMeta, CaseStats, SearchField } from './types.js';
import { api } from './services/api.js';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const DEFAULT_PAGINATION: PaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
  from: 0,
  to: 0,
};

const DEFAULT_STATS: CaseStats = {
  total: 0,
  draft: 0,
  planning: 0,
  in_review: 0,
  approved: 0,
  completed: 0,
  cancelled: 0,
};

function MainApp() {
  const { user, isLoading: isAuthLoading } = useAuth();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'cases'>('dashboard');

  // Cases state
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [stats, setStats] = useState<CaseStats>(DEFAULT_STATS);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [surgeonFilter, setSurgeonFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<MedicalCase | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<MedicalCase | null>(null);
  const [confirmDeleteOnOpen, setConfirmDeleteOnOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isApiConsoleOpen, setIsApiConsoleOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch cases from backend API
  const fetchCases = useCallback(async () => {
    if (!user) return;
    setIsLoadingCases(true);
    try {
      const res = await api.getCases({
        page,
        per_page: 10,
        search,
        search_field: searchField,
        status: statusFilter,
        priority: priorityFilter,
        surgeon: surgeonFilter,
        sort_by: sortBy,
        sort_direction: sortDirection,
      });

      if (res.success && res.data) {
        setCases(res.data.cases);
        setPagination(res.data.pagination);
        setStats(res.data.stats);
      }
    } catch (err: unknown) {
      console.error('Failed to load cases', err);
    } finally {
      setIsLoadingCases(false);
    }
  }, [user, page, search, searchField, statusFilter, priorityFilter, surgeonFilter, sortBy, sortDirection]);

  useEffect(() => {
    if (user) {
      fetchCases();
    }
  }, [user, fetchCases]);

  // Handlers
  const handleOpenNewCase = () => {
    setCaseToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditCase = (c: MedicalCase) => {
    setCaseToEdit(c);
    setIsFormOpen(true);
  };

  const handleOpenViewCase = (c: MedicalCase) => {
    setSelectedCase(c);
    setConfirmDeleteOnOpen(false);
    setIsDetailsOpen(true);
  };

  const handleOpenDeleteCase = (c: MedicalCase) => {
    setSelectedCase(c);
    setConfirmDeleteOnOpen(true);
    setIsDetailsOpen(true);
  };

  const handleCaseSaved = (savedCase: MedicalCase) => {
    showToast(
      caseToEdit
        ? `Case ${savedCase.case_number} updated successfully.`
        : `Case ${savedCase.case_number} created successfully.`
    );
    fetchCases();
  };

  const handleDeleteSuccess = (deletedId: number) => {
    showToast('Case successfully deleted.', 'success');
    fetchCases();
  };

  const handleStatusUpdated = (updated: MedicalCase) => {
    setSelectedCase(updated);
    showToast(`Case status transitioned to ${updated.status}.`);
    fetchCases();
  };

  const handleResetDb = async () => {
    if (!confirm('Reset database back to the original 24 seed cases and default accounts?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetDatabase();
      showToast('Database reset to fresh 24 seed cases.');
      await fetchCases();
    } catch {
      showToast('Failed to reset database.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleFilterFromDashboard = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    setCurrentTab('cases');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Initializing MedCase Portal...
          </span>
        </div>
      </div>
    );
  }

  // Hide all case pages from users who are not logged in
  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-medium text-white animate-bounce">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenApiConsole={() => setIsApiConsoleOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onResetDb={handleResetDb}
        isResetting={isResetting}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onNewCase={handleOpenNewCase}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' ? (
          <Dashboard
            stats={stats}
            recentCases={cases}
            onSelectCase={handleOpenViewCase}
            onFilterStatus={handleFilterFromDashboard}
            onNewCase={handleOpenNewCase}
          />
        ) : (
          <CaseList
            cases={cases}
            pagination={pagination}
            search={search}
            setSearch={setSearch}
            searchField={searchField}
            setSearchField={setSearchField}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            surgeonFilter={surgeonFilter}
            setSurgeonFilter={setSurgeonFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            page={page}
            setPage={setPage}
            isLoading={isLoadingCases}
            onViewCase={handleOpenViewCase}
            onEditCase={handleOpenEditCase}
            onDeleteCase={handleOpenDeleteCase}
            onNewCase={handleOpenNewCase}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          &copy; 2026 Jajal Medical &bull; MedCase Implant Management System &bull; Software Developer Intern Practical Assignment
        </p>
      </footer>

      {/* Modals */}
      <CaseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        caseToEdit={caseToEdit}
        onSuccess={handleCaseSaved}
      />

      <CaseDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        caseItem={selectedCase}
        onEdit={handleOpenEditCase}
        onDeleteSuccess={handleDeleteSuccess}
        onStatusUpdated={handleStatusUpdated}
        initialConfirmDelete={confirmDeleteOnOpen}
      />

      <TestRunnerModal
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
      />

      <ApiConsoleModal
        isOpen={isApiConsoleOpen}
        onClose={() => setIsApiConsoleOpen(false)}
      />

      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
