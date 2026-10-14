import React, { useState } from 'react';
import { MedicalCase, PaginationMeta, SearchField } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Building,
  User,
  LayoutGrid,
  List,
  FileQuestion,
  X,
  SlidersHorizontal,
  Hash,
  Stethoscope,
  Tag,
  Check,
} from 'lucide-react';

const KNOWN_SURGEONS = [
  'Dr. Robert Sterling',
  'Dr. Emily Vance',
  'Dr. Tariq Mahmood',
  'Dr. Samantha Reed',
  'Dr. Jonathan Cole',
  'Dr. Karen White',
  'Dr. Michael Chang',
];

interface CaseListProps {
  cases: MedicalCase[];
  pagination: PaginationMeta;
  search: string;
  setSearch: (val: string) => void;
  searchField: SearchField;
  setSearchField: (val: SearchField) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  surgeonFilter: string;
  setSurgeonFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (val: 'asc' | 'desc') => void;
  page: number;
  setPage: (val: number) => void;
  isLoading: boolean;
  onViewCase: (c: MedicalCase) => void;
  onEditCase: (c: MedicalCase) => void;
  onDeleteCase: (c: MedicalCase) => void;
  onNewCase: () => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  pagination,
  search,
  setSearch,
  searchField,
  setSearchField,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  surgeonFilter,
  setSurgeonFilter,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  page,
  setPage,
  isLoading,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onNewCase,
}) => {
  const { canCreate, canEdit, canDelete } = useAuth();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setPage(1);
  };

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

  const getSearchFieldLabel = (field: SearchField) => {
    switch (field) {
      case 'case_number':
        return 'Case #';
      case 'surgeon_name':
        return 'Surgeon';
      case 'patient_reference':
        return 'Patient Code';
      default:
        return 'All Fields';
    }
  };

  const getSearchFieldPlaceholder = (field: SearchField) => {
    switch (field) {
      case 'case_number':
        return 'Search by Case Number (e.g. CASE-0001)...';
      case 'surgeon_name':
        return 'Search by Surgeon Name (e.g. Dr. Sterling)...';
      case 'patient_reference':
        return 'Search by Patient Code (e.g. PT-98214)...';
      default:
        return 'Search Case #, Surgeon, or Patient Code...';
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setSearchField('all');
    setStatusFilter('All');
    setPriorityFilter('All');
    setSurgeonFilter('All');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    searchField !== 'all' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    surgeonFilter !== 'All';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm overflow-hidden pb-12 md:pb-0">
      {/* Header, Search, Filters & Actions */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Medical Implant Case Directory
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                {pagination.total} cases
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse, search, and filter patient-specific implant cases.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle (Mobile & Tablet) */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Card View (Mobile friendly)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View (Desktop friendly)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {canCreate && (
              <button
                onClick={onNewCase}
                className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 px-3.5 py-2 rounded-lg font-bold text-xs shadow-md shadow-cyan-500/10 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden xs:inline">Create Case</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH BAR WITH TARGET FIELD SELECTOR (Case Number, Surgeon, Patient Code, All) */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Target Field Dropdown Pill */}
            <div className="relative sm:w-48 shrink-0">
              <select
                value={searchField}
                onChange={(e) => {
                  setSearchField(e.target.value as SearchField);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-700/90 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">🔍 All Fields</option>
                <option value="case_number">📋 Case Number</option>
                <option value="surgeon_name">👨‍⚕️ Surgeon Name</option>
                <option value="patient_reference">🏷️ Patient Code</option>
              </select>
            </div>

            {/* Main Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={getSearchFieldPlaceholder(searchField)}
                className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                showAdvancedFilters || statusFilter !== 'All' || priorityFilter !== 'All' || surgeonFilter !== 'All'
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(statusFilter !== 'All' || priorityFilter !== 'All' || surgeonFilter !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>
          </div>

          {/* FILTERING OPTIONS ROW (Status, Priority, Surgeon) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Planning">Planning</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Filter by Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Surgeon Filter */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Filter by Surgeon
              </label>
              <select
                value={surgeonFilter}
                onChange={(e) => {
                  setSurgeonFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="All">All Surgeons</option>
                {KNOWN_SURGEONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ACTIVE FILTER TAGS BAR */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">Active Filters:</span>

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-cyan-800/60 text-[11px]">
                  <span>
                    {getSearchFieldLabel(searchField)}: &quot;{search}&quot;
                  </span>
                  <button
                    onClick={() => setSearch('')}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Remove search"
                  >
                    &times;
                  </button>
                </span>
              )}

              {statusFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-800/60 text-[11px]">
                  <span>Status: {statusFilter}</span>
                  <button
                    onClick={() => setStatusFilter('All')}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Remove status filter"
                  >
                    &times;
                  </button>
                </span>
              )}

              {priorityFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-purple-800/60 text-[11px]">
                  <span>Priority: {priorityFilter}</span>
                  <button
                    onClick={() => setPriorityFilter('All')}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Remove priority filter"
                  >
                    &times;
                  </button>
                </span>
              )}

              {surgeonFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-emerald-800/60 text-[11px]">
                  <span>Surgeon: {surgeonFilter}</span>
                  <button
                    onClick={() => setSurgeonFilter('All')}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Remove surgeon filter"
                  >
                    &times;
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Switchable between Cards (Responsive) and Table */}
      <div className="relative min-h-[350px]">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Loading medical cases...
            </div>
          </div>
        )}

        {cases.length === 0 ? (
          <div className="py-16 text-center text-slate-500 px-4">
            <FileQuestion className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="font-bold text-slate-200 text-sm">No matching medical cases found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no implant cases matching your search query or active filter settings.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* RESPONSIVE CARD VIEW (Optimized for Phones & Tablets, clean on all devices) */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-cyan-950/20 group"
              >
                <div>
                  {/* Top: Case #, Ref & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span
                        onClick={() => onViewCase(c)}
                        className="font-mono font-bold text-sm text-white hover:text-cyan-400 cursor-pointer transition-colors block"
                      >
                        {c.case_number}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Ref: {c.patient_reference}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </div>
                  </div>

                  {/* Device Name */}
                  <div className="my-2.5">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">
                      Implant Specification
                    </span>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                      {c.implant_type}
                    </p>
                  </div>

                  {/* Surgeon & Facility */}
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{c.surgeon_name}</span>
                    </div>
                    {c.hospital_site && (
                      <div className="flex items-center gap-1.5 truncate text-[11px] text-slate-500">
                        <Building className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{c.hospital_site}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Date & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400/80" />
                    <span>{c.surgery_date ? c.surgery_date : 'No date'}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onViewCase(c)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">View</span>
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => onEditCase(c)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        title="Edit Case"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Edit</span>
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDeleteCase(c)}
                        className="p-1 rounded bg-rose-950/40 hover:bg-rose-900 border border-rose-900/60 text-rose-300 text-xs transition-colors cursor-pointer"
                        title="Delete Case (Admin Only)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* RESPONSIVE TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th
                    onClick={() => handleSort('case_number')}
                    className="py-3 px-4 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Case #</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'case_number' ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th className="py-3 px-4">Patient Ref</th>
                  <th
                    onClick={() => handleSort('surgeon_name')}
                    className="py-3 px-4 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Surgeon</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'surgeon_name' ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th className="py-3 px-4">Implant Device</th>
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3 px-4 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'status' ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('priority')}
                    className="py-3 px-4 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Priority</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'priority' ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('surgery_date')}
                    className="py-3 px-4 cursor-pointer hover:text-white select-none transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Surgery Date</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === 'surgery_date' ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      <span
                        onClick={() => onViewCase(c)}
                        className="cursor-pointer hover:text-cyan-400 hover:underline transition-colors"
                      >
                        {c.case_number}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {c.patient_reference}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium whitespace-nowrap">
                      {c.surgeon_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={c.implant_type}>
                      {c.implant_type}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {c.surgery_date ? (
                        <span className="flex items-center gap-1.5 font-mono text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400/80" />
                          {c.surgery_date}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Not scheduled</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onViewCase(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Case Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => onEditCase(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Case"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteCase(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete Case (Admin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Responsive Pagination Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="text-center sm:text-left">
          Showing <span className="font-semibold text-white">{pagination.from}</span> to{' '}
          <span className="font-semibold text-white">{pagination.to}</span> of{' '}
          <span className="font-semibold text-white">{pagination.total}</span> cases
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  page === p
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="sm:hidden px-2 font-mono text-slate-300 font-semibold">
            Page {page} / {pagination.last_page}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.last_page}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            title="Next Page"
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
