import { useState } from 'react'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

function App() {
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(200);
  const [mode, setMode] = useState("scroll"); // "scroll", "single", or "vertical"
  const [isPlaying, setIsPlaying] = useState(false);

  // Scroll mode state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Vertical scroll mode state
  const verticalScrollRef = useRef(null);
  const verticalOffsetRef = useRef(0);
  const verticalWordRefs = useRef([]);
  const verticalWordCenters = useRef([]);
  const [currentVerticalWordIndex, setCurrentVerticalWordIndex] = useState(0);

  // Single word mode state
  const [singleIndex, setSingleIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);       // ref to the inner scrolling div
  const offsetRef = useRef(0);          // raw offset value, NOT state
  const wordRefs = useRef([]);
  const wordCenters = useRef([]);

  const words = useMemo(() => {
    return text.trim().split(/\s+/).filter((w) => w.length > 0);
  }, [text]);

  const msPerWord = wpm > 0 ? 60000 / wpm : 0;
  const pixelsPerMs = msPerWord > 0 ? 120 / msPerWord : 0;

  /* ---------------- SCROLL MODE ---------------- */

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

  useLayoutEffect(() => {
    let cumulative = 0;
    verticalWordCenters.current = words.map((_, i) => {
      const el = verticalWordRefs.current[i];
      if (!el) return 0;
      const height = el.offsetHeight;
      const center = cumulative + height / 2;
      cumulative += height + 16;
      return center;
    });
  }, [words]);

  useEffect(() => {
    if (!isPlaying || mode !== "scroll") {
      cancelAnimationFrame(animationRef.current);
      return;
    }
    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      offsetRef.current += delta * pixelsPerMs;

      // Directly mutate the DOM — no React re-render
      if (scrollRef.current) {
        scrollRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
      }

      // Only update word index state (cheap check, infrequent state change)
      if (containerRef.current) {
        const containerCenter = containerRef.current.offsetWidth / 2 + offsetRef.current;
        let closest = 0, smallestDiff = Infinity;
        wordCenters.current.forEach((center, index) => {
          const diff = Math.abs(center - containerCenter);
          if (diff < smallestDiff) { smallestDiff = diff; closest = index; }
        });
        setCurrentWordIndex(closest);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, pixelsPerMs, mode]);

  // Vertical pixels per ms (same speed logic but vertical)
  const verticalPixelsPerMs = msPerWord > 0 ? 60 / msPerWord : 0;

  useEffect(() => {
    if (!isPlaying || mode !== "vertical") {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      verticalOffsetRef.current += delta * verticalPixelsPerMs;

      if (verticalScrollRef.current) {
        verticalScrollRef.current.style.transform = `translateY(${-verticalOffsetRef.current}px)`;
      }

      if (containerRef.current) {
        const containerCenter = containerRef.current.offsetHeight / 2 + verticalOffsetRef.current;
        let closest = 0, smallestDiff = Infinity;
        verticalWordCenters.current.forEach((center, index) => {
          const diff = Math.abs(center - containerCenter);
          if (diff < smallestDiff) { smallestDiff = diff; closest = index; }
        });
        setCurrentVerticalWordIndex(closest);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, verticalPixelsPerMs, mode]);

  /* ---------------- SINGLE WORD MODE ---------------- */

  useEffect(() => {
    if (!isPlaying || mode !== "single") {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSingleIndex((prev) => {
          if (prev >= words.length - 1) return prev;
          return prev + 1;
        });
        setFade(true);
      }, 100);
    }, msPerWord);

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, msPerWord, words.length, mode]);

  /* ---------------- CONTROLS ---------------- */

  const handleStart = () => {
    if (words.length === 0) return;
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    offsetRef.current = 0;
    verticalOffsetRef.current = 0;
    if (scrollRef.current) scrollRef.current.style.transform = `translateX(0px)`;
    if (verticalScrollRef.current) verticalScrollRef.current.style.transform = `translateY(0px)`;
    setSingleIndex(0);
    setCurrentWordIndex(0);
    setCurrentVerticalWordIndex(0);
    lastTimeRef.current = null;
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8a014",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <h1>Speed Reader</h1>

      <textarea
        placeholder="Paste your text here..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleReset();
        }}
        rows={5}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "#f6d500",
          color: "#fff",
          border: "1px solid #444",
          marginBottom: "20px",
        }}
      />

      <div style={{ marginBottom: "20px" }}>
        <label>
          WPM:
          <input
            type="number"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            style={{ marginLeft: "10px", width: "80px" }}
          />
        </label>

        <button onClick={() => setMode("scroll")} style={{ marginLeft: 20 }}>
          Scrolling Mode
        </button>
        <button onClick={() => setMode("single")} style={{ marginLeft: 10 }}>
          Single Word Mode
        </button>
        <button onClick={() => setMode("vertical")} style={{ marginLeft: 10 }}>
          Vertical Scroll Mode
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        {!isPlaying ? (
          <button onClick={handleStart} style={{ marginRight: "10px" }}>
            Start
          </button>
        ) : (
          <button onClick={handlePause} style={{ marginRight: "10px" }}>
            Pause
          </button>
        )}
        <button onClick={handleReset}>Reset</button>
      </div>

      {/* ------------ DISPLAY AREA ------------ */}

      {mode === "scroll" && (
        <div
          ref={containerRef}
          style={{
            width: "40vw",
            height: "120px",
            margin: "60px auto",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            borderTop: "1px solid #333",
            borderBottom: "1px solid #333",
          }}
        >
          <div
            ref={scrollRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              willChange: "transform",
            }}
          >
            {words.map((word, index) => (
              <div
                key={index}
                ref={(el) => (wordRefs.current[index] = el)}
                style={{
                  fontSize: "28px",
                  whiteSpace: "nowrap",
                  color: "#ffffff",
                  opacity: index === currentWordIndex ? 1 : 0.35,
                  transition: "opacity 0.2s ease",
                }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "single" && (
        <div
          style={{
            width: "40vw",
            height: "120px",
            margin: "60px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "1px solid #333",
            borderBottom: "1px solid #333",
            fontSize: "48px",
            fontWeight: "bold",
            opacity: fade ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          {words[singleIndex]}
        </div>
      )}

      {mode === "vertical" && (
        <div
          ref={containerRef}
          style={{
            width: "40vw",
            height: "300px",
            margin: "60px auto",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderTop: "1px solid #333",
            borderBottom: "1px solid #333",
            position: "relative",
          }}
        >
          {/* fade gradients top and bottom */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "80px",
            background: "linear-gradient(to bottom, #f8a014, transparent)",
            zIndex: 1, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
            background: "linear-gradient(to top, #f8a014, transparent)",
            zIndex: 1, pointerEvents: "none",
          }} />
          <div
            ref={verticalScrollRef}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              willChange: "transform",
              paddingTop: "140px",
            }}
          >
            {words.map((word, index) => (
              <div
                key={index}
                ref={(el) => (verticalWordRefs.current[index] = el)}
                style={{
                  fontSize: "28px",
                  whiteSpace: "nowrap",
                  color: "#ffffff",
                  opacity: index === currentVerticalWordIndex ? 1 : 0.3,
                  transform: index === currentVerticalWordIndex ? "scale(1.15)" : "scale(1)",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App