import { useEffect, useRef, useState, useCallback } from "react";
import "./Game.css";

const GRAVITY = 0.35;
const JUMP_FORCE = -13;
const GROUND_Y = 220;
const DINO_X = 80;
const INITIAL_SPEED = 4;
const SPEED_INCREMENT = 0.0004;
const DINO_W = 66;
const DINO_H = 70;

interface Cactus {
  x: number;
  img: HTMLImageElement;
  w: number;
  h: number;
}

interface Cloud {
  x: number;
  y: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const stateRef = useRef({
    dinoY: GROUND_Y,
    dinoVY: 0,
    onGround: true,
    cacti: [] as Cactus[],
    clouds: [{ x: 200, y: 60 }, { x: 500, y: 40 }, { x: 750, y: 75 }] as Cloud[],
    speed: INITIAL_SPEED,
    score: 0,
    frame: 0,
    gameOver: false,
    started: false,
    trackX: 0,
  });
  
  const animRef = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "dead">("idle");

  // Load all assets
  useEffect(() => {
    const paths: Record<string, string> = {
      dinoStart:   "/game/Dino/DinoStart.png",
      dinoRun1:    "/game/Dino/DinoRun1.png",
      dinoRun2:    "/game/Dino/DinoRun2.png",
      dinoJump:    "/game/Dino/DinoJump.png",
      dinoDead:    "/game/Dino/DinoDead.png",
      dinoDuck1:   "/game/Dino/DinoDuck1.png",
      dinoDuck2:   "/game/Dino/DinoDuck2.png",
      smallCactus1: "/game/Cactus/SmallCactus1.png",
      smallCactus2: "/game/Cactus/SmallCactus2.png",
      smallCactus3: "/game/Cactus/SmallCactus3.png",
      largeCactus1: "/game/Cactus/LargeCactus1.png",
      largeCactus2: "/game/Cactus/LargeCactus2.png",
      largeCactus3: "/game/Cactus/LargeCactus3.png",
      cloud:       "/game/Other/Cloud.png",
      gameOver:    "/game/Other/GameOver.png",
      reset:       "/game/Other/Reset.png",
      track:       "/game/Other/Track.png",
    };

    Promise.all(
      Object.entries(paths).map(([key, src]) =>
        loadImage(src).then(img => ({ key, img }))
      )
    ).then(entries => {
      entries.forEach(({ key, img }) => {
        imagesRef.current[key] = img;
      });
      setLoaded(true);
    });
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameOver) {
      restartGame();
      return;
    }
    if (!s.started) {
      s.started = true;
      setStatus("running");
    }
    if (s.onGround) {
      s.dinoVY = JUMP_FORCE;
      s.onGround = false;
    }
  }, []);

  const restartGame = () => {
    stateRef.current = {
      dinoY: GROUND_Y,
      dinoVY: 0,
      onGround: true,
      cacti: [],
      clouds: [{ x: 200, y: 60 }, { x: 500, y: 40 }, { x: 750, y: 75 }],
      speed: INITIAL_SPEED,
      score: 0,
      frame: 0,
      gameOver: false,
      started: true,
      trackX: 0,
    };
    setDisplayScore(0);
    setStatus("running");
  };

  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const imgs = imagesRef.current;
    const groundY = GROUND_Y + DINO_H;
    const trackH = imgs.track?.naturalHeight || 24;

    const cactusVariants = [
      { key: "smallCactus1", w: 34, h: 70 },
      { key: "smallCactus2", w: 68, h: 70 },
      { key: "smallCactus3", w: 102, h: 70 },
      { key: "largeCactus1", w: 50, h: 100 },
      { key: "largeCactus2", w: 100, h: 100 },
      { key: "largeCactus3", w: 150, h: 100 },
    ];

    const spawnCactus = (s: typeof stateRef.current) => {
      if (s.cacti.length === 0 || s.cacti[s.cacti.length - 1].x < W - (400 + Math.random() * 350)) {
        const v = cactusVariants[Math.floor(Math.random() * cactusVariants.length)];
        s.cacti.push({
          x: W + 20,
          img: imgs[v.key],
          w: v.w,
          h: v.h,
        });
      }
    };

    const getDinoImg = (s: typeof stateRef.current) => {
      if (s.gameOver) return imgs.dinoDead;
      if (!s.onGround) return imgs.dinoJump;
      if (!s.started) return imgs.dinoStart;
      return Math.floor(s.frame / 6) % 2 === 0 ? imgs.dinoRun1 : imgs.dinoRun2;
    };

    const loop = () => {
      animRef.current = requestAnimationFrame(loop);
      const s = stateRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // // Clouds
      // s.clouds.forEach(c => {
      //   if (imgs.cloud) ctx.drawImage(imgs.cloud, c.x, c.y, 92, 28);
      //   if (s.started && !s.gameOver) c.x -= 0.8;
      //   if (c.x < -100) c.x = W + 50;
      // });

      // Scrolling track
      if (imgs.track) {
        const trackW = imgs.track.naturalWidth;
        const tx = -(s.trackX % trackW);
        ctx.drawImage(imgs.track, tx, groundY, trackW, trackH);
        ctx.drawImage(imgs.track, tx + trackW, groundY, trackW, trackH);
        if (s.started && !s.gameOver) s.trackX += s.speed;
      }

      if (!s.started) {
        // Draw idle dino
        const dinoImg = getDinoImg(s);
        if (dinoImg) ctx.drawImage(dinoImg, DINO_X, s.dinoY, DINO_W, DINO_H);

        ctx.fillStyle = "#7EB8D4";
        ctx.font = "500 18px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Clench or press space to start", W / 2, H / 2 + 30);
        return;
      }

      if (!s.gameOver) {
        // Physics
        s.dinoVY += GRAVITY;
        s.dinoY += s.dinoVY;
        if (s.dinoY >= GROUND_Y) {
          s.dinoY = GROUND_Y;
          s.dinoVY = 0;
          s.onGround = true;
        }

        s.speed += SPEED_INCREMENT;
        s.frame++;
        s.score = Math.floor(s.frame / 6);
        setDisplayScore(s.score);

        spawnCactus(s);
        s.cacti = s.cacti
          .map(c => ({ ...c, x: c.x - s.speed }))
          .filter(c => c.x > -200);

        // Collision — inset hitbox for fairness
        for (const c of s.cacti) {
          const hPad = 20;  // horizontal padding
          const vPad = 24;  // vertical padding

          const dinoLeft = DINO_X + hPad;
          const dinoRight = DINO_X + DINO_W - hPad;
          const dinoTop = s.dinoY + vPad;
          const dinoBottom = s.dinoY + DINO_H - 8;

          const cLeft = c.x + hPad;
          const cRight = c.x + c.w - hPad;
          const cTop = groundY - c.h + vPad;

          if (
            dinoRight > cLeft &&
            dinoLeft < cRight &&
            dinoBottom > cTop
          ) {
            s.gameOver = true;
            setStatus("dead");
          }
        }
      }

      // Draw cacti
      s.cacti.forEach(c => {
        if (c.img) ctx.drawImage(c.img, c.x, groundY - c.h, c.w, c.h);
      });

      // Draw dino
      const dinoImg = getDinoImg(s);
      if (dinoImg) ctx.drawImage(dinoImg, DINO_X, s.dinoY, DINO_W, DINO_H);

      // Score
      ctx.fillStyle = "#7EB8D4";
      ctx.font = "500 20px monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(s.score).padStart(5, "0"), W - 24, 36);

      // Game over screen
      if (s.gameOver) {
        if (imgs.gameOver) {
          ctx.drawImage(imgs.gameOver, W / 2 - 96, H / 2 - 60, 192, 36);
        }
        if (imgs.reset) {
          ctx.drawImage(imgs.reset, W / 2 - 19, H / 2 - 10, 38, 34);
        }
      }
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [loaded]);

  return (
    <div className="game-page">
      {!loaded && <div className="game-loading">Loading assets...</div>}
      <canvas
        ref={canvasRef}
        width={900}
        height={400}
        className="game-canvas"
        style={{ display: loaded ? "block" : "none" }}
        onMouseDown={jump}
      />
      {loaded && <div className="game-hint">Clench to jump</div>}
    </div>
  );
}