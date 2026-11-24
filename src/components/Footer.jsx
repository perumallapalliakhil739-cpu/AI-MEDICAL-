import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, HeartPulse, Activity, ExternalLink, FileCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      {/* Prominent Medical Disclaimer Banner */}
      <div className="bg-amber-500/10 border-y border-amber-500/20 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="p-2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
            <span className="font-bold uppercase tracking-wide mr-1">Mandatory Medical Disclaimer:</span>
            MedScan AI is an educational technology demonstration. Information extracted, classified, and displayed is strictly for informational support and preparatory doctor discussions based on standard ICMR treatment protocols. It does <span className="font-semibold underline">NOT</span> constitute a medical diagnosis, clinical prescription, or emergency triage service. Always consult a certified medical professional for diagnosis and treatment decisions.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                MedScan <span className="text-teal-600 dark:text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-md">
              Demystifying complex diagnostic reports through artificial intelligence mapped with the official Standard Treatment Workflows (STWs) published by the Indian Council of Medical Research (ICMR).
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FileCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Aligned with ICMR STW 2024 Clinical Volumes</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Home & Overview
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Upload Lab Report
                </Link>
              </li>
              <li>
                <Link to="/results?sample=lipid" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  Lipid Profile Demo
                </Link>
              </li>
              <li>
                <Link to="/results?sample=diabetes" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  HbA1c Diabetes Demo
                </Link>
              </li>
              <li>
                <Link to="/results?sample=cbc" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  CBC Anemia Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Reference & Compliance */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Standards & Guidelines
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://main.icmr.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  ICMR Official Portal <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">
                  Privacy-first: No server-side storage of uploads
                </span>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">
                  Client-side processing & secure OCR simulation
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>Built with precision for healthcare clarity &copy; {new Date().getFullYear()} MedScan AI.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400">
              <HeartPulse className="h-3.5 w-3.5 animate-pulse" /> Healthcare Innovation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

