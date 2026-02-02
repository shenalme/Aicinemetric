
import React, { useState } from 'react';
import { extractFrames } from './utils/videoProcessor';
import { analyzeFilmFrames } from './services/geminiService';
import { AnalysisState, FilmAnalysis } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import { Upload, Film, Loader2, Sparkles, AlertCircle, PlayCircle } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractedFrames, setExtractedFrames] = useState<{ data: string; timestamp: number }[]>([]);
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    result: null,
    error: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) { // Increased to 100MB
        setState(prev => ({ ...prev, error: "File too large. Please upload a video under 100MB." }));
        return;
      }
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setState(prev => ({ ...prev, result: null, error: null }));
      setExtractedFrames([]);
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setState(prev => ({ ...prev, isAnalyzing: true, progress: 5, error: null }));

    try {
      // Step 1: Extract frames (more frames for better analysis)
      setState(prev => ({ ...prev, progress: 20 }));
      const frames = await extractFrames(file, 16);
      setExtractedFrames(frames);
      
      // Step 2: Call Gemini
      setState(prev => ({ ...prev, progress: 50 }));
      const analysisResult = await analyzeFilmFrames(frames, file.name);

      // Add frames to the result for display in the dashboard
      const finalResult: FilmAnalysis = {
        ...analysisResult,
        frames: frames
      };

      setState({
        isAnalyzing: false,
        progress: 100,
        result: finalResult,
        error: null
      });
    } catch (err: any) {
      console.error(err);
      setState({
        isAnalyzing: false,
        progress: 0,
        result: null,
        error: err.message || "The AI encounterted an error while decoding this file. Please check your internet and try again."
      });
    }
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setExtractedFrames([]);
    setState({
      isAnalyzing: false,
      progress: 0,
      result: null,
      error: null
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-indigo-500/30 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 py-5 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-[-0.05em] text-white">CINEMETRICS <span className="text-zinc-600 font-light">CORE</span></span>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Architecture</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-20">
        {!state.result ? (
          <div className="max-w-5xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center space-y-16">
            <div className="space-y-8 animate-in fade-in duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-4">
                <Sparkles className="w-3 h-3" /> Next-Gen Video Analysis
              </div>
              <h1 className="serif text-6xl md:text-8xl text-white leading-[0.9] font-bold tracking-tighter">
                Visual Intelligence <br/><span className="italic text-zinc-500">for Modern Cinema.</span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                Unlock the hidden architecture of your film. Get automated shot pacing, color profiles, and sensory breakdown in seconds.
              </p>
            </div>

            <div className="w-full max-w-xl">
              {!file ? (
                <div className="relative group p-1 bg-gradient-to-br from-indigo-500/20 via-transparent to-pink-500/20 rounded-[3rem]">
                  <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-zinc-800 rounded-[2.8rem] bg-zinc-950/80 cursor-pointer group-hover:bg-zinc-900/40 group-hover:border-indigo-500/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-5 bg-zinc-900 rounded-2xl mb-5 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 transition-all border border-white/5">
                        <Upload className="w-8 h-8 text-zinc-500 group-hover:text-white" />
                      </div>
                      <p className="mb-2 text-lg font-medium text-white">Drop your sequence here</p>
                      <p className="text-xs text-zinc-500 tracking-wide uppercase font-bold">MP4 // MOV // AVI (UP TO 100MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="bg-zinc-900/50 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-8 space-y-8 backdrop-blur-xl animate-in zoom-in-95 duration-500">
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black group">
                    <video 
                      src={videoUrl!} 
                      className="w-full h-full object-contain" 
                      controls 
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="text-left">
                      <p className="text-white font-bold truncate max-w-[250px]">{file.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">SIZE: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={reset}
                      className="text-xs text-zinc-500 hover:text-white font-bold uppercase tracking-widest border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
                    >
                      Swap Source
                    </button>
                  </div>
                  
                  <button
                    disabled={state.isAnalyzing}
                    onClick={runAnalysis}
                    className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl ${
                      state.isAnalyzing 
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-600/40'
                    }`}
                  >
                    {state.isAnalyzing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Generating Insight...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-6 h-6" />
                        Execute Analysis
                      </>
                    )}
                  </button>

                  {state.isAnalyzing && (
                    <div className="space-y-3">
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-700 ease-out" 
                          style={{ width: `${state.progress}%` }} 
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Status: Processing Multimodal Data</span>
                        <span>{state.progress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {state.error && (
                <div className="mt-8 flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in shake duration-500">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div className="text-left">
                    <p className="font-bold uppercase tracking-tighter">System Alert</p>
                    <p className="opacity-80">{state.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AnalysisDashboard analysis={state.result} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 hover:opacity-100 transition-opacity">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} Cinemetrics Core Engine // Build 1.0.42
          </div>
          <div className="flex gap-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>Powered by Gemini 3 Flash</span>
            <span>Privacy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
