
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Line
} from 'recharts';
import { FilmAnalysis } from '../types';
import { Download, FileVideo, Music, Layout, Palette, Clock, Info, Aperture, Layers } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  analysis: FilmAnalysis;
}

const AnalysisDashboard: React.FC<Props> = ({ analysis }) => {
  const downloadPDF = async () => {
    const element = document.getElementById('analysis-report');
    if (!element) return;
    
    const canvas = await html2canvas(element, { 
      scale: 2, 
      backgroundColor: '#0a0a0a',
      useCORS: true,
      logging: false
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${analysis.title.replace(/\s+/g, '_')}_Cinematics.pdf`);
  };

  const shotData = analysis.shots.map(s => ({
    name: `S${s.id}`,
    duration: s.duration,
    asl: analysis.asl
  }));

  const getAslCategory = (asl: number) => {
    if (asl < 3) return { label: "High-Octane", color: "text-red-400", desc: "Similar to modern action films (Mad Max, Bourne)." };
    if (asl < 6) return { label: "Contemporary", color: "text-amber-400", desc: "Standard Hollywood blockbuster pacing." };
    if (asl < 10) return { label: "Measured", color: "text-emerald-400", desc: "Classic drama or suspense pacing." };
    return { label: "Contemplative", color: "text-indigo-400", desc: "Slow cinema / Art-house style (Tarkovsky, Ozu)." };
  };

  const aslInfo = getAslCategory(analysis.asl);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-indigo-400 mb-2">
            <Aperture className="w-5 h-5 animate-spin-slow" />
            <span className="uppercase tracking-[0.3em] text-xs font-bold">Comprehensive Analysis</span>
          </div>
          <h1 className="serif text-5xl md:text-7xl text-white font-bold leading-none">{analysis.title}</h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            Index: {new Date().toLocaleDateString()} // ML-MODEL: GEMINI-3-FLASH
          </p>
        </div>
        <button 
          onClick={downloadPDF}
          className="group flex items-center gap-3 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1"
        >
          <Download className="w-5 h-5 group-hover:bounce" /> Export Cinematic Report
        </button>
      </div>

      <div id="analysis-report" className="space-y-10 bg-black/40 p-2 md:p-6 rounded-[2.5rem]">
        
        {/* Cinematic Pulse (Barcode) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="serif text-xl text-white">Cinematic Pulse</h3>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Color Chronology</span>
          </div>
          <div className="h-24 w-full rounded-2xl overflow-hidden flex shadow-2xl border border-white/5">
            {analysis.shots.map((shot, idx) => (
              <div 
                key={idx} 
                className="h-full flex-grow transition-all hover:scale-y-110 hover:z-10" 
                style={{ 
                  backgroundColor: shot.colors[0],
                  width: `${(shot.duration / analysis.shots.reduce((acc, s) => acc + s.duration, 0)) * 100}%` 
                }}
                title={`Shot ${shot.id}: ${shot.colors[0]}`}
              />
            ))}
          </div>
        </section>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Clock className="text-indigo-400" />} 
            label="Average Shot Length" 
            value={`${analysis.asl.toFixed(2)}s`} 
            badge={aslInfo.label}
            badgeColor={aslInfo.color}
            desc={aslInfo.desc}
          />
          <StatCard 
            icon={<Layers className="text-emerald-400" />} 
            label="Discontinuity Count" 
            value={analysis.totalShots.toString()} 
            desc="Total visual cuts detected in sequence."
          />
          <StatCard 
            icon={<Palette className="text-pink-400" />} 
            label="Thematic Palette" 
            value={analysis.dominantColors.length.toString()} 
            desc="Key color anchors defining the visual mood."
          />
        </div>

        {/* Visual Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shot Duration Chart */}
          <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="serif text-2xl text-white">Rhythm & Pace</h3>
              <Clock className="w-5 h-5 text-indigo-500/50" />
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={shotData}>
                  <defs>
                    <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area type="monotone" dataKey="duration" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDur)" />
                  <Line type="monotone" dataKey="asl" stroke="#f43f5e" strokeDasharray="8 4" dot={false} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Extracted Frames Gallery */}
          {analysis.frames && (
            <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="serif text-2xl text-white">Visual Sample</h3>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Frames 1-{analysis.frames.length}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {analysis.frames.slice(0, 9).map((frame, i) => (
                  <div key={i} className="aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-white/5 group relative">
                    <img 
                      src={`data:image/jpeg;base64,${frame.data}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={`Frame ${i}`} 
                    />
                    <div className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[8px] text-white font-mono">
                      {frame.timestamp.toFixed(1)}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audio atmosphere */}
        <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3 space-y-4">
              <div className="flex items-center gap-3">
                <Music className="w-8 h-8 text-amber-500" />
                <h3 className="serif text-3xl text-white">Aural Texture</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-4">
                "{analysis.audio.musicDescription}"
              </p>
              <div className="pt-4">
                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-widest">Dominant Mood</span>
                <p className="text-xl text-amber-200 font-medium tracking-tight uppercase italic">{analysis.audio.mood}</p>
              </div>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {analysis.audio.keyEvents.map((evt, idx) => (
                <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold mb-3">
                    0{idx + 1}
                  </div>
                  <p className="text-sm text-zinc-300">{evt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown List */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <Layout className="w-6 h-6 text-emerald-400" />
            <h3 className="serif text-3xl text-white">Shot Syntax</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.shots.map(shot => (
              <div key={shot.id} className="bg-zinc-900/30 border border-white/5 p-6 rounded-[1.5rem] hover:bg-zinc-900/60 transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-[10px] text-zinc-500">SHOT_ID: {shot.id}</span>
                  <div className="flex gap-1">
                    {shot.colors.map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <h4 className="text-white font-medium mb-4 group-hover:text-emerald-400 transition-colors">{shot.description}</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase tracking-tighter">Movement</span>
                    <span className="text-zinc-300 font-medium">{shot.cameraMovement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 uppercase tracking-tighter">Duration</span>
                    <span className="text-indigo-400 font-bold">{shot.duration.toFixed(1)}s</span>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-zinc-400 leading-snug">
                    <strong className="text-zinc-500 block text-[9px] uppercase mb-1">Composition Notes</strong>
                    {shot.composition}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <div className="bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/20 p-12 rounded-[3rem] text-center max-w-4xl mx-auto">
          <div className="bg-indigo-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="serif text-3xl text-white mb-6">Cinematic Synthesis</h3>
          <p className="text-xl text-zinc-300 leading-relaxed font-light italic">
            "{analysis.visualSummary}"
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, desc, badge, badgeColor }: any) => (
  <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all group">
    <div className="mb-6 transform group-hover:scale-110 transition-transform">{icon}</div>
    <div className="flex items-baseline gap-3 mb-2">
      <div className="text-4xl font-bold text-white tracking-tighter">{value}</div>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-bold uppercase ${badgeColor}`}>
          {badge}
        </span>
      )}
    </div>
    <div className="text-sm font-semibold text-zinc-300 mb-2 uppercase tracking-widest">{label}</div>
    <div className="text-xs text-zinc-500 leading-relaxed">{desc}</div>
  </div>
);

export default AnalysisDashboard;
