import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import FandomPage from "./FandomPage";
import FandomDirectory from "./FandomDirectory";
import AdminPage from "./AdminPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/fandoms" element={<FandomDirectory />} />
        <Route path="/fandom/:slug" element={<FandomPage />} />
        <Route path="/fandoms/:slug" element={<FandomPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
