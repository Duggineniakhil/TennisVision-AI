"use client";

import { useEffect, useState } from "react";
import { getStatus, getAnalysis } from "@/lib/api";

interface StatusPollerProps {
  jobId: string;
  onComplete: (data: any) => void;
}

export default function StatusPoller({ jobId, onComplete }: StatusPollerProps) {
  const [status, setStatus] = useState<string>("queued");
  const [stage, setStage] = useState<string>("Initializing...");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const data = await getStatus(jobId);
        setStatus(data.status);
        setStage(data.stage);
        setProgress(data.progress);

        if (data.status === "done") {
          clearInterval(intervalId);
          // Fetch full analysis
          const analysisData = await getAnalysis(jobId);
          onComplete(analysisData);
        } else if (data.status === "error") {
          clearInterval(intervalId);
          // Fetch analysis to get the error message
          const analysisData = await getAnalysis(jobId);
          setError(analysisData.error || "An unknown error occurred during processing.");
        }
      } catch (err: any) {
        console.error("Error polling status:", err);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [jobId, onComplete]);

  if (status === "error") {
    return (
      <div className="p-8 text-center bg-red-900/20 border border-red-800 rounded-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-red-900/50 rounded-full text-red-500">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Processing Failed</h3>
        <p className="text-red-200/80">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-12 text-center bg-slate-800/50 border border-slate-700 rounded-2xl max-w-xl mx-auto w-full">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <svg className="w-full h-full text-slate-700" viewBox="0 0 100 100">
          <circle className="stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
        </svg>
        <svg className="absolute top-0 left-0 w-full h-full text-emerald-500 -rotate-90" viewBox="0 0 100 100">
          <circle 
            className="stroke-current transition-all duration-1000 ease-out" 
            strokeWidth="8" 
            strokeLinecap="round" 
            cx="50" 
            cy="50" 
            r="40" 
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * progress) / 100}
          ></circle>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{progress}%</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">Analyzing Match</h3>
      <p className="text-slate-400 animate-pulse">{stage}</p>
      
      <div className="mt-8 text-sm text-slate-500 bg-slate-900/50 p-4 rounded-lg text-left">
        <p className="font-medium text-slate-400 mb-2">AI Pipeline Steps:</p>
        <ul className="space-y-1 opacity-80">
          <li className={progress > 10 ? "text-emerald-400" : ""}>✓ Detecting players</li>
          <li className={progress > 20 ? "text-emerald-400" : ""}>✓ Tracking tennis ball</li>
          <li className={progress > 30 ? "text-emerald-400" : ""}>✓ Mapping court lines</li>
          <li className={progress > 50 ? "text-emerald-400" : ""}>✓ Computing statistics</li>
          <li className={progress > 75 ? "text-emerald-400" : ""}>✓ Rendering visual overlays</li>
        </ul>
      </div>
    </div>
  );
}
