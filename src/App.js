import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const pathsRef = useRef([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 25;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawAll();
  }, []);

  const drawAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    const offsetX = canvas.width / 2;
    const offsetY = canvas.height / 2;
    ctx.translate(offsetX, offsetY); // Center origin
    ctx.scale(scale, scale);

    // Draw grid lines
    const step = 75;
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1 / scale;

    const gridLimitX = canvas.width / scale;
    const gridLimitY = canvas.height / scale;

    for (let x = -gridLimitX; x < gridLimitX; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -gridLimitY);
      ctx.lineTo(x, gridLimitY);
      ctx.stroke();
    }

    for (let y = -gridLimitY; y < gridLimitY; y += step) {
      ctx.beginPath();
      ctx.moveTo(-gridLimitX, y);
      ctx.lineTo(gridLimitX, y);
      ctx.stroke();
    }

    // Draw all paths
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2 / scale;

    [...pathsRef.current, currentPath].forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });

    ctx.restore();
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - canvasRef.current.width / 2) / scale,
      y: (e.clientY - rect.top - canvasRef.current.height / 2) / scale,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setCurrentPath([pos]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    setCurrentPath((prev) => [...prev, pos]);
  };

  const endDrawing = () => {
    if (currentPath.length > 0) {
      pathsRef.current = [...pathsRef.current, currentPath];
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  useEffect(() => {
    drawAll();
  }, [currentPath, scale]);

  const handleWheel = (e) => {
    e.preventDefault();
    let newScale = scale - e.deltaY * 0.001;
    newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
    setScale(newScale);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="whiteboard"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onWheel={handleWheel}
      />
      <iframe
        className="soundcloud-player"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F1768727658&show_artwork=true"
      >
      </iframe>
      <div
        className="soundcloud-search"
      >
      </div>
      <div 
        className="editing"
      >
      </div>
      <div 
        className="timer"
      >
      </div>
      <button
        className="undo"
      >
      </button>
          <button
        className="redo"
      >
      </button>
    </div>
  );
}

export default App;
