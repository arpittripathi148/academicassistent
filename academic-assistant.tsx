import { useState, useRef, useEffect } from "react";

const SUBJECTS = [
  {
    id: "DSA",
    label: "DSA",
    icon: "🔗",
    color: ["#7c3aed", "#a78bfa"],
    desc: "Data Structures & Algorithms",
    topics: ["Arrays & Strings", "Linked Lists", "Trees & Graphs", "Sorting & Searching", "Dynamic Programming", "Recursion"],
    suggestions: ["Explain Binary Search for exam", "DSA: Merge Sort with code", "Linked List insertion short notes", "Important DSA questions 10 marks"],
  },
  {
    id: "OS",
    label: "OS",
    icon: "🖥️",
    color: ["#0369a1", "#38bdf8"],
    desc: "Operating Systems",
    topics: ["Process Management", "CPU Scheduling", "Memory Management", "Deadlocks", "File Systems", "Synchronization"],
    suggestions: ["Explain Deadlock for exam", "CPU Scheduling algorithms short", "Paging vs Segmentation explain", "Important OS questions 10 marks"],
  },
  {
    id: "DBMS",
    label: "DBMS",
    icon: "🗄️",
    color: ["#065f46", "#34d399"],
    desc: "Database Management Systems",
    topics: ["ER Model", "Normalization", "SQL Queries", "Transactions", "Indexing", "Joins"],
    suggestions: ["Explain Normalization for exam", "SQL joins with examples", "ACID properties short notes", "Important DBMS questions 10 marks"],
  },
  {
    id: "Python",
    label: "Python",
    icon: "🐍",
    color: ["#b45309", "#fbbf24"],
    desc: "Python Programming",
    topics: ["OOP Concepts", "File Handling", "Decorators", "List Comprehension", "Modules", "Exception Handling"],
    suggestions: ["Python OOP explain with code", "List vs Tuple short notes", "Decorators in Python for exam", "Important Python questions 10 marks"],
  },
  {
    id: "C/C++",
    label: "C/C++",
    icon: "💻",
    color: ["#9f1239", "#fb7185"],
    desc: "C and C++ Programming",
    topics: ["Pointers", "Structures", "File I/O", "Classes & Objects", "Inheritance", "Memory Management"],
    suggestions: ["C Pointers with code", "Difference: C vs C++ for exam", "Inheritance in C++ explain", "Important C/C++ questions 10 marks"],
  },
  {
    id: "Networks",
    label: "Networks",
    icon: "🌐",
    color: ["#1e3a8a", "#60a5fa"],
    desc: "Computer Networks",
    topics: ["OSI Model", "TCP/IP", "Routing Protocols", "DNS & HTTP", "Subnetting", "Network Security"],
    suggestions: ["OSI Model layers for exam", "TCP vs UDP short notes", "Explain DNS with example", "Important Networks questions 10 marks"],
  },
];

const SYSTEM_PROMPT = `You are an intelligent academic assistant designed to help students understand concepts, prepare for exams, and solve problems efficiently.

Your Core Role: Act like a teacher, tutor, and exam guide combined.

Primary Objectives:
1. Explain concepts clearly from basic to advanced level.
2. Help students prepare for exams with structured answers.
3. Solve problems step-by-step with proper explanation.
4. Improve student understanding, not just give answers.

Response Style:
- Start with a simple explanation (easy language).
- Then give a detailed explanation (exam-ready).
- Use bullet points and examples.
- Highlight important keywords using **bold**.
- Keep answers structured and neat.

Answer Format:
- Definition
- Explanation
- Example
- Diagram (ASCII if needed)
- Conclusion / Key Points

Special Instructions:
- If user says "for exam" → structured, high-scoring answer.
- If user says "short" → crisp revision notes.
- If user says "explain" → go deep with examples.
- If coding → provide code + explanation + output.

Tone: Supportive, clear, teacher-like. Encouraging but not casual.
Always end with: "📌 Do you want a short revision version or more practice questions?"`;

