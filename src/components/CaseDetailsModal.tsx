import React, { useState, useEffect } from 'react';
import { CaseStatus, MedicalCase } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  X,
  Pencil,
  Trash2,
  Calendar,
  Building,
  User,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileCheck2,
} from 'lucide-react';

interface CaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: MedicalCase | null;
  onEdit: (c: MedicalCase) => void;
  onDeleteSuccess: (deletedId: number) => void;
  onStatusUpdated: (updated: MedicalCase) => void;
  initialConfirmDelete?: boolean;
}

const WORKFLOW_STEPS: CaseStatus[] = [
  'Draft',
  'Planning',
  'In Review',
  'Approved',
  'Completed',
];

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onEdit,
  onDeleteSuccess,
  onStatusUpdated,
  initialConfirmDelete = false,
}) => {
  const { canEdit, canDelete } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(initialConfirmDelete);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    setShowConfirmDelete(initialConfirmDelete);
  }, [initialConfirmDelete, isOpen]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !caseItem) return null;

  const handleDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await api.deleteCase(caseItem.id);
      onDeleteSuccess(caseItem.id);
      setShowConfirmDelete(false);
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { message?: string; status?: number };
      setDeleteError(
        errorObj.message || `Server rejected delete operation (HTTP ${errorObj.status || 403}).`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: CaseStatus) => {
    if (!canEdit) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.updateCase(caseItem.id, {
        case_number: caseItem.case_number,
        patient_reference: caseItem.patient_reference,
        surgeon_name: caseItem.surgeon_name,
        implant_type: caseItem.implant_type,
        priority: caseItem.priority,
        status: newStatus,
        surgery_date: caseItem.surgery_date,
      });
      if (res.success && res.data) {
        onStatusUpdated(res.data);
      }
    } catch (err) {
      console.error('Failed to change status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const currentStepIdx = WORKFLOW_STEPS.indexOf(caseItem.status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-mono font-bold text-white truncate">
                  {caseItem.case_number}
                </h3>
                <span className="text-[11px] sm:text-xs font-mono text-slate-400">
                  (Ref: {caseItem.patient_reference})
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                Created: {new Date(caseItem.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(caseItem);
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Edit</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/70 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
                title="Delete Case (Admin Only)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showConfirmDelete && (
          <div className="p-4 bg-rose-950/95 border-b border-rose-800 text-white shrink-0 animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-rose-200">
                  Permanently delete case {caseItem.case_number}?
                </h4>
                <p className="text-[11px] sm:text-xs text-rose-300/90 mt-1">
                  This action is irreversible. The case record will be removed. Only Admin role is authorized on server.
                </p>

                {deleteError && (
                  <p className="mt-2 text-xs font-bold text-rose-200 bg-rose-900/90 p-2 rounded border border-rose-700">
                    {deleteError}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmDelete(false);
                      setDeleteError(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Workflow Progress Tracker */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Clinical Workflow Stages</span>
              <span className="text-cyan-400 font-mono">Current: {caseItem.status}</span>
            </div>

            {/* Responsive workflow grid (2 cols on phone, 5 cols on tablet/desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = caseItem.status === step;

                return (
                  <button
                    key={step}
                    disabled={!canEdit || isUpdatingStatus}
                    onClick={() => handleQuickStatusChange(step)}
                    className={`text-left p-2 rounded-lg border text-xs transition-all ${
                      isCurrent
                        ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300 font-bold shadow-sm'
                        : isPassed
                        ? 'border-slate-700 bg-slate-800/80 text-slate-300'
                        : 'border-slate-800/60 bg-slate-950 text-slate-500'
                    } ${canEdit ? 'hover:border-cyan-600 cursor-pointer active:scale-95' : 'cursor-default'}`}
                    title={canEdit ? `Click to transition case to ${step}` : undefined}
                  >
                    <div className="flex items-center gap-1.5">
                      {isPassed ? (
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] text-slate-500 shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <span className="truncate">{step}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Case Fields Grid */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Implant Type */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Implant Specification
                </span>
                <p className="text-xs sm:text-sm font-bold text-white">{caseItem.implant_type}</p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Patient-Specific Device
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      caseItem.priority === 'High'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : caseItem.priority === 'Medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    Priority: {caseItem.priority}
                  </span>
                </div>
              </div>

              {/* Surgeon & Facility */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Lead Surgeon & Operating Facility
                </span>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <User className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{caseItem.surgeon_name}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                  <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{caseItem.hospital_site || 'Primary Surgical Pavilion'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Surgery Date */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Surgery Schedule
                </span>
                <div className="flex items-center gap-2 text-xs font-mono text-white">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{caseItem.surgery_date ? caseItem.surgery_date : 'Not Scheduled'}</span>
                </div>
              </div>

              {/* Created By Details */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Created By (Audit Trail)
                </span>
                <div className="text-xs text-white font-medium truncate">
                  {caseItem.creator?.name || `User ID #${caseItem.created_by}`}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Role: <strong className="capitalize">{caseItem.creator?.role || 'Staff'}</strong></span>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-3.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Audit Timestamp
                </span>
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Mod: {new Date(caseItem.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Auto-managed timestamp
                </div>
              </div>
            </div>

            {/* Clinical & Engineering Notes */}
            {caseItem.notes && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:p-4">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Clinical Planning & Bio-Mechanical Notes
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {caseItem.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/90 shrink-0 flex items-center justify-between">
          <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 truncate pr-2">
            <FileCheck2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">IEC 62304 / ISO 13485 Audit Compliant</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
