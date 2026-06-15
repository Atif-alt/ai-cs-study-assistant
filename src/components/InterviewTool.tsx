import { useState } from "react";
import { PRELOADED_INTERVIEW_CHALLENGES, CodingChallenge } from "../data";
import { Briefcase, Key, Award, HelpCircle, ChevronRight, Play, Terminal, Star } from "lucide-react";
import { motion } from "motion/react";

interface InterviewToolProps {
  onStartSimulation: (challenge: CodingChallenge) => void;
}

export default function InterviewTool({ onStartSimulation }: InterviewToolProps) {
  const [activeChallenge, setActiveChallenge] = useState<CodingChallenge>(PRELOADED_INTERVIEW_CHALLENGES[0]);
  const [revealHintsCount, setRevealHintsCount] = useState<number>(0);

  const selectChallenge = (challenge: CodingChallenge) => {
    setActiveChallenge(challenge);
    setRevealHintsCount(0);
  };

  const showNextHint = () => {
    setRevealHintsCount(prev => Math.min(activeChallenge.hints.length, prev + 1));
  };

  return (
    <div id="interview-tool-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Challenges sidebar list */}
      <div id="challenges-list-card" className="lg:col-span-4 bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-natural-primary/10 rounded-lg text-natural-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-natural-text-main font-sans">Interview Core Bank</h2>
              <p className="text-xs text-natural-text-mute">Practice FAANG-tier problem solving</p>
            </div>
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {PRELOADED_INTERVIEW_CHALLENGES.map((challenge) => {
              const isActive = challenge.id === activeChallenge.id;
              const diffColors =
                challenge.difficulty === "Easy"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : challenge.difficulty === "Medium"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-red-50 text-red-800 border-red-200";

              return (
                <button
                  key={challenge.id}
                  onClick={() => selectChallenge(challenge)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-sans transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-white border-natural-primary shadow-sm text-natural-text-main font-bold"
                      : "bg-white/60 border-natural-border hover:bg-white text-natural-text-sec cursor-pointer"
                  }`}
                >
                  <div>
                    <h3 className={`font-semibold ${isActive ? "text-natural-primary" : "text-natural-text-main"}`}>
                      {challenge.title}
                    </h3>
                    <p className="text-[10px] text-natural-text-mute mt-0.5">{challenge.topic}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono border font-semibold ${diffColors}`}>
                    {challenge.difficulty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 bg-[#F5F2ED] p-3 rounded-lg border border-natural-border shadow-xs">
          <h3 className="text-xs font-semibold text-natural-text-sec mb-1.5 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> STAR Strategy Advice
          </h3>
          <p className="text-[10px] text-natural-text-mute leading-normal font-sans">
            For behavioral components, formulate: Situation (What happened?), Task (Target to hit), Action (What actions did you take), and Result (Specific metric outcomes).
          </p>
        </div>
      </div>

      {/* Challenge detailed panel */}
      <div id="challenge-details-card" className="lg:col-span-8 bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-natural-border/60 pb-3.5 mb-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-natural-primary font-semibold">
                ACTIVE LAB CHALLENGE
              </span>
              <h2 className="text-lg font-bold text-natural-text-main font-sans mt-0.5">{activeChallenge.title}</h2>
            </div>

            <button
              onClick={() => onStartSimulation(activeChallenge)}
              className="bg-natural-primary hover:bg-natural-primary-hover active:scale-95 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-transform cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Live Whiteboard Simulator
            </button>
          </div>

          <div className="prose prose-xs text-xs text-natural-text-sec leading-relaxed mb-6 font-sans">
            <p className="whitespace-pre-line mb-4 text-[#4A443B]">{activeChallenge.description}</p>

            <span className="text-[10px] text-natural-text-mid font-mono uppercase tracking-wider block mb-1">Starter Boilerplate code:</span>
            <pre className="p-3 bg-[#2C3333] border border-black rounded-lg text-[#A8B5A2] font-mono text-[11px] overflow-x-auto leading-relaxed max-h-[160px] shadow-inner">
              {activeChallenge.starterCode}
            </pre>
          </div>
        </div>

        {/* Incremental hint manager */}
        <div className="border-t border-natural-border pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-medium text-natural-text-sec flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-natural-primary" /> Incremental Whiteboard Hints
            </span>
            {revealHintsCount < activeChallenge.hints.length && (
              <button
                onClick={showNextHint}
                className="text-[10px] font-semibold text-natural-primary hover:text-natural-primary-hover bg-natural-primary/5 hover:bg-natural-primary/10 border border-natural-primary/10 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                Reveal Hint ({revealHintsCount}/{activeChallenge.hints.length})
              </button>
            )}
          </div>

          {revealHintsCount > 0 ? (
            <div className="space-y-2">
              {activeChallenge.hints.slice(0, revealHintsCount).map((hint, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-natural-border rounded-lg flex items-start gap-2 shadow-xs">
                  <span className="w-4 h-4 rounded-full bg-natural-primary/10 text-natural-primary text-[10px] font-mono font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#5D574F] font-sans leading-relaxed">{hint}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-white/20 border border-dashed border-natural-border rounded-lg text-natural-text-mute text-xs font-sans">
              No hints revealed yet. Solve the challenge yourself, or click 'Reveal Hint' above for hints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
