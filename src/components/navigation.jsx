import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <div style={styles.navContainer}>
      <div style={styles.menuLabel}>MENU</div>
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
    left: 20,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start",
    zIndex: 1000,
  },
  menuLabel: {
    padding: "10px 14px",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.95)",
    border: "1px solid rgba(128, 107, 66, 0.35)",
    color: "#4a340f",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
  },
  navLink: {
    padding: "12px 18px",
    background: "linear-gradient(135deg, #e8d9a8ee 0%, #d4c07aee 100%)",
    border: "1.5px solid #c9a96e",
    borderRadius: 4,
    color: "#2b1d0e",
    fontSize: 12,
    fontFamily: "'Cinzel Decorative', serif",
    letterSpacing: 1.5,
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