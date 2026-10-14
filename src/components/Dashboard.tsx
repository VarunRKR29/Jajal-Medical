import React from 'react';
import { CaseStats, MedicalCase } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import {
  FileStack,
  Clock,
  Eye,
  CheckCircle,
  Award,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Plus,
  Building,
} from 'lucide-react';

interface DashboardProps {
  stats: CaseStats;
  recentCases: MedicalCase[];
  onSelectCase: (caseItem: MedicalCase) => void;
  onFilterStatus: (status: string) => void;
  onNewCase: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  recentCases,
  onSelectCase,
  onFilterStatus,
  onNewCase,
}) => {
  const { canCreate, user } = useAuth();

  // Upcoming surgeries (cases with valid future surgery dates)
  const upcomingSurgeries = recentCases
    .filter((c) => c.surgery_date && c.status !== 'Completed' && c.status !== 'Cancelled')
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-950/80 text-emerald-400 border border-emerald-800';
      case 'In Review':
        return 'bg-sky-950/80 text-sky-400 border border-sky-800';
      case 'Planning':
        return 'bg-amber-950/80 text-amber-400 border border-amber-800';
      case 'Completed':
        return 'bg-indigo-950/80 text-indigo-400 border border-indigo-800';
      case 'Cancelled':
        return 'bg-rose-950/80 text-rose-400 border border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border border-slate-700';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-950/80 text-rose-300 border border-rose-800 font-semibold';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border border-amber-800';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-14 md:pb-0">
      {/* Welcome Clinical Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live Clinical Workflow
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
            Medical Implant Case Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time tracking of patient-specific custom implant designs, surgical scheduling, and multi-disciplinary approval stages.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={onNewCase}
            className="self-stretch sm:self-start md:self-center flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Case</span>
          </button>
        )}
      </div>

      {/* Core Counts Grid (Required 5 counts - fully responsive layout) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Required Metric Counts
          </h2>
          <span className="text-[11px] text-slate-500">Tap card to filter list</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Cases - Spans 2 cols on mobile for balanced grid */}
          <div
            onClick={() => onFilterStatus('All')}
            className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Cases</span>
              <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-cyan-950 group-hover:text-cyan-400 transition-colors">
                <FileStack className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.total}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">All Records</span>
            </div>
          </div>

          {/* Planning */}
          <div
            onClick={() => onFilterStatus('Planning')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-700/60 p-4 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-400">Planning</span>
              <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 group-hover:bg-amber-900 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.planning}
              </span>
              <span className="text-[10px] text-amber-500/80 font-medium">CAD / FEA</span>
            </div>
          </div>

          {/* In Review */}
          <div
            onClick={() => onFilterStatus('In Review')}
            className="bg-slate-900/90 border border-slate-800 hover:border-sky-700/60 p-4 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sky-400">In Review</span>
              <div className="p-2 rounded-lg bg-sky-950/60 text-sky-400 group-hover:bg-sky-900 transition-colors">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.in_review}
              </span>
              <span className="text-[10px] text-sky-500/80 font-medium">Surgeon Sign-off</span>
            </div>
          </div>

          {/* Approved */}
          <div
            onClick={() => onFilterStatus('Approved')}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-700/60 p-4 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400">Approved</span>
              <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 group-hover:bg-emerald-900 transition-colors">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.approved}
              </span>
              <span className="text-[10px] text-emerald-500/80 font-medium">Ready for OR</span>
            </div>
          </div>

          {/* Completed */}
          <div
            onClick={() => onFilterStatus('Completed')}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-700/60 p-4 rounded-xl transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-indigo-400">Completed</span>
              <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 group-hover:bg-indigo-900 transition-colors">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.completed}
              </span>
              <span className="text-[10px] text-indigo-500/80 font-medium">Implanted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Surgeries & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Surgical Schedule */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Upcoming Surgical Dates</h3>
            </div>
            <button
              onClick={() => onFilterStatus('All')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              View Directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {upcomingSurgeries.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No upcoming surgeries scheduled.</p>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {upcomingSurgeries.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-800/40 px-2 rounded-lg transition-colors cursor-pointer group gap-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-slate-800 border border-slate-700 text-slate-200 text-center px-2 py-1 rounded-md min-w-[50px] shrink-0">
                      <div className="text-[9px] text-cyan-400 font-bold uppercase">
                        {c.surgery_date ? new Date(c.surgery_date).toLocaleString('default', { month: 'short' }) : 'TBD'}
                      </div>
                      <div className="text-xs font-extrabold">
                        {c.surgery_date ? new Date(c.surgery_date).getDate() : '--'}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {c.case_number}
                        </span>
                        <span className="text-slate-500 text-xs hidden xs:inline">&bull;</span>
                        <span className="text-xs text-slate-300 truncate max-w-[200px] sm:max-w-[240px]">
                          {c.implant_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                        <span>Surgeon: {c.surgeon_name}</span>
                        {c.hospital_site && (
                          <>
                            <span className="text-slate-600 hidden xs:inline">&bull;</span>
                            <span className="text-slate-500 truncate max-w-[150px]">{c.hospital_site}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-center pl-14 sm:pl-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityBadge(c.priority)}`}>
                      {c.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workflow & Priority Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Status Breakdown</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Approved for OR ({stats.approved})</span>
                  <span className="font-bold text-emerald-400">
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">In Clinical Review ({stats.in_review})</span>
                  <span className="font-bold text-sky-400">
                    {stats.total > 0 ? Math.round((stats.in_review / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.in_review / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">CAD Planning ({stats.planning})</span>
                  <span className="font-bold text-amber-400">
                    {stats.total > 0 ? Math.round((stats.planning / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.planning / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Drafts / Incomplete ({stats.draft})</span>
                  <span className="font-bold text-slate-400">
                    {stats.total > 0 ? Math.round((stats.draft / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-slate-600 rounded-full"
                    style={{ width: `${stats.total > 0 ? (stats.draft / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Staff: <strong className="text-slate-200 capitalize">{user?.role}</strong>
            </span>
            <span className="text-[11px] text-slate-500">Live DB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
