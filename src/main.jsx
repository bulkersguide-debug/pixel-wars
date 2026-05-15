import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import FandomPage from "./FandomPage";
import FandomDirectory from "./FandomDirectory";
import AdminPage from "./AdminPage";
import TermsOfService from "./TermsOfService";
import PrivacyPolicy from "./PrivacyPolicy";
import Contact from "./Contact";
import RivalriesPage from "./RivalriesPage";
import RequestFandomPage from "./RequestFandomPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<App />} />
        <Route path="/fandoms"        element={<FandomDirectory />} />
        <Route path="/fandom/:slug"   element={<FandomPage />} />
        <Route path="/fandoms/:slug"  element={<FandomPage />} />
        <Route path="/admin"          element={<AdminPage />} />
        <Route path="/terms"          element={<TermsOfService />} />
        <Route path="/privacy"        element={<PrivacyPolicy />} />
        <Route path="/contact"        element={<Contact />} />
        <Route path="/rivalries"      element={<RivalriesPage />} />
        <Route path="/request-fandom" element={<RequestFandomPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
