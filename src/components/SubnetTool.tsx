import { useState, useEffect } from "react";
import { calculateIPv4Subnet, generateSubnetChallenge } from "../data";
import { SubnetResult, SubnetChallenge } from "../types";
import { Network, Plus, CheckCircle, HelpCircle, ArrowRight, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SubnetTool() {
  // Calculator States
  const [ipInput, setIpInput] = useState("192.168.1.135");
  const [cidrInput, setCidrInput] = useState(26);
  const [subnetResult, setSubnetResult] = useState<SubnetResult | null>(null);

  // Challenge States
  const [challenge, setChallenge] = useState<SubnetChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  // Trigger Subnet Calculation
  const handleCalculate = () => {
    const res = calculateIPv4Subnet(ipInput, cidrInput);
    if (res) {
      setSubnetResult(res);
    }
  };

  useEffect(() => {
    handleCalculate();
  }, [ipInput, cidrInput]);

  // Load a Subnet challenge
  const nextChallenge = () => {
    setChallenge(generateSubnetChallenge());
    setUserAnswer("");
    setIsSubmitted(false);
  };

  useEffect(() => {
    nextChallenge();
  }, []);

  // Submit Answer
  const handleCheckAnswer = () => {
    if (!challenge) return;
    const cleanAnswer = userAnswer.trim().toLowerCase();
    const cleanCorrect = challenge.correctAnswer.trim().toLowerCase();
    const correct = cleanAnswer === cleanCorrect;

    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  return (
    <div id="subnet-tool-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Subnet Calculator Module */}
      <div id="subnet-calculator-card" className="lg:col-span-7 bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-natural-primary/10 rounded-lg text-natural-primary">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-natural-text-main font-sans">IPv4 Subnet Calculator</h2>
            <p className="text-xs text-natural-text-mute">Perform binary host network boundary calculations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5">
          <div className="sm:col-span-8">
            <label className="block text-xs font-medium text-natural-text-sec mb-1">IP Address</label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g. 192.168.1.135"
              className="w-full bg-[#F5F2ED] border border-natural-border rounded-lg py-2 px-3 text-natural-text-main text-sm focus:ring-1 focus:ring-natural-primary focus:outline-none transition-all font-mono"
            />
          </div>
          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-natural-text-sec mb-1">CIDR Slash</label>
            <div className="flex items-center">
              <span className="text-natural-text-mute mr-2 font-mono text-sm">/</span>
              <input
                type="number"
                min="0"
                max="32"
                value={cidrInput}
                onChange={(e) => setCidrInput(Math.min(32, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full bg-[#F5F2ED] border border-natural-border rounded-lg py-2 px-3 text-natural-text-main text-sm focus:ring-1 focus:ring-natural-primary focus:outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {subnetResult ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-natural-border/60 shadow-xs">
                <span className="text-[10px] text-natural-text-mid uppercase tracking-wider font-mono">Netmask</span>
                <p className="text-sm font-semibold text-natural-primary font-mono mt-0.5">{subnetResult.subnetMask}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-natural-border/60 shadow-xs">
                <span className="text-[10px] text-natural-text-mid uppercase tracking-wider font-mono">Network ID Address</span>
                <p className="text-sm font-semibold text-natural-primary font-mono mt-0.5">{subnetResult.networkAddress}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-natural-border/60 shadow-xs">
                <span className="text-[10px] text-natural-text-mid uppercase tracking-wider font-mono">Broadcast Address</span>
                <p className="text-sm font-semibold text-[#b91c1c] font-mono mt-0.5">{subnetResult.broadcastAddress}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-natural-border/60 shadow-xs">
                <span className="text-[10px] text-natural-text-mid uppercase tracking-wider font-mono">Usable IP Host Range</span>
                <p className="text-sm font-semibold text-natural-text-sec font-mono mt-0.5">{subnetResult.usableRange}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-natural-border/60 shadow-xs">
              <span className="text-[10px] text-natural-text-mid uppercase tracking-wider font-mono">Host Capacity Sizing</span>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-natural-text-mute">
                  Total System IPs: <span className="font-semibold text-natural-text-main font-mono">{subnetResult.totalHosts.toLocaleString()}</span>
                </p>
                <p className="text-xs text-natural-text-mute">
                  Usable Host IPs: <span className="font-semibold text-natural-primary font-mono">{subnetResult.usableHosts.toLocaleString()}</span>
                </p>
              </div>
            </div>

            <div className="bg-[#2C3333] p-3 rounded-lg border border-black font-mono shadow-md text-natural-primary-light">
              <span className="text-[10px] text-natural-text-mid uppercase tracking-wider block mb-1">Binary Mask Breakdown</span>
              <p className="text-xs tracking-wider overflow-x-auto whitespace-nowrap">{subnetResult.binaryMask}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-natural-text-mute text-sm">
            Please enter a valid IP address and CIDR prefix.
          </div>
        )}
      </div>

      {/* Subnet Practice / Challenge Module */}
      <div id="subnet-trainer-card" className="lg:col-span-5 bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-natural-primary/10 rounded text-natural-primary">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-semibold text-natural-text-main">CIDR Challenge Trainer</h2>
            </div>
            {streak > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-800 border border-amber-200 rounded-full font-mono text-xs font-semibold animate-pulse">
                Streak: {streak}🔥
              </span>
            )}
          </div>

          {challenge ? (
            <div className="bg-white rounded-lg p-4 border border-natural-border/60 mb-4 min-h-[140px] flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[10px] bg-natural-primary/10 text-natural-primary border border-natural-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold font-mono">
                  Question Category: {challenge.questionType}
                </span>
                <p className="text-sm text-natural-text-main font-medium mt-3 leading-relaxed">
                  {challenge.questionText}
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-2 py-6">
              <div className="h-4 bg-natural-card rounded w-1/3"></div>
              <div className="h-10 bg-natural-card rounded"></div>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={userAnswer}
              disabled={isSubmitted}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer (e.g. 192.168.1.0 or 254)"
              className="w-full bg-[#F5F2ED] border border-natural-border rounded-lg py-2 px-3 text-natural-text-main text-sm focus:ring-1 focus:ring-natural-primary focus:outline-none font-mono"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitted && userAnswer.trim()) {
                  handleCheckAnswer();
                }
              }}
            />

            <AnimatePresence mode="wait">
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`p-3 rounded-lg border text-xs leading-normal ${
                    isCorrect
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  <p className="font-semibold mb-1 flex items-center gap-1.5">
                    {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600" /> : <HelpCircle className="w-4 h-4 text-red-600" />}
                    {isCorrect ? "Correct!" : "Incorrect Answer"} - Solid values of: <span className="font-mono bg-white border border-natural-border px-1 py-0.5 rounded text-natural-text-main">{challenge?.correctAnswer}</span>
                  </p>
                  <p className="text-natural-text-sec">
                    Use the tool on the left to verify this Host setting. Set Host IP to <span className="font-mono font-semibold">{challenge?.ip}</span> and Prefix to <span className="font-mono font-semibold">/{challenge?.cidr}</span>.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {!isSubmitted ? (
            <button
              onClick={handleCheckAnswer}
              disabled={!userAnswer.trim()}
              className="flex-1 bg-natural-primary hover:bg-natural-primary-hover disabled:bg-natural-card disabled:text-natural-text-mute text-white font-medium py-2 rounded-lg text-xs transition-all font-sans cursor-pointer"
            >
              Check Solution
            </button>
          ) : (
            <button
              onClick={nextChallenge}
              className="flex-1 bg-natural-primary hover:bg-natural-primary-hover text-white font-medium py-2 rounded-lg text-xs transition-all font-sans flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Next Challenge <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={nextChallenge}
            className="px-3 bg-white hover:bg-[#F5F2ED] text-natural-text-sec border border-natural-border rounded-lg transition-all cursor-pointer"
            title="Skip Question"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
