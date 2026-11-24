import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Trash2, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Download, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { 
  getScanHistory, 
  deleteScanFromHistory, 
  clearAllHistory 
} from '../utils/scanHistory';
import { generatePdfSummary } from '../utils/generatePdfSummary';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = deleteScanFromHistory(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    clearAllHistory();
    setHistory([]);
    setShowClearConfirm(false);
  };

  const handleReopen = (entry) => {
    sessionStorage.setItem('medscan_latest_scan', JSON.stringify(entry.scanData));
    navigate('/results', { state: { scanResult: entry.scanData } });
  };

  const handleDownloadPdf = (entry, e) => {
    e.stopPropagation();
    generatePdfSummary(entry.scanData);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-2">
            <History className="h-3.5 w-3.5" />
            <span>On-Device Local Storage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Report Scan History
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            View, reopen, or download PDF summaries of past medical analyses saved on this device.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold px-2">
                  Clear all scans?
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                >
                  Yes, Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Note Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 to-cyan-50/80 dark:from-slate-900/80 dark:to-slate-800/80 border border-teal-200/80 dark:border-teal-900/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
        <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 dark:text-white font-semibold">Privacy First Guarantee:</strong>{' '}
          Your uploaded documents are processed purely in memory and are never saved to our servers or stored on disk. This history log exists entirely inside your web browser&apos;s local device storage and is never uploaded anywhere.
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-8">
          <div className="h-16 w-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto">
            <History className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              No Past Scans Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You haven&apos;t scanned any lab reports on this device yet. Upload a medical report to see instant ICMR guideline insights.
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Upload Your First Report</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>Showing {history.length} saved scan{history.length === 1 ? '' : 's'}</span>
            <span>Click any record to reopen full results</span>
          </div>

          <AnimatePresence>
            {history.map((item, idx) => {
              const formattedTime = new Date(item.timestamp).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleReopen(item)}
                  className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {item.reportType}
                        </span>
                        {item.urgentAlert && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            Urgent Alert
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.abnormalCount > 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}>
                          {item.abnormalCount > 0 ? `${item.abnormalCount} Abnormal` : 'All Normal'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>Scanned: {formattedTime}</span>
                        </span>
                        <span>&bull;</span>
                        <span>Source: <strong className="font-mono text-slate-700 dark:text-slate-300">{item.fileName}</strong></span>
                        {item.totalCount > 0 && (
                          <>
                            <span>&bull;</span>
                            <span>{item.totalCount} tests</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadPdf(item, e)}
                      title="Download PDF Summary"
                      className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="hidden sm:inline">PDF Summary</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReopen(item)}
                      title="Reopen Analysis"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-sm transition-all flex items-center gap-1"
                    >
                      <span>Reopen</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete this scan"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

