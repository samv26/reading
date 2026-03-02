import { useState, useEffect, useRef } from "react";

export default function six() {
  const [number, setNumber] = useState("");
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [duration, setDuration] = useState(1000);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const generateNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const startTest = () => {
    const newNumber = generateNumber();
    setNumber(newNumber);
    setVisible(true);
    setInput("");
    setResult(null);
    setStreak(0);

    // give focus to the input field after updating state
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, duration);
  };

  const nextQuestion = () => {
    const newNumber = generateNumber();
    setNumber(newNumber);
    setVisible(true);
    setInput("");
    setResult(null);

    // give focus to the input field after updating state
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, duration);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // if the number is no longer visible, start a new test when Enter is pressed
    if (!visible) {
      startTest();
    }
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.gameboy}>
        <h1 style={styles.title}>SIX DIGIT MEMORY</h1>

        <div style={styles.screen}>
          {visible ? (
            <div style={styles.number}>{number}</div>
          ) : (
            <div style={styles.placeholder}>----</div>
          )}
        </div>

        <div style={{ ...styles.controls, justifyContent: "center", gap: "10px" }}>
          <button style={styles.button} onClick={startTest}>
            Start
          </button>
          {result === "Correct!" && (
            <button style={styles.button} onClick={nextQuestion}>
              Next
            </button>
          )}
        </div>

        <div style={styles.form}>
          <input
            ref={inputRef}
            type="text"
            maxLength="6"
            value={input}
            onChange={(e) => {
              const val = e.target.value;
              setInput(val);
              // immediate feedback when full length entered or match
              if (val === number) {
                setResult("Correct!");
                setStreak(streak + 1);
              } else if (val.length === 6) {
                setResult("Wrong!");
                setStreak(0);
              } else {
                setResult(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !visible) {
                e.preventDefault();
                if (result === "Correct!") {
                  nextQuestion();
                } else {
                  startTest();
                }
              }
            }}
            style={styles.input}
            placeholder="Enter number"
          />
        </div>

        {result && (
          <div
            style={{
              ...styles.result,
              color: result === "Correct!" ? "#00ff99" : "#ff4d6d",
            }}
          >
            {result}
          </div>
        )}

        <div style={styles.streakContainer}>
          <span style={styles.streakLabel}>Streak: </span>
          <span style={styles.streakCount}>{streak}</span>
        </div>

        <div style={styles.sliderContainer}>
          <label style={styles.sliderLabel}>
            Display Time: {(duration / 1000).toFixed(1)}s
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={styles.slider}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0b1f3a",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Courier New', monospace",
  },
  gameboy: {
    backgroundColor: "#1e3a8a",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 0 40px #00f0ff",
    width: "400px",
    textAlign: "center",
    border: "4px solid #00f0ff",
  },
  title: {
    color: "#00f0ff",
    marginBottom: "20px",
    textShadow: "0 0 10px #00f0ff",
  },
  screen: {
    backgroundColor: "#0f172a",
    height: "120px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "3px solid #00f0ff",
    boxShadow: "inset 0 0 20px #00f0ff",
  },
  number: {
    fontSize: "42px",
    color: "#39ff14",
    textShadow: "0 0 15px #39ff14",
    letterSpacing: "8px",
  },
  placeholder: {
    fontSize: "32px",
    color: "#1e293b",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
  },
  button: {
    backgroundColor: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 0 10px #00f0ff",
  },
  form: {
    marginTop: "10px",
  },
  input: {
    padding: "10px",
    width: "70%",
    borderRadius: "8px",
    border: "2px solid #00f0ff",
    marginRight: "5px",
    backgroundColor: "#0f172a",
    color: "#00f0ff",
    textAlign: "center",
    fontSize: "25px",
  },
  submit: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#22d3ee",
    color: "#0b1f3a",
    cursor: "pointer",
    boxShadow: "0 0 10px #00f0ff",
  },
  result: {
    marginTop: "15px",
    fontSize: "20px",
    textShadow: "0 0 10px currentColor",
  },
  sliderContainer: {
    marginTop: "20px",
  },
  sliderLabel: {
    color: "#00f0ff",
    display: "block",
    marginBottom: "5px",
  },
  slider: {
    width: "100%",
  },
  streakContainer: {
    marginTop: "15px",
    fontSize: "18px",
    color: "#00f0ff",
  },
  streakLabel: {
    color: "#00f0ff",
  },
  streakCount: {
    color: "#39ff14",
    textShadow: "0 0 10px #39ff14",
    fontWeight: "bold",
    fontSize: "24px",
  },
};