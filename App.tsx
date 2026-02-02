
import React, { useState, useCallback } from 'react';
import { extractFrames } from './utils/videoProcessor';
import { analyzeFilmFrames } from './services/geminiService';
import { AnalysisState, FilmAnalysis } from './types';
import AnalysisDashboard from './components/AnalysisDashboard';
import { Upload, Film, PlayCircle, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    result: null,
    error: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit for demo
        setState(prev => ({ ...prev, error: "File too large. Please upload a video under 50MB." }));
        return;
      }
      setFile(selectedFile);
      setVideoUrl(URL.createObjectURL(selectedFile));
      setState(prev => ({ ...prev, result: null, error: null }));
    }
  };

  const runAnalysis = async () => {
    if (!file) return;

    setState(prev => ({ ...prev, isAnalyzing: true, progress: 10, error: null }));

    try {
      // Step 1: Extract frames
      setState(prev => ({ ...prev, progress: 30 }));
      const frames = await extractFrames(file, 12);
      
      // Step 2: Call Gemini
      setState(prev => ({ ...prev, progress: 60 }));
      const analysisResult = await analyzeFilmFrames(frames, file.name);

      setState({
        isAnalyzing: false,
        progress: 100,
        result: analysisResult,
        error: null
      });
    } catch (err: any) {
      console.error(err);
      setState({
        isAnalyzing: false,
        progress: 0,
        result: null,
        error: err.message || "Failed to analyze video. Please try again."
      });
    }
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setState({
      isAnalyzing: false,
      progress: 0,
      result: null,
      error: null
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">CINEMETRICS <span className="text-indigo-500">AI</span></span>
          </div>
          <div className="hidden md:block text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Experimental Cinematic Engine v1.0
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12">
        {!state.result ? (
          <div className="max-w-4xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center space-y-12">
            <div className="space-y-6">
              <h1 className="serif text-5xl md:text-7xl text-white leading-tight">
                Decode the <span className="italic text-zinc-400">Cinematic</span> DNA.
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Upload your film or scene for deep multimodal analysis. Extract shot length statistics, color theory breakdowns, and auditory atmosphere profiles.
              </p>
            </div>

            <div className="w-full max-w-lg">
              {!file ? (
                <div className="relative group">
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-700 rounded-3xl bg-zinc-900/20 cursor-pointer group-hover:bg-zinc-900/40 group-hover:border-indigo-500 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-4 bg-zinc-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-400" />
                      </div>
                      <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-zinc-500">MP4, MOV or AVI (Max 50MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6 space-y-6">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                    <video 
                      src={videoUrl!} 
                      className="w-full h-full object-contain" 
                      controls 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-left overflow-hidden">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={reset}
                      className="text-xs text-zinc-500 hover:text-white underline"
                    >
                      Change File
                    </button>
                  </div>
                  
                  <button
                    disabled={state.isAnalyzing}
                    onClick={runAnalysis}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                      state.isAnalyzing 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    {state.isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing cinematic structure...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze Sequence
                      </>
                    )}
                  </button>

                  {state.isAnalyzing && (
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{ width: `${state.progress}%` }} 
                      />
                    </div>
                  )}
                </div>
              )}

              {state.error && (
                <div className="mt-6 flex items-center gap-2 p-4 bg-red-900/20 border border-red-900/50 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {state.error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <AnalysisDashboard analysis={state.result} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-zinc-600 text-xs uppercase tracking-widest">
        © {new Date().getFullYear()} Cinemetrics AI. Powered by Gemini Pro Vision.
      </footer>
    </div>
  );
};

export default App;
