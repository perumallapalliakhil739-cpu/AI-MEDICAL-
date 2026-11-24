import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Pill, 
  Apple, 
  AlertOctagon, 
  Calendar, 
  ChevronRight, 
  X, 
  ExternalLink,
  Layers,
  Sparkles,
  Stethoscope
} from 'lucide-react';

export const KnowledgeBasePage = () => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [activeCondition, setActiveCondition] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch conditions from backend
  useEffect(() => {
    fetch('http://localhost:8000/api/conditions')
      .then(res => res.json())
      .then(data => {
        setConditions(data || []);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default list if backend endpoint is unreachable
        setConditions([
          {
            id: 'diabetes-type-2',
            condition: 'Type 2 Diabetes Mellitus',
            specialty: 'Endocrinology & Diabetology',
            source_file: 'ICMR_STW_Type_2_Diabetes_Mellitus.pdf',
            marker_count: 7,
            medicine_count: 4,
            related_lab_markers: ['HbA1c', 'Fasting Blood Glucose', 'Postprandial Blood Glucose', 'UACR']
          },
          {
            id: 'adult-dyslipidemia',
            condition: 'Adult Dyslipidemia & Cardiovascular Risk Management',
            specialty: 'Cardiology & Preventive Medicine',
            source_file: 'ICMR_STW_Adult_Dyslipidemia_ASCVD.pdf',
            marker_count: 7,
            medicine_count: 4,
            related_lab_markers: ['Total Cholesterol', 'LDL-C', 'HDL-C', 'Triglycerides']
          },
          {
            id: 'nutritional-anemia',
            condition: 'Nutritional Anemia in Adults & Reproductive Age',
            specialty: 'Hematology & Primary Medicine',
            source_file: 'ICMR_STW_Nutritional_Anemia_Adults.pdf',
            marker_count: 9,
            medicine_count: 4,
            related_lab_markers: ['Hemoglobin', 'MCV', 'MCH', 'Serum Ferritin', 'TIBC']
          }
        ]);
        setLoading(false);
      });
  }, []);

  // Fetch full condition detail when a card is clicked
  const handleOpenDetail = async (condSummary) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`http://localhost:8000/api/conditions/${condSummary.id}`);
      if (res.ok) {
        const fullData = await res.json();
        setActiveCondition(fullData);
      } else {
        setActiveCondition(condSummary);
      }
    } catch {
      setActiveCondition(condSummary);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Specialties filter
  const specialties = ['All', ...new Set(conditions.map(c => c.specialty).filter(Boolean))];

  // Filtered conditions
  const filteredConditions = conditions.filter(c => {
    const matchesSpecialty = selectedSpecialty === 'All' || c.specialty === selectedSpecialty;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesSpecialty;

    const matchesName = c.condition?.toLowerCase().includes(query);
    const matchesFile = c.source_file?.toLowerCase().includes(query);
    const matchesMarkers = c.related_lab_markers?.some(m => String(m).toLowerCase().includes(query));

    return matchesSpecialty && (matchesName || matchesFile || matchesMarkers);
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-300">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Government of India Clinical Evidence Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ICMR Standard Treatment Workflows (STWs)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The verified clinical protocols published by the Indian Council of Medical Research (ICMR). MedScan AI benchmarks all biomarker extractions against these official workflow algorithms.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by condition, lab marker (e.g. HbA1c)..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
        </div>

        {/* Specialty Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {specialties.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedSpecialty === spec
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Conditions Cards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Activity className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading ICMR STW protocols...</p>
        </div>
      ) : filteredConditions.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">No STW conditions found</h3>
          <p className="text-xs text-slate-500 mt-1">Try a different search term or run `python backend/build_kb.py` to ingest PDFs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConditions.map((cond) => (
            <motion.div
              key={cond.id}
              whileHover={{ y: -4 }}
              onClick={() => handleOpenDetail(cond)}
              className="cursor-pointer rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500/60 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Specialty and count badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800 truncate max-w-[200px]">
                    {cond.specialty}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {cond.medicine_count || 0} Meds &bull; {cond.marker_count || 0} Markers
                  </span>
                </div>

                {/* Condition Title */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug">
                    {cond.condition}
                  </h3>
                </div>

                {/* Source PDF Name Badge (Explicit requirement) */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-xs">
                  <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Official Source Document
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                      {cond.source_file}
                    </div>
                  </div>
                </div>

                {/* Related Markers preview */}
                {cond.related_lab_markers && cond.related_lab_markers.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Related Lab Markers:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {cond.related_lab_markers.slice(0, 4).map((m, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {m}
                        </span>
                      ))}
                      {cond.related_lab_markers.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                          +{cond.related_lab_markers.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer action */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                <span>View Full STW Protocol</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL / DRAWER */}
      <AnimatePresence>
        {activeCondition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setActiveCondition(null)}
                className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {activeCondition.specialty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-rose-500" />
                    <span>Source: {activeCondition.source_file}</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {activeCondition.condition}
                </h2>
              </div>

              {/* Diagnostic Criteria */}
              {activeCondition.diagnostic_criteria && activeCondition.diagnostic_criteria.length > 0 && (
                <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 space-y-2 text-xs">
                  <h4 className="font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    <span>Diagnostic Criteria (STW Definition):</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {activeCondition.diagnostic_criteria.map((crit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">&bull;</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Investigations */}
              {activeCondition.recommended_investigations && activeCondition.recommended_investigations.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-teal-600" />
                    <span>Recommended Investigations:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCondition.recommended_investigations.map((inv, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                        {inv}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines Formulated in STW */}
              {activeCondition.medicines && activeCondition.medicines.length > 0 && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="h-4 w-4 text-purple-600" />
                    <span>Medicines Specified in ICMR STW:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeCondition.medicines.map((med, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          {med.name}
                        </div>
                        <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                          Role: {med.purpose}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          {med.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Precautions */}
              {activeCondition.lifestyle_precautions && activeCondition.lifestyle_precautions.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Apple className="h-4 w-4 text-teal-600" />
                    <span>Lifestyle &amp; Dietary Precautions:</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {activeCondition.lifestyle_precautions.map((life, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                        <span>{life}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Red Flags / Referral Triggers */}
              {activeCondition.red_flags_refer_to_doctor && activeCondition.red_flags_refer_to_doctor.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs space-y-2">
                  <h4 className="font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertOctagon className="h-4 w-4 text-rose-600" />
                    <span>Red Flags &mdash; Referral to Higher Healthcare Center:</span>
                  </h4>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {activeCondition.red_flags_refer_to_doctor.map((flag, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-600 font-bold">&bull;</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Guidelines */}
              {activeCondition.follow_up && activeCondition.follow_up.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    <span>Follow-Up &amp; Monitoring Protocol:</span>
                  </h4>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {activeCondition.follow_up.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">&bull;</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveCondition(null)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  Close Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

