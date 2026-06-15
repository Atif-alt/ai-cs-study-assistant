import { Flashcard, SubnetResult, SubnetChallenge } from "./types";

// Dynamic IPv4 Subnet Calculator with real binary arithmetic
export function calculateIPv4Subnet(ip: string, cidr: number): SubnetResult | null {
  try {
    const octets = ip.split(".").map(Number);
    if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255) || cidr < 0 || cidr > 32) {
      return null;
    }

    // Convert IP to a 32-bit integer
    const ipInt = (octets[0] << 24) >>> 0 | (octets[1] << 16) >>> 0 | (octets[2] << 8) >>> 0 | octets[3] >>> 0;

    // Generate Netmask
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;

    // Calculate Network & Broadcast Integers
    const netInt = (ipInt & maskInt) >>> 0;
    const broadInt = (netInt | ~maskInt) >>> 0;

    // Format Mask
    const maskStr = [
      (maskInt >>> 24) & 255,
      (maskInt >>> 16) & 255,
      (maskInt >>> 8) & 255,
      maskInt & 255
    ].join(".");

    // Format Network Address
    const netStr = [
      (netInt >>> 24) & 255,
      (netInt >>> 16) & 255,
      (netInt >>> 8) & 255,
      netInt & 255
    ].join(".");

    // Format Broadcast Address
    const broadStr = [
      (broadInt >>> 24) & 255,
      (broadInt >>> 16) & 255,
      (broadInt >>> 8) & 255,
      broadInt & 255
    ].join(".");

    // Calculate usability bounds
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? 0 : totalHosts - 2;

    let usableRange = "N/A";
    if (cidr < 31) {
      const firstUsableInt = (netInt + 1) >>> 0;
      const lastUsableInt = (broadInt - 1) >>> 0;

      const firstStr = [
        (firstUsableInt >>> 24) & 255,
        (firstUsableInt >>> 16) & 255,
        (firstUsableInt >>> 8) & 255,
        firstUsableInt & 255
      ].join(".");

      const lastStr = [
        (lastUsableInt >>> 24) & 255,
        (lastUsableInt >>> 16) & 255,
        (lastUsableInt >>> 8) & 255,
        lastUsableInt & 255
      ].join(".");

      usableRange = `${firstStr} - ${lastStr}`;
    }

    // Binary mask representation
    const binaryMask = maskInt.toString(2).padStart(32, "0").replace(/(.{8})/g, "$1 ").trim();

    return {
      ipAddress: ip,
      subnetMask: `${maskStr} (/${cidr})`,
      networkAddress: netStr,
      broadcastAddress: broadStr,
      usableRange,
      totalHosts,
      usableHosts,
      binaryMask
    };
  } catch (err) {
    return null;
  }
}

