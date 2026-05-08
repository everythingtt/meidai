import { useState, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import AIScannerPanel from './components/AIScannerPanel';
import { aiScanner } from './services/aiScanner';
import { AIAnalysis, ScanResult, VideoSource } from './types';
import { Video, Zap, Globe, Brain, Github, ExternalLink } from 'lucide-react';

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // CDN video sources for demonstration
  const videoSources: VideoSource[] = [
    { quality: '1080p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', type: 'video/mp4' },
    { quality: '720p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', type: 'video/mp4' },
    { quality: '480p', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', type: 'video/mp4' }
  ];

  const primaryVideo = videoSources[0].url;

  const handleFrameCapture = useCallback(async (videoElement: HTMLVideoElement) => {
    setIsScanning(true);
    setError(null);
    setIsPanelOpen(true);

    try {
      const base64Frame = aiScanner.captureVideoFrame(videoElement);
      const analysis = await aiScanner.analyzeFrame(base64Frame);
      
      setCurrentAnalysis(analysis);
      
      const timestamp = new Date().toLocaleTimeString();
      const newScan: ScanResult = {
        timestamp,
        description: analysis.summary,
        objects: analysis.objects.map(obj => obj.name),
        confidence: analysis.objects.length > 0 
          ? analysis.objects.reduce((acc, obj) => acc + obj.confidence, 0) / analysis.objects.length 
          : 0
      };
      
      setScanHistory(prev => [...prev, newScan]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsScanning(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-600 to-purple-600 rounded-xl">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CDN Video Player</h1>
              <p className="text-slate-400 text-sm">with Built-in AI Scanner</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">CDN Ready</span>
            </div>
            <button 
              onClick={() => setIsPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Scanner</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Video Player Section */}
        <div className="mb-8">
          <div className="aspect-video max-w-5xl mx-auto">
            <VideoPlayer
              src={primaryVideo}
              sources={videoSources}
              onFrameCapture={handleFrameCapture}
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">CDN Optimized</h3>
            <p className="text-slate-400 text-sm">
              Multi-quality sources with automatic fallback. Designed for global CDN distribution with edge caching support.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">AI Frame Scanner</h3>
            <p className="text-slate-400 text-sm">
              Powered by OpenRouter with advanced vision models. Detect objects, analyze scenes, and extract metadata in real-time.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Real-time Analysis</h3>
            <p className="text-slate-400 text-sm">
              Instant frame capture and analysis. Track scan history and export results for content moderation or indexing.
            </p>
          </div>
        </div>

        {/* Video Sources */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Available CDN Sources
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-3 px-4">Quality</th>
                  <th className="text-left py-3 px-4">Source URL</th>
                  <th className="text-left py-3 px-4">Type</th>
                </tr>
              </thead>
              <tbody>
                {videoSources.map((source, index) => (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded font-medium">
                        {source.quality}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs truncate max-w-md">
                      {source.url}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {source.type || 'video/mp4'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* AI Scanner Panel */}
      <AIScannerPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        scanHistory={scanHistory}
        currentAnalysis={currentAnalysis}
        isScanning={isScanning}
        error={error}
      />

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Video className="w-4 h-4" />
            <span>CDN Video Player with AI Scanner</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
          <p className="text-slate-500 text-xs">
            Powered by OpenRouter • Model: tencent/hy3-preview:free
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
