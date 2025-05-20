import { useEffect, useRef, useState } from "react";

function App() {
  const canvasRef = useRef(null);
  const pathsRef = useRef([]); 
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawAll();
  }, []);

  const drawAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scale, scale);

    const step = 75;
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1 / scale;
    for (let x = 0; x < canvas.width / scale; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height / scale);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height / scale; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width / scale, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2 / scale;
    pathsRef.current.forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });

    if (currentPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
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
    <canvas
      ref={canvasRef}
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
        cursor: "crosshair",
        border: "none",
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onWheel={handleWheel}
    />
  );
}

export default App;
