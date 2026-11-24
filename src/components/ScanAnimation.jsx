import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Cpu, Database, Stethoscope, Sparkles } from 'lucide-react';

const SCAN_STEPS = [
  { label: 'Reading report document and optical text...', icon: Cpu, threshold: 0 },
  { label: 'Identifying clinical biomarkers & patient values...', icon: Activity, threshold: 25 },
  { label: 'Comparing against reference biological intervals...', icon: Database, threshold: 50 },
  { label: 'Querying Gemini Vision & ICMR Workflows...', icon: ShieldCheck, threshold: 75 },
  { label: 'Synthesizing verified medical test parameters...', icon: Stethoscope, threshold: 92 },
];

export const ScanAnimation = ({ file, isComplete = false }) => {
  const [simulatedProgress, setSimulatedProgress] = useState(15);

  useEffect(() => {
    if (isComplete) {
      setSimulatedProgress(100);
      return;
    }

    // Progress smoothly up to 92% while waiting for API response
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 92) return 92;
        const increment = Math.max(1, Math.floor((92 - prev) / 10));
        return prev + increment;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isComplete]);

  const progress = isComplete ? 100 : simulatedProgress;
  const activeStep = SCAN_STEPS.slice().reverse().find(step => progress >= step.threshold) || SCAN_STEPS[0];
  const StepIcon = activeStep.icon;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Scanning Stage Viewport */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-teal-500/30 bg-slate-900 shadow-2xl shadow-teal-900/30 flex items-center justify-center">
        {/* Document Silhouette Background */}
        <div className="absolute inset-4 rounded-xl border border-dashed border-teal-500/20 bg-slate-950/80 p-6 flex flex-col justify-between overflow-hidden">
          {/* Mock Document Header */}
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <div className="h-3 w-32 bg-teal-400/40 rounded"></div>
                <div className="h-2 w-20 bg-teal-400/20 rounded mt-1.5"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-2.5 w-16 bg-teal-400/30 rounded ml-auto"></div>
              <div className="h-2 w-24 bg-teal-400/20 rounded mt-1.5 ml-auto"></div>
            </div>
          </div>

          {/* Mock Document Body Lines */}
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-40 bg-teal-400/30 rounded"></div>
              <div className="h-2.5 w-14 bg-teal-400/40 rounded"></div>
              <div className="h-2.5 w-24 bg-teal-400/20 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-48 bg-teal-400/30 rounded"></div>
              <div className="h-2.5 w-12 bg-amber-400/60 rounded"></div>
              <div className="h-2.5 w-20 bg-teal-400/20 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-36 bg-teal-400/30 rounded"></div>
              <div className="h-2.5 w-16 bg-rose-400/60 rounded"></div>
              <div className="h-2.5 w-24 bg-teal-400/20 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-52 bg-teal-400/30 rounded"></div>
              <div className="h-2.5 w-12 bg-teal-400/40 rounded"></div>
              <div className="h-2.5 w-16 bg-teal-400/20 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-44 bg-teal-400/30 rounded"></div>
              <div className="h-2.5 w-14 bg-amber-400/60 rounded"></div>
              <div className="h-2.5 w-28 bg-teal-400/20 rounded"></div>
            </div>
          </div>

          {/* Mock Document Footer */}
          <div className="border-t border-teal-500/20 pt-3 flex items-center justify-between">
            <div className="h-2 w-28 bg-teal-400/20 rounded"></div>
            <div className="h-4 w-16 bg-teal-500/30 rounded"></div>
          </div>
        </div>

        {/* Matrix Grid Lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(45, 212, 191, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Laser Scanner Bar */}
        <motion.div
          animate={{
            top: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent z-20 pointer-events-none shadow-[0_0_20px_4px_rgba(45,212,191,0.9)]"
        >
          {/* Laser Glow Area */}
          <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-teal-500/25 to-transparent pointer-events-none" />
          <div className="absolute -bottom-12 left-0 right-0 h-12 bg-gradient-to-b from-teal-500/25 to-transparent pointer-events-none" />
        </motion.div>

        {/* Center overlay badge with progress */}
        <div className="absolute bottom-6 left-6 right-6 z-30 bg-slate-900/90 backdrop-blur-md rounded-xl p-4 border border-teal-500/40 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold">
              <StepIcon className="h-4 w-4 text-teal-400 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="truncate">{activeStep.label}</span>
            </div>
            <span className="text-sm font-mono font-bold text-teal-300">
              {progress}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="mt-3 grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            {SCAN_STEPS.map((step, idx) => {
              const isDone = progress >= step.threshold;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-1 transition-colors ${
                    isDone ? 'text-teal-400 font-medium' : 'text-slate-600'
                  }`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      isDone ? 'bg-teal-400 shadow-[0_0_6px_#2dd4bf]' : 'bg-slate-700'
                    }`}
                  />
                  <span className="hidden sm:inline truncate">Step {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* File being scanned badge */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-teal-500/30 text-[11px] text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
          <span className="font-mono text-teal-200 truncate max-w-[200px]">
            {file ? file.name : 'Report_Document'}
          </span>
        </div>
      </div>
    </div>
  );
};
