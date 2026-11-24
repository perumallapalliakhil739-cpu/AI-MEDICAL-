import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  FileCheck,
  Server,
  KeyRound,
  RotateCcw,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ScanAnimation } from '../components/ScanAnimation';
import { dummyReports } from '../data/dummyReports';
import { saveScanToHistory } from '../utils/scanHistory';

export const UploadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanComplete, setIsScanComplete] = useState(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState('lipid');
  const [errorMsg, setErrorMsg] = useState('');
  const [backendStatus, setBackendStatus] = useState({ checked: false, online: false, keyConfigured: false, model: '' });

  // Probe backend on mount or when retried
  const checkBackendHealth = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/health');
      if (res.ok) {
        const data = await res.json();
        setBackendStatus({
          checked: true,
          online: data.status === 'online',
          keyConfigured: data.gemini_api_key_configured,
          model: data.model || '',
        });
      } else {
        setBackendStatus({ checked: true, online: false, keyConfigured: false, model: '' });
      }
    } catch {
      setBackendStatus({ checked: true, online: false, keyConfigured: false, model: '' });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Handle preset sample selection
  const handleSelectPreset = (key) => {
    setSelectedPresetKey(key);
    const preset = dummyReports[key];
    setFile({
      name: preset.fileName,
      size: preset.fileSize,
      type: preset.fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png',
      isPreset: true,
      presetKey: key,
    });
    setFilePreview(null);
    setErrorMsg('');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const hasValidExt = validExts.some(ext => selectedFile.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(selectedFile.type) && !hasValidExt) {
      setErrorMsg('Please upload a PDF or image file (JPG, PNG, WebP).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg(`File size exceeds 10 MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB). Please upload a smaller file.`);
      return;
    }

    setErrorMsg('');
    const formattedSize = (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB';
    setFile({
      name: selectedFile.name,
      size: formattedSize,
      type: selectedFile.type || 'application/pdf',
      rawFile: selectedFile,
      isPreset: false,
    });

    if (selectedFile.type && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartScan = async () => {
    if (!file) {
      setErrorMsg('Please select or drop a medical report first.');
      return;
    }

    setErrorMsg('');
    setIsScanning(true);
    setIsScanComplete(false);

    // If it's a real user-uploaded file, send it to the FastAPI backend
    if (file.rawFile) {
      const formData = new FormData();
      formData.append('file', file.rawFile);

      // 120-second AbortController timeout for AI vision + STW analysis
      const controller = new AbortController();
      let didTimeout = false;
      const timeoutTimer = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, 120000);

      try {
        const response = await fetch('http://localhost:8000/api/scan', {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutTimer);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setIsScanning(false);
          const serverError = data.error || data.detail || `Server returned error (${response.status}: ${response.statusText || 'Error'})`;
          console.error('[MedScan Scan Error] POST /api/scan failed:', {
            status: response.status,
            statusText: response.statusText,
            error: data.error,
            detail: data.detail,
            responseBody: data,
          });
          setErrorMsg(serverError);
          return;
        }

        // Successfully extracted!
        setIsScanComplete(true);
        const scanPayload = {
          ...data,
          fileName: file.name,
          fileSize: file.size,
          isLiveScan: true,
        };

        // Save to browser's privacy-first local history
        saveScanToHistory(scanPayload);

        // Cache in sessionStorage
        sessionStorage.setItem('medscan_latest_scan', JSON.stringify(scanPayload));

        // Wait a brief moment to show 100% and transition
        setTimeout(() => {
          navigate('/results', { state: { scanResult: scanPayload } });
        }, 500);

      } catch (err) {
        clearTimeout(timeoutTimer);
        setIsScanning(false);
        console.error('[MedScan Scan Error] Exception during scan request:', err);

        if (didTimeout || err.name === 'AbortError') {
          setErrorMsg(
            'The scan request timed out after 120 seconds. The Gemini AI service may be experiencing high demand or the file is very large. Please click "Try again".'
          );
        } else {
          setErrorMsg(
            `Could not connect to backend server at http://localhost:8000 (${err.message || 'Network error'}). Make sure the FastAPI server is running.`
          );
        }
      }
    } else {
      // User selected a sample preset: simulate scan and load preset
      setTimeout(() => {
        setIsScanComplete(true);
        setTimeout(() => {
          const key = file.presetKey || selectedPresetKey || 'lipid';
          const preset = dummyReports[key];
          if (preset) {
            saveScanToHistory({
              report_type: preset.reportTitle,
              report_date: preset.reportDate,
              lab_name: preset.labName,
              fileName: preset.fileName,
              tests: (preset.abnormalValues || []).map(v => ({
                name: v.name,
                value: v.value,
                unit: v.unit,
                reference_range: v.reference,
                status: (v.status || 'unknown').toLowerCase(),
              })),
              analysis: preset.analysis,
              isSample: true,
            });
          }
          navigate(`/results?sample=${key}`);
        }, 500);
      }, 1800);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Backend unreachable warning banner */}
      {backendStatus.checked && !backendStatus.online && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Backend Service Unreachable</p>
              <p className="text-xs text-amber-700/90 dark:text-amber-300/90">
                Cannot connect to <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">http://localhost:8000/api/health</code>. Live report scanning is offline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={checkBackendHealth}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </motion.div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gemini AI Multimodal Vision Ready</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload Your Medical Report
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Upload your pathology or biochemistry report (PDF, JPG, PNG &le; 10MB). Google Gemini Vision reads the report and extracts test parameters with zero disk persistence.
        </p>

        {/* Backend Connectivity Status Indicator */}
        {backendStatus.checked && (
          <div className="mt-4 flex items-center justify-center gap-3 text-xs">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
              backendStatus.online 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              <Server className="h-3 w-3" />
              <span>Backend (Port 8000): {backendStatus.online ? 'Connected' : 'Offline'}</span>
            </div>

            {backendStatus.online && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                backendStatus.keyConfigured
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                <KeyRound className="h-3 w-3" />
                <span>Gemini API Key: {backendStatus.keyConfigured ? 'Configured' : 'Missing in .env'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isScanning ? (
          /* Scanning Screen Mode */
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="space-y-6"
          >
            <div className="text-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-teal-600 dark:text-teal-400">
                Gemini Vision Extraction
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Reading &amp; Analyzing Report...
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Processing document in memory and extracting clinical biomarker parameters.
              </p>
            </div>

            <ScanAnimation file={file} isComplete={isScanComplete} />
          </motion.div>
        ) : (
          /* Normal Upload State */
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Sample Preset Selector Pills for instant testing */}
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-slate-900/60 border border-teal-200/80 dark:border-teal-900/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                <span className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Don&apos;t have a file ready? Click a sample report to test:</span>
                </span>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  Instant Realistic Panels
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('lipid')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    file?.presetKey === 'lipid'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <div className="text-xs font-bold">Lipid Profile (PDF)</div>
                  <div className={`text-[10px] mt-0.5 ${file?.presetKey === 'lipid' ? 'text-teal-100' : 'text-slate-500'}`}>
                    High Cholesterol / ASCVD Risk
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('cbc')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    file?.presetKey === 'cbc'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <div className="text-xs font-bold">CBC Hemogram (PNG)</div>
                  <div className={`text-[10px] mt-0.5 ${file?.presetKey === 'cbc' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Low Hemoglobin / Anemia
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('diabetes')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    file?.presetKey === 'diabetes'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <div className="text-xs font-bold">HbA1c Glucose (PDF)</div>
                  <div className={`text-[10px] mt-0.5 ${file?.presetKey === 'diabetes' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Type 2 Diabetes Screening
                  </div>
                </button>
              </div>
            </div>

            {/* Error banner with Try Again button */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block">Scan Request Notice</span>
                    <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300">{errorMsg}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setErrorMsg('')}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Try again</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Drag & Drop Card */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-3xl p-10 sm:p-14 border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/20 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-teal-500/70 bg-white/70 dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileInput}
              />

              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-teal-500/10 to-cyan-500/20 dark:from-teal-500/20 dark:to-cyan-500/20 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 shadow-inner">
                <Upload className="h-8 w-8 animate-bounce" style={{ animationDuration: '2.5s' }} />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                Drag &amp; drop your report here, or{' '}
                <span className="text-teal-600 dark:text-teal-400 underline decoration-teal-500/40">
                  browse files
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm">
                Supports PDF, JPG, or PNG files up to 10MB. Processed strictly in-memory without saving to disk.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-medium">
                  PDF (max 10MB)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-medium">
                  JPG / JPEG
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-medium">
                  PNG / WebP
                </span>
              </div>
            </div>

            {/* Uploaded File Preview Card (if file chosen) */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-teal-500/40 shadow-lg shadow-teal-500/5 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Thumbnail / Icon */}
                  <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : file.type === 'application/pdf' ? (
                      <FileText className="h-7 w-7 text-rose-500" />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-teal-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </span>
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Size: {file.size}</span>
                      <span>&bull;</span>
                      <span className="text-teal-600 dark:text-teal-400 font-medium">
                        {file.rawFile ? 'Ready for Gemini API scan' : 'Preset sample ready'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove file"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-600/30 hover:-translate-y-0.5 transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Scan Report</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bottom Security / Clinical Guarantee Note */}
            <div className="p-4 rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Zero-Storage Memory Policy:
                </span>{' '}
                Files submitted to the backend API are streamed directly to Google Gemini Vision in memory and are discarded immediately after response synthesis. No files are ever saved to disk.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
