
export interface Shot {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
  description: string;
  colors: string[];
  cameraMovement: string;
  composition: string;
}

export interface AudioStats {
  mood: string;
  musicDescription: string;
  dynamicRange: string;
  keyEvents: string[];
}

export interface FilmAnalysis {
  title: string;
  asl: number; // Average Shot Length
  totalShots: number;
  dominantColors: string[];
  shots: Shot[];
  audio: AudioStats;
  visualSummary: string;
  frames?: { data: string; timestamp: number }[];
}

export interface AnalysisState {
  isAnalyzing: boolean;
  progress: number;
  result: FilmAnalysis | null;
  error: string | null;
}
