import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <div style={styles.navContainer}>
      <Link to="/reading" style={styles.navLink}>
        READING
      </Link>
      <Link to="/six" style={styles.navLink}>
        SIX DIGIT
      </Link>
      <Link to="/sequence" style={styles.navLink}>
        SEQUENCE
      </Link>
    </div>
  );
}

const styles = {
  navContainer: {
    position: "fixed",
    right: 20,
    bottom: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 1000,
  },
  navLink: {
    padding: "12px 18px",
    background: "#00d4ff22",
    border: "1px solid #00d4ff",
    borderRadius: 6,
    color: "#00d4ff",
    fontSize: 14,
    textDecoration: "none",
    fontWeight: "bold",
    boxShadow: "0 0 10px #00d4ff55",
    textAlign: "center",
    transition: "all 0.2s",
  },
};
