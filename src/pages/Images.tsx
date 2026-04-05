import { useState, useRef, useCallback, useEffect } from "react";
import "./Images.css";

const SERIES = [
  { id: "series1", label: "Series 1", folder: "series1", count: 76, filePattern: (i:number) => `E1154S7I${String(i).padStart(3,"0")}.png`, },
  { id:"series2",label:"Series 2",folder:"series2",count: 100, filePattern: (i: number) => `image_${i + 1}.png` },
  { id:"series3",label:"Series 3",folder:"series3",count: 301, filePattern: (i: number) => `image_${i + 101}.png` },
  { id:"series4",label:"Series 4",folder:"series4",count: 203, filePattern: (i: number) => `image_${i + 402}.png` },
  { id:"series5",label:"Series 5",folder:"series5",count: 4438, filePattern: (i: number) => `image_${i + 605}.png` },
];

export default function Images() {
  const [activeSeries, setActiveSeries] = useState(SERIES[0]);
  const [imageIndex, setImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => stopScroll();
  }, []);

  useEffect(() => {
    setImageIndex(0);
  }, [activeSeries]);

  const nextImage = useCallback(() => {
    setImageIndex(i => i >= activeSeries.count - 1 ? 0 : i + 1);
  }, [activeSeries.count]);

  const stopScroll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    intervalRef.current = null;
    holdTimeoutRef.current = null;
  };

  const handlePointerDown = () => {
    holdTimeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(nextImage, 60);
    }, 400);
  };

  const handlePointerUp = () => {
    const wasHolding = !!intervalRef.current;
    stopScroll();
    if (!wasHolding) nextImage();
  };

  const handleSeriesSelect = (series: typeof SERIES[0]) => {
    stopScroll();
    setActiveSeries(series);
  };

  const imageSrc = `/${activeSeries.folder}/${activeSeries.filePattern(imageIndex)}`;

  return (
    <div className="images-page">
      <div
        className="image-viewer"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={stopScroll}
      >
        <img
          src={imageSrc}
          alt={`${activeSeries.label} image ${imageIndex + 1}`}
          className="scan-image"
          draggable={false}
        />

        <div className="viewer-overlay-tl">
          <span>{activeSeries.label}</span>
          <span>Image {imageIndex + 1} / {activeSeries.count}</span>
        </div>

        <div className="viewer-progress-bar">
          <div
            className="viewer-progress-fill"
            style={{ width: `${(imageIndex / (activeSeries.count - 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="series-panel">
        <h3 className="series-title">Series</h3>
        <div className="series-list">
          {SERIES.map(series => (
            <button
              key={series.id}
              className={`series-btn ${activeSeries.id === series.id ? "series-btn-active" : ""}`}
              onClick={() => handleSeriesSelect(series)}
            >
              <img
                src={`/${series.folder}/${series.filePattern(0)}`}
                alt={series.label}
                className="series-btn-thumb-img"
                draggable={false}
              />
              <span className="series-btn-label">{series.label}</span>
              <span className="series-btn-count">{series.count} images</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}