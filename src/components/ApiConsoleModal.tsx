import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Download,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  FileJson,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface EndpointPreset {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  defaultBody?: string;
  authRequired: boolean;
}

const PRESETS: EndpointPreset[] = [
  {
    name: '1. POST /api/login',
    method: 'POST',
    endpoint: '/api/login',
    description: 'Get an API token (Anyone)',
    authRequired: false,
    defaultBody: JSON.stringify(
      {
        email: 'admin@jajalmedical.com',
        password: 'Password123!',
      },
      null,
      2
    ),
  },
  {
    name: '2. POST /api/logout',
    method: 'POST',
    endpoint: '/api/logout',
    description: 'Revoke token (Logged-in user)',
    authRequired: true,
  },
  {
    name: '3. GET /api/cases',
    method: 'GET',
    endpoint: '/api/cases?page=1&per_page=10&search=&status=&priority=',
    description: 'List cases (paginated, search, filter) (Admin, Viewer, Engineer)',
    authRequired: true,
  },
  {
    name: '4. POST /api/cases',
    method: 'POST',
    endpoint: '/api/cases',
    description: 'Create a case (Admin, Engineer)',
    authRequired: true,
    defaultBody: JSON.stringify(
      {
        case_number: `CASE-LIVE-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_reference: 'PT-99120',
        surgeon_name: 'Dr. Gregory House',
        implant_type: 'Custom Titanium Mandible Mesh',
        status: 'Planning',
        priority: 'High',
        surgery_date: '2026-11-28',
        notes: 'Interactive API console submission',
      },
      null,
      2
    ),
  },
  {
    name: '5. GET /api/cases/{id}',
    method: 'GET',
    endpoint: '/api/cases/1',
    description: 'Get one case details (Admin, Viewer, Engineer)',
    authRequired: true,
  },
  {
    name: '6. PUT /api/cases/{id}',
    method: 'PUT',
    endpoint: '/api/cases/1',
    description: 'Update a case (Admin, Engineer)',
    authRequired: true,
    defaultBody: JSON.stringify(
      {
        case_number: 'CASE-0001',
        patient_reference: 'PT-98214',
        surgeon_name: 'Dr. Robert Sterling',
        implant_type: 'Patient-Specific Cranial Titanium Mesh',
        status: 'Approved',
        priority: 'High',
        surgery_date: '2026-10-28',
        notes: 'Updated via REST API Console',
      },
      null,
      2
    ),
  },
  {
    name: '7. DELETE /api/cases/{id}',
    method: 'DELETE',
    endpoint: '/api/cases/1',
    description: 'Delete a case (Admin only - 403 for Viewer/Engineer)',
    authRequired: true,
  },
  {
    name: '8. GET /api/holidays (Bonus)',
    method: 'GET',
    endpoint: '/api/holidays?year=2026&country=US',
    description: 'Public holiday external API integration',
    authRequired: false,
  },
];

export const ApiConsoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { token, user } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset>(PRESETS[2]);
  const [method, setMethod] = useState(PRESETS[2].method);
  const [url, setUrl] = useState(PRESETS[2].endpoint);
  const [requestBody, setRequestBody] = useState(PRESETS[2].defaultBody || '');
  const [includeAuth, setIncludeAuth] = useState(true);

  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<unknown>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'endpoints' | 'console'>('console');

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

  const handleSelectPreset = (p: EndpointPreset) => {
    setSelectedPreset(p);
    setMethod(p.method);
    setUrl(p.endpoint);
    setRequestBody(p.defaultBody || '');
    setIncludeAuth(p.authRequired);
    setMobileTab('console');
  };

  const handleSend = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    const t0 = performance.now();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (includeAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: ['POST', 'PUT'].includes(method) ? requestBody : undefined,
      });

      const elapsed = Math.round(performance.now() - t0);
      setLatency(elapsed);
      setResponseStatus(res.status);

      const json = await res.json().catch(() => ({}));
      setResponseBody(json);
    } catch (err: unknown) {
      setResponseStatus(500);
      setResponseBody({ error: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPostmanCollection = async () => {
    try {
      const res = await fetch('/docs/MedCase_Postman_Collection.json');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'MedCase_Postman_Collection.json';
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert('Could not download file.');
    }
  };

  const copyResponse = () => {
    if (responseBody) {
      navigator.clipboard.writeText(JSON.stringify(responseBody, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                REST API Console & Postman Suite
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Directly invoke and inspect Laravel Sanctum JSON endpoints with status code compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={downloadPostmanCollection}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition-all cursor-pointer"
              title="Download collection for Postman / Thunder Client"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Postman JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile View Tab Switcher */}
        <div className="lg:hidden flex border-b border-slate-800 bg-slate-950/60 px-4 pt-1.5 shrink-0">
          <button
            onClick={() => setMobileTab('endpoints')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              mobileTab === 'endpoints'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            Endpoints ({PRESETS.length})
          </button>
          <button
            onClick={() => setMobileTab('console')}
            className={`flex-1 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              mobileTab === 'console'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400'
            }`}
          >
            Request & Response
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Preset Endpoints Sidebar (Col 4) */}
          <div
            className={`lg:col-span-4 border-r border-slate-800 divide-y divide-slate-800/80 bg-slate-950/40 overflow-y-auto ${
              mobileTab === 'endpoints' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Standard REST Endpoints
            </div>
            {PRESETS.map((p) => {
              const isSelected = selectedPreset.name === p.name;
              return (
                <div
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-800 border-l-4 border-l-cyan-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.method === 'GET'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : p.method === 'POST'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : p.method === 'PUT'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {p.method}
                    </span>
                    <span className="text-xs font-bold text-white truncate">{p.endpoint}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.description}</p>
                </div>
              );
            })}
          </div>

          {/* Request / Response Workspace (Col 8) */}
          <div
            className={`lg:col-span-8 p-4 sm:p-5 bg-slate-900/90 overflow-y-auto space-y-4 ${
              mobileTab === 'console' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Request Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as EndpointPreset['method'])}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Sending...' : 'Send'}</span>
              </button>
            </div>

            {/* Auth Checkbox & Current Actor */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeAuth}
                  onChange={(e) => setIncludeAuth(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Include Sanctum Bearer Token</span>
              </label>

              <span className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Active Actor: <strong className="text-white capitalize">{user?.role}</strong> ({user?.name})
              </span>
            </div>

            {/* Request Body (for POST/PUT) */}
            {['POST', 'PUT'].includes(method) && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Request Payload (JSON)
                </label>
                <textarea
                  rows={5}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            )}

            {/* Response Section */}
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Response:</span>
                  {responseStatus !== null && (
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        responseStatus >= 200 && responseStatus < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : responseStatus === 401 || responseStatus === 403
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      HTTP {responseStatus}
                    </span>
                  )}
                  {latency !== null && (
                    <span className="text-[11px] text-slate-400">{latency} ms</span>
                  )}
                </div>

                {responseBody !== null && (
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy JSON
                      </>
                    )}
                  </button>
                )}
              </div>

              {responseBody !== null ? (
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-56">
                  {JSON.stringify(responseBody, null, 2)}
                </pre>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  Select an endpoint above and click &quot;Send&quot; to inspect real API responses.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 shrink-0 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate pr-2">
            <FileJson className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Consistent Shape: {`{ success, data, message }`}</span>
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
