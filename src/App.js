import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const gridCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const [mode, setMode] = useState("draw");
  const pathsRef = useRef([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const offsetRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); // Center offset

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 25;

  useEffect(() => {
    const resizeCanvases = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      [gridCanvasRef.current, drawCanvasRef.current].forEach((canvas) => {
        canvas.width = width;
        canvas.height = height;
      });

      // Keep offset centered on canvas
      offsetRef.current = { x: width / 2, y: height / 2 };

      drawGrid();
      drawAllPaths();
    };

    resizeCanvases();
    window.addEventListener("resize", resizeCanvases);
    return () => window.removeEventListener("resize", resizeCanvases);
  }, []);

  // Draw grid on bottom canvas
  const drawGrid = () => {
    const canvas = gridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    const offsetX = offsetRef.current.x;
    const offsetY = offsetRef.current.y;
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1 / scale;

    const step = 75;
    const limitX = canvas.width / scale;
    const limitY = canvas.height / scale;

    // Draw vertical lines
    for (let x = -limitX; x < limitX; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -limitY);
      ctx.lineTo(x, limitY);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = -limitY; y < limitY; y += step) {
      ctx.beginPath();
      ctx.moveTo(-limitX, y);
      ctx.lineTo(limitX, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Draw all paths on top canvas
  const drawAllPaths = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    const offsetX = offsetRef.current.x;
    const offsetY = offsetRef.current.y;
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    [...pathsRef.current, currentPath].forEach((path) => {
      if (path.length < 2) return;

      const pathType = path[0]?.type || "draw";

      if (pathType === "erase") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 15 / scale;
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else if (pathType === "highlight") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(255, 255, 0, 0.3)";
        ctx.lineWidth = 10 / scale;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2 / scale;
      }

      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });

    ctx.restore();
  };

  useEffect(() => {
    drawGrid();
    drawAllPaths();
  }, [currentPath, scale]);

  // Also redraw whenever scale changes explicitly
  useEffect(() => {
    drawGrid();
    drawAllPaths();
  }, [scale]);

  const getMousePos = (e) => {
    const rect = drawCanvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offsetRef.current.x) / scale,
      y: (e.clientY - rect.top - offsetRef.current.y) / scale,
    };
  };

  // Drawing event handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setCurrentPath([{ ...pos, type: mode }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    setCurrentPath((prev) => [...prev, { ...pos, type: mode }]);
  };

  const endDrawing = () => {
    if (currentPath.length > 0) {
      pathsRef.current = [...pathsRef.current, currentPath];
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  // Zoom on center of screen only, no pan offset change
  const handleWheel = (e) => {
    e.preventDefault();

    let newScale = scale - e.deltaY * 0.001;
    newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

    setScale(newScale);

    // Immediate redraw to avoid lag
    drawGrid();
    drawAllPaths();
  };

  return (
    <div>
      <canvas
        ref={gridCanvasRef}
        className="grid-layer"
        style={{ pointerEvents: "none" }}
      />
      <canvas
        ref={drawCanvasRef}
        className="drawing-layer"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onWheel={handleWheel}
      />
      <div className="editing">
        <button onClick={() => setMode("draw")}>
          <img src="pencil-Stroke-Rounded.png" alt="pencil" />
        </button>
        <button onClick={() => setMode("erase")}>
          <img src="eraser-Stroke-Rounded.png" alt="eraser" />
        </button>
        <button onClick={() => setMode("highlight")}>
          <img src="highlighter-Stroke-Rounded.png" alt="highlighter" />
        </button>
      </div>
    </div>
  );
}

export default App;
