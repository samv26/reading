import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Reading from "./pages/reading";
import Six from "./pages/six";
import Sequence from "./pages/sequence";

function App() {
  return (
    <Router>
      <Routes>
        {/* default route redirects to /reading */}
        <Route path="/" element={<Navigate to="/reading" replace />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/six" element={<Six />} />
        <Route path="/sequence" element={<Sequence />} />
        {/* fallback for unknown paths */
        <Route path="*" element={<Navigate to="/reading" replace />} />
}
      </Routes>
    </Router>
  );
}

export default App;
