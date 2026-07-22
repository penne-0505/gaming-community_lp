import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { trackPageView } from "./analytics";

const Membership = lazy(() => import("./pages/Membership"));
const JoinLanding = lazy(() => import("./pages/JoinLanding"));
const DemoFlow = lazy(() => import("./pages/DemoFlow"));
const Contract = lazy(() => import("./pages/Contract"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Legal = lazy(() => import("./pages/Legal"));
const LegalDoc = lazy(() => import("./pages/LegalDoc"));
const Thanks = lazy(() => import("./pages/Thanks"));
const Cancellation = lazy(() => import("./pages/Cancellation"));
const Supporters = lazy(() => import("./pages/Supporters"));

const RouteAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    trackPageView(path);
  }, [location.pathname, location.search]);

  return null;
};

const App = () => {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <RouteAnalytics />
      <Suspense fallback={<div className="min-h-screen token-bg-main" />}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<JoinLanding />} />
          <Route path="/join" element={<JoinLanding />} />
          <Route path="/demo-flow" element={<DemoFlow />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/legal/:docKey" element={<LegalDoc />} />
          <Route path="/contract" element={<Contract />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/cancellation" element={<Cancellation />} />
          <Route path="/supporters" element={<Supporters />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
