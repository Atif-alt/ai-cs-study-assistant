import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Port must be 3000 as per runtime environment config
const PORT = 3000;

// Lazy initialization of Gemini client to prevent crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured yet. Please configure it in your Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// System instruction manager based on category and pedagogical strategy
const getSystemInstruction = (category: string, mode: string) => {
  const instructions = [
    "You are a highly capable, student-centric Computer Science AI Study Assistant and Tutor.",
    "Your mission is to tutor undergraduate and graduate Computer Science/Software Engineering students. Make your answers highly technical but accessible via metaphors, crystal-clear structured formatting, and diagrams.",
    "Ensure any code snippet you write has line-by-line logical context, syntax correctness, and is formatted with proper Markdown syntax.",
    "Use ASCII art diagrams or simple text flowcharts to represent packet exchanges, tree traversal, protocol structures, and pointer modifications where relevant."
  ];

  // Apply CS Topic Guidance
  if (category === "networks") {
    instructions.push(
      "TOPIC: Computer Networks & Protocols.",
      "Focus points: TCP/IP & OSI stacks, socket programming, IP Addressing, subnets/subnetting (CIDR, VLSM), DNS, HTTP (v1.1, v2, v3), flow control (sliding window), congestion control (slow start, AIMD), routing algorithms (Dijkstra, Bellman-Ford, BGP), and ARP.",
      "Where applicable, show visual representations of header layouts, handshakes (SYN -> SYN-ACK -> ACK), or network configurations."
    );
  } else if (category === "coding") {
    instructions.push(
      "TOPIC: Programming Concepts, Data Structures, & Algorithms.",
      "Focus points: Big O performance profiling, core structures (linked lists, trees, graphs, heaps, hash maps), custom sorting, dynamic programming, OOP paradigms, concurrency (locks, threads, race-states), and modern development methodologies.",
      "Explicitly mention Time and Space complexity at the end of any algorithm analysis.",
      "Encourage clean variables, helper functions, and defensive error handling in written examples."
    );
  } else if (category === "interview") {
    instructions.push(
      "TOPIC: Technical Mock Interviewing & Career Prep.",
      "Focus points: FAANG-style software engineering interview questions, system design interviews (scalability, database replication, message queues, CDNs), and behavioral responses utilizing the STAR technique (Situation, Task, Action, Result).",
      "Help the candidate analyze bottlenecks, evaluate tradeoffs (databases vs memory stores), outline distributed layers, and optimize search bounds."
    );
  } else {
    instructions.push(
      "TOPIC: General Computer Science & Engineering.",
      "Provide holistic computer science domain knowledge, linking theories to modern compiler, operation system, or computer architecture executions."
    );
  }

  // Apply Pedagogical Strategy Mode
  if (mode === "socratic") {
    instructions.push(
      "STRATEGY: SOCRATIC METHOD (GUIDED EXPLORATION).",
      "CRITICAL RULE: DO NOT GIVE INDEPENDENT WORKING SOLUTIONS OR THE ENTIRE SOLVED ANSWER DIRECTLY!",
      "Instead, validate whatever progress the student mentions, explain some small bridging concepts, and ask them 1 simple, logical, targeted question to nudge them to the next critical breakthrough.",
      "Make them think about boundary limits, data structures selection, or simple state conversions. Keep them in the lead.",
      "Provide the full summary/code synthesis ONLY when they have confidently deduced the core logic."
    );
  } else if (mode === "cheatsheet") {
    instructions.push(
      "STRATEGY: HIGH-VELOCITY CHEATSHEET SUMMARY.",
      "Generate extremely compact, easily read bulleted notes, comparison charts (using Markdown tables), list of key terminology, core equations (e.g. subnet sizing equations), and memorable visual or text mnemonics to boost memory recall."
    );
  } else if (mode === "quiz") {
    instructions.push(
      "STRATEGY: INTERACTIVE CONCEPT QUIZZER.",
      "Initiate a micro-test based on their query.",
      "Present EXACTLY 1 tailored multiple-choice question (A, B, C, D) or a short code evaluation question.",
      "DO NOT specify the correct answer in the options text. Wait for their response.",
      "When they submit, give an in-depth retrospective explaining why the correct choice works and why other choices fail."
    );
  } else {
    instructions.push(
      "STRATEGY: COMPREHENSIVE COMPANION. Provide a complete structured curriculum. Start with an intuitive metaphor (TL;DR), follow with deep blueprint specifications, show real-world cases, and conclude with three critical study summaries."
    );
  }

  return instructions.join("\n\n");
};

async function createServer() {
  const app = express();
  app.use(express.json());

  // Log server requests
  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  // REST API Endpoints
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, category = "general", mode = "standard" } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Format messages into contents acceptable by Gen AI SDK
      // Message structure is [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
      const formattedContents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const ai = getGeminiClient();
      const systemInst = getSystemInstruction(category, mode);

      console.log(`[Gemini Request] Category: ${category}, Mode: ${mode}, Messages Count: ${formattedContents.length}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInst,
          temperature: 0.7,
        },
      });

      const responseText = response.text || "I was unable to determine a helpful response. Please try rephrasing your question.";
      return res.json({ content: responseText });
    } catch (error: any) {
      console.error("[Gemini Error]", error);
      return res.status(500).json({
        error: error.message || "An unexpected error occurred during AI processing.",
      });
    }
  });

  // Static files and Vite Dev/Prod handling
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static build assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Study Assistant Server running at http://0.0.0.0:${PORT}/`);
  });
}

createServer().catch((err) => {
  console.error("Critical: Failed to bootstrap fullstack Express-Vite server:", err);
});
