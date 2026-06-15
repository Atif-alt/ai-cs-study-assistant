import { useState } from "react";
import { ALGORITHM_TEMPLATES } from "../data";
import { Terminal, Cpu, Play, Clipboard, Sliders, CheckCircle, RefreshCw } from "lucide-react";

interface AlgorithmWorkbenchProps {
  onAnalyzeCode: (code: string, language: string, title: string) => void;
  isAnalyzing: boolean;
}

export default function AlgorithmWorkbench({ onAnalyzeCode, isAnalyzing }: AlgorithmWorkbenchProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(ALGORITHM_TEMPLATES[0]);
  const [customCode, setCustomCode] = useState(ALGORITHM_TEMPLATES[0].code);
  const [lang, setLang] = useState("typescript");
  const [copied, setCopied] = useState(false);

  // Handle preset loading
  const handleTemplateChange = (name: string) => {
    const template = ALGORITHM_TEMPLATES.find(t => t.name === name);
    if (template) {
      setSelectedTemplate(template);
      setCustomCode(template.code);
    }
  };

  // Trigger analysis
  const triggerAnalysis = () => {
    onAnalyzeCode(customCode, lang, selectedTemplate.name);
  };

  // Copy code snippet to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(customCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="algo-workbench-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Code Editor Column */}
      <div id="code-editor-card" className="lg:col-span-7 bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-natural-primary/10 rounded-lg text-natural-primary">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-natural-text-main font-sans">Algorithm Workbench</h2>
                <p className="text-xs text-natural-text-mute">Trace pointers, assess bounds, and optimize logic layers</p>
              </div>
            </div>

            {/* Template Dropdown */}
            <div className="flex items-center gap-1.5 self-start">
              <span className="text-[10px] text-natural-text-sec uppercase tracking-wider font-semibold">Preset:</span>
              <select
                className="bg-[#F5F2ED] border border-natural-border rounded-lg py-1 px-2.5 text-xs text-natural-text-main focus:outline-none focus:ring-1 focus:ring-natural-primary"
                value={selectedTemplate.name}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                {ALGORITHM_TEMPLATES.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Editors / Codearea */}
          <div className="relative mb-4">
            <div className="absolute top-2.5 right-2.5 flex items-center gap-2 z-10">
              <button
                onClick={copyToClipboard}
                className="p-1 px-2 bg-black/40 hover:bg-black/60 rounded border border-white/10 text-[10px] text-white/80 font-mono transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Clipboard className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full h-80 bg-[#2C3333] border border-black rounded-lg p-4 pt-10 text-xs text-[#A8B5A2] font-mono focus:outline-none focus:ring-2 focus:ring-natural-primary leading-relaxed resize-none shadow-lg"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Control Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-natural-border/30">
          <div className="flex items-baseline gap-2 self-start sm:self-auto">
            <span className="text-xs text-natural-text-mute">Analysis language context:</span>
            <select
              className="bg-[#F5F2ED] border border-natural-border rounded py-0.5 px-2 text-xs text-natural-text-sec focus:outline-none focus:ring-1 focus:ring-natural-primary font-mono"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          <button
            onClick={triggerAnalysis}
            disabled={isAnalyzing || !customCode.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-natural-primary hover:bg-natural-primary-hover disabled:bg-natural-card disabled:text-natural-text-mute text-white font-medium text-xs rounded-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing concepts...
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" /> Analyze Complexity & Logic
              </>
            )}
          </button>
        </div>
      </div>

      {/* Concept Instructions Sidecard */}
      <div id="workbench-guidance-card" className="lg:col-span-5 bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 px-2 bg-natural-primary/10 rounded-full border border-natural-primary/20 text-natural-primary font-mono text-[10px] font-semibold">
              Checklist
            </div>
            <h3 className="text-sm font-semibold text-natural-text-main">How to optimize learning:</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-natural-card rounded-full border border-natural-border text-xs text-natural-primary flex items-center justify-center font-mono mt-0.5 font-bold">1</span>
              <p className="text-xs text-natural-text-sec leading-normal">
                Choose a pre-made algorithm template above, or paste in any system code block (e.g. standard sorting, linked list iterations, graph traversing).
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-natural-card rounded-full border border-natural-border text-xs text-natural-primary flex items-center justify-center font-mono mt-0.5 font-bold">2</span>
              <p className="text-xs text-natural-text-sec leading-normal">
                Click <span className="font-semibold text-natural-primary">Analyze Complexity</span>. The AI Study Companion will parse your logic, trace pointers, explain dynamic bounds, and highlight any potential performance bottlenecks.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 bg-natural-card rounded-full border border-natural-border text-xs text-natural-primary flex items-center justify-center font-mono mt-0.5 font-bold">3</span>
              <p className="text-xs text-natural-text-sec leading-normal">
                Check alternative data structures recommendations. Compare your solution to standard stack/heap optimizations to master resource sizing tradeoff strategies.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-natural-border p-3.5 rounded-lg mt-6 shadow-xs">
          <h4 className="text-xs font-semibold text-natural-text-sec flex items-center gap-1.5 mb-1.5">
            <Sliders className="w-3.5 h-3.5 text-natural-primary" /> Pedagogical Metaphor
          </h4>
          <p className="text-[11px] text-natural-text-mute leading-relaxed font-sans">
            "Learning code complexity is like moving houses. O(1) means lifting a box yourself, O(N) requires loading single cars one-by-one, while O(N²) involves having every vehicle visit every other vehicle before departure."
          </p>
        </div>
      </div>
    </div>
  );
}
