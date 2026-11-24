import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, Stethoscope, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'medscan_disclaimer_accepted';

export const DisclaimerModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) {
        setIsOpen(true);
      }
    } catch {
      // LocalStorage error fallback
      setIsOpen(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-teal-500/30 p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Header Icon */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Medical Disclaimer &amp; Terms
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Welcome to MedScan AI
              </h2>
            </div>
          </div>

          {/* Statement */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="font-semibold text-slate-900 dark:text-white">
              Please read and acknowledge before proceeding:
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                &ldquo;This tool gives general information from ICMR guidelines and does not replace a doctor.&rdquo;
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>MedScan AI explains lab results by referencing official Indian Council of Medical Research (ICMR) Standard Treatment Workflows.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>The extracted biomarkers, precautions, and medicine names are for educational preparation for a clinical consultation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>Never start, stop, or change prescription dosages based solely on this tool. Always consult a qualified physician.</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400 text-center sm:text-left">
              By clicking accept, you agree to these clinical terms.
            </span>
            <button
              type="button"
              onClick={handleAccept}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-600/30 transition-all hover:-translate-y-0.5"
            >
              <Stethoscope className="h-4 w-4" />
              <span>I Understand &amp; Accept</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

