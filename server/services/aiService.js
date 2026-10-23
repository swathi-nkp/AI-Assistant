import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check active AI mode from environment: 'offline' (default) or 'openai'
 */
export const getAIMode = () => {
  dotenv.config({ path: path.join(__dirname, '../.env'), override: true });
  return (process.env.AI_MODE || 'offline').toLowerCase().trim();
};

/**
 * OpenAI Client Initializer (Used only when AI_MODE=openai)
 */
const getOpenAIClient = () => {
  dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

  const apiKey = process.env.OPENAI_API_KEY;
  if (
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey === 'your_key_here' ||
    apiKey === 'your_openai_api_key_here'
  ) {
    throw new Error(
      'OPENAI_API_KEY is not configured in server/.env. Please add your OpenAI API key or set AI_MODE=offline to use the free offline academic tutor.'
    );
  }
  return new OpenAI({ apiKey: apiKey.trim() });
};

const getModel = () => {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
};

/* ==========================================================================
   OFFLINE ACADEMIC TUTOR KNOWLEDGE BASE & CONVERSATION ENGINE
   ========================================================================== */

const TOPIC_DATABASE = {
  closure: {
    name: 'JavaScript Closures',
    keywords: ['closure', 'closures', 'lexical scope', 'outer function', 'inner function'],
    definition: `A **closure** is created when an inner function retains access to variables from its outer (enclosing) lexical scope, even after that outer function has returned and finished execution.`,
    concept: `In JavaScript, every time a function is created, a closure is created with a reference to its outer lexical environment. Because functions carry this hidden reference, variables defined in the outer scope persist in memory rather than being garbage collected.`,
    example: `\`\`\`javascript
function createCounter(initialValue = 0) {
  let count = initialValue; // Enclosed state variable

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = createCounter(10);
console.log(counter.increment()); // 11
console.log(counter.getCount());  // 11
// 'count' cannot be accessed or modified from the outside!
\`\`\``,
    whyUseful: `1. **Data Encapsulation & Privacy:** Emulating private variables before JavaScript introduced \`#privateField\`.
2. **Function Factories:** Constructing specialized functions with pre-configured parameters.
3. **Event Handlers & Currying:** Preserving state across asynchronous callbacks and intervals.`,
    pitfalls: `• **Memory Overhead:** Enclosed variables are held in memory; unnecessary closures over large objects can cause memory leaks.
• **Loop Pitfall with \`var\`:** In older code, using \`var i\` in a \`for\` loop shares a single instance across all iterations. Using \`let i\` creates a fresh block-scoped binding per iteration.`,
    keyTakeaway: `Closures allow inner functions to remember their birthplace. They give functions persistent private memory.`
  },

  scope: {
    name: 'JavaScript Scope & Scope Chain',
    keywords: ['scope', 'lexical scope', 'block scope', 'global scope', 'scope chain'],
    definition: `**Scope** in JavaScript determines the visibility and accessibility of variables and functions at different parts of your code.`,
    concept: `JavaScript has three primary types of scope:
1. **Global Scope:** Accessible anywhere in the application.
2. **Function Scope:** Variables declared with \`var\` are scoped to their enclosing function.
3. **Block Scope:** Variables declared with \`let\` and \`const\` are scoped to the nearest pair of curly braces \`{ ... }\`.
When a variable is referenced, the runtime traverses the **Scope Chain** outward from the local environment until it finds the identifier or reaches the global object.`,
    example: `\`\`\`javascript
const globalVar = "Accessible everywhere";

function outer() {
  const outerVar = "Visible in outer & inner";

  if (true) {
    let blockVar = "Only visible inside this block";
    console.log(outerVar); // Accessible (found via scope chain)
  }

  // console.log(blockVar); // ReferenceError: blockVar is not defined
}
\`\`\``,
    whyUseful: `Preventing variable name collisions, enforcing modularity, and keeping internal state isolated.`,
    pitfalls: `Polluting the global scope leads to accidental overwrites and unpredictable side effects. Always prefer \`const\` and \`let\`.`,
    keyTakeaway: `JavaScript utilizes lexical (static) scoping: variable access is determined by where functions and blocks are physically written in the code.`
  },

  promises: {
    name: 'JavaScript Promises & Asynchronous Execution',
    keywords: ['promise', 'promises', '.then', '.catch', 'microtask', 'resolve', 'reject'],
    definition: `A **Promise** is an object representing the eventual completion (or failure) of an asynchronous operation and its resulting value.`,
    concept: `A Promise exists in one of three mutually exclusive states:
1. **Pending:** Initial state, neither fulfilled nor rejected.
2. **Fulfilled:** The asynchronous task succeeded; resolves with a value.
3. **Rejected:** The asynchronous task failed; rejects with a reason/error.
Promises execute their callbacks in the JavaScript **Microtask Queue**, giving them priority over Macrotasks (like \`setTimeout\`).`,
    example: `\`\`\`javascript
function fetchStudentData(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, name: "Student Alex", gpa: 3.8 });
      } else {
        reject(new Error("Invalid student ID"));
      }
    }, 500);
  });
}

fetchStudentData(101)
  .then((student) => console.log("Success:", student.name))
  .catch((err) => console.error("Error:", err.message))
  .finally(() => console.log("Request finished"));
\`\`\``,
    whyUseful: `Solves **Callback Hell** (Pyramid of Doom), standardizes asynchronous error handling with \`.catch()\`, and enables concurrent operations using \`Promise.all()\` and \`Promise.race()\`.`,
    pitfalls: `Forgetting to return promises in chained \`.then()\` handlers or omitting \`.catch()\` which causes unhandled rejection warnings.`,
    keyTakeaway: `Promises standardize asynchronous workflows into composable, chainable pipeline objects.`
  },

  async_await: {
    name: 'Async / Await in JavaScript',
    keywords: ['async', 'await', 'async/await', 'asynchronous'],
    definition: `**async/await** is syntactic sugar built on top of JavaScript Promises, allowing asynchronous code to be written and read like synchronous code.`,
    concept: `• Adding \`async\` before a function guarantees that it returns a Promise.
• The \`await\` keyword can only be used inside an \`async\` function (or top-level modules). It pauses execution of the surrounding async function until the Promise settles, without blocking the main browser thread.`,
    example: `\`\`\`javascript
async function loadCoursework(courseId) {
  try {
    const response = await fetch(\`/api/courses/\${courseId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Course load failed:", error.message);
    throw error;
  }
}
\`\`\``,
    whyUseful: `Significantly improves code readability, streamlines error handling via standard \`try...catch\` blocks, and simplifies complex sequential API calls.`,
    pitfalls: `Accidental sequential bottlenecks. If two API requests do not depend on each other, do not \`await\` them sequentially; use \`await Promise.all([fetchA(), fetchB()])\` to run them concurrently.`,
    keyTakeaway: `async/await makes asynchronous code readable and maintainable while retaining non-blocking asynchronous execution.`
  },

  react: {
    name: 'React.js Core Concepts',
    keywords: ['react', 'virtual dom', 'reconciliation', 'jsx', 'component'],
    definition: `**React** is a declarative, component-driven JavaScript library for building interactive user interfaces.`,
    concept: `React structures UIs into self-contained, reusable components. Instead of directly mutating the browser DOM, React maintains an in-memory representation called the **Virtual DOM**. When component state changes, React performs **Reconciliation** (diffing) and updates only the necessary real DOM nodes.`,
    example: `\`\`\`jsx
function WelcomeCard({ studentName, enrolledCourses }) {
  return (
    <div className="card">
      <h2>Welcome, {studentName}! 👋</h2>
      <p>Active Courses: {enrolledCourses.length}</p>
    </div>
  );
}
\`\`\``,
    whyUseful: `1. Reusable component architecture.
2. Unidirectional data flow (parent to child via props).
3. Optimized rendering performance via Virtual DOM.`,
    pitfalls: `Directly modifying state without setter functions, or mutating props directly. Props are strictly read-only.`,
    keyTakeaway: `React views are a pure function of state: UI = f(state).`
  },

  usestate: {
    name: 'React useState Hook',
    keywords: ['usestate', 'state', 'setstate'],
    definition: `**useState** is a React Hook that adds reactive local state to functional components.`,
    concept: `Calling \`useState(initialValue)\` returns an array with exactly two elements:
1. The current state variable.
2. A setter function to update that state and schedule a component re-render.`,
    example: `\`\`\`jsx
import React, { useState } from 'react';

function LikeCounter() {
  const [likes, setLikes] = useState(0);

  // Functional update ensures safe state transitions
  const handleLike = () => {
    setLikes((prevLikes) => prevLikes + 1);
  };

  return (
    <button onClick={handleLike}>
      👍 Liked {likes} times
    </button>
  );
}
\`\`\``,
    whyUseful: `Enables functional components to store and update dynamic data without writing legacy ES6 class components.`,
    pitfalls: `State updates are asynchronous and batched. Reading state immediately after calling \`setCount(count + 1)\` returns the old value. Use functional updates (\`prev => prev + 1\`) when new state depends on previous state.`,
    keyTakeaway: `Never mutate state directly (e.g. \`state.count = 5\`). Always invoke the setter function so React knows to trigger a re-render.`
  },

  useeffect: {
    name: 'React useEffect Hook & Lifecycle',
    keywords: ['useeffect', 'dependency array', 'side effect', 'cleanup function'],
    definition: `**useEffect** is a React Hook that lets functional components perform side effects (data fetching, DOM listeners, timers, subscriptions).`,
    concept: `The dependency array controls execution:
• **No dependency array:** Runs after *every* render.
• **Empty array \`[]\`:** Runs once when component mounts; cleanup runs on unmount.
• **Dependency array \`[id, filter]\`:** Runs on mount and whenever specified values change.
• **Cleanup function:** A returned callback from the effect runs before the next effect execution and when the component unmounts.`,
    example: `\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Cleanup prevents memory leaks!
    return () => clearInterval(interval);
  }, []); // Empty array: runs on mount only

  return <p>Elapsed: {seconds}s</p>;
}
\`\`\``,
    whyUseful: `Consolidates lifecycle behaviors (\`componentDidMount\`, \`componentDidUpdate\`, \`componentWillUnmount\`) into a unified, declarative API.`,
    pitfalls: `Omitting required dependencies from the array causes stale closures. Forgetting cleanup functions on subscriptions or timers causes memory leaks.`,
    keyTakeaway: `Isolate side effects in useEffect, declare all external reactive values in the dependency array, and return a cleanup function when necessary.`
  },

  useref: {
    name: 'React useRef Hook',
    keywords: ['useref', 'dom reference', 'mutable reference'],
    definition: `**useRef** returns a mutable ref object whose \`.current\` property persists across renders without causing a re-render when modified.`,
    concept: `useRef has two primary use cases:
1. **Accessing DOM nodes directly** (e.g., auto-focusing an input, measuring element size, or auto-scrolling a chat container).
2. **Storing mutable instance variables** (like timer IDs or previous state values) that shouldn't trigger a visual update when changed.`,
    example: `\`\`\`jsx
import React, { useRef } from 'react';

function AutoScrollChat() {
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <div className="messages">...</div>
      <div ref={bottomRef} />
    </div>
  );
}
\`\`\``,
    whyUseful: `Allows persistent mutable state without unnecessary component re-renders.`,
    pitfalls: `Do not read or write \`ref.current\` during the rendering phase. Only interact with refs in event handlers or inside \`useEffect\`.`,
    keyTakeaway: `useRef is like a "box" holding a value across renders. Updating \`ref.current\` does NOT trigger a re-render.`
  },

  usecontext: {
    name: 'React useContext Hook & Context API',
    keywords: ['usecontext', 'context api', 'prop drilling', 'global state'],
    definition: `**useContext** allows functional components to subscribe to React context without manual prop drilling.`,
    concept: `Context provides a mechanism to pass data through the component tree without manually passing props down through intermediate components at every level.
Consists of:
1. \`createContext(defaultValue)\`
2. \`<MyContext.Provider value={...}>\`
3. \`useContext(MyContext)\` in consumer components.`,
    example: `\`\`\`jsx
import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(!dark) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeButton() {
  const { dark, toggle } = useContext(ThemeContext);
  return <button onClick={toggle}>{dark ? '🌙 Dark' : '☀️ Light'}</button>;
}
\`\`\``,
    whyUseful: `Eliminates prop drilling for global or subtree concerns such as current authenticated user, theme, or language localization.`,
    pitfalls: `Every consumer component re-renders whenever the context value changes. For massive state trees with frequent updates, optimize or separate contexts.`,
    keyTakeaway: `useContext makes shared data globally accessible to any nested component in the provider's subtree.`
  },

  node_express: {
    name: 'Node.js & Express.js Architecture',
    keywords: ['node', 'node.js', 'express', 'express.js', 'middleware', 'routing'],
    definition: `**Node.js** is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine. **Express** is a minimalist web framework for Node.js.`,
    concept: `Node.js uses an event-driven, non-blocking I/O model making it efficient for data-intensive real-time applications.
Express organizes backend applications into **Middleware functions** that intercept incoming HTTP requests, perform logic, and invoke \`next()\` or send a response.`,
    example: `\`\`\`javascript
import express from 'express';

const app = express();
app.use(express.json()); // Built-in body parser middleware

// Custom logging middleware
app.use((req, res, next) => {
  console.log(\`[\${req.method}] \${req.url}\`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

app.listen(5000, () => console.log('Server active on port 5000'));
\`\`\``,
    whyUseful: `Unified full-stack JavaScript (same language frontend and backend), high throughput for I/O operations, and a rich npm ecosystem.`,
    pitfalls: `CPU-intensive operations (heavy image processing or cryptography) can block the single-threaded event loop. Offload CPU-heavy tasks to worker threads.`,
    keyTakeaway: `Express applications are essentially a stack of middleware functions executed in sequence during the HTTP request-response cycle.`
  },

  rest_api: {
    name: 'RESTful API Design & HTTP Principles',
    keywords: ['rest', 'rest api', 'http methods', 'status codes', 'endpoint', 'endpoints'],
    definition: `A **REST API** (Representational State Transfer) is an architectural style for networked client-server applications that uses stateless communication and standard HTTP methods.`,
    concept: `Core REST Principles:
• **Statelessness:** Each request from client to server must contain all necessary authentication and context data; the server stores no client session context.
• **Resource-Oriented URIs:** URIs represent nouns (resources), not actions (e.g. \`GET /api/notes\`, not \`/api/getNotes\`).
• **Standard HTTP Verbs:**
  - \`GET\`: Retrieve a resource (Idempotent, Safe).
  - \`POST\`: Create a new resource.
  - \`PUT\` / \`PATCH\`: Update existing resource.
  - \`DELETE\`: Remove resource.
• **HTTP Status Codes:** 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Error).`,
    example: `\`\`\`http
POST /api/quizzes HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "JavaScript Closures",
  "numQuestions": 5
}
\`\`\``,
    whyUseful: `Decouples the frontend client from backend databases, enabling independent scaling, deployment, and multi-platform support (Web, iOS, Android).`,
    pitfalls: `Over-fetching or under-fetching data, and using incorrect HTTP status codes (e.g. returning 200 OK for errors).`,
    keyTakeaway: `REST treats data as resources identified by clean URIs and manipulated via standard HTTP methods.`
  },

  mongodb_mongoose: {
    name: 'MongoDB & Mongoose ODM',
    keywords: ['mongodb', 'mongoose', 'nosql', 'bson', 'schema', 'document', 'collection'],
    definition: `**MongoDB** is a document-oriented NoSQL database that stores data in flexible BSON structures. **Mongoose** is an Object Data Modeling (ODM) library for Node.js.`,
    concept: `Unlike relational databases with rigid tables and rows, MongoDB stores records as **Documents** within **Collections**.
Mongoose adds schema definition, type casting, validation, middleware hooks, and query helpers on top of MongoDB's native driver.`,
    example: `\`\`\`javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
\`\`\``,
    whyUseful: `Flexible data schemas, rapid prototyping, JSON-like structures that map naturally to JavaScript objects, and straightforward horizontal scaling.`,
    pitfalls: `Lacking relational integrity checks unless enforced at application level; unbounded embedded arrays that exceed MongoDB's 16MB document size limit.`,
    keyTakeaway: `MongoDB provides document flexibility; Mongoose provides structure, validation, and relationships.`
  },

  database_normalization: {
    name: 'Database Normalization (1NF to BCNF)',
    keywords: ['normalization', '1nf', '2nf', '3nf', 'bcnf', 'redundancy', 'anomalies'],
    definition: `**Normalization** is the systematic database design technique of organizing tables to minimize redundancy and prevent insertion, update, and deletion anomalies.`,
    concept: `The Normal Forms:
1. **1NF (First Normal Form):** Every column must contain atomic (indivisible) values; no repeating groups or arrays in columns.
2. **2NF (Second Normal Form):** Must be in 1NF, and every non-key column must be fully functionally dependent on the entire primary key (no partial dependency on composite keys).
3. **3NF (Third Normal Form):** Must be in 2NF, and have no transitive dependencies (non-key columns must not depend on other non-key columns).
4. **BCNF (Boyce-Codd Normal Form):** A stricter version of 3NF where for every functional dependency X → Y, X must be a candidate key.`,
    example: `\`\`\`sql
-- Before Normalization (Anomalies):
-- StudentID, StudentName, CourseID, CourseName, Instructor

-- After 3NF Normalization:
-- Students: (StudentID, StudentName)
-- Courses: (CourseID, CourseName, InstructorID)
-- Enrollments: (StudentID, CourseID, EnrollmentDate)
\`\`\``,
    whyUseful: `Eliminates wasted disk space, preserves data consistency, and guarantees that updates only need to occur in a single location.`,
    pitfalls: `Over-normalizing leads to excessive JOIN operations, increasing query latency. Production systems often intentionally denormalize specific read-heavy paths.`,
    keyTakeaway: `Normalization rule of thumb: "Every non-key attribute must depend on the key, the whole key, and nothing but the key, so help me Codd."`
  },

  jwt_auth: {
    name: 'JWT & Authentication / Authorization',
    keywords: ['jwt', 'json web token', 'authentication', 'authorization', 'bcrypt', 'token'],
    definition: `**JWT (JSON Web Token)** is a compact, URL-safe standard (RFC 7519) used to securely transmit claims between parties as a JSON object.`,
    concept: `A JWT consists of three parts separated by dots:
1. **Header:** Algorithm & token type (\`{ "alg": "HS256", "typ": "JWT" }\`).
2. **Payload:** Claims containing user ID and expiration (\`{ "id": "123", "exp": 1720000000 }\`).
3. **Signature:** Cryptographic hash of \`HMACSHA256(base64(header) + "." + base64(payload), secret)\`.
Authentication verifies identity (e.g. login with hashed passwords via \`bcrypt\`). Authorization verifies permissions (e.g. admin role).`,
    example: `\`\`\`javascript
// Backend token verification middleware:
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user to request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
\`\`\``,
    whyUseful: `Enables stateless authentication; servers do not need to query a session database on every incoming request.`,
    pitfalls: `Storing sensitive secrets in the payload (payload is only Base64 encoded, not encrypted) or storing JWTs in insecure client locations vulnerable to XSS.`,
    keyTakeaway: `JWTs are digitally signed credentials. The server verifies their authenticity via the cryptographic signature without holding server-side sessions.`
  },

  data_structures_algorithms: {
    name: 'Data Structures & Algorithms',
    keywords: ['data structure', 'algorithm', 'big o', 'complexity', 'array', 'linked list', 'stack', 'queue', 'binary search', 'sorting'],
    definition: `**Data Structures** are specialized formats for organizing and storing data. **Algorithms** are step-by-step procedures for solving computational problems.`,
    concept: `Asymptotic Analysis (Big-O Notation):
• **O(1) Constant:** Instant access (Hash table lookup, array indexing).
• **O(log n) Logarithmic:** Halving problem space (Binary Search).
• **O(n) Linear:** Single loop over data (Linear Search).
• **O(n log n) Linearithmic:** Optimal comparison sorting (MergeSort, QuickSort).
• **O(n²) Quadratic:** Nested loops (BubbleSort, brute force comparisons).
Common Structures: Arrays, Linked Lists, Stacks (LIFO), Queues (FIFO), Hash Maps, Binary Search Trees, Graphs.`,
    example: `\`\`\`javascript
// Binary Search: O(log n) Time, O(1) Space
function binarySearch(sortedArr, target) {
  let left = 0;
  let right = sortedArr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1; // Not found
}
\`\`\``,
    whyUseful: `Choosing the right data structure dramatically improves time and space efficiency, transforming unusable exponential algorithms into scalable solutions.`,
    pitfalls: `Optimizing prematurely or using complex trees where a simple hash table or array is far more cache-friendly and appropriate.`,
    keyTakeaway: `Understand the trade-offs: arrays provide O(1) random access but O(n) insertions; hash tables provide average O(1) lookups at the cost of additional memory.`
  }
};

