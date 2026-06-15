import { useState, useEffect } from "react";
import { PRELOADED_FLASHCARDS } from "../data";
import { Flashcard, Category } from "../types";
import { BookOpen, HelpCircle, Layers, Sliders, ChevronLeft, ChevronRight, Check, Plus, Trash2, Tag, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FlashcardTool() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"all" | Category>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");

  // New Flashcard state creators
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("general");
  const [newDifficulty, setNewDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [errorMsg, setErrorMsg] = useState("");

  // Load and sync from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai_study_flashcards");
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (err) {
        setCards(PRELOADED_FLASHCARDS);
      }
    } else {
      setCards(PRELOADED_FLASHCARDS);
      localStorage.setItem("ai_study_flashcards", JSON.stringify(PRELOADED_FLASHCARDS));
    }
  }, []);

  const saveToLocalStorage = (updatedCards: Flashcard[]) => {
    setCards(updatedCards);
    localStorage.setItem("ai_study_flashcards", JSON.stringify(updatedCards));
  };

  // Filter the items list
  const filteredCards = cards.filter((card) => {
    const matchesCat = categoryFilter === "all" || card.category === categoryFilter;
    const matchesDiff = difficultyFilter === "all" || card.difficulty === difficultyFilter;
    return matchesCat && matchesDiff;
  });

  // Handle slide navigations
  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev === 0 ? filteredCards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev === filteredCards.length - 1 ? 0 : prev + 1));
  };

  // Create custom flashcard
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setErrorMsg("Please fill in both the Question and the Answer fields.");
      return;
    }

    const newCard: Flashcard = {
      id: "fc-" + Date.now(),
      question: newQuestion,
      answer: newAnswer,
      category: newCategory,
      difficulty: newDifficulty
    };

    const updated = [newCard, ...cards];
    saveToLocalStorage(updated);
    setNewQuestion("");
    setNewAnswer("");
    setErrorMsg("");
    setCurrentIdx(0);
    setIsFlipped(false);
  };

  // Delete active flashcard
  const handleDeleteCard = (id: string) => {
    const updated = cards.filter(card => card.id !== id);
    saveToLocalStorage(updated);
    if (currentIdx >= updated.length && updated.length > 0) {
      setCurrentIdx(updated.length - 1);
    }
    setIsFlipped(false);
  };

  // Reset index if filters change
  useEffect(() => {
    setCurrentIdx(0);
    setIsFlipped(false);
  }, [categoryFilter, difficultyFilter]);

  const activeCard = filteredCards[currentIdx];

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case "easy": return "border-green-200 text-green-850 bg-green-50";
      case "medium": return "border-amber-200 text-amber-850 bg-amber-50";
      case "hard": return "border-red-200 text-red-850 bg-red-50";
      default: return "border-natural-border text-natural-text-mute bg-[#F5F2ED]";
    }
  };

  return (
    <div id="flashcards-layout-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration & Creator Panel */}
      <div id="flashcards-form-panel" className="lg:col-span-5 space-y-6">
        {/* Filter Management Section */}
        <div className="bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-4 h-4 text-natural-primary" />
            <h2 className="text-sm font-semibold text-natural-text-main">Study Filters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-natural-text-sec mb-1.5">Subject Stream</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "all", label: "All Topics" },
                  { key: "networks", label: "Networks" },
                  { key: "coding", label: "Algorithms" },
                  { key: "interview", label: "Mock Prep" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setCategoryFilter(item.key as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${
                      categoryFilter === item.key
                        ? "bg-natural-primary border-natural-primary-hover text-white shadow-xs"
                        : "bg-white border-natural-border hover:bg-[#F5F2ED] text-natural-text-sec"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-natural-text-sec mb-1.5">Assigned Difficulty</label>
              <div className="flex gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "easy", label: "Easy" },
                  { key: "medium", label: "Medium" },
                  { key: "hard", label: "Hard" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setDifficultyFilter(item.key as any)}
                    className={`flex-1 px-2.5 py-1 text-[11px] rounded border transition-all cursor-pointer font-semibold ${
                      difficultyFilter === item.key
                        ? "bg-natural-primary border-natural-primary-hover text-white"
                        : "bg-white border-natural-border hover:bg-[#F5F2ED] text-natural-text-sec"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Card Creation Form */}
        <div className="bg-[#fbfaf8] border border-natural-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-natural-primary" />
            <h2 className="text-sm font-semibold text-natural-text-main">Create Custom Card</h2>
          </div>

          <form onSubmit={handleCreateCard} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-natural-text-sec mb-1">Question Prompt</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What is the Big-O bound of bubble sort?"
                className="w-full bg-[#F5F2ED] border border-natural-border rounded-lg py-1.5 px-3 text-natural-text-main text-xs focus:ring-1 focus:ring-natural-primary focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-natural-text-sec mb-1">Detailed Answer</label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="e.g. O(N^2) average and worst, O(N) optimized helper swap."
                className="w-full h-20 bg-[#F5F2ED] border border-natural-border rounded-lg p-2.5 text-natural-text-main text-xs focus:ring-1 focus:ring-natural-primary focus:outline-none font-sans resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-natural-text-sec mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Category)}
                  className="w-full bg-[#F5F2ED] border border-natural-border rounded py-1 px-2 text-xs text-natural-text-main focus:outline-none focus:ring-1 focus:ring-natural-primary"
                >
                  <option value="networks">Networks</option>
                  <option value="coding">Coding</option>
                  <option value="interview">Interview</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-natural-text-sec mb-1">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as any)}
                  className="w-full bg-[#F5F2ED] border border-natural-border rounded py-1 px-2 text-xs text-natural-text-main focus:outline-none focus:ring-1 focus:ring-natural-primary"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {errorMsg && <p className="text-[10px] text-[#991b1b] font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full py-2 bg-natural-primary hover:bg-natural-primary-hover border border-natural-primary-dark rounded-lg text-white font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              Add Card
            </button>
          </form>
        </div>
      </div>

      {/* Active recall Slider Frame */}
      <div id="flashcards-slider-panel" className="lg:col-span-7 flex flex-col justify-between">
        {activeCard ? (
          <div className="space-y-4">
            {/* Flip container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[280px] bg-white border border-natural-border rounded-2xl cursor-pointer p-6 hover:shadow-md hover:border-natural-primary-light transition-all flex flex-col justify-between relative overflow-hidden select-none"
            >
              <div className="absolute top-2.5 right-2.5 p-1.5 opacity-60 hover:opacity-100 bg-[#F5F2ED]/80 rounded transition-opacity">
                <Bookmark className="w-3.5 h-3.5 text-natural-primary fill-natural-primary" />
              </div>

              <div id="card-top-infoband" className="flex justify-between items-center text-[10px] font-mono border-b border-natural-border/50 pb-2 mb-3">
                <span className="uppercase text-natural-primary font-bold tracking-wider">
                  Category: {activeCard.category === "coding" ? "Algorithms" : activeCard.category}
                </span>
                <span className={`px-2 py-0.5 rounded border ${getDifficultyStyles(activeCard.difficulty)}`}>
                  {activeCard.difficulty}
                </span>
              </div>

              {/* Central Text */}
              <div className="flex-1 flex items-center justify-center py-4 my-auto">
                <div className="text-center w-full max-w-md mx-auto">
                  {!isFlipped ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-sm font-sans font-semibold text-natural-text-main leading-relaxed"
                    >
                      {activeCard.question}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs font-mono text-natural-primary-hover leading-relaxed text-left whitespace-pre-wrap max-h-[170px] overflow-y-auto"
                    >
                      {activeCard.answer}
                    </motion.div>
                  )}
                </div>
              </div>

              <div id="card-bottom-infoband" className="text-center text-[10px] text-natural-text-mute font-mono pt-3 border-t border-natural-border/50">
                Click Card to {isFlipped ? "Show Question" : "Reveal Answer"}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center bg-[#fbfaf8] p-3 rounded-xl border border-natural-border shadow-xs">
              <div className="flex gap-1.5">
                <button
                  onClick={handlePrev}
                  className="p-1 px-2.5 bg-white hover:bg-[#F5F2ED] border border-natural-border rounded-lg text-natural-text-sec cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 px-2.5 bg-white hover:bg-[#F5F2ED] border border-natural-border rounded-lg text-natural-text-sec cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-natural-text-mid font-mono">
                Card {currentIdx + 1} of {filteredCards.length}
              </span>

              <button
                onClick={() => handleDeleteCard(activeCard.id)}
                className="text-xs font-semibold text-[#c2410c] hover:text-[#9a3412] flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full text-center py-20 bg-[#fbfaf8] border border-natural-border border-dashed rounded-xl text-natural-text-mute text-sm">
            No Flashcards match your active filters. Choose a broader filter or add custom cards.
          </div>
        )}
      </div>
    </div>
  );
}
