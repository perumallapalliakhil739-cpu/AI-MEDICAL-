import React, { useState, useMemo } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Pill, 
  Apple, 
  AlertOctagon, 
  Printer, 
  Share2, 
  ArrowLeft, 
  Sparkles,
  Stethoscope,
  Layers,
  Building2,
  Calendar,
  AlertCircle,
  FileCheck,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Download
} from 'lucide-react';
import { dummyReports } from '../data/dummyReports';
import { generatePdfSummary } from '../utils/generatePdfSummary';

// Colored status badge helper
const getStatusBadge = (status) => {
  const s = (status || '').trim().toLowerCase();
  switch (s) {
    case 'high':
      return {
        label: 'HIGH',
        className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    case 'low':
      return {
        label: 'LOW',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'normal':
      return {
        label: 'NORMAL',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'unknown':
    default:
      return {
        label: 'UNKNOWN',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
};

export const ResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Retrieve scanned report from route state, sessionStorage, or fallback preset
  const liveScan = useMemo(() => {
    if (location.state?.scanResult) {
      return location.state.scanResult;
    }
    const cached = sessionStorage.getItem('medscan_latest_scan');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  }, [location.state]);

  const sampleKey = searchParams.get('sample') || 'lipid';
  const defaultDummy = dummyReports[sampleKey] || dummyReports.lipid;

  const [copied, setCopied] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'abnormal'

  // Determine active source data
  const isLiveScan = Boolean(liveScan && liveScan.tests && liveScan.tests.length > 0);

  const reportTitle = isLiveScan
    ? liveScan.report_type || 'Laboratory Test Report'
    : defaultDummy.title;

  const reportDate = isLiveScan
    ? liveScan.report_date || 'Date not specified'
    : defaultDummy.date;

  const labName = isLiveScan
    ? liveScan.lab_name || 'Diagnostic Laboratory'
    : 'Clinical Diagnostics';

  const fileName = isLiveScan
    ? liveScan.fileName || 'Scanned_Report.pdf'
    : defaultDummy.fileName;

  // Analysis object (real analysis from backend or sample fallback)
  const analysis = isLiveScan && liveScan.analysis
    ? liveScan.analysis
    : defaultDummy.analysis || {};

  // Extract raw tests
  const rawTests = isLiveScan
    ? liveScan.tests
    : defaultDummy.abnormalValues.map(v => ({
        name: v.name,
        value: v.value,
        unit: v.unit,
        reference_range: v.reference,
        status: v.status.toLowerCase(),
      }));

  // Sort tests: abnormal rows (high, low) first, then unknown, then normal
  const sortedTests = useMemo(() => {
    const getRank = (status) => {
      const s = (status || '').toLowerCase();
      if (s === 'high') return 1;
      if (s === 'low') return 2;
      if (s === 'unknown') return 3;
      if (s === 'normal') return 4;
      return 5;
    };

    return [...rawTests].sort((a, b) => getRank(a.status) - getRank(b.status));
  }, [rawTests]);

  const abnormalCount = useMemo(() => {
    return sortedTests.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s === 'high' || s === 'low';
    }).length;
  }, [sortedTests]);

  const displayedTests = useMemo(() => {
    if (filterType === 'abnormal') {
      return sortedTests.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s === 'high' || s === 'low';
      });
    }
    return sortedTests;
  }, [sortedTests, filterType]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generatePdfSummary({
      report_type: reportTitle,
      report_date: reportDate,
      lab_name: labName,
      fileName: fileName,
      tests: sortedTests,
      analysis: analysis,
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Upload or scan another report</span>
        </Link>

        {/* Preset Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 px-2">Sample Panels:</span>
          {Object.keys(dummyReports).map((key) => {
            const isSelected = !isLiveScan && sampleKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  sessionStorage.removeItem('medscan_latest_scan');
                  setSearchParams({ sample: key });
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {key === 'lipid' ? 'Lipid Profile' : key === 'cbc' ? 'CBC Hemogram' : 'HbA1c Glucose'}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. CODE-LEVEL URGENT ALERT BANNER (If triggered by critical-value safety check) */}
      {analysis?.urgent_alert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-5 bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 text-white shadow-xl shadow-rose-600/25 border-2 border-rose-300/40 flex items-start gap-4"
        >
          <div className="p-2 rounded-xl bg-white/20 text-white shrink-0 mt-0.5 animate-pulse">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                Code-Level Safety Alert
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">
                Critical Value Detected
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              {analysis.urgent_alert}
            </p>
          </div>
        </motion.div>
      )}

      {/* 2. PERMANENT MEDICAL DISCLAIMER BANNER (Always visible) */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 sm:p-5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-sm flex items-start gap-3.5"
      >
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="space-y-1 text-xs sm:text-sm">
          <h2 className="font-bold uppercase tracking-wide text-xs">
            Important Medical Disclaimer
          </h2>
          <p className="leading-relaxed">
            This is for <span className="font-bold underline">information only</span>, not a medical diagnosis. The suggestions, abnormal flags, and medicine classifications below are educational summaries referenced from ICMR Standard Treatment Workflows (STWs). <span className="font-semibold">Consult a qualified doctor before altering any medication, therapy, or diet.</span>
          </p>
        </div>
      </motion.div>

      {/* 3. REPORT OVERVIEW HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5">
                <FileCheck className="h-3.5 w-3.5" />
                <span>{reportTitle}</span>
              </span>

              {isLiveScan && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Gemini Vision Extracted</span>
                </span>
              )}

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{reportDate}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {reportTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>Lab: <strong className="text-slate-700 dark:text-slate-300">{labName}</strong></span>
              </span>
              <span>&bull;</span>
              <span>Source File: <strong className="font-mono text-teal-600 dark:text-teal-400">{fileName}</strong></span>
              <span>&bull;</span>
              <span>
                Total Parameters: <strong className="text-slate-700 dark:text-slate-300">{sortedTests.length}</strong> ({abnormalCount} flagged abnormal)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-600/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Summary (PDF)</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print View</span>
            </button>
          </div>
        </div>

        {/* Guideline badge info strip */}
        <div className="mt-4 pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Standard Treatment Workflows (ICMR STW Guidelines Aligned)
            </span>
          </div>
          <Link
            to="/knowledge-base"
            className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Browse All Official ICMR Guidelines &rarr;</span>
          </Link>
        </div>
      </motion.div>

      {/* 4. REAL EXTRACTED TESTS TABLE */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-teal-700 dark:text-teal-300">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Extracted Laboratory Tests &amp; Values
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directly parsed from your document. Abnormal items are sorted to the top.
              </p>
            </div>
          </div>

          {/* Table Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Tests ({sortedTests.length})
            </button>
            <button
              onClick={() => setFilterType('abnormal')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === 'abnormal'
                  ? 'bg-rose-500 text-white shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Abnormal Flags ({abnormalCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th scope="col" className="px-5 py-3.5">Test Parameter</th>
                <th scope="col" className="px-5 py-3.5">Result Value</th>
                <th scope="col" className="px-5 py-3.5">Unit</th>
                <th scope="col" className="px-5 py-3.5">Reference Range</th>
                <th scope="col" className="px-5 py-3.5 text-center">Status Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedTests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No tests match the selected filter.
                  </td>
                </tr>
              ) : (
                displayedTests.map((test, idx) => {
                  const badge = getStatusBadge(test.status);
                  const isAbnormal = test.status === 'high' || test.status === 'low';

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                        isAbnormal ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {isAbnormal && (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                          )}
                          <span>{test.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        {test.value !== null && test.value !== undefined ? String(test.value) : '—'}
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs">
                        {test.unit || '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {test.reference_range || <span className="text-slate-400 italic">Not printed</span>}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${badge.className}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 5. MAIN PROBLEM CARD (Populated with main_findings and Related Tests as chips) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-300">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Card 1: Primary Clinical Analysis
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Main Problem &amp; STW Findings
              </h2>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            ICMR STW Matched
          </span>
        </div>

        {/* Findings List */}
        {analysis?.main_findings && analysis.main_findings.length > 0 ? (
          <div className="space-y-6">
            {analysis.main_findings.map((finding, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {finding.possible_condition}
                    </span>
                  </div>

                  {finding.source && (
                    <Link
                      to={`/knowledge-base`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors shrink-0"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>STW: {finding.source.source_file || finding.source.stw_id}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>

                {/* 2-3 sentence plain language summary (8th grade level) */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {finding.summary}
                </p>

                {/* Confidence note */}
                {finding.confidence_note && (
                  <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    <span>Clinical Correlation: {finding.confidence_note}</span>
                  </div>
                )}

                {/* Related Tests as Chips */}
                {finding.related_tests && finding.related_tests.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Related Out-of-Range Tests:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {finding.related_tests.map((testName, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <Activity className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                          <span>{testName}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
            No specific guideline matches were identified.
          </div>
        )}
      </motion.div>

      {/* 6. PRECAUTIONS & MEDICINES (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PRECAUTIONS (Checklist style with icons) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6"
        >
          <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-300">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
              <Apple className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Card 2: Evidence-Based Precautions
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Lifestyle &amp; Dietary Measures
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Checklist derived from official ICMR non-pharmacological recommendations:
          </p>

          {/* Precautions Checklist */}
          {analysis?.precautions && analysis.precautions.length > 0 ? (
            <div className="space-y-3">
              {analysis.precautions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-3 transition-colors hover:border-teal-500/40"
                >
                  <div className="h-5 w-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {typeof item === 'string' ? item : item.text}
                    </p>
                    {item.source_stw_id && (
                      <span className="inline-block text-[10px] font-mono text-teal-700 dark:text-teal-400">
                        Source: ICMR STW &bull; {item.source_stw_id}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No specific precautions indicated.</p>
          )}
        </motion.div>

        {/* MEDICINES (Discuss with your doctor - Cards with source badge) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="lg:col-span-6 rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-teal-700 dark:text-teal-300">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
                <Pill className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  Card 3: Physician Talking Points
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Suggested Medicines
                </h3>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Doctor Discussion Only
            </span>
          </div>

          {/* Strict Warning Banner */}
          <div className="p-3.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Strict Prescription Notice:</span> The drugs listed below represent first-line classes from ICMR protocols without specific doses. <span className="underline font-semibold">Never self-medicate or purchase without an in-person doctor prescription.</span>
            </div>
          </div>

          {/* Medicines Cards */}
          {analysis?.medicines && analysis.medicines.length > 0 ? (
            <div className="space-y-3.5">
              {analysis.medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2 hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {med.name}
                    </h4>
                    {med.source_stw_id && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold border border-teal-200 dark:border-teal-800 shrink-0">
                        Source: ICMR STW &bull; {med.source_stw_id}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Clinical Purpose: {med.purpose}
                  </div>

                  {med.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Notes: {med.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No specific prescription classes indicated for discussion.</p>
          )}
        </motion.div>
      </div>

      {/* 7. WHEN TO SEE A DOCTOR (Highlighted Warning Box) */}
      {analysis?.see_a_doctor_if && analysis.see_a_doctor_if.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="rounded-3xl p-6 sm:p-7 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300 font-bold">
            <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
              When to See a Doctor Immediately (Red Flags)
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Per ICMR clinical referral protocols, seek prompt or emergency in-person medical evaluation if you experience any of the following symptoms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {analysis.see_a_doctor_if.map((flag, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-slate-800 dark:text-slate-200 font-medium"
              >
                <span className="text-rose-600 font-bold mt-0.5">&bull;</span>
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 8. TESTS NOT COVERED BY GUIDELINES SECTION */}
      {analysis?.tests_without_match && analysis.tests_without_match.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="rounded-3xl p-6 bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="h-4 w-4 text-slate-500" />
            <span>Not Covered by Our Current Guidelines</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The following out-of-range biomarkers were identified on your report, but they do not have a direct corresponding condition in our current ICMR STW knowledge base. Please review these parameters with your treating physician for accurate clinical interpretation:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {analysis.tests_without_match.map((testName, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-sm"
              >
                {testName}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bottom Action Footer */}
      <div className="p-6 rounded-3xl bg-teal-50/60 dark:bg-slate-900/60 border border-teal-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:hidden">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Need to scan another laboratory sheet?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MedScan AI correlates all pathology, hematology, and biochemistry documents with ICMR STWs.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-sm transition-all"
        >
          <Activity className="h-4 w-4" />
          <span>Upload Another Report</span>
        </Link>
      </div>
    </div>
  );
};
