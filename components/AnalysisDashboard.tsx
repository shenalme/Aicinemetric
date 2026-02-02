
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { FilmAnalysis, Shot } from '../types';
import { Download, FileVideo, Music, Layout, Palette, Clock, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  analysis: FilmAnalysis;
}

const AnalysisDashboard: React.FC<Props> = ({ analysis }) => {
  const downloadPDF = async () => {
    const element = document.getElementById('analysis-report');
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0a0a0a' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${analysis.title.replace(/\s+/g, '_')}_Analysis.pdf`);
  };

  const shotData = analysis.shots.map(s => ({
    name: `Shot ${s.id}`,
    duration: s.duration,
    asl: analysis.asl
  }));

  const colorData = analysis.dominantColors.map((color, idx) => ({
    name: color,
    value: 1,
    color
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="serif text-4xl md:text-5xl text-white mb-2">{analysis.title}</h1>
          <p className="text-zinc-400 uppercase tracking-widest text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" /> Cinematic Analysis Report
          </p>
        </div>
        <button 
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105"
        >
          <Download className="w-5 h-5" /> Download PDF Report
        </button>
      </div>

      <div id="analysis-report" className="space-y-8 bg-zinc-950 p-6 md:p-10 rounded-3xl border border-white/5 shadow-2xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={<Clock className="text-indigo-400" />} 
            label="Avg Shot Length (ASL)" 
            value={`${analysis.asl.toFixed(2)}s`} 
            desc="Calculated mean across identified cuts"
          />
          <StatCard 
            icon={<FileVideo className="text-emerald-400" />} 
            label="Total Identified Shots" 
            value={analysis.totalShots.toString()} 
            desc="Visual discontinuities detected"
          />
          <StatCard 
            icon={<Palette className="text-pink-400" />} 
            label="Dominant Palette" 
            value={analysis.dominantColors.length.toString()} 
            desc="Key thematic hues extracted"
          />
        </div>

        {/* Visual Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> Shot Duration Timeline
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={shotData}>
                  <defs>
                    <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={10} label={{ value: 'Secs', angle: -90, position: 'insideLeft', fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="duration" stroke="#818cf8" fillOpacity={1} fill="url(#colorDur)" />
                  <Line type="monotone" dataKey="asl" stroke="#f43f5e" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-zinc-500 mt-4 italic">Red dashed line indicates Average Shot Length (ASL).</p>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-400" /> Dominant Colors
            </h3>
            <div className="flex flex-wrap gap-4 items-center justify-center h-48">
              {analysis.dominantColors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-16 h-16 rounded-full shadow-lg border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-mono text-zinc-500">{color}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-1 h-3 rounded-full overflow-hidden">
              {analysis.dominantColors.map((color, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>

        {/* Audio Section */}
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Music className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Aural Atmosphere</h3>
              <p className="text-sm text-zinc-400">Audio dynamics and musical analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase text-zinc-500 font-bold">Estimated Mood</span>
                <p className="text-lg text-white font-medium">{analysis.audio.mood}</p>
              </div>
              <div>
                <span className="text-xs uppercase text-zinc-500 font-bold">Musical Texture</span>
                <p className="text-zinc-300">{analysis.audio.musicDescription}</p>
              </div>
            </div>
            <div className="bg-zinc-800/40 p-5 rounded-xl">
              <h4 className="text-sm font-semibold mb-3">Key Auditory Events</h4>
              <ul className="space-y-2">
                {analysis.audio.keyEvents.map((evt, idx) => (
                  <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                    {evt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Detailed Shots List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layout className="w-5 h-5 text-emerald-400" /> Shot-by-Shot Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.shots.map(shot => (
              <div key={shot.id} className="bg-zinc-900/30 border border-white/5 p-4 rounded-xl hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">Shot {shot.id}</span>
                  <span className="text-xs font-semibold text-indigo-400">{shot.duration.toFixed(1)}s</span>
                </div>
                <h4 className="font-medium text-white mb-2">{shot.description}</h4>
                <div className="text-xs text-zinc-500 space-y-1">
                  <p><strong className="text-zinc-400">Movement:</strong> {shot.cameraMovement}</p>
                  <p><strong className="text-zinc-400">Composition:</strong> {shot.composition}</p>
                </div>
                <div className="mt-3 flex gap-1">
                  {shot.colors.map((c, i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Summary */}
        <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-indigo-300 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5" /> Narrative Synthesis
          </h3>
          <p className="text-zinc-300 leading-relaxed italic">
            "{analysis.visualSummary}"
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, desc }: { icon: React.ReactNode, label: string, value: string, desc: string }) => (
  <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 hover:bg-zinc-900 transition-all cursor-default">
    <div className="mb-4">{icon}</div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm font-semibold text-zinc-300 mb-1">{label}</div>
    <div className="text-xs text-zinc-500">{desc}</div>
  </div>
);

export default AnalysisDashboard;
