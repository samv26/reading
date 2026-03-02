import { useState, useEffect, useRef } from "react";
import Navigation from "../components/navigation";

export default function sequence() {
  const [sequence, setSequence] = useState([]);
  const [playerInput, setPlayerInput] = useState([]);
  const [isShowing, setIsShowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(3);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("gs_highscore")) || 0
  );

  const intervalRef = useRef(null);

  const colors = [
    "#ff006e",
    "#8338ec",
    "#3a86ff",
    "#fb5607",
    "#ffbe0b",
    "#06ffa5",
    "#ff006e",
    "#60a5fa",
    "#f59e0b",
    "#10b981",
  ];

  const getColorForNumber = (num) => colors[num];

  const generateNext = (lastNum = null) => {
    let num;
    do {
      num = Math.floor(Math.random() * 10);
    } while (lastNum !== null && num === lastNum);
    return num;
  };

  const startGame = () => {
    const initial = [];
    let lastNum = null;
    for (let j = 0; j < 3; j++) {
      const newNum = generateNext(lastNum);
      initial.push(newNum);
      lastNum = newNum;
    }
    setSequence(initial);
    setRound(3);
    setPlayerInput([]);
    setGameOver(false);
    playSequence(initial);
  };

  const playSequence = (seq) => {
    setIsShowing(true);
    setPlayerInput([]);
    let i = 0;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(i);
      i++;
      if (i >= seq.length) {
        clearInterval(intervalRef.current);
        setTimeout(() => {
          setIsShowing(false);
          setCurrentIndex(null);
        }, 500);
      }
    }, 800);
  };

  const handleInput = (num) => {
    if (isShowing || gameOver) return;

    const updated = [...playerInput, num];
    setPlayerInput(updated);

    if (num !== sequence[updated.length - 1]) {
      endGame();
      return;
    }

    if (updated.length === sequence.length) {
      const nextSeq = [...sequence, generateNext(sequence[sequence.length - 1])];
      const newRound = round + 1;
      setRound(newRound);
      setSequence(nextSeq);
      setTimeout(() => playSequence(nextSeq), 800);
    }
  };

  const endGame = () => {
    setGameOver(true);
    if (round - 1 > highScore) {
      setHighScore(round - 1);
      localStorage.setItem("gs_highscore", round - 1);
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.gameboy}>
        <h1 style={styles.title}>GROWING SEQUENCE</h1>

        <div
          style={{
            ...styles.screen,
            color: isShowing && currentIndex !== null ? getColorForNumber(sequence[currentIndex]) : "#39ff14",
            textShadow: isShowing && currentIndex !== null ? `0 0 20px ${getColorForNumber(sequence[currentIndex])}` : "0 0 20px #39ff14",
          }}
        >
          {isShowing && currentIndex !== null
            ? sequence[currentIndex]
            : gameOver
            ? "GAME OVER"
            : "READY"}
        </div>

        <div style={styles.screen}>
          {playerInput.length > 0 ? playerInput[playerInput.length - 1] : "-"}
        </div>

        <div style={styles.info}>
          <div>Level: {round - 1}</div>
          <div>High Score: {highScore}</div>
        </div>

        <div style={styles.keypad}>
          {[0,1,2,3,4,5,6,7,8,9].map((num) => (
            <button
              key={num}
              style={{
                ...styles.button,
                backgroundColor: getColorForNumber(num),
                boxShadow: `0 0 10px ${getColorForNumber(num)}`,
              }}
              onClick={() => handleInput(num)}
            >
              {num}
            </button>
          ))}
        </div>

        <button style={styles.start} onClick={startGame}>
          {gameOver ? "RESTART" : "START"}
        </button>
      </div>
      <Navigation />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#081b33",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Courier New', monospace",
  },
  gameboy: {
    backgroundColor: "#1e40af",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 0 40px #00eaff",
    width: "420px",
    textAlign: "center",
    border: "4px solid #00eaff",
  },
  title: {
    color: "#00eaff",
    textShadow: "0 0 15px #00eaff",
    marginBottom: "20px",
  },
  screen: {
    backgroundColor: "#0f172a",
    height: "100px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "48px",
    color: "#39ff14",
    textShadow: "0 0 20px #39ff14",
    borderRadius: "10px",
    border: "3px solid #00eaff",
  },
  info: {
    display: "flex",
    justifyContent: "space-between",
    color: "#00eaff",
    marginBottom: "15px",
  },
  keypad: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "10px",
    marginBottom: "15px",
  },
  button: {
    padding: "15px",
    fontSize: "18px",
    backgroundColor: "#0ea5e9",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 0 10px #00eaff",
  },
  start: {
    padding: "12px",
    width: "100%",
    fontSize: "16px",
    backgroundColor: "#22d3ee",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 0 15px #00eaff",
  },
};