/**
 * Detect topic from text query
 */
function detectTopic(query) {
  if (!query || typeof query !== 'string') return null;
  const q = query.toLowerCase();

  for (const [key, data] of Object.entries(TOPIC_DATABASE)) {
    for (const kw of data.keywords) {
      // Check for word boundary or direct match
      if (q.includes(kw)) {
        return key;
      }
    }
  }
  return null;
}

/**
 * Detect user intent: 'example', 'why_useful', 'pitfalls', 'interview', 'explain'
 */
function detectIntent(query) {
  const q = query.toLowerCase();
  if (q.includes('example') || q.includes('sample') || q.includes('show code') || q.includes('code snippet') || q.includes('how to write')) {
    return 'example';
  }
  if (q.includes('why') || q.includes('useful') || q.includes('benefit') || q.includes('advantage') || q.includes('pros') || q.includes('use case')) {
    return 'why_useful';
  }
  if (q.includes('pitfall') || q.includes('mistake') || q.includes('gotcha') || q.includes('error') || q.includes('caution')) {
    return 'pitfalls';
  }
  if (q.includes('interview') || q.includes('question') || q.includes('test me') || q.includes('exam')) {
    return 'interview';
  }
  return 'explain';
}

/**
 * Inspect conversation history for active topic context (Follow-up handling)
 */