// Generate a random, solvable CIDR / IP challenge for students to solve
export function generateSubnetChallenge(): SubnetChallenge {
  const mockClassAs = ["10", "172.16", "192.168"];
  const selectedOctetHeader = mockClassAs[Math.floor(Math.random() * mockClassAs.length)];

  let ip = "";
  let cidr = 24;

  if (selectedOctetHeader === "10") {
    const o2 = Math.floor(Math.random() * 256);
    const o3 = Math.floor(Math.random() * 256);
    const o4 = Math.floor(Math.random() * 254) + 1;
    ip = `10.${o2}.${o3}.${o4}`;
    // CIDR range between 8 and 28 for Class A
    cidr = Math.floor(Math.random() * 21) + 8;
  } else if (selectedOctetHeader === "172.16") {
    const o3 = Math.floor(Math.random() * 256);
    const o4 = Math.floor(Math.random() * 254) + 1;
    ip = `172.16.${o3}.${o4}`;
    // CIDR range between 12 and 26
    cidr = Math.floor(Math.random() * 15) + 12;
  } else {
    // 192.168
    const o3 = Math.floor(Math.random() * 256);
    const o4 = Math.floor(Math.random() * 254) + 1;
    ip = `192.168.${o3}.${o4}`;
    // CIDR range between 24 and 30
    cidr = Math.floor(Math.random() * 7) + 24;
  }

  const results = calculateIPv4Subnet(ip, cidr);
  if (!results) {
    // fallback safe default
    return {
      ip: "192.168.1.135",
      cidr: 26,
      questionType: "network",
      questionText: "What is the network address (subnet base ID) of 192.168.1.135/26?",
      correctAnswer: "192.168.1.128"
    };
  }

  const questionTypes: Array<SubnetChallenge["questionType"]> = ["mask", "network", "broadcast", "hosts"];
  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  let questionText = "";
  let correctAnswer = "";

  switch (type) {
    case "mask":
      questionText = `What is the standard decimal Subnet Mask for an IP block with a /${cidr} prefix? (e.g., 255.255.x.y)`;
      correctAnswer = results.subnetMask.split(" ")[0];
      break;
    case "network":
      questionText = `What is the Network Address (Subnet Base ID) of the subnet containing the host ${ip}/${cidr}?`;
      correctAnswer = results.networkAddress;
      break;
    case "broadcast":
      questionText = `What is the Broadcast Address of the subnet containing the host ${ip}/${cidr}?`;
      correctAnswer = results.broadcastAddress;
      break;
    case "hosts":
      questionText = `How many USABLE host IP addresses are available in a /${cidr} subnet?`;
      correctAnswer = results.usableHosts.toString();
      break;
  }

  return {
    ip,
    cidr,
    questionType: type,
    questionText,
    correctAnswer
  };
}

// Preloaded interview challenges
export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  description: string;
  starterCode: string;
  hints: string[];
}

export const PRELOADED_INTERVIEW_CHALLENGES: CodingChallenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays & Hash Map",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n**Example:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9, so we return [0, 1].\n```",
    starterCode: `function twoSum(nums: number[], target: number): number[] {
  // Write your O(n) solution here
  const map = new Map<number, number>();
  
  return [];
}`,
    hints: [
      "Can we do this in one pass using a hash map to get O(N) instead of O(N^2) nested loops?",
      "For each element num in the array, check if target - num exists in the map."
    ]
  },
  {
    id: "reverse-list",
    title: "Reverse Linked List",
    difficulty: "Easy",
    topic: "Linked Lists & Pointers",
    description: "Given the `head` of a singly linked list, reverse the list, and return its new absolute head.\n\n**Example:**\n```\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]\n```",
    starterCode: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = (val===undefined ? 0 : val);
    this.next = (next===undefined ? null : next);
  }
}

function reverseList(head: ListNode | null): ListNode | null {
  let prev = null;
  let curr = head;
  
  // Implement pointer flipping logic here

  return prev;
}`,
    hints: [
      "Keep track of three variables during iteration: previous, current, and next.",
      "Before re-pointing current.next, store the actual current.next in a temporary 'next' variable."
    ]
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Sorting & Arrays",
    description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the input intervals.\n\n**Example:**\n```\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].\n```",
    starterCode: `function mergeIntervals(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;
  
  // Sort intervals by start time first!
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged: number[][] = [];
  
  return merged;
}`,
    hints: [
      "Sorting intervals by their starting times makes overlap detection much simpler. Why?",
      "If the current interval matches or overlaps with the last interval in 'merged', merge them by updating the end time."
    ]
  },
  {
    id: "lru-cache",
    title: "LRU Cache (System Design & Code)",
    difficulty: "Medium",
    topic: "Design / Doubly-Linked-List",
    description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) Cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(capacity)` Initialize the cache with positive size `capacity`.\n- `get(key)` Return the value of the `key` if the key exists, otherwise return `-1`.\n- `put(key, value)` Update the value of the `key` if it exists. Otherwise, add the `key-value` pair. If the number of keys exceeds the capacity, evict the least recently used key.\n\nCould you do both operations in **O(1)** average time complexity?",
    starterCode: `class LRUCache {
  private capacity: number;
  private cache: Map<number, number>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: number): number {
    // Retrieve value and update the key to be most recently used
    return -1;
  }

  put(key: number, value: number): void {
    // Add value, evict LRU item if size > capacity
  }
}`,
    hints: [
      "JavaScript/TypeScript Maps maintain insertion order! This makes LRU implementation using a standard Map incredibly beautiful and O(1).",
      "When a key is accessed (get) or updated (put), you can delete it from the map and re-set it to mark it as the most recently inserted (MRU)."
    ]
  }
];

