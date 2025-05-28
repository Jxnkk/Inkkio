import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const gridCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const [mode, setMode] = useState("draw");
  const pathsRef = useRef([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const offsetRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); 
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [embedCode, setEmbedCode] = useState("");

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 25;

  const API_KEY = "AIzaSyBJcLNXS5KazHLCV2yjNkpaDGOGgdLuy-U";
  const my_key = "367fc2e9522cccbe43d012";
  const CX = "c7b07b8214c624a79";

  const handleSearch = async (searchQuery) => {
  try {
    const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
      params: {
        key: API_KEY,
        cx: CX,
        q: `${searchQuery} song`,
      },
    });
    const allResults = response.data.items || [];
    const trackLinks = [];

    for (const item of allResults) {
      const url = item.link;
      console.log(item);
      const splitUrl = url.split("/");
      if(splitUrl.length == 5){
        trackLinks.push(item);
      }
    setSearchResults(trackLinks);
    console.log("Filtered track links:", trackLinks);
    }} catch (error) {
      console.log("No successful search", error);
    }
  };

  const fetchEmbedCode = async (my_url) => {
    try {
      const response = await axios.get("https://iframe.ly/api/iframely", {
        params: {
          url: my_url,
          api_key: my_key
        },
      });
      console.log("Requested URL:", my_url);
      const data = response.data;
      const embedUrl = data.links.player[0].href;
      console.log(embedUrl);
      setEmbedCode(embedUrl);
    }
    catch (error) {
      console.error("Error fetching embed code:", error);
    }
  };

  const handleResultClick = (url) => {
    fetchEmbedCode(url);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const resizeCanvases = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      [gridCanvasRef.current, drawCanvasRef.current].forEach((canvas) => {
        canvas.width = width;
        canvas.height = height;
      });

      offsetRef.current = { x: width / 2, y: height / 2 };

      drawGrid();
      drawAllPaths();
    };

    resizeCanvases();
    window.addEventListener("resize", resizeCanvases);
    return () => window.removeEventListener("resize", resizeCanvases);
  }, []);

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

    for (let x = -limitX; x < limitX; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, -limitY);
      ctx.lineTo(x, limitY);
      ctx.stroke();
    }

    for (let y = -limitY; y < limitY; y += step) {
      ctx.beginPath();
      ctx.moveTo(-limitX, y);
      ctx.lineTo(limitX, y);
      ctx.stroke();
    }

    ctx.restore();
  };

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

  const handleWheel = (e) => {
    e.preventDefault();

    let newScale = scale - e.deltaY * 0.001;
    newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

    setScale(newScale);

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
      <div className="search-results">
        <input
          type="text"
          className="searchBox"
          value={searchQuery}
          onChange={handleInputChange} 
          placeholder="Search for a song or playlist"
        />
        <button onClick={handleSearch}>Search</button>
        {searchResults.length > 0 && (
        <div className="searchResultsContainer">
          <h3>Search Results:</h3>
          <div className="searchList">
            {searchResults.map((result, index) => (
              <div key={index} className="searchItem">
                {result.pagemap?.cse_image && result.pagemap.cse_image[0] ? (
                <img
                  src={result.pagemap.cse_image[0].src}
                  alt="cover"
                  className="cover-image"
                />
                ) : (
                  <div className="noImage">No Image</div>
                )}
                <div className="songInfo">
                    <a href={result.link} target="_blank" rel="noopener noreferrer"                    
                    onClick={(e) => {
                      e.preventDefault(); 
                      handleResultClick(result.link); 
                    }}>
                    <h4>{result.title}</h4>
                    </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      <div>
        <iframe
          className="soundcloud-player"
          src={embedCode ? embedCode : "https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F222896338&show_artwork=true"}
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default App;
