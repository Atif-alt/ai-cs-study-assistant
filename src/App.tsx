import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { motion } from "motion/react";
import {
  Sparkles,
  BookOpen,
  Sliders,
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Bookmark,
  Network,
  Terminal,
  Briefcase,
  Layers,
  HelpCircle,
  Clock,
  ChevronDown
} from "lucide-react";
import { ChatSession, Category, StudyMode, Message } from "./types";
import { CodingChallenge } from "./data";
import SubnetTool from "./components/SubnetTool";
import AlgorithmWorkbench from "./components/AlgorithmWorkbench";
import InterviewTool from "./components/InterviewTool";
import FlashcardTool from "./components/FlashcardTool";

export default function App() {
  const [activeTab, setActiveTab] = useState<"chat" | "subnet" | "workbench" | "interview" | "flashcards">("chat");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Active configurations
  const [category, setCategory] = useState<Category>("general");
  const [studyMode, setStudyMode] = useState<StudyMode>("standard");

  // Interaction inputs
  const [textInput, setTextInput] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [errorText, setErrorText] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load chat sessions on component mount
  useEffect(() => {
    const saved = localStorage.getItem("ai_study_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (err) {
        initDefaultSession();
      }
    } else {
      initDefaultSession();
    }
  }, []);

  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem("ai_study_sessions", JSON.stringify(updated));
  };

  const initDefaultSession = () => {
    const defaultSession: ChatSession = {
      id: "session-default",
      name: "General CS Introduction",
      category: "general",
      mode: "standard",
      messages: [
        {
          id: "msg-welcome",
          role: "assistant",
          content: "Welcome to your **AI CS Study Assistant**! 🎓\n\nI am equipped to tutor you across multiple fundamental domains:\n\n- 🌐 **Computer Networks**: Get instant breakdowns of packet structures, OSI levels, handshakes, TCP control models, IP subnets, or DNS workflows.\n- 💻 **Algorithms & Code**: Paste scripts in the Algorithm Workbench to trace AST layers, assess Big-O bounds, and review dynamic memoization.\n- 💼 **Interview Whiteboard Prep**: Challenge yourself with hand-curated questions and launch simulated coding interview scenarios.\n- 📝 **Active Recall Flashcards**: Practice flashcards backed by spacing mechanisms.\n\nChoose a **Topic** or **Tutorial Study Mode** on the left to begin, or type a conceptual question below!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  };

  // Create customized session
  const createNewSession = (cat: Category = "general", mode: StudyMode = "standard", sessionName = "") => {
    const newSessionId = "session-" + Date.now();
    const formattedName = sessionName || `${cat.charAt(0).toUpperCase() + cat.slice(1)} - ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;

    const newSession: ChatSession = {
      id: newSessionId,
      name: formattedName,
      category: cat,
      mode: mode,
      messages: [
        {
          id: "msg-welcome-new",
          role: "assistant",
          content: `Initialized chat session specialized for **${cat.toUpperCase()}** under the **${mode.toUpperCase()}** strategy. How can I guide your studies today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newSessionId);
    setCategory(cat);
    setStudyMode(mode);
  };

  // Helper session injector
  const createSessionWithMessages = (cat: Category, mode: StudyMode, sessionName: string, initialMessages: Message[]) => {
    const newSessionId = "session-" + Date.now();
    const newSession: ChatSession = {
      id: newSessionId,
      name: sessionName,
      category: cat,
      mode: mode,
      messages: [
        {
          id: "msg-initializer",
          role: "assistant",
          content: `Simulated workspace established for **${sessionName}**. Initiating whiteboard scenario dialogue now...`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        },
        ...initialMessages
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newSessionId);
  };

  // Delete chat session
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length === 0) {
      initDefaultSession();
    } else {
      saveSessions(filtered);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  const handleActiveSessionSelection = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setCategory(session.category);
    setStudyMode(session.mode);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Auto Scroll Chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isPending]);

  // Sync Category/Study mode if we explicitly toggle them in active chat settings
  const handleConfigChange = (newCat: Category, newMode: StudyMode) => {
    setCategory(newCat);
    setStudyMode(newMode);
    if (activeSession) {
      const updated = sessions.map(s => {
        if (s.id === activeSession.id) {
          return { ...s, category: newCat, mode: newMode };
        }
        return s;
      });
      saveSessions(updated);
    }
  };

  // Trigger Gemini AI request
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!textInput.trim() || !activeSession || isPending) return;

    setErrorText("");
    const userMessageContent = textInput;
    setTextInput("");

    const newUserMessage: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: userMessageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedChatMessages = [...activeSession.messages, newUserMessage];

    // Optimistic Update
    const sessionHistoryUpdated = sessions.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          messages: updatedChatMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    saveSessions(sessionHistoryUpdated);

    setIsPending(true);

    try {
      // Map simple message list for API transfer
      const apiPayloadMessages = updatedChatMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiPayloadMessages,
          category: activeSession.category,
          mode: activeSession.mode
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server processing failed.");
      }

      const resData = await response.json();

      const newAssistantMessage: Message = {
        id: "msg-ai-" + Date.now(),
        role: "assistant",
        content: resData.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      const finalSessionsList = sessions.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...updatedChatMessages, newAssistantMessage],
            updatedAt: new Date().toISOString(),
            name: s.name === "General CS Introduction" || s.name === "New Chat Session"
              ? userMessageContent.slice(0, 24) + (userMessageContent.length > 24 ? "..." : "")
              : s.name
          };
        }
        return s;
      });

      saveSessions(finalSessionsList);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An unexpected network error occurred. Please verify your GEMINI_API_KEY.");
    } finally {
      setIsPending(false);
    }
  };

  // Launch Workbench analysis in chat panel
  const handleAnalyzeCode = (code: string, language: string, title: string) => {
    const analysisPrompt: Message = {
      id: "sys-trace-" + Date.now(),
      role: "user",
      content: `Hello Copilot! Provide a deep pedagogical review and logical AST analysis of this ${language} algorithm: "${title}":\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nPlease structure your assessment covering:\n1. **Theoretical Big-O Performance** (Time and Space bounds).\n2. **Line-by-line concept tracing**.\n3. **Trade-offs & Optimizations** (How can we optimize caches, memory bounds, or pointer steps?).`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    createSessionWithMessages("coding", "standard", `Trace Code: ${title}`, [analysisPrompt]);
    setActiveTab("chat");
    setTimeout(() => {
      // Trigger API call automatically
      const newlyCreated = localStorage.getItem("ai_study_sessions");
      if (newlyCreated) {
        const sessionsParsed = JSON.parse(newlyCreated);
        if (sessionsParsed.length > 0) {
          setActiveSessionId(sessionsParsed[0].id);
          // Auto trigger call via synthetic submit
          triggerSyntheticInitialSendMessage(sessionsParsed[0]);
        }
      }
    }, 200);
  };

  // Start mock whiteboard simulation
  const handleStartInterviewSimulation = (challenge: CodingChallenge) => {
    const interviewPrompt: Message = {
      id: "sys-mock-" + Date.now(),
      role: "user",
      content: `Hi! I want to practice the Whiteboard Technical Coding interview for "${challenge.title}" in the topic area "${challenge.topic}".\n\n**Problem Specifications:**\n${challenge.description}\n\n**Starter code:**\n\`\`\`typescript\n${challenge.starterCode}\n\`\`\`\n\nPlease act as my friendly interviewer. Guide this as a whiteboard interview session. Start with a warm introduction, specify any system constraints, and ask me to state my theoretical strategy first before writing code.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    createSessionWithMessages("interview", "socratic", `Mock Interview: ${challenge.title}`, [interviewPrompt]);
    setActiveTab("chat");
    setTimeout(() => {
      const newlyCreated = localStorage.getItem("ai_study_sessions");
      if (newlyCreated) {
        const sessionsParsed = JSON.parse(newlyCreated);
        if (sessionsParsed.length > 0) {
          setActiveSessionId(sessionsParsed[0].id);
          triggerSyntheticInitialSendMessage(sessionsParsed[0]);
        }
      }
    }, 200);
  };

  // Auto trigger the first message processing for modular workbench / interviews
  const triggerSyntheticInitialSendMessage = async (session: ChatSession) => {
    setIsPending(true);
    setErrorText("");
    try {
      const apiPayloadMessages = session.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiPayloadMessages,
          category: session.category,
          mode: session.mode
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server processing failed.");
      }

      const resData = await response.json();

      const newAssistantMessage: Message = {
        id: "msg-ai-" + Date.now(),
        role: "assistant",
        content: resData.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      // Query latest sessions again
      const current = localStorage.getItem("ai_study_sessions");
      if (current) {
        const parsed = JSON.parse(current);
        const final = parsed.map((s: ChatSession) => {
          if (s.id === session.id) {
            return {
              ...s,
              messages: [...s.messages, newAssistantMessage],
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        });
        saveSessions(final);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "An unexpected network error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div id="ai-study-assistant-root" className="min-h-screen bg-natural-bg text-natural-text-main flex flex-col font-sans">
      {/* Brand Navigation Bar */}
      <header id="assistant-app-header" className="border-b border-natural-border bg-[#E8E4DE]/60 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-natural-primary flex items-center justify-center text-white uppercase tracking-widest font-mono text-sm shadow-md shadow-natural-primary/20">
            CS
          </div>
          <div>
            <h1 className="text-sm font-bold text-natural-text-main uppercase tracking-wider font-sans">KernelStudy</h1>
            <p className="text-[10px] text-natural-text-mute font-mono">Networks • Algorithms • Engineering Interviews</p>
          </div>
        </div>

        {/* Global Tab List */}
        <div className="flex items-center gap-1 overflow-x-auto select-none rounded-lg bg-natural-card p-1 border border-natural-border/60">
          {[
            { id: "chat", label: "Copilot Chat", icon: Sparkles },
            { id: "subnet", label: "IP Subnets", icon: Network },
            { id: "workbench", label: "Algorithms", icon: Terminal },
            { id: "interview", label: "Tech Mock", icon: Briefcase },
            { id: "flashcards", label: "Flashcards", icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap outline-none ${
                  active
                    ? "bg-white border border-natural-border shadow-sm text-natural-primary font-bold"
                    : "text-natural-text-sec hover:text-natural-text-main hover:bg-white/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Study Hub Workspace */}
      <main id="hub-workspace-pane" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-130px)]">
            {/* Sidebar configurations (Left Section) */}
            <div id="tutorial-control-sidebar" className="lg:col-span-3 bg-natural-card border border-natural-border rounded-xl p-4 flex flex-col justify-between overflow-y-auto">
              <div>
                <section className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sliders className="w-4 h-4 text-natural-primary" />
                    <h3 className="text-xs font-semibold text-natural-text-main font-mono uppercase tracking-wider">
                      Strategy Tuner
                    </h3>
                  </div>

                  <div className="space-y-3.5 bg-white/70 p-3.5 rounded-lg border border-natural-border">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-natural-text-mid mb-1">
                        Topic Framework
                      </label>
                      <select
                        value={category}
                        onChange={(e) => handleConfigChange(e.target.value as Category, studyMode)}
                        className="w-full bg-natural-bg border border-natural-border rounded px-2 py-1 text-xs text-natural-text-main focus:outline-none focus:ring-1 focus:ring-natural-primary"
                      >
                        <option value="general">General CS Theory</option>
                        <option value="networks">Computer Networks</option>
                        <option value="coding">Programming & Systems</option>
                        <option value="interview">FAANG Interview Prep</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-natural-text-mid mb-1">
                        Pedagogy Style
                      </label>
                      <select
                        value={studyMode}
                        onChange={(e) => handleConfigChange(category, e.target.value as StudyMode)}
                        className="w-full bg-natural-bg border border-natural-border rounded px-2 py-1 text-xs text-natural-text-main focus:outline-none focus:ring-1 focus:ring-natural-primary"
                      >
                        <option value="standard">Socratic Explanations</option>
                        <option value="socratic">Socratic Method (Nudge Tutor)</option>
                        <option value="cheatsheet">Monster Cheatsheet Summaries</option>
                        <option value="quiz">Interactive Concept Quiz</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Conversation Threads */}
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-natural-text-mid uppercase tracking-wider font-mono">
                      Saved Chats ({sessions.length})
                    </span>
                    <button
                      onClick={() => createNewSession("general", "standard", "New Chat Session")}
                      className="p-1 hover:bg-white border border-natural-border rounded text-natural-text-main transition-colors"
                      title="New Session"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 max-h-[190px] overflow-y-auto">
                    {sessions.map((session) => {
                      const isActive = session.id === activeSessionId;
                      return (
                        <div
                          key={session.id}
                          onClick={() => handleActiveSessionSelection(session)}
                          className={`group w-full text-left p-2 rounded-lg text-xs flex justify-between items-center cursor-pointer transition-all ${
                            isActive
                              ? "bg-white border border-natural-border text-natural-primary font-semibold shadow-sm"
                              : "text-natural-text-sec hover:bg-white/40 hover:text-natural-text-main"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MessageSquare className="w-3 h-3 text-natural-text-mid shrink-0" />
                            <span className="truncate">{session.name}</span>
                          </div>
                          <button
                            onClick={(e) => deleteSession(session.id, e)}
                            className="text-natural-text-mid hover:text-red-700 opacity-0 group-hover:opacity-100 p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="p-3 bg-white/40 rounded-xl mt-4 border border-natural-border/30">
                <p className="text-[11px] font-bold text-natural-text-sec mb-1">Pro Tip: Interview Prep</p>
                <p className="text-[10px] text-natural-text-mute leading-relaxed">Practice whiteboarding the TCP 3-way handshake for network roles.</p>
              </div>

              <div className="mt-4 pt-4 border-t border-natural-border text-center text-[10px] text-natural-text-mid font-mono">
                Powered by Gemini 3.5 Flash
              </div>
            </div>

            {/* Chat Conversation Box (Right Section) */}
            <div id="conversation-container" className="lg:col-span-9 bg-[#fbfaf8] border border-natural-border rounded-xl flex flex-col justify-between overflow-hidden relative shadow-md">
              {/* Active Header bar context */}
              <div id="active-session-titlebar" className="bg-white/80 border-b border-natural-border px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-natural-primary rounded-full animate-ping"></span>
                  <p className="text-natural-text-main font-semibold font-mono truncate max-w-sm font-sans">
                    {activeSession?.name || "Workspace dialogue"}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-natural-text-mid font-mono text-[10px]">
                  <span>Topic: <b className="text-natural-primary font-bold uppercase">{category}</b></span>
                  <span>Pedagogy: <b className="text-natural-primary font-bold uppercase">{studyMode}</b></span>
                </div>
              </div>

              {/* Messages Body log list */}
              <div id="dialogue-scroll-pane" className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeSession?.messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`text-[10px] select-none font-mono tracking-widest font-bold w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                        isUser ? "bg-natural-primary text-white" : "bg-natural-primary-light text-white"
                      }`}>
                        {isUser ? "U" : "AI"}
                      </div>

                      <div className={`p-3.5 rounded-xl border leading-relaxed text-xs leading-loose antialiased shadow-sm ${
                        isUser
                          ? "bg-natural-primary text-white border-natural-primary-hover"
                          : "bg-white border-natural-border text-natural-text-main"
                      }`}>
                        <div className={`prose prose-xs leading-relaxed max-w-none ${isUser ? "text-white prose-headings:text-white" : "text-natural-text-main prose-headings:text-natural-text-main"}`}>
                          <Markdown>{msg.content}</Markdown>
                        </div>
                        <span className={`block text-[8px] text-right mt-1 font-mono ${isUser ? "text-white/60" : "text-natural-text-mute"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isPending && (
                  <div className="flex gap-3 mr-auto items-center animate-pulse">
                    <div className="bg-[#E8E4DE] text-natural-primary border border-natural-border text-[10px] font-mono tracking-wider font-bold w-6 h-6 rounded-lg flex items-center justify-center">
                      ...
                    </div>
                    <div className="bg-white border border-natural-border p-2 px-4 rounded-xl text-xs text-natural-text-sec font-mono flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3 h-3 animate-spin text-natural-primary" />
                      Pedagogical Copilot formulating analysis...
                    </div>
                  </div>
                )}

                {errorText && (
                  <div className="bg-[#fdf2f2] border border-[#f3b5b5] text-red-800 p-3.5 rounded-lg text-xs leading-normal">
                    <p className="font-semibold mb-1">Configuration Warning</p>
                    <p className="text-slate-700 text-[11px] leading-relaxed mb-2">{errorText}</p>
                    <p className="text-slate-500 text-[10px] leading-relaxed">
                      Please verify that your application has a verified <b className="text-slate-800 font-mono font-bold">GEMINI_API_KEY</b> configured inside the Secrets area in the AI Studio UI sidebar.
                    </p>
                  </div>
                )}

                <div ref={chatBottomRef}></div>
              </div>

              {/* Chat Textbox Form Input */}
              <div id="dialogue-form-pane" className="bg-white border-t border-natural-border p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto relative">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask about subnetting, Big O, or system design..."
                    className="flex-1 bg-[#F5F2ED] border border-natural-border rounded-full py-3.5 pl-6 pr-14 text-xs text-natural-text-main focus:outline-none focus:ring-2 focus:ring-natural-primary transition-all resize-none h-12 leading-normal"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !textInput.trim()}
                    className="absolute right-2 top-2 w-8 h-8 bg-natural-dark text-white rounded-full flex items-center justify-center hover:bg-black/90 active:scale-95 disabled:bg-natural-card disabled:text-natural-text-mute transition-all"
                    title="Send Message"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab-driven panels */}
        {activeTab === "subnet" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <SubnetTool />
          </motion.div>
        )}

        {activeTab === "workbench" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <AlgorithmWorkbench onAnalyzeCode={handleAnalyzeCode} isAnalyzing={isPending} />
          </motion.div>
        )}

        {activeTab === "interview" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <InterviewTool onStartSimulation={handleStartInterviewSimulation} />
          </motion.div>
        )}

        {activeTab === "flashcards" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
            <FlashcardTool />
          </motion.div>
        )}
      </main>
    </div>
  );
}
