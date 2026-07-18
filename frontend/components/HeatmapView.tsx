"use client";

import { API_BASE } from "@/lib/api";

interface HeatmapViewProps {
  p1Url?: string;
  p2Url?: string;
}

export default function HeatmapView({ p1Url, p2Url }: HeatmapViewProps) {
  if (!p1Url || !p2Url) return null;

  const getFullUrl = (url: string) => url.startsWith("http") ? url : `${API_BASE.replace('/api', '')}${url}`;

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="w-2 h-6 bg-orange-500 rounded-full mr-3"></span>
        Court Coverage Heatmaps
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-700 w-full max-w-[280px] aspect-[5/9] relative overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getFullUrl(p1Url)} 
              alt="Player 1 Heatmap" 
              className="w-full h-full object-contain mix-blend-screen group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="mt-3 font-medium text-slate-300">Player 1</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="bg-slate-900 rounded-xl p-2 border border-slate-700 w-full max-w-[280px] aspect-[5/9] relative overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getFullUrl(p2Url)} 
              alt="Player 2 Heatmap" 
              className="w-full h-full object-contain mix-blend-screen group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="mt-3 font-medium text-slate-300">Player 2</p>
        </div>
      </div>
    </div>
  );
}
