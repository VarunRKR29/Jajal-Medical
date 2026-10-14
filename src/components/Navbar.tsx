import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Activity,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  FileText,
  Terminal,
  RotateCcw,
  UserCheck,
  Menu,
  X,
  Plus,
  LayoutDashboard,
  FolderKanban,
} from 'lucide-react';

interface NavbarProps {
  onOpenTestRunner: () => void;
  onOpenApiConsole: () => void;
  onOpenDocs: () => void;
  onResetDb: () => void;
  isResetting: boolean;
  currentTab: 'dashboard' | 'cases';
  setCurrentTab: (tab: 'dashboard' | 'cases') => void;
  onNewCase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTestRunner,
  onOpenApiConsole,
  onOpenDocs,
  onResetDb,
  isResetting,
  currentTab,
  setCurrentTab,
  onNewCase,
}) => {
  const { user, logout, switchRoleQuick, canCreate, isAdmin, isViewer, isEngineer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSwitch = (tab: 'dashboard' | 'cases') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Desktop Nav */}
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div
                className="flex items-center space-x-2.5 cursor-pointer select-none"
                onClick={() => handleTabSwitch('dashboard')}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-base sm:text-lg tracking-tight text-white">MedCase</span>
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800 px-1 py-0.2 rounded">
                      Jajal
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 leading-none hidden xs:block">
                    Implant Tracking
                  </p>
                </div>
              </div>

              {/* Desktop Nav Tabs */}
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
                <button
                  onClick={() => handleTabSwitch('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === 'dashboard'
                      ? 'bg-slate-800 text-cyan-400 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => handleTabSwitch('cases')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentTab === 'cases'
                      ? 'bg-slate-800 text-cyan-400 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Case Directory</span>
                </button>
              </nav>
            </div>

            {/* Center: Create Case Button (desktop/tablet) */}
            <div className="hidden sm:flex items-center space-x-2">
              {canCreate && (
                <button
                  onClick={onNewCase}
                  className="bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm shadow-cyan-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>New Implant Case</span>
                </button>
              )}
            </div>

            {/* Reviewer Tools & Role Switcher */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Quick Role Switcher for Desktop */}
              <div className="hidden xl:flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700/60 text-xs">
                <span className="text-slate-400 px-2 text-[11px] font-medium flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Test As:
                </span>
                <button
                  onClick={() => switchRoleQuick('admin')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isAdmin ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Switch to Admin (Full CRUD)"
                >
                  Admin
                </button>
                <button
                  onClick={() => switchRoleQuick('viewer')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isViewer ? 'bg-amber-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Switch to Viewer (Read-only)"
                >
                  Viewer
                </button>
                <button
                  onClick={() => switchRoleQuick('engineer')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isEngineer ? 'bg-purple-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Switch to Engineer (Create/Edit, No Delete)"
                >
                  Engineer
                </button>
              </div>

              {/* Action Buttons (Desktop/Tablet) */}
              <button
                onClick={onOpenTestRunner}
                className="hidden lg:flex items-center space-x-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                title="Run Automated PHPUnit / Feature Tests"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="inline">Test Suite</span>
              </button>

              <button
                onClick={onOpenApiConsole}
                className="hidden lg:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                title="Test REST API & Postman Collection"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="inline">REST API</span>
              </button>

              <button
                onClick={onOpenDocs}
                className="hidden lg:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                title="View Documentation & Architecture"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
                <span className="inline">Docs</span>
              </button>

              {/* Reset Seed Data */}
              <button
                onClick={onResetDb}
                disabled={isResetting}
                className="hidden md:flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs p-1.5 rounded-lg transition-all cursor-pointer"
                title="Reset Database to 24 seed cases"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
              </button>

              {/* User Role Indicator & Logout (Desktop) */}
              <div className="hidden sm:flex items-center pl-2 border-l border-slate-800 space-x-2">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                    {user?.name || 'User'}
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    {isAdmin && (
                      <span className="inline-flex items-center text-[10px] text-cyan-400 font-medium">
                        <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Admin
                      </span>
                    )}
                    {isViewer && (
                      <span className="inline-flex items-center text-[10px] text-amber-400 font-medium">
                        <ShieldAlert className="w-2.5 h-2.5 mr-0.5" /> Viewer
                      </span>
                    )}
                    {isEngineer && (
                      <span className="inline-flex items-center text-[10px] text-purple-400 font-medium">
                        <Wrench className="w-2.5 h-2.5 mr-0.5" /> Engineer
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Menu Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-4 py-4 space-y-4 animate-fadeIn">
            {/* Current User Info on Mobile */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                  {user?.name.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{user?.name}</div>
                  <div className="text-[10px] text-slate-400">{user?.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-900">
                  {user?.role}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 hover:bg-rose-900 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mobile Primary Navigation Tabs */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTabSwitch('dashboard')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleTabSwitch('cases')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  currentTab === 'cases'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                <span>Case Directory</span>
              </button>
            </div>

            {/* Mobile Create Case Button */}
            {canCreate && (
              <button
                onClick={() => {
                  onNewCase();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Implant Case</span>
              </button>
            )}

            {/* Mobile Quick Role Switcher */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test As Role:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => switchRoleQuick('admin')}
                  className={`p-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                    isAdmin
                      ? 'bg-cyan-600 text-white border-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Admin
                </button>
                <button
                  onClick={() => switchRoleQuick('viewer')}
                  className={`p-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                    isViewer
                      ? 'bg-amber-600 text-white border-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Viewer
                </button>
                <button
                  onClick={() => switchRoleQuick('engineer')}
                  className={`p-2 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                    isEngineer
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Engineer
                </button>
              </div>
            </div>

            {/* Mobile Tools & Docs */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => {
                  onOpenTestRunner();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Test Suite</span>
              </button>

              <button
                onClick={() => {
                  onOpenApiConsole();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>REST API</span>
              </button>

              <button
                onClick={() => {
                  onOpenDocs();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Docs / Specs</span>
              </button>

              <button
                onClick={() => {
                  onResetDb();
                  setMobileMenuOpen(false);
                }}
                disabled={isResetting}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Reset 24 Cases</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Floating Bottom Action Bar for Mobile Phones (quick 1-tap thumb navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleTabSwitch('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            currentTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        {canCreate && (
          <button
            onClick={onNewCase}
            className="flex items-center justify-center w-11 h-11 -mt-4 rounded-full bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 active:scale-95 transition-all cursor-pointer"
            aria-label="Create Case"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}

        <button
          onClick={() => handleTabSwitch('cases')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            currentTab === 'cases' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderKanban className="w-5 h-5 mb-0.5" />
          <span>Cases</span>
        </button>
      </div>
    </>
  );
};