function formatMessage(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = parts.map((p, j) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={j} style={{ color: "#1e40af" }}>{p.slice(2, -2)}</strong>
        : p
    );
    const t = line.trim();
    if (t.startsWith("### ")) return <h3 key={i} style={{ fontSize: "1rem", fontWeight: 700, color: "#1e3a8a", margin: "12px 0 4px" }}>{t.slice(4)}</h3>;
    if (t.startsWith("## ")) return <h2 key={i} style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e3a8a", margin: "14px 0 4px" }}>{t.slice(3)}</h2>;
    if (t.startsWith("# ")) return <h1 key={i} style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e3a8a", margin: "16px 0 4px" }}>{t.slice(2)}</h1>;
    if (t.startsWith("- ") || t.startsWith("* ")) return <div key={i} style={{ display: "flex", gap: 6, margin: "3px 0" }}><span style={{ color: "#3b82f6", flexShrink: 0 }}>•</span><span>{formatted}</span></div>;
    if (/^\d+\.\s/.test(t)) return <div key={i} style={{ display: "flex", gap: 6, margin: "3px 0" }}><span style={{ color: "#3b82f6", flexShrink: 0, minWidth: 18 }}>{t.match(/^\d+/)[0]}.</span><span>{formatted}</span></div>;
    if (t === "") return <div key={i} style={{ height: 6 }} />;
    return <p key={i} style={{ margin: "3px 0", lineHeight: 1.6 }}>{formatted}</p>;
  });
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative", margin: "10px 0" }}>
      <pre style={{ background: "#0f172a", color: "#e2e8f0", padding: "14px 16px", borderRadius: 8, overflowX: "auto", fontSize: "0.82rem", fontFamily: "monospace", lineHeight: 1.6 }}>{children}</pre>
      <button onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        style={{ position: "absolute", top: 8, right: 8, background: copied ? "#22c55e" : "#334155", color: "#fff", border: "none", borderRadius: 5, padding: "3px 9px", fontSize: "0.75rem", cursor: "pointer" }}>
        {copied ? "✓" : "Copy"}
      </button>
    </div>
  );
}

