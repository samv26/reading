import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <div style={styles.navContainer}>
      {[
        { to: "/reading", label: "Reading" },
        { to: "/six", label: "Six Digit" },
        { to: "/sequence", label: "Sequence" },
      ].map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          style={styles.navLink}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.navLinkHover)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, styles.navLink)}
        >
          <span style={styles.ornament}>❧</span>
          {label}
          <span style={{ ...styles.ornament, transform: "scaleX(-1)", display: "inline-block" }}>❧</span>
        </Link>
      ))}
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
    gap: 8,
    zIndex: 1000,
  },
  navLink: {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #e8d9a8ee 0%, #d4c07aee 100%)",
    border: "1.5px solid #c9a96e",
    borderRadius: 2,
    color: "#2b1d0e",
    fontSize: 10,
    fontFamily: "'Cinzel Decorative', serif",
    letterSpacing: 2,
    textDecoration: "none",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 2px 10px #0003, inset 0 1px 0 #ffffff44",
    transition: "all 0.2s",
    backdropFilter: "blur(4px)",
  },
  navLinkHover: {
    background: "linear-gradient(135deg, #5c3a1eee 0%, #2b1d0eee 100%)",
    border: "1.5px solid #b8860b",
    color: "#f0c040",
    boxShadow: "0 4px 16px #0004, inset 0 1px 0 #ffffff22",
  },
  ornament: {
    color: "#b8860b",
    fontSize: 12,
    lineHeight: 1,
  },
};