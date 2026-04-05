import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { usePatient } from "./PatientContext";
import "./Navbar.css";

const PAGES = [
  { label: "Home", path: "/" },
  { label: "Vitals", path: "/vitals" },
  { label: "Images", path: "/images" },
  { label: "Model", path: "/model" },
  { label: "Game", path: "/game" },
];

export default function Navbar() {
  const { data, paused, setPaused } = usePatient();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [time, setTime] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      const activeIndex = PAGES.findIndex(p => p.path === location.pathname);
      const target = itemRefs.current[activeIndex >= 0 ? activeIndex : 0];
      if (target) {
        target.focus();
        setHovered(PAGES[activeIndex >= 0 ? activeIndex : 0].path);
      }
    } else {
      setHovered(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = PAGES.findIndex(p => p.path === hovered);
        const next = e.key === "ArrowDown"
          ? Math.min(currentIndex + 1, PAGES.length - 1)
          : Math.max(currentIndex - 1, 0);
        setHovered(PAGES[next].path);
        itemRefs.current[next]?.focus();
      }
      if (e.key === "Enter" && hovered) {
        handleSelect(hovered);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, hovered]);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
    setHovered(null);
  };

  const currentPage = PAGES.find(p => p.path === location.pathname)?.label ?? "Home";

  return (
    <>
      {open && (
        <div
          className="navbar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="navbar-wrapper">
        <button className="navbar-trigger" onClick={() => setOpen(o => !o)}>
          <div className="trigger-left">
            <span className="trigger-page">{currentPage}</span>
            <span className="trigger-arrow">{open ? "▲" : "▼"}</span>
          </div>
          <span className="trigger-clock">{time}</span>
          <div className="trigger-right">
            <div className="trigger-patient">
              <span>Procedure: <strong>{data.procedure || "—"}</strong></span>
              <span>Patient: <strong>{data.patientName || "—"}</strong></span>
            </div>
            {/* Pause button */}
            <button
              className={`pause-btn ${paused ? "pause-btn-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setPaused(!paused);
              }}
              style={{ position: "relative", zIndex: 9999 }}
            >
              {paused ? "▶" : "⏸"}
            </button>
          </div>
        </button>

        {open && (
          <div className="navbar-dropdown" ref={dropdownRef}>
            {PAGES.map((page, i) => (
              <div
                key={page.path}
                ref={el => { itemRefs.current[i] = el; }}
                tabIndex={0}
                className={`dropdown-item ${
                  hovered === page.path
                    ? "dropdown-item-hovered"
                    : location.pathname === page.path
                    ? "dropdown-item-active"
                    : ""
                }`}
                onMouseEnter={() => setHovered(page.path)}
                onClick={() => handleSelect(page.path)}
              >
                {page.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}