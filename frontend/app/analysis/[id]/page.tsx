"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusPoller from "@/components/StatusPoller";
import VideoPlayer from "@/components/VideoPlayer";
import StatsPanel from "@/components/StatsPanel";
import HeatmapView from "@/components/HeatmapView";
import ShotMap from "@/components/ShotMap";
import HighlightTimeline from "@/components/HighlightTimeline";

export default function AnalysisDashboard() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [analysisData, setAnalysisData] = useState<any>(null);

  // When StatusPoller finishes, it calls this
  const handleComplete = (data: any) => {
    setAnalysisData(data);
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl max-h-2xl rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />
        <div className="z-10 w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-200 mb-2">Analysis in Progress</h1>
            <p className="text-slate-400">Please wait while the AI pipeline processes your video.</p>
          </div>
          <StatusPoller jobId={jobId} onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  // Done! Render Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="text-emerald-400">🎾</span> Match Dashboard
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Job ID: <span className="font-mono text-slate-500">{jobId.split('-')[0]}</span></p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
          >
            Upload New Video
          </button>
        </div>

        {/* Top Row: Video & Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Processed Video
            </h2>
            <VideoPlayer videoUrl={analysisData.video_url} />
          </div>
          
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Match Statistics
            </h2>
            <StatsPanel 
              player1={analysisData.player_1} 
              player2={analysisData.player_2} 
            />
          </div>
        </div>

        {/* Bottom Row: Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-800">
          <HeatmapView 
            p1Url={analysisData.heatmap_p1_url} 
            p2Url={analysisData.heatmap_p2_url} 
          />
          <ShotMap url={analysisData.shot_map_url} />
          <HighlightTimeline highlights={analysisData.highlights} />
        </div>

      </div>
    </div>
  );
}
