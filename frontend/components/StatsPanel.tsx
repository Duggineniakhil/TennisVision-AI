"use client";

import { Activity, Gauge, Zap, Footprints, ShieldAlert } from "lucide-react";

interface PlayerMetrics {
  total_shots: number;
  avg_shot_speed: number;
  max_shot_speed: number;
  avg_player_speed: number;
  distance_covered: number;
}

interface StatsProps {
  player1?: PlayerMetrics;
  player2?: PlayerMetrics;
  player1Name?: string;
  player2Name?: string;
}

export default function StatsPanel({
  player1 = { total_shots: 48, avg_shot_speed: 112, max_shot_speed: 148, avg_player_speed: 14, distance_covered: 340 },
  player2 = { total_shots: 52, avg_shot_speed: 108, max_shot_speed: 142, avg_player_speed: 16, distance_covered: 390 },
  player1Name = "Player 1",
  player2Name = "Player 2",
}: StatsProps) {

  const metrics = [
    { label: "Total Shots", key: "total_shots", unit: "", icon: Activity },
    { label: "Avg Shot Speed", key: "avg_shot_speed", unit: "km/h", icon: Gauge },
    { label: "Max Shot Speed", key: "max_shot_speed", unit: "km/h", icon: Zap },
    { label: "Avg Movement", key: "avg_player_speed", unit: "km/h", icon: Footprints },
    { label: "Distance Run", key: "distance_covered", unit: "m", icon: ShieldAlert },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#131B2E] border border-[#1E2A40] shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1E2A40]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0250B0] flex items-center justify-center font-bold text-xs text-white">P1</div>
          <h3 className="text-base font-bold text-white">{player1Name}</h3>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#0E1626] border border-[#1E2A40] text-xs font-bold text-[#8E9BAE] uppercase tracking-wider">
          Game Stats
        </div>

        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">{player2Name}</h3>
          <div className="w-7 h-7 rounded-lg bg-pink-600 flex items-center justify-center font-bold text-xs text-white">P2</div>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-5">
        {metrics.map((m) => {
          const val1 = Number((player1 as any)[m.key] || 0);
          const val2 = Number((player2 as any)[m.key] || 0);
          const total = Math.max(val1 + val2, 1);
          const pct1 = Math.round((val1 / total) * 100);
          const pct2 = 100 - pct1;
          const p1Wins = val1 >= val2;

          return (
            <div key={m.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={`font-mono text-sm ${p1Wins ? "text-[#D0FF41] font-bold" : "text-[#C6D0DD]"}`}>
                  {val1} {m.unit}
                </span>

                <span className="text-[#8E9BAE] uppercase tracking-wider flex items-center gap-1">
                  {m.label}
                </span>

                <span className={`font-mono text-sm ${!p1Wins ? "text-[#D0FF41] font-bold" : "text-[#C6D0DD]"}`}>
                  {val2} {m.unit}
                </span>
              </div>

              {/* Progress Comparison Bar */}
              <div className="h-2.5 w-full bg-[#0E1626] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-[#1E2A40]">
                <div
                  style={{ width: `${pct1}%` }}
                  className={`h-full rounded-l-full transition-all duration-500 ${
                    p1Wins ? "bg-[#0250B0]" : "bg-[#1E2A40]"
                  }`}
                />
                <div
                  style={{ width: `${pct2}%` }}
                  className={`h-full rounded-r-full transition-all duration-500 ${
                    !p1Wins ? "bg-[#D0FF41]" : "bg-[#1E2A40]"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
