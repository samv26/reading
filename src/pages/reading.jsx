import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/navigation";
import defaultText from "../assets/defaulttext";

/* ─── Global styles injected once ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=IM+Fell+English:ital@0;1&family=Cinzel+Decorative:wght@400;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

  :root {
    --parchment:       #f2e8cc;
    --parchment-dark:  #e8d9a8;
    --parchment-deep:  #d4c07a;
    --ink:             #2b1d0e;
    --ink-light:       #4a3420;
    --walnut:          #5c3a1e;
    --walnut-light:    #7a4f2d;
    --gold:            #b8860b;
    --gold-bright:     #d4a017;
    --gold-shine:      #f0c040;
    --moss:            #4a5e2a;
    --crimson:         #8b1a1a;
    --cream-border:    #c9a96e;
  }

  /* Parchment noise texture via SVG data URI */
  .parchment-bg {
    background-color: var(--parchment);
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeBlend in='SourceGraphic' mode='multiply'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
      radial-gradient(ellipse at 20% 10%, #e8d48866 0%, transparent 60%),
      radial-gradient(ellipse at 80% 90%, #c9a96e44 0%, transparent 55%),
      linear-gradient(160deg, #f5edd8 0%, #eadcb0 40%, #dfc98a 100%);
  }

  /* Aged paper vignette */
  .parchment-bg::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at 50% 50%, transparent 55%, #2b1d0e55 100%);
    z-index: 0;
  }

  /* Wood-grain divider */
  .wood-divider {
    width: 100%;
    height: 6px;
    background:
      repeating-linear-gradient(
        90deg,
        #7a4f2d 0px, #5c3a1e 8px, #8b6040 12px, #5c3a1e 16px,
        #6b4828 22px, #7a4f2d 28px
      );
    border-top: 2px solid var(--gold);
    border-bottom: 2px solid var(--gold);
    opacity: 0.85;
  }

  /* Ornamental rule */
  .ornament-rule {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--gold);
    font-family: 'IM Fell English', serif;
    font-size: 18px;
    letter-spacing: 4px;
    user-select: none;
  }
  .ornament-rule::before,
  .ornament-rule::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--parchment-dark); }
  ::-webkit-scrollbar-thumb {
    background: var(--walnut);
    border-radius: 4px;
    border: 1px solid var(--gold);
  }

  /* Range input */
  input[type=range].book-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--walnut) 0%, var(--gold) 100%);
    outline: none;
    cursor: pointer;
    border: 1px solid var(--cream-border);
  }
  input[type=range].book-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, var(--gold-shine), var(--gold));
    border: 2px solid var(--walnut);
    box-shadow: 0 2px 6px #0004;
    cursor: pointer;
  }

  /* Textarea */
  .book-textarea {
    background: linear-gradient(180deg, #fffef5 0%, #f8f0d8 100%);
    border: 2px solid var(--cream-border);
    border-radius: 4px;
    box-shadow: inset 0 2px 8px #0002, 0 1px 0 var(--gold-bright);
    color: var(--ink);
    font-family: 'Libre Baskerville', serif;
    font-size: 14px;
    line-height: 1.8;
    padding: 16px;
    resize: vertical;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }
  .book-textarea:focus {
    border-color: var(--gold);
    box-shadow: inset 0 2px 8px #0002, 0 0 0 3px #b8860b22;
  }
  .book-textarea::placeholder { color: var(--walnut-light); font-style: italic; }

  /* Mode buttons */
  .mode-btn {
    padding: 8px 20px;
    font-family: 'Cinzel Decorative', serif;
    font-size: 10px;
    letter-spacing: 2px;
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.2s;
    border: 1.5px solid var(--cream-border);
    background: var(--parchment);
    color: var(--ink-light);
  }
  .mode-btn.active {
    background: linear-gradient(135deg, var(--walnut) 0%, var(--ink) 100%);
    border-color: var(--gold);
    color: var(--gold-shine);
    box-shadow: 0 2px 12px #0003, inset 0 1px 0 #ffffff22;
  }
  .mode-btn:hover:not(.active) {
    background: var(--parchment-dark);
    border-color: var(--walnut);
    color: var(--ink);
  }

  /* Action buttons */
  .action-btn {
    padding: 10px 26px;
    font-family: 'Cinzel Decorative', serif;
    font-size: 10px;
    letter-spacing: 2px;
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .action-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #ffffff18 0%, transparent 60%);
    pointer-events: none;
  }
  .action-btn:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 4px 14px #0003; }
  .action-btn:active { transform: translateY(0); }

  .btn-start  { background: linear-gradient(135deg, #2e5c1e, #3d7a29); border: 1.5px solid #6aaa4a; color: #c8f0a8; }
  .btn-pause  { background: linear-gradient(135deg, #7a4a00, #b87000); border: 1.5px solid #d4a017; color: #fff0c0; }
  .btn-reset  { background: linear-gradient(135deg, #6b1a1a, #a02020); border: 1.5px solid #c84040; color: #ffd0c0; }
  .btn-clear  { background: linear-gradient(135deg, #3a3020, #5a4a30); border: 1.5px solid #8a7050; color: #d0c0a0; }
  .btn-adhd   { background: linear-gradient(135deg, #6b0a50, #a0106e); border: 1.5px solid var(--crimson); color: #ffc0e8; }
  .btn-220    { background: linear-gradient(135deg, #1a3a5c, #2a5a8c); border: 1.5px solid #4a8abc; color: #c0d8f8; }
  .btn-240    { background: linear-gradient(135deg, #2a4a1a, #4a7a2a); border: 1.5px solid #6aaa4a; color: #c8f0a8; }

  /* Display box */
  .reader-box {
    background: linear-gradient(180deg, #fffef5 0%, #f8f0d8 100%);
    border: 2px solid var(--cream-border);
    border-radius: 4px;
    box-shadow:
      inset 0 0 30px #00000008,
      0 4px 20px #0002,
      0 1px 0 var(--gold-bright);
    position: relative;
    overflow: hidden;
  }
  .reader-box::before {
    content: '❧';
    position: absolute;
    top: 6px; left: 12px;
    color: var(--gold);
    font-size: 16px;
    opacity: 0.5;
    pointer-events: none;
  }
  .reader-box::after {
    content: '❧';
    position: absolute;
    bottom: 6px; right: 12px;
    color: var(--gold);
    font-size: 16px;
    opacity: 0.5;
    transform: scaleX(-1);
    pointer-events: none;
  }

  /* Center line */
  .center-line-v {
    position: absolute;
    top: 50%; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold-bright), transparent);
    transform: translateY(-50%);
    opacity: 0.5;
  }
  .center-line-h {
    position: absolute;
    left: 50%; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, transparent, var(--gold-bright), transparent);
    transform: translateX(-50%);
    opacity: 0.5;
  }

  /* Corner ornaments on display box */
  .corner-ornament {
    position: absolute;
    width: 24px; height: 24px;
    pointer-events: none;
  }
  .corner-ornament svg { width: 100%; height: 100%; }
  .co-tl { top: 4px; left: 4px; }
  .co-tr { top: 4px; right: 4px; transform: scaleX(-1); }
  .co-bl { bottom: 4px; left: 4px; transform: scaleY(-1); }
  .co-br { bottom: 4px; right: 4px; transform: scale(-1,-1); }

  .stats-line {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    color: var(--walnut-light);
    font-size: 13px;
    letter-spacing: 1px;
  }

  .byline {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    color: var(--walnut);
    font-size: 13px;
    letter-spacing: 1px;
    opacity: 0.75;
    text-align: center;
  }

  .wpm-label {
    font-family: 'Cinzel Decorative', serif;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--walnut);
  }

  .wpm-value {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 22px;
    color: var(--walnut);
    min-width: 56px;
    text-align: right;
  }
`;

function injectStyles() {
  if (document.getElementById("book-reader-styles")) return;
  const el = document.createElement("style");
  el.id = "book-reader-styles";
  el.textContent = GLOBAL_CSS;
  document.head.appendChild(el);
}

const CornerSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L12 2 Q2 2 2 12" stroke="#b8860b" strokeWidth="1.5" fill="none"/>
    <path d="M2 2 L8 2 Q2 2 2 8" stroke="#b8860b" strokeWidth="1" fill="none" opacity="0.5"/>
    <circle cx="2" cy="2" r="1.5" fill="#b8860b"/>
  </svg>
);

function Reading() {
  const [text, setText] = useState(defaultText);
  const [wpm, setWpm] = useState(200);
  const [mode, setMode] = useState("single");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => { injectStyles(); }, []);

  const words = useMemo(() => {
    return text.trim().split(/\s+/).filter((w) => w.length > 0);
  }, [text]);

  const msPerWord = wpm > 0 ? 60000 / wpm : 0;

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);

  /* ---------------- HORIZONTAL ---------------- */
  const scrollRef = useRef(null);
  const offsetRef = useRef(0);
  const wordRefs = useRef([]);
  const wordCenters = useRef([]);
  const [currentHorizontalIndex, setCurrentHorizontalIndex] = useState(0);
  const horizontalSpeed = msPerWord > 0 ? 120 / msPerWord : 0;

  useLayoutEffect(() => {
    let cumulative = 0;
    wordCenters.current = words.map((_, i) => {
      const el = wordRefs.current[i];
      if (!el) return 0;
      const width = el.offsetWidth;
      const center = cumulative + width / 2;
      cumulative += width + 40;
      return center;
    });
  }, [words]);

  /* ---------------- VERTICAL ---------------- */
  const VERTICAL_PADDING = 150;
  const verticalScrollRef = useRef(null);
  const verticalOffsetRef = useRef(-VERTICAL_PADDING);
  const verticalWordRefs = useRef([]);
  const verticalCenters = useRef([]);
  const [currentVerticalIndex, setCurrentVerticalIndex] = useState(0);
  const verticalSpeed = msPerWord > 0 ? 70 / msPerWord : 0;

  useLayoutEffect(() => {
    let cumulative = 0;
    verticalCenters.current = words.map((_, i) => {
      const el = verticalWordRefs.current[i];
      if (!el) return 0;
      const height = el.offsetHeight;
      const center = cumulative + height / 2;
      cumulative += height + 16;
      return center;
    });
  }, [words]);

  /* ---------------- SINGLE ---------------- */
  const [singleIndex, setSingleIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);

  /* ================= ANIMATION ENGINE ================= */
  useEffect(() => {
    if (!isPlaying) { cancelAnimationFrame(animationRef.current); return; }

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (mode === "horizontal") {
        offsetRef.current += delta * horizontalSpeed;
        if (scrollRef.current)
          scrollRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
        if (containerRef.current) {
          const center = containerRef.current.offsetWidth / 2 + offsetRef.current;
          let closest = 0, smallest = Infinity;
          wordCenters.current.forEach((c, i) => {
            const diff = Math.abs(c - center);
            if (diff < smallest) { smallest = diff; closest = i; }
          });
          setCurrentHorizontalIndex(closest);
        }
      }

      if (mode === "vertical") {
        verticalOffsetRef.current += delta * verticalSpeed;
        if (verticalScrollRef.current)
          verticalScrollRef.current.style.transform = `translateY(${-verticalOffsetRef.current}px)`;
        if (containerRef.current) {
          const center = containerRef.current.offsetHeight / 2 + verticalOffsetRef.current;
          let closest = 0, smallest = Infinity;
          verticalCenters.current.forEach((c, i) => {
            const diff = Math.abs(c - center);
            if (diff < smallest) { smallest = diff; closest = i; }
          });
          setCurrentVerticalIndex(closest);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, mode, horizontalSpeed, verticalSpeed]);

  /* ---------------- SINGLE MODE ---------------- */
  useEffect(() => {
    if (!isPlaying || mode !== "single") { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSingleIndex((prev) => (prev < words.length - 1 ? prev + 1 : prev));
        setFade(true);
      }, 80);
    }, msPerWord);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, mode, msPerWord, words.length]);

  /* ---------------- CONTROLS ---------------- */
  const handleReset = () => {
    setIsPlaying(false);
    offsetRef.current = 0;
    verticalOffsetRef.current = -VERTICAL_PADDING;
    if (scrollRef.current) scrollRef.current.style.transform = "translateX(0px)";
    if (verticalScrollRef.current)
      verticalScrollRef.current.style.transform = `translateY(${VERTICAL_PADDING}px)`;
    setCurrentHorizontalIndex(0);
    setCurrentVerticalIndex(0);
    setSingleIndex(0);
    lastTimeRef.current = null;
    wordRefs.current = [];
    verticalWordRefs.current = [];
    wordCenters.current = [];
    verticalCenters.current = [];
  };

  /* ─── Word styles for the reader ─── */
  const wordStyle = {
    fontSize: 28,
    fontWeight: "normal",
    fontFamily: "'Playfair Display', serif",
    color: "#2b1d0e",
    whiteSpace: "nowrap",
    letterSpacing: 1,
  };

  const verticalWordStyle = {
    fontSize: 28,
    fontFamily: "'Playfair Display', serif",
    fontWeight: "normal",
    color: "#2b1d0e",
    textAlign: "center",
    letterSpacing: 1,
  };

  return (
    <div
      className="parchment-bg"
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        boxSizing: "border-box",
        overflow: "auto",
        position: "relative",
      }}
    >
      {/* ── Page content wrapper ── */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── Title block ── */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "clamp(18px, 5vw, 38px)",
              fontWeight: 700,
              color: "#2b1d0e",
              letterSpacing: 4,
              lineHeight: 1.2,
              textShadow: "1px 1px 0 #b8860b44",
            }}
          >
            ✦ SPEED READER ✦
          </div>
          <div style={{ marginTop: 6 }}>
            <div className="ornament-rule" style={{ maxWidth: 420, margin: "0 auto" }}>
              ❦
            </div>
          </div>
          <div
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: "italic",
              color: "#7a4f2d",
              fontSize: 13,
              letterSpacing: 2,
              marginTop: 4,
            }}
          >
            An Imperial Reading Engine
          </div>
        </div>

        {/* ── Wood divider ── */}
        <div className="wood-divider" />

        {/* ── Textarea ── */}
        <div>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 9,
              letterSpacing: 3,
              color: "#7a4f2d",
              marginBottom: 6,
            }}
          >
            ✦ MANUSCRIPT
          </div>
          <textarea
            className="book-textarea"
            value={text}
            onChange={(e) => { setText(e.target.value); handleReset(); }}
            rows={5}
            placeholder="Inscribe or paste your text here…"
          />
        </div>

        {/* ── Reader display ── */}
        {mode === "horizontal" && (
          <div className="reader-box" style={{ minHeight: 60 }}>
            <div className="corner-ornament co-tl"><CornerSvg /></div>
            <div className="corner-ornament co-tr"><CornerSvg /></div>
            <div className="corner-ornament co-bl"><CornerSvg /></div>
            <div className="corner-ornament co-br"><CornerSvg /></div>
            <div
              ref={containerRef}
              style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div className="center-line-h" />
              <div
                ref={scrollRef}
                style={{
                  display: "flex",
                  gap: 40,
                  alignItems: "center",
                  paddingLeft: "50%",
                  paddingRight: "50%",
                }}
              >
                {words.map((word, i) => (
                  <div key={i} ref={(el) => (wordRefs.current[i] = el)} style={wordStyle}>
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "vertical" && (
          <div className="reader-box" style={{ minHeight: 60 }}>
            <div className="corner-ornament co-tl"><CornerSvg /></div>
            <div className="corner-ornament co-tr"><CornerSvg /></div>
            <div className="corner-ornament co-bl"><CornerSvg /></div>
            <div className="corner-ornament co-br"><CornerSvg /></div>
            <div className="center-line-v" />
            <div
              ref={containerRef}
              style={{ height: 300, display: "flex", justifyContent: "center", overflow: "hidden", position: "relative" }}
            >
              <div
                ref={verticalScrollRef}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  paddingTop: `${VERTICAL_PADDING}px`,
                  paddingBottom: `${VERTICAL_PADDING}px`,
                  transform: `translateY(${VERTICAL_PADDING}px)`,
                }}
              >
                {words.map((word, i) => (
                  <div key={i} ref={(el) => (verticalWordRefs.current[i] = el)} style={verticalWordStyle}>
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "single" && (
          <div className="reader-box" style={{ minHeight: 60 }}>
            <div className="corner-ornament co-tl"><CornerSvg /></div>
            <div className="corner-ornament co-tr"><CornerSvg /></div>
            <div className="corner-ornament co-bl"><CornerSvg /></div>
            <div className="corner-ornament co-br"><CornerSvg /></div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 80,
                padding: "24px 40px",
              }}
            >
              <div
                style={{
                  fontSize: 38,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,

                  color: "#2b1d0e",
                  letterSpacing: 2,
                  opacity: fade ? 1 : 0,
                  transition: "opacity 0.08s ease",
                }}
              >
                {words[singleIndex]}
              </div>
            </div>
          </div>
        )}

        {/* ── WPM Control ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #e8d9a8 0%, #d4c07a 100%)",
            border: "1.5px solid var(--cream-border)",
            borderRadius: 4,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span className="wpm-label">WORDS PER MINUTE</span>
          <input
            type="range"
            className="book-slider"
            min={50}
            max={700}
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            style={{ flex: 1, minWidth: 0 }}
          />
          <span className="wpm-value">{wpm}</span>
        </div>

        {/* ── Mode selector ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {["horizontal", "vertical", "single"].map((m) => (
            <button
              key={m}
              className={`mode-btn${mode === m ? " active" : ""}`}
              onClick={() => { setMode(m); handleReset(); }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Speed presets ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="action-btn btn-adhd" onClick={() => setWpm("400")}>
            ⚡ ADHD MODE
          </button>
          <button className="action-btn btn-220" onClick={() => setWpm("220")}>
            ⏱ 220 WPM
          </button>
          <button className="action-btn btn-240" onClick={() => setWpm("240")}>
            ⏱ 240 WPM
          </button>
        </div>

        {/* ── Wood divider ── */}
        <div className="wood-divider" />

        {/* ── Playback controls ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            className={`action-btn ${isPlaying ? "btn-pause" : "btn-start"}`}
            onClick={() => setIsPlaying((p) => !p)}
          >
            {isPlaying ? "⏸ PAUSE" : "▶ BEGIN"}
          </button>
          <button className="action-btn btn-reset" onClick={handleReset}>
            ↺ RESET
          </button>
          <button
            className="action-btn btn-clear"
            onClick={() => { setText(""); handleReset(); }}
          >
            ✕ CLEAR
          </button>
        </div>

        {/* ── Stats ── */}
        {words.length > 0 && (
          <div style={{ textAlign: "center" }}>
            <div className="ornament-rule" style={{ maxWidth: 500, margin: "0 auto 6px" }}>❦</div>
            <div className="stats-line">
              {words.length} words · Est. reading time {Math.round(words.length / wpm)} min
            </div>
          </div>
        )}

        {/* ── Byline ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
          <div className="byline">✦ Crafted by <em>Sam V</em> ✦</div>
          <div className="byline">✦ Version <em>3.2</em> ✦</div>
        </div>

        <Navigation />
      </div>
    </div>
  );
}

export default Reading;