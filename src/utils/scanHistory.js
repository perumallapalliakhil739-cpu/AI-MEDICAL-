const STORAGE_KEY = 'medscan_history';
const MAX_HISTORY = 30;

export const getScanHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read scan history from localStorage:', err);
    return [];
  }
};

export const saveScanToHistory = (scanPayload) => {
  if (!scanPayload) return null;
  try {
    const current = getScanHistory();
    // Exclude large binary/preview files to keep storage privacy-first and lightweight
    const { rawFile, filePreview, ...cleanData } = scanPayload;

    const tests = cleanData.tests || [];
    const abnormalCount = tests.filter(t => {
      const s = String(t.status || '').toLowerCase().trim();
      return s === 'high' || s === 'low';
    }).length;

    const entry = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      fileName: cleanData.fileName || 'Lab_Report',
      reportType: cleanData.report_type || cleanData.fileName || 'Clinical Pathology Report',
      reportDate: cleanData.report_date || new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      labName: cleanData.lab_name || null,
      abnormalCount,
      totalCount: tests.length,
      urgentAlert: cleanData.analysis?.urgent_alert || null,
      scanData: cleanData,
    };

    const updated = [entry, ...current.filter(item => item.id !== entry.id)].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (err) {
    console.error('Failed to save scan to localStorage history:', err);
    return null;
  }
};

export const deleteScanFromHistory = (id) => {
  try {
    const current = getScanHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return [];
  }
};

export const clearAllHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear scan history:', err);
    return [];
  }
};

