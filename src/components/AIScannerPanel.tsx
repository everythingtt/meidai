import React from 'react';
import { Brain, Sparkles, Target, Monitor, X, AlertCircle, CheckCircle } from 'lucide-react';
import { AIAnalysis, ScanResult } from '../types';

interface AIScannerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scanHistory: ScanResult[];
  currentAnalysis: AIAnalysis | null;
  isScanning: boolean;
  error: string | null;
}

const AIScannerPanel: React.FC<AIScannerPanelProps> = ({
  isOpen,
  onClose,
  scanHistory,
  currentAnalysis,
  isScanning,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 h-full overflow-hidden flex flex-col animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Frame Scanner</h2>
              <p className="text-slate-400 text-xs">Powered by OpenRouter</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Current Analysis */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isScanning && (
            <div className="bg-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-600/30 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <Brain className="absolute inset-0 m-auto w-6 h-6 text-purple-500" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Analyzing Frame...</p>
                <p className="text-slate-400 text-sm mt-1">AI is processing the video content</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Scan Failed</p>
                <p className="text-red-300/70 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {currentAnalysis && !isScanning && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 text-sm font-medium">Scene Summary</span>
                </div>
                <p className="text-white leading-relaxed">{currentAnalysis.summary}</p>
              </div>

              {/* Scene Type */}
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">Scene Type</span>
                </div>
                <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm font-medium">
                  {currentAnalysis.scene}
                </span>
              </div>

              {/* Detected Objects */}
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">
                    Detected Objects ({currentAnalysis.objects.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {currentAnalysis.objects.map((obj, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-slate-300">{obj.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                            style={{ width: `${obj.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-slate-400 text-xs w-12 text-right">
                          {(obj.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-300 text-sm font-medium">Frame Metadata</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Resolution</p>
                    <p className="text-white font-medium">{currentAnalysis.metadata.resolution}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-xs mb-1">Aspect Ratio</p>
                    <p className="text-white font-medium">{currentAnalysis.metadata.aspectRatio}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-slate-400 text-sm font-medium mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full" />
                Scan History
              </h3>
              <div className="space-y-2">
                {scanHistory.slice().reverse().map((scan, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm font-medium truncate flex-1">
                        {scan.description.substring(0, 50)}...
                      </span>
                      <span className="text-slate-500 text-xs ml-2">{scan.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {scan.objects.length} objects detected
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-green-600/20 text-green-400 rounded-full">
                        {(scan.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!currentAnalysis && !isScanning && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-400">Click "AI Scan" to analyze the current video frame</p>
              <p className="text-slate-500 text-sm mt-2">The AI will detect objects, scenes, and more</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Model: tencent/hy3-preview:free</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIScannerPanel;
