import React, { useState, useEffect } from 'react';
import {
  Download,
  FolderOpen,
  FolderPlus,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  ArrowRight,
  X,
  Copy,
  Check,
  Chrome,
  Terminal,
  HelpCircle,
  Sparkles,
  Archive,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';

interface DownloadExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadExtensionModal: React.FC<DownloadExtensionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingDirectory, setIsSavingDirectory] = useState(false);
  const [savedDirectoryName, setSavedDirectoryName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const hasFileSystemAccess = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  // Listen for confirmation message from standalone top-level folder saver window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OMEGA_EXTENSION_SAVED_DIR') {
        setSavedDirectoryName(event.data.dirName);
        setSaveStatus('success');
        setStatusMessage(
          `Successfully saved and unpacked all files into "${event.data.dirName}"! You can now click "Load unpacked" in chrome://extensions and select that folder.`
        );
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isOpen) return null;

  // 1. Direct directory picker save via File System Access API (or top-level standalone window when inside cross-origin iframe)
  const handleSaveToDirectory = async () => {
    // When inside an iframe preview, cross-origin restrictions block window.showDirectoryPicker.
    // Opening a dedicated top-level window provides full native File System Access without cross-origin blocks.
    if (isInIframe) {
      setIsSavingDirectory(true);
      setSaveStatus('idle');
      setStatusMessage('Opening top-level folder picker window...');

      try {
        const popup = window.open(
          '/save-extension-folder.html',
          'SaveOmegaExtension',
          'width=620,height=680,resizable=yes,scrollbars=yes'
        );

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          // If popup is blocked by the browser, fallback or show direct open link
          setStatusMessage(
            'Popup was blocked by your browser. Please click the "Open Folder Saver Window" link below to choose your destination directory.'
          );
        } else {
          popup.focus();
          setStatusMessage(
            'Opened folder picker in a top-level window. Click "Select Folder & Save" in the popup to choose your destination directory.'
          );
        }
      } catch (err: any) {
        console.warn('Popup open notice:', err);
        await handleDownloadZipFallback(
          'omega-chrome-extension.zip downloaded! (Browser popup was prevented; extract this .zip file to any folder and load it into Chrome).'
        );
      } finally {
        setIsSavingDirectory(false);
      }
      return;
    }

    // Top-level execution (when app is opened directly in a browser tab)
    if (!('showDirectoryPicker' in window)) {
      handleDownloadZipFallback(
        'Direct folder saving is only supported in Chromium browsers. Downloading full .zip archive instead.'
      );
      return;
    }

    setIsSavingDirectory(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      // 1. Ask user to pick the folder where they want the extension files saved
      // @ts-ignore
      const parentHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });

      setStatusMessage('Creating extension directory and saving files...');

      // 2. Fetch the extension zip from the backend
      const res = await fetch('/api/extension/download-zip');
      if (!res.ok) {
        throw new Error('Failed to fetch extension files from server');
      }

      const blob = await res.blob();
      const zip = await JSZip.loadAsync(blob);

      // Create "omega-extension" subfolder inside user's selected folder
      const extFolderHandle = await parentHandle.getDirectoryHandle('omega-extension', {
        create: true,
      });

      // Helper recursive function to write files into FileSystemDirectoryHandle
      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue; // Skip directory entries

        const pathParts = relativePath.split('/');
        let currentDir = extFolderHandle;

        // Traverse / create subdirectories (e.g., icons/)
        for (let i = 0; i < pathParts.length - 1; i++) {
          currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create: true });
        }

        const fileName = pathParts[pathParts.length - 1];
        const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
        // @ts-ignore
        const writable = await fileHandle.createWritable();

        const fileData = await zipEntry.async('uint8array');
        await writable.write(fileData);
        await writable.close();
      }

      setSavedDirectoryName(`${parentHandle.name}/omega-extension`);
      setSaveStatus('success');
      setStatusMessage(`Successfully extracted and saved all files into "${parentHandle.name}/omega-extension"! You can now click "Load unpacked" in chrome://extensions and select that folder.`);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled directory selection dialog
        setStatusMessage('Directory selection was cancelled.');
      } else {
        console.warn('Directory write error, opening top-level helper window:', err);
        window.open('/save-extension-folder.html', '_blank');
        setStatusMessage('Opened top-level folder picker window to bypass sandbox restrictions.');
      }
    } finally {
      setIsSavingDirectory(false);
    }
  };

  // 2. Standard Download as Zip
  const handleDownloadZipFallback = async (customMsg?: string) => {
    setIsDownloading(true);
    setSaveStatus('idle');
    if (customMsg) setStatusMessage(customMsg);

    try {
      const response = await fetch('/api/extension/download-zip');
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'omega-chrome-extension.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSaveStatus('success');
      setStatusMessage(
        customMsg ||
          'omega-chrome-extension.zip downloaded! Extract it to your preferred directory, then load unpacked in chrome://extensions.'
      );
    } catch (e: any) {
      setSaveStatus('error');
      setStatusMessage(e.message || 'Download failed.');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(label);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 shrink-0" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-zinc-800 flex items-start justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl shrink-0">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100">Download Omega Chrome Extension</h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                  Manifest V3
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Save the complete unpacked extension folder to your computer to install into Google Chrome
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Download Zip Card */}
            <div className={`p-4 rounded-xl bg-zinc-950 border flex flex-col justify-between space-y-3 transition-colors ${
              isInIframe ? 'border-emerald-500/40 bg-emerald-500/[0.03]' : 'border-zinc-800 hover:border-zinc-700'
            }`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Archive className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    1-Click Download
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100">Download Extension (.zip)</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Download <code className="text-zinc-300 font-mono">omega-chrome-extension.zip</code> directly to your computer. Extract it to any folder, then load unpacked in Chrome.
                </p>
              </div>

              <button
                onClick={() => handleDownloadZipFallback()}
                disabled={isDownloading || isSavingDirectory}
                className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Downloading ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download (.zip) Archive</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Folder Pick Card */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-blue-500/30 hover:border-blue-500/50 bg-blue-500/[0.02] flex flex-col justify-between space-y-3 relative overflow-hidden group transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                    <span>Direct Folder Save</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100">Choose Location & Save</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Pick a folder on your computer (e.g. <code className="text-zinc-300 font-mono">Documents</code>). Unpacks the ready-to-use <code className="text-blue-400 font-mono">omega-extension</code> directory directly to your drive.
                </p>
              </div>

              <button
                onClick={handleSaveToDirectory}
                disabled={isSavingDirectory || isDownloading}
                className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingDirectory ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Opening Folder Saver...</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-4 h-4" />
                    <span>Choose Location & Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                saveStatus === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : saveStatus === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              }`}
            >
              {saveStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : saveStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                <div>{statusMessage}</div>
                {isInIframe && saveStatus !== 'success' && (
                  <div className="mt-2">
                    <a
                      href="/save-extension-folder.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-medium text-[11px] transition-colors"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Click here if folder saver didn't open automatically</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step-by-Step Installation Guide */}
          <div className="space-y-3 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <h4 className="text-xs font-mono uppercase font-bold text-zinc-300 flex items-center gap-1.5">
              <Chrome className="w-3.5 h-3.5 text-blue-400" />
              <span>3-Step Installation in Chrome</span>
            </h4>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-300 font-medium">Open Chrome Extensions manager</p>
                    <button
                      onClick={() => copyToClipboard('chrome://extensions', 'chrome_url')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono cursor-pointer"
                    >
                      {copiedStep === 'chrome_url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedStep === 'chrome_url' ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <p className="text-zinc-400">
                    Navigate to <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-blue-300 font-mono select-all">chrome://extensions</code> in your Chrome browser.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div className="flex-1">
                  <p className="text-zinc-300 font-medium">Toggle "Developer mode"</p>
                  <p className="text-zinc-400">
                    Switch the <strong className="text-zinc-200">Developer mode</strong> toggle located in the top-right corner of the Extensions page to ON.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div className="flex-1">
                  <p className="text-zinc-300 font-medium">Click "Load unpacked"</p>
                  <p className="text-zinc-400">
                    Click the <strong className="text-zinc-200">"Load unpacked"</strong> button in the top-left corner and select the saved <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 font-mono">{savedDirectoryName || 'omega-extension'}</code> folder.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Directory Contents Breakdown */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
              Included Extension Files:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-400">
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">manifest.json</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate">background.js</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">content.js</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                <span className="truncate">popup.html/js</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Pre-configured with your cloud URL</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