function resolveTopicFromContext(messages, prompt) {
  // 1. Check prompt first
  const promptTopic = detectTopic(prompt);
  if (promptTopic) return promptTopic;

  // 2. Scan recent conversation history backwards
  if (Array.isArray(messages)) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg && msg.content) {
        const historyTopic = detectTopic(msg.content);
        if (historyTopic) return historyTopic;
      }
    }
  }

  return 'general';
}

/**
 * Build rich, structured offline response for a given topic, intent, and tutoring style
 */
function buildOfflineResponse(topicKey, intent, prompt, style = 'academic') {
  const topic = TOPIC_DATABASE[topicKey];

  if (!topic) {
    const cleanPrompt = prompt.replace(/[?.,!]/g, '').trim();

    if (style === 'concise') {
      return `### ⚡ High-Yield Study Notes: ${cleanPrompt}

• **Core Concept:** ${cleanPrompt} is a key architectural foundation establishing modularity and clear operational boundaries.
• **Primary Principle:** Eliminates ambiguity by ensuring standard predictable outputs from defined inputs.
• **Exam Focus:** Understand trade-offs between execution performance, resource consumption, and maintenance complexity.

📌 **Quick Takeaway:** *Focus on the problem it solves and real-world trade-offs.*`;
    }

    if (style === 'code') {
      return `### 💻 Implementation Guide: ${cleanPrompt}

When implementing or designing solutions around **${cleanPrompt}**, structure code into three isolated stages:

\`\`\`javascript
// Step 1: Input validation & prerequisite setup
function execute${cleanPrompt.replace(/\s+/g, '')}(params = {}) {
  if (!params || typeof params !== 'object') {
    throw new TypeError("Invalid parameter specification");
  }

  // Step 2: Core state transformation & execution
  const processedState = {
    ...params,
    executedAt: new Date().toISOString(),
    status: "active"
  };

  // Step 3: Return predictable outcome
  return processedState;
}
\`\`\`

#### 🔍 Engineering Walkthrough:
1. Always validate boundaries before triggering state mutations.
2. Isolate side effects to maintain testable, modular components.
3. Clean up resources and gracefully catch runtime exceptions.`;
    }

    if (style === 'socratic') {
      return `### 🧠 Socratic Inquiry: ${cleanPrompt}

To truly master **${cleanPrompt}**, let's reason through its necessity together:

Consider a large-scale application where different modules interact without clear boundaries. 
*What happens if two independent systems try to mutate shared state at the exact same moment?*

💡 **Think about this:**
If you had to design a mechanism for **${cleanPrompt}** from scratch, would you prioritize maximum execution speed or strict data consistency? Why?

*Reply with your thoughts, and let's work through the mechanics together!*`;
    }

    // Default: Academic
    return `### Academic Concept Overview: ${cleanPrompt}

Let's break down **${cleanPrompt}** into core principles and study takeaways:

---

#### 1. Definition & Core Concept
**${cleanPrompt}** represents a fundamental concept in computing and academic studies. It addresses how systems organize information, define operational boundaries, and establish repeatable workflows.

#### 2. Key Conceptual Pillars
- **Modularity & Structure:** Breaking down large problems into isolated, testable components.
- **Predictability:** Ensuring that equivalent inputs yield consistent, verifiable outputs.
- **Optimization:** Balancing trade-offs between execution speed, memory consumption, and developer maintainability.

#### 3. Practical Example & Illustration
When implementing or studying this concept, structure your thought process into three phases:
1. **Inputs & Prerequisites:** Define the initial state and dependencies.
2. **Core Transformation:** Execute the logic step by step without skipping state transitions.
3. **Validation:** Check boundary conditions and handle edge cases gracefully.

---

#### 📌 Exam & Interview Takeaway:
*Focus on the trade-offs and rationale behind this concept. Be prepared to explain both the high-level theoretical purpose and how it is applied in production systems.*

💡 *Tip: Feel free to ask for a specific code example, common pitfalls, or switch tutoring styles in the toolbar!*`;
  }

  // Topic is matched! Handle tutoring styles
  if (style === 'concise') {
    return `### ⚡ High-Yield Notes: ${topic.name}

• **Definition:** ${topic.definition}
• **Key Mechanics:** ${topic.keyTakeaway}
• **Why Useful:** ${topic.whyUseful.split('\n')[0] || topic.whyUseful}

📌 **Exam Core Takeaway:**
*${topic.keyTakeaway}*`;
  }

  if (style === 'code') {
    return `### 💻 Code Implementation & Mechanics: ${topic.name}

${topic.example}

---

#### 🔍 Execution Walkthrough:
${topic.concept}

#### 💡 Architectural Pattern:
${topic.whyUseful}

📌 **Developer Best Practice:**
*${topic.keyTakeaway}*`;
  }

  if (style === 'socratic') {
    return `### 🧠 Socratic Challenge: ${topic.name}

${topic.definition}

Now, let's explore the deeper mechanics with a challenge scenario:

Given this code pattern:
${topic.example}

🤔 **Question for you to consider:**
*If this function were called 10,000 times inside an asynchronous loop without cleanup, what would happen to system memory and garbage collection?*

*Share your prediction, and let's dissect the runtime behavior step-by-step!*`;
  }

  // Topic matched with specific intent (example, why_useful, pitfalls)
  if (intent === 'example') {
    return `### Practical Code Example: ${topic.name}

Here is a clear, runnable example demonstrating **${topic.name}**:

${topic.example}

---

#### 🔍 Code Walkthrough:
${topic.concept}

#### 💡 Core Takeaway:
${topic.keyTakeaway}`;
  }

  if (intent === 'why_useful') {
    return `### Why is ${topic.name} Useful?

${topic.whyUseful}

---

#### 💡 Theoretical Mechanism:
${topic.definition}

#### 🎯 Key Takeaway:
${topic.keyTakeaway}`;
  }

  if (intent === 'pitfalls') {
    return `### Common Pitfalls & Mistakes with ${topic.name}

${topic.pitfalls}

---

#### 💡 Best Practice Reminder:
${topic.keyTakeaway}

#### Example to Reference:
${topic.example}`;
  }

  // Default: Academic Comprehensive walkthrough
  return `### ${topic.name}

${topic.definition}

---

#### 🧠 How It Works:
${topic.concept}

#### 💻 Practical Example:
${topic.example}

#### 🎯 Why It Matters:
${topic.whyUseful}

---

#### 📌 Exam Revision Key Takeaway:
*${topic.keyTakeaway}*

💡 *Switch tutoring styles using the toolbar (e.g. ⚡ Concise, 💻 Code-First, or 🧠 Socratic Challenge)!*`;
}

