import { useEffect, useRef } from "react";
import { usePatient } from "../PatientContext";
import "./Vitals.css";

interface WaveformProps {
  color: string;
  generatePoint: (t: number) => number;
  offsetRef: React.MutableRefObject<number>;
  paused: boolean;
}

function Waveform({ color, generatePoint, offsetRef, paused }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const width = canvas.width;
    const height = canvas.height;
    const speed = 2;

    if (pointsRef.current.length === 0) {
      pointsRef.current = Array(width).fill(height / 2);
    }

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      offsetRef.current += speed;
      pointsRef.current.shift();
      pointsRef.current.push(generatePoint(offsetRef.current));

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;

      pointsRef.current.forEach((y, x) => {
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [paused]);

  return <canvas ref={canvasRef} width={700} height={100} className="waveform-canvas" />;
}

function ecgPoint(t: number, height: number): number {
  const cycle = t % 80;
  if (cycle < 10) return height / 2 + Math.sin(cycle * 0.3) * 4;
  if (cycle < 15) return height / 2 - 35;
  if (cycle < 20) return height / 2 + 20;
  if (cycle < 25) return height / 2 - 8;
  return height / 2 + Math.sin(cycle * 0.1) * 3;
}

function spo2Point(t: number, height: number): number {
  return height / 2 + Math.sin(t * 0.08) * 35 + Math.sin(t * 0.16) * 10;
}

function rrPoint(t: number, height: number): number {
  const base = Math.sin(t * 0.03) * 28;
  const notch = Math.sin(t * 0.09) * 8;
  return height / 2 + base + notch;
}

export default function Vitals() {
  const { data, paused, waveOffsets } = usePatient();

  const hr = data.heartRate || "98";
  const bp = data.bloodPressure || "108/68";
  const spo2 = data.oxygenSat || "98";
  const temp = data.temperature || "37.2";
  const H = 100;

  return (
    <div className="vitals-page">
      <div className="waveform-row">
        <div className="waveform-wrap">
          <Waveform
            color="#39ff6a"
            generatePoint={(t) => ecgPoint(t, H)}
            offsetRef={waveOffsets.ecg}
            paused={paused}
          />
        </div>
        <div className="vital-readout green">
          <span className="vital-label">HR</span>
          <span className="vital-value">{hr}</span>
        </div>
      </div>

      <div className="waveform-row">
        <div className="waveform-wrap">
          <Waveform
            color="#00e5ff"
            generatePoint={(t) => spo2Point(t, H)}
            offsetRef={waveOffsets.spo2}
            paused={paused}
          />
        </div>
        <div className="vital-readout cyan">
          <span className="vital-label">SpO₂</span>
          <span className="vital-value">{spo2}</span>
        </div>
      </div>

      <div className="waveform-row">
        <div className="waveform-wrap">
          <Waveform
            color="#ffe033"
            generatePoint={(t) => rrPoint(t, H)}
            offsetRef={waveOffsets.rr}
            paused={paused}
          />
        </div>
        <div className="vital-readout yellow">
          <span className="vital-label">RR</span>
          <span className="vital-value">18</span>
        </div>
      </div>

      <div className="vitals-bottom">
        <div className="vital-big red">{bp} <span className="vital-unit">mmHg</span></div>
        <div className="vital-big red">{temp} <span className="vital-unit">°C</span></div>
      </div>
    </div>
  );
}