import React, { useState, useEffect } from 'react';
import { X, Database, ListChecks, Cloud, BookOpen } from 'lucide-react';

export const DocsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'traceability' | 'database' | 'deployment' | 'readme'>('traceability');

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Project Documentation & Architecture
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                IEC 62304 traceability, database schemas, and AWS cloud deployment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Horizontally Scrollable Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-3 sm:px-4 pt-2 space-x-1 sm:space-x-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('traceability')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'traceability'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Traceability</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'database'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Design</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'deployment'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>AWS Deployment (Bonus)</span>
          </button>

          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'readme'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>README.md</span>
          </button>
        </div>

        {/* Scrollable Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/90 text-xs text-slate-300 space-y-4">
          {activeTab === 'traceability' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">
                Traceability Matrix (IEC 62304 Medical Device Standards)
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Direct mapping between clinical requirement inputs, implementation code, and automated verification tests.
              </p>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-950 text-cyan-300 font-semibold border-b border-slate-800 text-[11px]">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Requirement (input)</th>
                      <th className="p-2.5">Implementation (output)</th>
                      <th className="p-2.5">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">REQ-001</td>
                      <td className="p-2.5 font-sans">Admin shall be able to create a case</td>
                      <td className="p-2.5 text-cyan-400">CaseController@store + form</td>
                      <td className="p-2.5 text-emerald-400">Feature test: admin creates case (201)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">REQ-002</td>
                      <td className="p-2.5 font-sans">Case Number shall be unique</td>
                      <td className="p-2.5 text-cyan-400">Unique index + Form Request</td>
                      <td className="p-2.5 text-emerald-400">Feature test: duplicate rejected (422)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">REQ-003</td>
                      <td className="p-2.5 font-sans">Only Admin shall delete cases</td>
                      <td className="p-2.5 text-cyan-400">CasePolicy@delete</td>
                      <td className="p-2.5 text-emerald-400">Feature test: viewer gets 403</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">REQ-004</td>
                      <td className="p-2.5 font-sans">Authorized user login & session</td>
                      <td className="p-2.5 text-cyan-400">AuthController@login + token</td>
                      <td className="p-2.5 text-emerald-400">Feature test: valid login (200)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">REQ-005</td>
                      <td className="p-2.5 font-sans">Guest restriction</td>
                      <td className="p-2.5 text-cyan-400">auth:sanctum middleware</td>
                      <td className="p-2.5 text-emerald-400">Feature test: guest rejected (401)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">REQ-006</td>
                      <td className="p-2.5 font-sans">Engineer role can edit but not delete</td>
                      <td className="p-2.5 text-cyan-400">CasePolicy@delete gate check</td>
                      <td className="p-2.5 text-emerald-400">Feature test: engineer delete gets 403</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">Relational Schema & Database Design</h4>
              <p className="text-slate-400">
                Foreign key constraints, indexing rationale, and schema definitions.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-2">
                <p><strong>Table 1: users</strong> (id, name, email [UNIQUE], password, role [INDEX], avatar_url, timestamps)</p>
                <p><strong>Table 2: cases</strong> (id, case_number [UNIQUE], patient_reference, surgeon_name [INDEX], implant_type, status [INDEX], priority [INDEX], surgery_date, created_by [FK -&gt; users.id], notes, hospital_site, timestamps)</p>
                <p><strong>Foreign Key:</strong> cases.created_by references users(id) ON DELETE RESTRICT</p>
                <p><strong>Indexes:</strong> cases_case_number_unique, cases_status_index, cases_surgeon_name_index</p>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white">AWS Cloud Architecture (Bonus Task)</h4>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-2">
                <p>&bull; <strong>App Tier:</strong> AWS EC2 (t4g.small / Graviton) in an Auto Scaling Group behind an Application Load Balancer (ALB).</p>
                <p>&bull; <strong>Database Tier:</strong> Amazon RDS for MySQL Multi-AZ in private isolated subnets with automated point-in-time recovery.</p>
                <p>&bull; <strong>File Storage:</strong> Amazon S3 with SSE-KMS encryption and expiring pre-signed URLs for medical DICOM models.</p>
                <p>&bull; <strong>Security Groups:</strong> Least privilege access (ALB: 80/443 -&gt; EC2: 3000 -&gt; RDS: 3306).</p>
                <p>&bull; <strong>Secrets:</strong> AWS Secrets Manager / SSM Parameter Store (zero keys in version control).</p>
                <p>&bull; <strong>HTTPS:</strong> AWS Certificate Manager (ACM) SSL with automated TLS 1.3 redirection.</p>
              </div>
            </div>
          )}

          {activeTab === 'readme' && (
            <div className="space-y-3 leading-relaxed">
              <h4 className="text-sm font-bold text-white">MedCase - Practical Assignment Documentation</h4>
              <p>Position: Software Developer Intern | Company: @Jajal Medical</p>
              <p>Test Credentials: admin@jajalmedical.com / viewer@jajalmedical.com / engineer@jajalmedical.com (Password: Password123!)</p>
              <p>Check the full README.md in the root repository for step-by-step setup and Laravel migration instructions.</p>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 shrink-0 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
