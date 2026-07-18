"use client";

interface Highlight {
  start_frame: number;
  end_frame: number;
  timestamp_seconds: number;
  label: string;
}

interface HighlightTimelineProps {
  highlights: Highlight[];
}

export default function HighlightTimeline({ highlights }: HighlightTimelineProps) {
  if (!highlights || highlights.length === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-xl h-full">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="w-2 h-6 bg-yellow-500 rounded-full mr-3"></span>
        Match Highlights
      </h3>
      
      <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {highlights.map((highlight, idx) => (
          <div 
            key={idx} 
            className="group flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
          >
            <div className="flex-shrink-0 w-16 px-2 py-1 bg-slate-900 rounded-md text-emerald-400 font-mono text-sm text-center border border-slate-700 group-hover:border-emerald-500/50">
              {formatTime(highlight.timestamp_seconds)}
            </div>
            <div>
              <p className="font-medium text-slate-200 group-hover:text-white transition-colors">
                {highlight.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Frames {highlight.start_frame} - {highlight.end_frame}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