function MessageBubble({ msg, accentColor }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "8px 0" }}>
        <div style={{ background: `linear-gradient(135deg,${accentColor[0]},${accentColor[1]})`, color: "#fff", borderRadius: "18px 18px 4px 18px", padding: "10px 15px", maxWidth: "75%", fontSize: "0.88rem", lineHeight: 1.5 }}>
          {msg.content}
        </div>
      </div>
    );
  }
  const segments = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = re.exec(msg.content)) !== null) {
    if (m.index > last) segments.push({ type: "text", content: msg.content.slice(last, m.index) });
    segments.push({ type: "code", content: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < msg.content.length) segments.push({ type: "text", content: msg.content.slice(last) });
  return (
    <div style={{ display: "flex", gap: 10, margin: "8px 0", alignItems: "flex-start" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${accentColor[0]},${accentColor[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🎓</div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", maxWidth: "80%", fontSize: "0.88rem", color: "#1e293b", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {segments.map((seg, i) => seg.type === "code" ? <CodeBlock key={i}>{seg.content}</CodeBlock> : <div key={i}>{formatMessage(seg.content)}</div>)}
      </div>
    </div>
  );
}

// ── Slide selector screen ──
function SubjectSlide({ subj, isActive, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover || isActive ? `linear-gradient(135deg,${subj.color[0]},${subj.color[1]})` : "#fff",
        border: `2px solid ${isActive ? subj.color[0] : "#e2e8f0"}`,
        borderRadius: 16, padding: "20px 16px", cursor: "pointer",
        transition: "all 0.25s", transform: hover || isActive ? "translateY(-4px)" : "none",
        boxShadow: hover || isActive ? `0 8px 24px ${subj.color[0]}44` : "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        color: hover || isActive ? "#fff" : "#1e293b", userSelect: "none"
      }}>
      <div style={{ fontSize: "2.2rem" }}>{subj.icon}</div>
      <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: 0.5 }}>{subj.label}</div>
      <div style={{ fontSize: "0.72rem", opacity: 0.85, textAlign: "center", lineHeight: 1.4 }}>{subj.desc}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center", marginTop: 4 }}>
        {subj.topics.slice(0, 3).map(t => (
          <span key={t} style={{ background: hover || isActive ? "rgba(255,255,255,0.2)" : "#f1f5f9", color: hover || isActive ? "#fff" : "#475569", borderRadius: 20, padding: "2px 8px", fontSize: "0.67rem", fontWeight: 500 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeSubj, setActiveSubj] = useState(null);
  const [chatMap, setChatMap] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const subj = SUBJECTS.find(s => s.id === activeSubj);
  const messages = chatMap[activeSubj] || [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, activeSubj]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading || !activeSubj) return;
    setInput("");
    const prev = chatMap[activeSubj] || [];
    const newMsgs = [...prev, { role: "user", content: userMsg }];
    setChatMap(m => ({ ...m, [activeSubj]: newMsgs }));
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + `\n\nFocus subject: ${activeSubj} — ${subj.desc}`,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, couldn't generate a response.";
      setChatMap(m => ({ ...m, [activeSubj]: [...newMsgs, { role: "assistant", content: reply }] }));
    } catch {
      setChatMap(m => ({ ...m, [activeSubj]: [...newMsgs, { role: "assistant", content: "⚠️ Connection error. Please try again." }] }));
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Subject picker screen ──
  if (!activeSubj) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f8fafc,#e0f2fe)", fontFamily: "'Segoe UI',sans-serif", padding: "24px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: "2.8rem", marginBottom: 6 }}>🎓</div>
          <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "#1e3a8a" }}>Academic Assistant</div>
          <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 4 }}>Choose a subject to start your session</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, maxWidth: 700, margin: "0 auto" }}>
          {SUBJECTS.map(s => <SubjectSlide key={s.id} subj={s} isActive={false} onClick={() => setActiveSubj(s.id)} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 24, color: "#94a3b8", fontSize: "0.75rem" }}>
          💡 Each subject keeps its own chat history
        </div>
      </div>
    );
  }

  // ── Chat screen ──
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9", fontFamily: "'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${subj.color[0]},${subj.color[1]})`, color: "#fff", padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setActiveSubj(null)}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            ←
          </button>
          <span style={{ fontSize: "1.6rem" }}>{subj.icon}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{subj.label} — {subj.desc}</div>
            <div style={{ fontSize: "0.72rem", opacity: 0.85 }}>Exam-ready answers · Step-by-step solutions</div>
          </div>
        </div>
        {/* Topic chips */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, overflowX: "auto", paddingBottom: 2 }}>
          {subj.topics.map(t => (
            <button key={t} onClick={() => sendMessage(`Explain ${t} in ${subj.id}`)}
              style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff", borderRadius: 20, padding: "3px 11px", fontSize: "0.72rem", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: 6 }}>{subj.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: subj.color[0], marginBottom: 4 }}>Start your {subj.label} session!</div>
            <div style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: 18 }}>Try a suggestion or ask your own question.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 400, margin: "0 auto" }}>
              {subj.suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{ background: "#fff", border: `1.5px solid #e2e8f0`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left", fontSize: "0.78rem", color: "#1e293b", fontWeight: 500, transition: "border-color 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", lineHeight: 1.4 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = subj.color[0]}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} accentColor={subj.color} />)}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "8px 0" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${subj.color[0]},${subj.color[1]})`, display: "flex", alignItems: "center", justifyContent: "center" }}>🎓</div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "4px 18px 18px 18px", padding: "14px 18px" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0,1,2].map(d => <div key={d} style={{ width: 8, height: 8, borderRadius: "50%", background: subj.color[1], animation: "bounce 1.2s infinite", animationDelay: `${d*0.2}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Ask a ${subj.label} question… ("for exam", "short", "explain")`}
            rows={1} style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", fontSize: "0.88rem", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto", color: "#1e293b" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
            onFocus={e => e.target.style.borderColor = subj.color[0]}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            style={{ background: input.trim() && !loading ? `linear-gradient(135deg,${subj.color[0]},${subj.color[1]})` : "#cbd5e1", color: "#fff", border: "none", borderRadius: 12, width: 44, height: 44, cursor: input.trim() && !loading ? "pointer" : "default", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
            ➤
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: "0.68rem", color: "#94a3b8", marginTop: 5 }}>
          💡 <strong>"for exam"</strong> · <strong>"short"</strong> · <strong>"explain"</strong> · <strong>"with code"</strong>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
