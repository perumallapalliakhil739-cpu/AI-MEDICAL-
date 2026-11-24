import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  FileSearch, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  HeartHandshake, 
  FileText, 
  Clock, 
  Layers, 
  Stethoscope 
} from 'lucide-react';

export const LandingPage = () => {
  const steps = [
    {
      number: '01',
      title: 'Upload Your Report',
      description: 'Upload your lab report in PDF, JPG, or PNG format. Our intelligent OCR engine extracts biomarkers, values, and units instantly.',
      icon: Upload,
      accent: 'from-cyan-500 to-teal-500',
    },
    {
      number: '02',
      title: 'AI Scans & Cross-References',
      description: 'The AI parses out-of-range indicators and cross-references your results with verified ICMR Standard Treatment Workflows (STWs).',
      icon: FileSearch,
      accent: 'from-teal-500 to-emerald-500',
    },
    {
      number: '03',
      title: 'Get Clear Health Insights',
      description: 'Receive an easy-to-read summary of the main problem, categorized precautions, and evidence-based medicines to discuss with your doctor.',
      icon: Activity,
      accent: 'from-emerald-500 to-teal-600',
    },
  ];

  const sampleReports = [
    {
      id: 'lipid',
      title: 'Lipid Profile & ASCVD Risk',
      condition: 'Dyslipidemia / High Cholesterol',
      badge: 'ICMR STW Cardiology',
      color: 'border-teal-500/30 hover:border-teal-500',
      tagBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
    },
    {
      id: 'cbc',
      title: 'Complete Blood Count (CBC)',
      condition: 'Microcytic Anemia / Iron Deficiency',
      badge: 'ICMR STW Hematology',
      color: 'border-amber-500/30 hover:border-amber-500',
      tagBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    },
    {
      id: 'diabetes',
      title: 'HbA1c & Fasting Glucose',
      condition: 'Type 2 Diabetes Mellitus',
      badge: 'ICMR STW Endocrinology',
      color: 'border-cyan-500/30 hover:border-cyan-500',
      tagBg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -top-20 right-1/4 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="pt-12 pb-20 sm:pt-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Standardized with ICMR Treatment Workflows (STWs)</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]"
            >
              Understand your{' '}
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                medical reports
              </span>{' '}
              in plain language.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Upload any blood test, biochemistry, or pathology report. MedScan AI breaks down complex laboratory biomarkers, highlights out-of-range values, and explains precautions &amp; medicines according to verified ICMR clinical guidelines.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/upload"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Your Report</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/results?sample=lipid"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:-translate-y-0.5 transition-all"
              >
                <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Try Sample Report</span>
              </Link>
            </motion.div>

            {/* Trust points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-200/80 dark:border-slate-800 text-left"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">100% Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Instant AI Scan</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">ICMR STW 2024</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Animated Report Preview Card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-md"
            >
              {/* Glass Card Container */}
              <div className="rounded-3xl p-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-teal-500/30 shadow-2xl shadow-teal-500/10">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <Activity className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Live Medical Scanner
                      </h3>
                      <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                        Confidence 98.6% &bull; ICMR Matched
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    High Alert
                  </span>
                </div>

                {/* Sample extracted biomarkers */}
                <div className="space-y-3 mb-5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        LDL Cholesterol
                      </div>
                      <div className="text-[10px] text-slate-500">Ref: &lt;100 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        164 mg/dL
                      </div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                        High +64%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Triglycerides
                      </div>
                      <div className="text-[10px] text-slate-500">Ref: &lt;150 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        240 mg/dL
                      </div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        High +60%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        HDL (Protective)
                      </div>
                      <div className="text-[10px] text-slate-500">Ref: &gt;40 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        36 mg/dL
                      </div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        Low
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI diagnosis pill */}
                <div className="p-3.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold mb-1">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>ICMR Clinical Guidance Match</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Consistent with Mixed Dyslipidemia. Recommended doctor discussion for moderate-intensity Statin therapy and dietary reduction of saturated fats.
                  </p>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-5 -right-5 bg-gradient-to-tr from-teal-600 to-cyan-500 text-white px-4 py-2 rounded-2xl shadow-xl shadow-teal-600/30 text-xs font-semibold flex items-center gap-2"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Doctor-Ready Summary</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
              Three-Step Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              From Lab Paper to Understandable Guidance
            </h3>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              No medical jargon. No confusion. Just clear, structured insights aligned with Indian Council of Medical Research (ICMR) clinical protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="relative rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all group"
                >
                  {/* Step number badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-tr ${step.accent} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-3xl font-black font-mono text-slate-200 dark:text-slate-800 group-hover:text-teal-500/30 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Preset Demo Reports Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">
              Instant Demonstrations
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Sample Clinical Analyses
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Don&apos;t have a file ready right now? Test MedScan AI using realistic clinical lab panels.
            </p>
          </div>
          <Link
            to="/upload"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
          >
            <span>Scan custom file</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleReports.map((report) => (
            <Link
              key={report.id}
              to={`/results?sample=${report.id}`}
              className={`block p-6 rounded-2xl bg-white dark:bg-slate-900 border ${report.color} shadow-sm hover:shadow-lg transition-all group`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${report.tagBg}`}>
                  {report.badge}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {report.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Clinical Condition: <span className="font-semibold text-slate-700 dark:text-slate-300">{report.condition}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

