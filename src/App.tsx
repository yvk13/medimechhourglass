import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect,useRef } from "react";
import { PatientProvider, usePatient } from "./PatientContext";
import Navbar from "./Navbar";
import Home from "./pages/Home";
import Vitals from "./pages/Vitals";
import Images from "./pages/Images";
import Model from "./pages/Model";
import Game from "./pages/Game";
import Navigation from "./Navigation";

// Locks navigation when paused
function NavigationLock() {
  const { paused } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();
  const lastLocation = useRef(location.pathname);

  useEffect(() => {
    if (!paused) {
      lastLocation.current = location.pathname;
    }
  }, [location.pathname, paused]);

  useEffect(() => {
    if (paused && location.pathname !== lastLocation.current) {
      navigate(lastLocation.current, { replace: true });
    }
  }, [paused, location.pathname]);

  return null;
}

// Blocks all mouse interaction except the pause button
function PauseOverlay() {
  const { paused } = usePatient();
  if (!paused) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 56,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        cursor: "not-allowed",
      }}
    />
  );
}

export default function App() {
  return (
    <PatientProvider>
      <BrowserRouter>
        <NavigationLock />
        <Navbar />
        <PauseOverlay />
        <Navigation direction="left" />
        <Navigation direction="right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vitals" element={<Vitals />} />
          <Route path="/images" element={<Images />} />
          <Route path="/model" element={<Model />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PatientProvider>
  );
}