// Preloaded flashcards for key active recall concepts
export const PRELOADED_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    question: "What are the 5 layers of the standard Internet Protocol Stack / TCP Model?",
    answer: "1. Physical (raw bit streams, cables)\n2. Link (Ethernet, Wi-Fi, switches, MAC addressing)\n3. Network (IP, ICMP, packet routing)\n4. Transport (TCP congestion control, UDP stream sockets)\n5. Application (HTTP, DNS, SMTP, FTP)",
    category: "networks",
    difficulty: "easy"
  },
  {
    id: "fc-2",
    question: "How does the TCP 3-Way Handshake build an active connection?",
    answer: "1. Client sends SYN (Synchronize) packet with initial sequence number X.\n2. Server replies with SYN-ACK packet, synchronizing sequence number Y and acknowledging client's number X+1.\n3. Client sends ACK (Acknowledge) packet acknowledging server's Y+1.",
    category: "networks",
    difficulty: "medium"
  },
  {
    id: "fc-3",
    question: "What is the difference between TCP congestion control (AIMD) and flow control?",
    answer: "- Congestion Control prevents the network from collapsing by limiting transfer windows on network congestion signals (like package loss or latency spikes).\n- Flow Control prevents the sender from overwhelming the receiver's local incoming buffers. It uses the 'Receive Window' (RWIN) field in TCP headers.",
    category: "networks",
    difficulty: "hard"
  },
  {
    id: "fc-4",
    question: "Explain the absolute difference between Time Complexity O(log n) and O(n log n).",
    answer: "- O(log n) represents logarithmic scaling. The system halves the problem size at each iteration (e.g. Binary Search). Highly efficient.\n- O(n log n) represents linearithmic scaling. It performs a logarithmic action n separate times (e.g. Master Theorem split sorting like Merge Sort or Quicksort).",
    category: "coding",
    difficulty: "easy"
  },
  {
    id: "fc-5",
    question: "What is dynamic programming (DP), and how does Memoization differ from Tabulation?",
    answer: "DP solves complex problems by breaking them into overlapping subproblems.\n- Memoization (Top-down) caches recursive function calls dynamically as they run.\n- Tabulation (Bottom-up) builds an iterative state-transition chart (array) from base layers to goals.",
    category: "coding",
    difficulty: "hard"
  },
  {
    id: "fc-6",
    question: "Explain DB Replication: What is Single-Primary (Leader) vs Multi-Primary (Leaderless)?",
    answer: "- Single-Primary: All updates (writes) hit a central primary database node. Read queries distribute to secondary replica nodes.\n- Leaderless (Quorum): Client writes to multiple nodes directly. Consensus is verified when write & read counts satisfy: W + R > N (quorum rule).",
    category: "interview",
    difficulty: "medium"
  }
];

// Preloaded Algorithm Templates for code analyzer
export const ALGORITHM_TEMPLATES = [
  {
    name: "Binary Search",
    lang: "typescript",
    code: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) {
      return mid; // Found the target index!
    } else if (arr[mid] < target) {
      left = mid + 1; // Narrow down to the right split
    } else {
      right = mid - 1; // Narrow down to the left split
    }
  }
  return -1; // Target not located in sorted array
}`
  },
  {
    name: "Sliding Window Maximum",
    lang: "typescript",
    code: `function maxSequenceSum(arr: number[], k: number): number {
  if (arr.length < k || k <= 0) return 0;
  
  let windowSum = 0;
  // Calculate first window total
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    // Add current, remove the element falling out of the window
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}`
  },
  {
    name: "Recursive Fibonacci WITH Memoization",
    lang: "typescript",
    code: `function fibonacciMemo(n: number, memo: Record<number, number> = {}): number {
  if (n <= 1) return n;
  if (n in memo) return memo[n]; // memo check
  
  // Save computed subproblems
  memo[n] = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
  return memo[n];
}`
  }
];