/* ==========================================================================
   PUBLIC AI SERVICE EXPORTS (OFFLINE + OPENAI MODES)
   ========================================================================== */

/**
 * 1. Generate Chat Response
 */
export const generateChatResponse = async ({ messages, prompt, style = 'academic' }) => {
  const mode = getAIMode();
  const lastUserMessage = prompt || (messages && messages[messages.length - 1]?.content) || '';
  const cleanStyle = ['academic', 'concise', 'code', 'socratic'].includes(String(style).toLowerCase())
    ? String(style).toLowerCase()
    : 'academic';

  // -------------------------
  // MODE 1: OFFLINE MODE
  // -------------------------
  if (mode === 'offline') {
    const topicKey = resolveTopicFromContext(messages, lastUserMessage);
    const intent = detectIntent(lastUserMessage);
    return buildOfflineResponse(topicKey, intent, lastUserMessage, cleanStyle);
  }

  // -------------------------
  // MODE 2: OPENAI MODE
  // -------------------------
  const openai = getOpenAIClient();
  let model = getModel();

  const formattedMessages = (messages || []).map((msg) => ({
    role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
    content: typeof msg.content === 'string' ? msg.content : String(msg.content || ''),
  }));

  if (prompt && prompt.trim()) {
    const lastMsg = formattedMessages[formattedMessages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== prompt.trim()) {
      formattedMessages.push({ role: 'user', content: prompt.trim() });
    }
  }

  const STYLE_SYSTEM_PROMPTS = {
    academic: `You are an elite university computer science professor.
Explain concepts thoroughly with rigorous theoretical foundations, underlying mechanics, architectural trade-offs, structured markdown headings, clean code examples, and exam review takeaways.`,
    concise: `You are a high-yield exam preparation coach.
Deliver punchy, bullet-pointed study notes with zero fluff. Focus strictly on core definitions, critical facts, and high-yield exam takeaways.`,
    code: `You are a staff software engineer and technical mentor.
Deliver practical, code-first explanations. Provide clean, modern, idiomatic code snippets with inline comments, line-by-line walkthroughs, and real-world debugging advice.`,
    socratic: `You are a Socratic tutor and mentor.
Guide the student through conceptual reasoning. Instead of giving long textbook dumps immediately, explain the principle briefly, offer an analogy, and prompt them with an insightful follow-up question to test their understanding.`,
  };

  const TUTOR_SYSTEM = STYLE_SYSTEM_PROMPTS[cleanStyle] || STYLE_SYSTEM_PROMPTS.academic;

  try {
    let response;
    try {
      response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'system', content: TUTOR_SYSTEM }, ...formattedMessages],
        temperature: 0.7,
      });
    } catch (err) {
      if (err?.code === 'model_not_found' && model !== 'gpt-4o-mini') {
        model = 'gpt-4o-mini';
        response = await openai.chat.completions.create({
          model,
          messages: [{ role: 'system', content: TUTOR_SYSTEM }, ...formattedMessages],
          temperature: 0.7,
        });
      } else {
        throw err;
      }
    }

    return response.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('OpenAI Chat Completion Error:', error?.message);
    if (error?.code === 'credit_balance_exhausted' || (error?.status === 429 && error?.message?.includes('credits'))) {
      throw new Error(
        'OpenAI Error: Your OpenAI account has $0 balance remaining (credit_balance_exhausted). Please add billing credits at platform.openai.com or switch to AI_MODE=offline.'
      );
    }
    throw new Error(error?.message || 'Failed to generate chat response from OpenAI.');
  }
};


