"use client";

import { API_BASE } from "@/lib/api";
import { Crosshair, Info } from "lucide-react";

interface ShotMapProps {
  url?: string;
}

export default function ShotMap({ url }: ShotMapProps) {
  if (!url) return null;

  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE.replace("/api", "")}${url}`;

  return (
    <div className="p-6 rounded-2xl bg-[#131B2E] border border-[#1E2A40] shadow-xl space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-[#1E2A40]">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-[#D0FF41]" />
          <span>Ball Trajectories</span>
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0E1626] text-[#D0FF41] border border-[#1E2A40]">
          Shot Map
        </span>
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative w-full max-w-[280px] aspect-[5/8] rounded-xl bg-[#0E1626] border border-[#1E2A40] p-2 overflow-hidden group hover:border-[#D0FF41] transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullUrl}
            alt="Shot Trajectory Map"
            className="w-full h-full object-contain mix-blend-screen group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      <div className="p-3 rounded-xl bg-[#0E1626] border border-[#1E2A40] flex items-center gap-2 text-xs text-[#8E9BAE]">
        <Info className="w-4 h-4 text-[#D0FF41] shrink-0" />
        <p>
          Color scale indicates shot speed (<span className="text-[#0250B0] font-bold">Blue</span> = Slower, <span className="text-[#D0FF41] font-bold">Volt Lime</span> = Faster)
        </p>
      </div>
    </div>
  );
}
