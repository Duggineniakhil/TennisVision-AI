import Uploader from "@/components/Uploader";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
      
      <div className="z-10 text-center max-w-3xl mb-12 space-y-6">
        <div className="inline-flex items-center justify-center space-x-3 mb-4">
          <span className="text-4xl">🎾</span>
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            TennisVision-AI
          </h1>
        </div>
        <p className="text-xl text-slate-400 leading-relaxed font-medium">
          Upload a match video and let our computer vision pipeline track players, analyze ball trajectories, and generate instant performance statistics.
        </p>
      </div>

      <div className="z-10 w-full">
        <Uploader />
      </div>

      <div className="z-10 mt-16 text-center max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="text-3xl mb-4">🏃‍♂️</div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">Player Tracking</h3>
          <p className="text-slate-400 text-sm leading-relaxed">YOLOv8 dynamically tracks players across the court, mapping their real-time positions.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="text-3xl mb-4">🥎</div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">Ball Trajectories</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Custom models track ball speed, shot placement, and generate beautiful trajectory maps.</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">Match Analytics</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Instantly view distance covered, average shot speeds, and total rally counts.</p>
        </div>
      </div>
    </div>
  );
}