/**
 * 2. Generate Note Summary
 */
export const generateSummary = async ({ title, text }) => {
  const mode = getAIMode();

  if (!text || text.trim() === '') {
    throw new Error('Please provide study notes text to summarize.');
  }

  // -------------------------
  // MODE 1: OFFLINE MODE
  // -------------------------
  if (mode === 'offline') {
    const cleanTitle = title || 'Study Notes Summary';
    const paragraphs = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 15);

    const wordCount = text.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    // Extract sentences dynamically from provided notes
    const extractedBullets = [];
    paragraphs.forEach((p, idx) => {
      const sentences = p.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 15);
      if (sentences.length > 0 && extractedBullets.length < 5) {
        extractedBullets.push(`• **Concept ${extractedBullets.length + 1}:** ${sentences[0].trim()}`);
      }
    });

    const keyPoints = extractedBullets.length > 0
      ? extractedBullets.join('\n')
      : `• **Core Concept:** ${paragraphs[0] || text.slice(0, 150)}...`;

    return `### 📑 Structured Study Summary: ${cleanTitle}
*(Original: ~${wordCount} words • Estimated reading time: ${readingTime} min • Offline Mode)*

---

#### 🎯 Main Topic & Executive Thesis
This material covers **${cleanTitle}**, focusing on foundational architectures, underlying principles, and standard methodologies for technical mastery.

#### 💡 Core Concepts & Key Points
${keyPoints}

#### 🧠 In-Depth Breakdown & Analysis
${paragraphs.slice(0, 3).map((p, i) => `> **Section ${i + 1}:** ${p}`).join('\n\n')}

---

#### 📝 High-Priority Exam Review Checklist
1. Review the primary definitions and code patterns outlined in the key concepts above.
2. Explain the mechanism in your own words without referencing your notes (active recall).
3. Test yourself on common edge cases and potential performance bottlenecks.`;
  }

  // -------------------------
  // MODE 2: OPENAI MODE
  // -------------------------
  const openai = getOpenAIClient();
  let model = getModel();

  const systemInstruction = `You are an expert academic study assistant. Create a comprehensive, structured study summary formatted in Markdown with:
1. Executive Summary & Core Thesis
2. Key Concepts & Definitions
3. In-Depth Breakdown
4. Exam Review Checklist`;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: `Title: "${title}"\nNotes:\n${text}` },
      ],
      temperature: 0.5,
    });
    return response.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('OpenAI Summary Generation Error:', error?.message);
    throw new Error(error?.message || 'Failed to generate summary from OpenAI.');
  }
};

