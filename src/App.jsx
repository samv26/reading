import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import defaultText from "./assets/defaulttext";

function App() {
  const [text, setText] = useState(defaultText);
  const [wpm, setWpm] = useState(200);
  const [mode, setMode] = useState("single");
  const [isPlaying, setIsPlaying] = useState(false);

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
    if (!isPlaying) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (mode === "horizontal") {
        offsetRef.current += delta * horizontalSpeed;
        if (scrollRef.current) {
          scrollRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
        }
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
        if (verticalScrollRef.current) {
          verticalScrollRef.current.style.transform = `translateY(${-verticalOffsetRef.current}px)`;
        }
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
    if (!isPlaying || mode !== "single") {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSingleIndex((prev) => prev < words.length - 1 ? prev + 1 : prev);
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

    if (scrollRef.current)
      scrollRef.current.style.transform = "translateX(0px)";
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

  /* ================= STYLES ================= */
  const styles = {
    app: {
      padding: "40px",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "#e0e0ff",
      minHeight: "100vh",
      fontFamily: "'Courier New', monospace",
    },
    title: {
      fontSize: 36,
      fontWeight: "bold",
      letterSpacing: 4,
      color: "#00d4ff",
      textShadow: "0 0 20px #00d4ff88",
      marginBottom: 24,
    },
    textarea: {
      width: "100%",
      padding: "12px",
      background: "#ffffff10",
      border: "1px solid #00d4ff44",
      borderRadius: 8,
      color: "#e0e0ff",
      fontSize: 14,
      resize: "vertical",
      outline: "none",
      marginBottom: 8,
    },
    controls: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
      flexWrap: "wrap",
    },
    input: {
      width: 80,
      padding: "8px 12px",
      background: "#ffffff10",
      border: "1px solid #00d4ff44",
      borderRadius: 6,
      color: "#e0e0ff",
      fontSize: 14,
      outline: "none",
    },
    label: { fontSize: 13, color: "#00d4ffaa", marginRight: 4 },
    btn: (active) => ({
      padding: "8px 18px",
      background: active ? "#00d4ff22" : "transparent",
      border: `1px solid ${active ? "#00d4ff" : "#00d4ff44"}`,
      borderRadius: 6,
      color: active ? "#00d4ff" : "#e0e0ffaa",
      fontSize: 13,
      cursor: "pointer",
      letterSpacing: 1,
      transition: "all 0.2s",
    }),
    actionBtn: (color) => ({
      padding: "10px 24px",
      background: `${color}22`,
      border: `1px solid ${color}`,
      borderRadius: 6,
      color: color,
      fontSize: 14,
      fontWeight: "bold",
      cursor: "pointer",
      letterSpacing: 2,
      transition: "all 0.2s",
    }),
    displayBox: {
      width: "80vw",
      maxWidth: 1000,
      margin: "40px auto",
      background: "#ffffff08",
      border: "1px solid #00d4ff22",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 0 40px #00d4ff11",
    },
    displayInnerVertical: (height) => ({
      height,
      display: "flex",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }),
    displayInnerHorizontal: (height) => ({
      height,
      display: "flex",
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    }),
    centerLine: (horiz) => ({
      position: "absolute",
      background: "#ffffff18",
      ...(horiz
        ? { left: "50%", top: 0, bottom: 0, width: 2, transform: "translateX(-50%)" }
        : { top: "50%", left: 0, right: 0, height: 2, transform: "translateY(-50%)" }),
    }),
  };

  const wordStyle = {
    fontSize: 28,
    fontWeight: "normal",
    color: "#ffffff",
    whiteSpace: "nowrap",
  };

  const verticalWordStyle = {
    fontSize: 28,
    fontWeight: "normal",
    color: "#ffffff",
    textAlign: "center",
  };

  return (
    <div style={styles.app}>
      <div style={styles.title}>⚡ SPEED READER</div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); handleReset(); }}
        rows={5}
        placeholder="Paste your text here..."
        style={styles.textarea}
      />

      <div style={styles.controls}>
        <span style={styles.label}>WPM</span>
        <input type="number" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} style={styles.input} />

        {["horizontal", "vertical", "single"].map((m) => (
          <button key={m} style={styles.btn(mode === m)} onClick={() => { setMode(m); handleReset(); }}>
            {m.toUpperCase()}
          </button>
        ))}

        <button style={styles.actionBtn("#00ff88")} onClick={() => setIsPlaying(true)}>▶ START</button>
        <button style={styles.actionBtn("#ffaa00")} onClick={() => setIsPlaying(false)}>⏸ PAUSE</button>
        <button style={styles.actionBtn("#ff4466")} onClick={handleReset}>↺ RESET</button>
        <button style={styles.actionBtn("#888")} onClick={() => { setText(""); handleReset(); }}>✕ CLEAR</button>
      </div>

      {/* ================= HORIZONTAL ================= */}
      {mode === "horizontal" && (
        <div style={styles.displayBox}>
          <div ref={containerRef} style={styles.displayInnerHorizontal(120)}>
            <div style={styles.centerLine(true)} />
            <div ref={scrollRef} style={{ display: "flex", gap: 40, alignItems: "center", paddingLeft: "50%", paddingRight: "50%" }}>
              {words.map((word, i) => (
                <div key={i} ref={(el) => (wordRefs.current[i] = el)} style={wordStyle}>
                  {word}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= VERTICAL ================= */}
      {mode === "vertical" && (
        <div style={styles.displayBox}>
          <div ref={containerRef} style={styles.displayInnerVertical(300)}>
            <div style={styles.centerLine(false)} />
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

      {/* ================= SINGLE ================= */}
      {mode === "single" && (
        <div style={styles.displayBox}>
          <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              fontSize: 36,
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: 2,
              opacity: fade ? 1 : 0,
              transition: "opacity 0.08s ease",
            }}>
              {words[singleIndex]}
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", color: "#ffffff33", fontSize: 12, marginTop: 20, letterSpacing: 2 }}>
        {words.length > 0 && `${words.length} WORDS · EST. ${Math.round(words.length / wpm)}m READ TIME`}
      </div>

      <div style={{
  marginTop: "60px",
  padding: "20px 0",
  textAlign: "center",
  fontSize: "14px",
  opacity: 0.6,
  letterSpacing: "1px"
}}>
  ✦ Crafted by <strong>Sam V</strong> ✦
  
</div>
<div style={{

  textAlign: "center",
  fontSize: "14px",
  opacity: 0.6,
  letterSpacing: "1px"
}}>
  ✦ Version <strong>3.2</strong> ✦
  
</div>

    </div>
  );
}

export default App;