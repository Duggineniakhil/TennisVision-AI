"use client";

import { API_BASE } from "@/lib/api";

interface ShotMapProps {
  url?: string;
}

export default function ShotMap({ url }: ShotMapProps) {
  if (!url) return null;

  const fullUrl = url.startsWith("http") ? url : `${API_BASE.replace('/api', '')}${url}`;

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 shadow-xl h-full">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
        Ball Trajectories
      </h3>
      
      <div className="flex flex-col items-center justify-center h-[calc(100%-3rem)]">
        <div className="bg-slate-900 rounded-xl p-2 border border-slate-700 w-full max-w-[280px] aspect-[5/9] relative overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={fullUrl} 
            alt="Shot Trajectory Map" 
            className="w-full h-full object-contain mix-blend-screen group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Color indicates relative shot speed (Blue = Slower, Yellow = Faster)
        </p>
      </div>
    </div>
  );
}