/**
 * 3. Generate Multiple-Choice Quiz with Difficulty Sections (Easy, Medium, Hard)
 */
export const generateQuiz = async ({ title, text, numQuestions = 3, difficulty = 'medium' }) => {
  const mode = getAIMode();
  const count = Number(numQuestions) || 3;
  const cleanTitle = title || 'Study Concept Quiz';
  const cleanDifficulty = ['easy', 'medium', 'hard'].includes(String(difficulty).toLowerCase())
    ? String(difficulty).toLowerCase()
    : 'medium';

  // -------------------------
  // MODE 1: OFFLINE MODE
  // -------------------------
  if (mode === 'offline') {
    const topicKey = detectTopic(title + ' ' + (text || ''));

    // Question templates partitioned by topic and difficulty level
    const topicQuestionBank = {
      closure: {
        easy: [
          {
            question: 'What is the foundational definition of a JavaScript closure?',
            options: [
              'An inner function retaining access to variables from its outer lexical scope even after the outer function finishes execution',
              'A self-executing function that runs once and deletes itself from memory',
              'A loop statement designed to prevent memory leaks when iterating over arrays',
              'A syntax rule that mandates semicolons at the end of every statement',
            ],
            correctAnswer: 0,
            explanation: 'Closures are formed whenever an inner function retains a lexical reference to variables in its parent function scope.',
            difficulty: 'easy',
          },
          {
            question: 'Which scope does an inner function have direct access to in JavaScript?',
            options: [
              'Its own local scope and its enclosing outer function scopes',
              'Only the global window scope, with local variables hidden',
              'Only variables declared with the const keyword',
              'Hardware BIOS memory addresses exclusively',
            ],
            correctAnswer: 0,
            explanation: 'JavaScript utilizes lexical scoping, meaning inner functions have access to their own variables and all enclosing ancestor scopes.',
            difficulty: 'easy',
          },
          {
            question: 'Where must an inner function be declared to create a closure over outer variables?',
            options: [
              'Inside the outer enclosing function body',
              'In an external CSS stylesheet link tag',
              'Inside a database configuration JSON file',
              'Directly in the browser operating system kernel',
            ],
            correctAnswer: 0,
            explanation: 'Declaring a function inside another enclosing function creates a nested lexical environment that enables closures.',
            difficulty: 'easy',
          },
        ],
        medium: [
          {
            question: 'Which real-world pattern commonly relies on closures for implementation in JavaScript?',
            options: [
              'Data privacy / encapsulation and configurable function factories',
              'Direct memory defragmentation on the physical SSD',
              'Transpiling JSX into machine binary assembly code',
              'Bypassing Cross-Origin Resource Sharing (CORS) policies',
            ],
            correctAnswer: 0,
            explanation: 'Closures allow developers to simulate private variables and construct configurable factory functions.',
            difficulty: 'medium',
          },
          {
            question: 'What happens to outer scope variables when an active inner closure retains a reference to them?',
            options: [
              'They are immediately garbage collected to free RAM',
              'They persist in memory because the active closure maintains a live reference',
              'They are converted into immutable global constants',
              'They throw a ReferenceError upon the outer function return',
            ],
            correctAnswer: 1,
            explanation: 'The garbage collector cannot reclaim memory for variables that still have active reachable references held by a closure.',
            difficulty: 'medium',
          },
          {
            question: 'In a classic `for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }` loop, what prints and why?',
            options: [
              'It logs "3" three times because var is function-scoped and shared across iterations',
              'It logs "0, 1, 2" in sequence without delay',
              'It throws a syntax error because setTimeout cannot accept closures',
              'It logs undefined three times because the timer cancels execution',
            ],
            correctAnswer: 0,
            explanation: 'Because `var` is function-scoped, all three closures share the exact same variable `i`, which evaluates to 3 after the loop finishes.',
            difficulty: 'medium',
          },
        ],
        hard: [
          {
            question: 'How can excessive, unclosed closures lead to memory leaks in large single-page applications?',
            options: [
              'Unused large parent objects in the lexical environment cannot be garbage collected while any inner closure is retained',
              'Closures continuously execute CPU cycles in an infinite while loop in the background',
              'Closures delete the global window object when memory reaches 80% capacity',
              'Closures block the JavaScript event loop from receiving new asynchronous network packets',
            ],
            correctAnswer: 0,
            explanation: 'If a closure retains a small variable from a parent context that also holds large arrays or DOM nodes, the entire context cannot be collected.',
            difficulty: 'hard',
          },
          {
            question: 'How does the V8 JavaScript engine allocate variables captured by a closure compared to standard local variables?',
            options: [
              'Captured variables are allocated on the Heap inside a Context object instead of the volatile Call Stack',
              'Captured variables are written directly to temporary swap space on the user hard drive',
              'Captured variables are converted to 32-bit assembly registers during execution',
              'Captured variables bypass V8 TurboFan JIT optimization and remain uncompiled',
            ],
            correctAnswer: 0,
            explanation: 'Stack frames are destroyed upon function return, so variables that outlive their activation record must be allocated on the heap inside a Context object.',
            difficulty: 'hard',
          },
          {
            question: 'What is function currying, and how does it utilize closures to enable partial application?',
            options: [
              'Transforming a multi-argument function into a unary chain, retaining earlier arguments via lexical closure',
              'Calling a function recursively until an array is sorted in ascending order',
              'Replacing callback functions with synchronous while-loop sleeps',
              'Mapping array items into an asynchronous worker pool',
            ],
            correctAnswer: 0,
            explanation: 'Currying returns a sequence of functions where each step preserves preceding arguments through closure state until all arguments are received.',
            difficulty: 'hard',
          },
        ],
      },
      useeffect: {
        easy: [
          {
            question: 'What is the primary role of the React useEffect Hook?',
            options: [
              'To perform side effects like data fetching, subscriptions, and DOM updates in functional components',
              'To define CSS styles and Tailwind layout classes for HTML components',
              'To directly mutate MongoDB database collections from the client browser',
              'To replace the JavaScript virtual machine with a WebAssembly compiler',
            ],
            correctAnswer: 0,
            explanation: 'useEffect provides functional components the ability to run side effects after React renders and updates the DOM.',
            difficulty: 'easy',
          },
          {
            question: 'When does a useEffect hook run if passed an empty dependency array `[]`?',
            options: [
              'Once after the initial component mount, and runs its cleanup on unmount',
              'On every single re-render whenever any state in the application updates',
              'Never; React ignores effects that have empty dependency arrays',
              'Every 5 seconds automatically on a background timer',
            ],
            correctAnswer: 0,
            explanation: 'An empty dependency array signals to React that the effect has no reactive dependencies and should only execute once upon mounting.',
            difficulty: 'easy',
          },
          {
            question: 'Where must React Hooks like useEffect and useState be called in a component?',
            options: [
              'At the top level of a React functional component or custom hook',
              'Inside conditional if statements or nested for-loops',
              'Inside asynchronous setTimeout callbacks exclusively',
              'Directly inside the index.html head tag',
            ],
            correctAnswer: 0,
            explanation: 'The Rules of Hooks require hooks to be called at the top level to guarantee consistent hook order across renders.',
            difficulty: 'easy',
          },
        ],
        medium: [
          {
            question: 'What is the purpose of returning a function from inside a useEffect callback?',
            options: [
              'To clean up side effects (e.g., clear timers, remove listeners, abort network requests)',
              'To return JSX markup directly to the browser DOM hierarchy',
              'To trigger a secondary synchronous re-render of child components',
              'To convert the functional component into a legacy ES6 class component',
            ],
            correctAnswer: 0,
            explanation: 'React invokes the returned cleanup function before the next effect cycle and when the component unmounts to prevent memory leaks.',
            difficulty: 'medium',
          },
          {
            question: 'What occurs if you omit the dependency array completely: `useEffect(() => { ... })`?',
            options: [
              'The effect executes after every single render of the component',
              'The effect executes only once on mount and never again',
              'React throws a compile-time syntax error',
              'The component skips rendering child elements',
            ],
            correctAnswer: 0,
            explanation: 'Without a dependency array, React assumes all renders require side effects, running the callback after every render.',
            difficulty: 'medium',
          },
          {
            question: 'Why does updating state unconditionally inside useEffect without dependencies cause problems?',
            options: [
              'It triggers an infinite re-render loop that can freeze the browser',
              'It deletes the state variable from component memory permanently',
              'It causes React to convert all state values into strings',
              'It closes the database connection on the backend server',
            ],
            correctAnswer: 0,
            explanation: 'Setting state triggers a re-render; without a dependency guard, the effect executes again, setting state repeatedly in an infinite loop.',
            difficulty: 'medium',
          },
        ],
        hard: [
          {
            question: 'What constitutes a "stale closure" bug within a React useEffect hook?',
            options: [
              'An effect callback referencing outdated state or prop values because they were omitted from the dependency array',
              'An effect executing before DOM elements have finished mounting to the virtual tree',
              'A memory leak triggered by unclosed WebSockets in production builds',
              'A transpilation failure when converting JSX via Babel',
            ],
            correctAnswer: 0,
            explanation: 'When dependencies are omitted, the effect function closure retains the initial render values and does not capture updated states.',
            difficulty: 'hard',
          },
          {
            question: 'How does React 18 Concurrent Mode handle useEffect execution in comparison to useLayoutEffect?',
            options: [
              'useLayoutEffect runs synchronously before browser paint, whereas useEffect is deferred and runs asynchronously after paint',
              'useEffect runs synchronously before DOM mutation, while useLayoutEffect runs on unmount only',
              'Both hooks execute synchronously and block the browser main thread equally',
              'React 18 deprecated useEffect entirely in favor of React Server Components',
            ],
            correctAnswer: 0,
            explanation: 'useLayoutEffect runs synchronously immediately after DOM mutations before browser paint; useEffect is deferred so browser painting is not blocked.',
            difficulty: 'hard',
          },
          {
            question: 'Why should you implement an AbortController or ignore boolean flag inside an asynchronous useEffect data-fetcher?',
            options: [
              'To eliminate race conditions where earlier slow HTTP requests resolve after newer fast requests overwrite state',
              'To speed up TCP packet transmission rates over low-latency networks',
              'To force the backend Express server to restart its worker thread',
              'To allow cross-site cookie extraction without credentials',
            ],
            correctAnswer: 0,
            explanation: 'Network requests can resolve out of order. Aborting or ignoring superseded requests ensures only the latest request state persists.',
            difficulty: 'hard',
          },
        ],
      },
    };

    // Generic fallback scaled across Easy, Medium, and Hard
    const genericQuestionBank = {
      easy: [
        {
          question: `What is the core definition and foundational purpose of "${cleanTitle}"?`,
          options: [
            `To organize logic, improve code clarity, and solve specific computational requirements predictably`,
            `To bypass operating system kernel protection rings without authentication`,
            `To delete database records automatically on every user interaction`,
            `To replace browser networking protocols with static file system images`,
          ],
          correctAnswer: 0,
          explanation: `At an introductory level, "${cleanTitle}" focuses on establishing clear logic, predictability, and structured problem solving.`,
          difficulty: 'easy',
        },
        {
          question: `For a beginner learning "${cleanTitle}", which concept is most fundamental?`,
          options: [
            `Understanding basic syntax, core inputs, and expected standard outputs`,
            `Writing low-level assembly language patches for hardware caches`,
            `Deploying multi-region Kubernetes clusters before writing code`,
            `Ignoring documentation and disabling compiler warning checks`,
          ],
          correctAnswer: 0,
          explanation: `Mastering syntax, basic data flow, and predictable inputs/outputs provides the essential foundation for "${cleanTitle}".`,
          difficulty: 'easy',
        },
        {
          question: `What is considered a primary benefit of studying "${cleanTitle}"?`,
          options: [
            `Strengthening active problem-solving skills and technical concept retention`,
            `Guaranteed elimination of all software bugs in any project`,
            `Bypassing modern web security and encryption standards`,
            `Making external documentation and testing frameworks obsolete`,
          ],
          correctAnswer: 0,
          explanation: `Understanding key concepts accelerates comprehension, reduces cognitive overhead, and builds lasting technical retention.`,
          difficulty: 'easy',
        },
      ],
      medium: [
        {
          question: `In standard application development, what is a best practice when applying "${cleanTitle}"?`,
          options: [
            `Isolating modular components, validating inputs, and handling potential exceptions gracefully`,
            `Hardcoding sensitive credentials directly in public client repositories`,
            `Omitting error boundaries and assuming network calls will never fail`,
            `Mutating global variables unpredictably across separate modules`,
          ],
          correctAnswer: 0,
          explanation: `Modular architecture, comprehensive error handling, and separation of concerns are critical engineering standards.`,
          difficulty: 'medium',
        },
        {
          question: `When testing or debugging "${cleanTitle}", what is the recommended procedure?`,
          options: [
            `Reproduce edge cases with unit tests and inspect intermediate state transitions systematically`,
            `Reboot the operating system repeatedly until errors disappear`,
            `Disable all logging and console output in development environments`,
            `Remove test assertions so CI/CD pipelines report successful builds`,
          ],
          correctAnswer: 0,
          explanation: `Systematic debugging through reproducible test cases and state inspection guarantees reliable resolution.`,
          difficulty: 'medium',
        },
        {
          question: `How does "${cleanTitle}" typically impact software scalability and maintainability?`,
          options: [
            `It promotes modularity and maintainable abstractions that scale predictably as complexity grows`,
            `It increases technical debt exponentially with every added line of code`,
            `It restricts the application to single-user offline operation only`,
            `It forces database queries to scan full collections on every lookup`,
          ],
          correctAnswer: 0,
          explanation: `Proper abstraction and separation of responsibilities allow software systems to scale sustainably without architectural rot.`,
          difficulty: 'medium',
        },
      ],
      hard: [
        {
          question: `Under heavy concurrency or edge-case conditions, what subtle architectural challenge can occur in "${cleanTitle}"?`,
          options: [
            `Race conditions, resource contention, and synchronization latency across distributed boundaries`,
            `Immediate physical degradation of CPU silicon pathways`,
            `Automatic conversion of typed variables into raw binary strings`,
            `Unrecoverable crash of the client display monitor driver`,
          ],
          correctAnswer: 0,
          explanation: `High-concurrency systems face race conditions, stale state invalidation, and synchronization overhead at scale.`,
          difficulty: 'hard',
        },
        {
          question: `Which low-level optimization principle is essential when scaling "${cleanTitle}" under extreme loads?`,
          options: [
            `Minimizing memory allocations, leveraging efficient caching, and reducing lock contention`,
            `Executing all asynchronous tasks sequentially inside single-threaded loops`,
            `Disabling database indexing to reduce write operation disk overhead`,
            `Writing raw unindexed queries that execute full table scans`,
          ],
          correctAnswer: 0,
          explanation: `Performance optimization requires memory reuse, intelligent multi-level caching, and avoiding bottlenecks.`,
          difficulty: 'hard',
        },
        {
          question: `How should an engineer articulate the core trade-offs of "${cleanTitle}" in an advanced technical design review?`,
          options: [
            `Compare time vs. space complexity, operational maintainability, and failure mode recovery strategies`,
            `Insist that this approach contains zero trade-offs, limitations, or potential costs`,
            `Focus solely on buzzwords while avoiding mechanical execution details`,
            `Suggest that no testing or monitoring is required for production deployments`,
          ],
          correctAnswer: 0,
          explanation: `Senior engineering decisions require balancing computational trade-offs, operational observability, and failure recovery.`,
          difficulty: 'hard',
        },
      ],
    };

    // Check if topic exists in bank; if so, grab the chosen difficulty
    let questionsForDifficulty = [];
    if (topicKey && topicQuestionBank[topicKey] && topicQuestionBank[topicKey][cleanDifficulty]) {
      questionsForDifficulty = topicQuestionBank[topicKey][cleanDifficulty];
    } else {
      questionsForDifficulty = genericQuestionBank[cleanDifficulty] || genericQuestionBank.medium;
    }

    return questionsForDifficulty.slice(0, count);
  }

  // -------------------------
  // MODE 2: OPENAI MODE
  // -------------------------
  const openai = getOpenAIClient();
  let model = getModel();

  const difficultyGuidelines = {
    easy: 'Generate beginner-friendly questions focusing on core definitions, basic syntax, and foundational principles. Keep questions clear and accessible.',
    medium: 'Generate intermediate-level questions focusing on real-world code application, execution behavior, error handling, and common design patterns.',
    hard: 'Generate advanced, rigorous questions testing subtle edge cases, runtime engine internals, concurrency/memory trade-offs, and architecture resilience.',
  };

  const systemInstruction = `You are a university computer science examiner. Generate exactly ${count} multiple choice questions for difficulty section "${cleanDifficulty.toUpperCase()}".
Difficulty Guidelines: ${difficultyGuidelines[cleanDifficulty] || difficultyGuidelines.medium}
Respond ONLY as a JSON object matching this schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string",
      "difficulty": "${cleanDifficulty}"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        {
          role: 'user',
          content: `Topic: "${cleanTitle}"\nDifficulty: "${cleanDifficulty}"\n${text ? `Study Material / Notes:\n${text}` : ''}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    });

    const parsed = JSON.parse(response.choices?.[0]?.message?.content || '{}');
    const questions = (parsed.questions || []).map((q) => ({
      ...q,
      difficulty: cleanDifficulty,
    }));
    return questions.slice(0, count);
  } catch (error) {
    console.error('OpenAI Quiz Generation Error:', error?.message);
    throw new Error(error?.message || 'Failed to generate quiz from OpenAI.');
  }
};

