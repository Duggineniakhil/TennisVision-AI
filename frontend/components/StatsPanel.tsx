"use client";

interface StatsProps {
  player1: {
    total_shots: number;
    avg_shot_speed: number;
    max_shot_speed: number;
    avg_player_speed: number;
    distance_covered: number;
  };
  player2: {
    total_shots: number;
    avg_shot_speed: number;
    max_shot_speed: number;
    avg_player_speed: number;
    distance_covered: number;
  };
}

export default function StatsPanel({ player1, player2 }: StatsProps) {
  const StatRow = ({ label, val1, val2, unit = "" }: { label: string; val1: number; val2: number; unit?: string }) => {
    // Determine winner for highlighting
    const p1Wins = val1 > val2;
    const p2Wins = val2 > val1;
    const isTie = val1 === val2;

    return (
      <div className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
        <div className={`w-1/3 text-center font-bold text-lg ${p1Wins && !isTie ? "text-emerald-400" : "text-slate-300"}`}>
          {val1} {unit && <span className="text-xs text-slate-500 font-normal">{unit}</span>}
        </div>
        <div className="w-1/3 text-center text-sm font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        <div className={`w-1/3 text-center font-bold text-lg ${p2Wins && !isTie ? "text-emerald-400" : "text-slate-300"}`}>
          {val2} {unit && <span className="text-xs text-slate-500 font-normal">{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
        <h3 className="text-2xl font-black text-white tracking-tight w-1/3 text-center">PLAYER 1</h3>
        <h3 className="text-lg font-medium text-slate-500 w-1/3 text-center uppercase tracking-widest">Match Stats</h3>
        <h3 className="text-2xl font-black text-white tracking-tight w-1/3 text-center">PLAYER 2</h3>
      </div>
      
      <div className="flex flex-col">
        <StatRow label="Total Shots" val1={player1.total_shots} val2={player2.total_shots} />
        <StatRow label="Avg Shot Speed" val1={player1.avg_shot_speed} val2={player2.avg_shot_speed} unit="km/h" />
        <StatRow label="Max Shot Speed" val1={player1.max_shot_speed} val2={player2.max_shot_speed} unit="km/h" />
        <StatRow label="Avg Movement" val1={player1.avg_player_speed} val2={player2.avg_player_speed} unit="km/h" />
        <StatRow label="Distance Run" val1={player1.distance_covered} val2={player2.distance_covered} unit="m" />
      </div>
    </div>
  );
}
