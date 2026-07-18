"use client";

import { useRef, useEffect } from "react";
import { API_BASE } from "@/lib/api";

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Construct full URL pointing to the FastAPI backend static files
  const fullUrl = videoUrl.startsWith("http") ? videoUrl : `${API_BASE.replace('/api', '')}${videoUrl}`;

  return (
    <div className="overflow-hidden rounded-2xl bg-black border border-slate-700 shadow-2xl aspect-video w-full flex items-center justify-center">
      <video
        ref={videoRef}
        src={fullUrl}
        controls
        className="w-full h-full object-contain"
        crossOrigin="anonymous"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
