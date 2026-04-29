import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { usePatient } from "./PatientContext";
import "./Navigation.css";

//page order for navigation
const PAGE_ORDER = ["/", "/vitals", "/images", "/model", "/game"];

//maps each route to label
const PAGE_LABELS: Record<string,string> = {
    "/": "Home",
    "/vitals": "Vitals",
    "/images": "Images",
    "/model": "Model",
    "/game": "Game",
};

//sets direction for page navigation
interface NavigationProps {
    direction: "left" | "right";
}

export default function Navigation({ direction }: NavigationProps) {
    const { paused } = usePatient();
    const navigate = useNavigate();
    const location = useLocation();

    //delays navigation function
    const hoverTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    //current index of page
    const currIdx = PAGE_ORDER.indexOf(location.pathname);
    const targetPath = direction == "left" ? PAGE_ORDER[(currIdx-1+PAGE_ORDER.length) % PAGE_ORDER.length] 
    : PAGE_ORDER[(currIdx+1) % PAGE_ORDER.length];

    useEffect(() => {
        return () => { if (hoverTimeRef.current) clearTimeout(hoverTimeRef.current); };
    }, []);

    //starts a timer and navigates to next page over a certain time
    const startHover = () => {
        if (paused) return;
        hoverTimeRef.current = setTimeout(() => navigate(targetPath), 800);
    };

    //stops timer when user stops hovering
    const cancelHover = () => {
        if (hoverTimeRef.current) clearTimeout(hoverTimeRef.current);
    };

    return (
        <div className={`nav-edge-btn nav-edge-${direction}`}
        onMouseEnter={startHover}
        onMouseLeave={cancelHover}
        >
            {direction === "left" && <span className="nav-arrow">◀</span>}
            <span className="nav-label">{PAGE_LABELS[targetPath]}</span>
            {direction === "right" && <span className="nav-arrow">▶</span>}
            <button></button>
        </div>
    );
}