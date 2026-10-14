import React, { useState, useEffect } from 'react';
import { CasePriority, CaseStatus, MedicalCase, PublicHoliday } from '../types.js';
import { api } from '../services/api.js';
import {
  X,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseToEdit?: MedicalCase | null;
  onSuccess: (updatedCase: MedicalCase) => void;
}

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  isOpen,
  onClose,
  caseToEdit,
  onSuccess,
}) => {
  const isEditing = Boolean(caseToEdit);

  const [caseNumber, setCaseNumber] = useState('');
  const [patientRef, setPatientRef] = useState('');
  const [surgeonName, setSurgeonName] = useState('');
  const [implantType, setImplantType] = useState('');
  const [status, setStatus] = useState<CaseStatus>('Draft');
  const [priority, setPriority] = useState<CasePriority>('Medium');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [hospitalSite, setHospitalSite] = useState('');
  const [notes, setNotes] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Public Holiday API state (Bonus Task)
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [holidayWarning, setHolidayWarning] = useState<string | null>(null);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const res = await api.getHolidays('2026', 'US');
        if (res.data) {
          setHolidays(res.data);
        }
      } catch (e) {
        console.warn('Could not load public holidays', e);
      }
    }
    fetchHolidays();
  }, []);

  // Pre-fill form when caseToEdit changes
  useEffect(() => {
    if (caseToEdit) {
      setCaseNumber(caseToEdit.case_number);
      setPatientRef(caseToEdit.patient_reference);
      setSurgeonName(caseToEdit.surgeon_name);
      setImplantType(caseToEdit.implant_type);
      setStatus(caseToEdit.status);
      setPriority(caseToEdit.priority);
      setSurgeryDate(caseToEdit.surgery_date || '');
      setHospitalSite(caseToEdit.hospital_site || '');
      setNotes(caseToEdit.notes || '');
    } else {
      const randomCaseNum = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomPatientCode = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
      setCaseNumber(randomCaseNum);
      setPatientRef(randomPatientCode);
      setSurgeonName('Dr. Robert Sterling');
      setImplantType('Patient-Specific Cranial Titanium Mesh');
      setStatus('Planning');
      setPriority('Medium');
      setSurgeryDate('');
      setHospitalSite('St. Jude Neurological Institute');
      setNotes('');
    }
    setFieldErrors({});
    setGeneralError(null);
  }, [caseToEdit, isOpen]);

  // Check if selected surgery date conflicts with public holiday
  useEffect(() => {
    if (!surgeryDate || holidays.length === 0) {
      setHolidayWarning(null);
      return;
    }

    const matched = holidays.find((h) => h.date === surgeryDate);
    if (matched) {
      setHolidayWarning(
        `Selected date is ${matched.localName} (Observed Public Holiday via Nager.Date API). Operating room staffing may be restricted.`
      );
    } else {
      setHolidayWarning(null);
    }
  }, [surgeryDate, holidays]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    const payload = {
      case_number: caseNumber,
      patient_reference: patientRef,
      surgeon_name: surgeonName,
      implant_type: implantType,
      status,
      priority,
      surgery_date: surgeryDate || null,
      hospital_site: hospitalSite,
      notes,
    };

    try {
      let res;
      if (isEditing && caseToEdit) {
        res = await api.updateCase(caseToEdit.id, payload);
      } else {
        res = await api.createCase(payload);
      }

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: unknown) {
      const errorObj = err as {
        status?: number;
        message?: string;
        errors?: Record<string, string[]>;
      };
      if (errorObj.errors) {
        setFieldErrors(errorObj.errors);
      }
      setGeneralError(errorObj.message || 'Validation failed. Please check the inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/95">
          <div className="min-w-0 pr-2">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {isEditing ? `Edit Implant Case: ${caseToEdit?.case_number}` : 'Create New Implant Case'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              {isEditing
                ? 'Update surgical specifications and clinical status parameters.'
                : 'Register a patient-specific medical implant case for design and fabrication.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* General Error Banner */}
          {generalError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Validation Error (422)</p>
                <p>{generalError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Case Number (Required, Unique) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Case Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                placeholder="e.g. CASE-0001"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  fieldErrors.case_number ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-700'
                }`}
              />
              {fieldErrors.case_number ? (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.case_number[0]}</p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-500">Must be unique across all cases.</p>
              )}
            </div>

            {/* Patient Reference (Required, Dummy code) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Patient Reference Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={patientRef}
                onChange={(e) => setPatientRef(e.target.value)}
                placeholder="e.g. PT-98214 (Dummy Code)"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  fieldErrors.patient_reference ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-700'
                }`}
              />
              {fieldErrors.patient_reference ? (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.patient_reference[0]}</p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-500">Anonymized token (No real names allowed).</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Surgeon Name (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Surgeon Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={surgeonName}
                onChange={(e) => setSurgeonName(e.target.value)}
                placeholder="Dr. Full Name"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  fieldErrors.surgeon_name ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-700'
                }`}
              />
              {fieldErrors.surgeon_name && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.surgeon_name[0]}</p>
              )}
            </div>

            {/* Implant Type (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Implant Type <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={implantType}
                onChange={(e) => setImplantType(e.target.value)}
                placeholder="e.g. Cranial PEEK Implant"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  fieldErrors.implant_type ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-700'
                }`}
              />
              {fieldErrors.implant_type && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.implant_type[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Workflow Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  fieldErrors.status ? 'border-rose-600' : 'border-slate-700'
                }`}
              >
                <option value="Draft">Draft</option>
                <option value="Planning">Planning</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {fieldErrors.status && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.status[0]}</p>
              )}
            </div>

            {/* Priority (Required) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority <span className="text-rose-400">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  fieldErrors.priority ? 'border-rose-600' : 'border-slate-700'
                }`}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {fieldErrors.priority && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.priority[0]}</p>
              )}
            </div>

            {/* Surgery Date (Optional, Valid Date) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Surgery Date (Optional)
              </label>
              <input
                type="date"
                value={surgeryDate}
                onChange={(e) => setSurgeryDate(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  fieldErrors.surgery_date ? 'border-rose-600' : 'border-slate-700'
                }`}
              />
              {fieldErrors.surgery_date && (
                <p className="mt-1 text-xs text-rose-400">{fieldErrors.surgery_date[0]}</p>
              )}
            </div>
          </div>

          {/* Bonus: Public Holiday Live Feedback next to Surgery Date */}
          {holidayWarning && (
            <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200">Public Holiday Alert</p>
                <p>{holidayWarning}</p>
              </div>
            </div>
          )}

          {/* Hospital Site */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hospital / Surgical Pavilion
            </label>
            <input
              type="text"
              value={hospitalSite}
              onChange={(e) => setHospitalSite(e.target.value)}
              placeholder="e.g. St. Jude Neurological Institute"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clinical & Engineering Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter anatomical specifications, CAD file references, DICOM CT scan notes..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 shrink-0 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Case' : 'Create Case'}
          </button>
        </div>
      </div>
    </div>
  );
};
