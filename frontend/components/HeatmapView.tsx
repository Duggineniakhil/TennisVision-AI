"use client";

import { API_BASE } from "@/lib/api";
import { Layers } from "lucide-react";

interface HeatmapViewProps {
  p1Url?: string;
  p2Url?: string;
}

export default function HeatmapView({ p1Url, p2Url }: HeatmapViewProps) {
  if (!p1Url || !p2Url) return null;

  const getFullUrl = (url: string) =>
    url.startsWith("http") ? url : `${API_BASE.replace("/api", "")}${url}`;

  return (
    <div className="p-6 rounded-2xl bg-[#131B2E] border border-[#1E2A40] shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E2A40]">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#0250B0]" />
          <span>Court Coverage Heatmaps</span>
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0E1626] text-[#8E9BAE] border border-[#1E2A40]">
          2 Players
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 Heatmap */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-full rounded-xl bg-[#1a1a2e] border border-[#1E2A40] overflow-hidden group hover:border-[#0250B0] transition-colors">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#0250B0] text-[10px] font-extrabold text-white shadow-sm">
              PLAYER 1
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFullUrl(p1Url)}
              alt="Player 1 Heatmap"
              className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <span className="text-xs font-semibold text-[#C6D0DD]">Player 1 — Court Coverage</span>
        </div>

        {/* Player 2 Heatmap */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-full rounded-xl bg-[#1a1a2e] border border-[#1E2A40] overflow-hidden group hover:border-[#D0FF41] transition-colors">
            <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-pink-600 text-[10px] font-extrabold text-white shadow-sm">
              PLAYER 2
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getFullUrl(p2Url)}
              alt="Player 2 Heatmap"
              className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <span className="text-xs font-semibold text-[#C6D0DD]">Player 2 — Court Coverage</span>
        </div>
      </div>
    </div>
  );
}
