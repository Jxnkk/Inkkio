import { useEffect, useState, useRef } from "react";
import "./Whiteboard.css";

export default function WhiteBoard(){
    const canvasRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({x: null, y: null});
    const [lastX, setLastX] = useState(null);
    const [lastY, setLastY] = useState(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [isHighlighting, setIsHighlight] = useState(false);
    const [isWriting, setIsWriting] = useState(false);
    const [isShape, setIsShape] = useState(false);
    const [isStickyNote, setIsStickyNote] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvasUpdater = canvas.getContext("2d");
        canvasUpdater.fillStyle = "#cccccc";

        for(let x = 0; x < canvas.width; x += 20){
            for(let y = 0; y < canvas.height; y += 20){
                canvasUpdater.beginPath();
                canvasUpdater.arc(x, y, 1, 0, Math.PI * 2, true);
                canvasUpdater.fill();
            }
        }
    }, [mousePosition]);

    function updateMouseLocation(event){
        setMousePosition({x: event.clientX, y: event.clientY});
    };
    
    function handleMouseDown(event){
        setIsMouseDown(true);
        setLastX(mousePosition.x);
        setLastY(mousePosition.y);
    }

    function handleMouseUp(event){
        setIsMouseDown(false);
        setLastX(null);
        setLastY(null);
    }

    useEffect(() => {
        if (!isMouseDown){ 
            return;
        }
        const canvas = canvasRef.current;
        const canvasUpdater = canvas.getContext("2d");
        if(lastX === null && lastY === null){
            setLastX(mousePosition.x);
            setLastY(mousePosition.y);
        }
        if(isDrawing){
            canvasUpdater.strokeStyle = "#000000";
            canvasUpdater.lineWidth = 2;
        };
        if(isErasing){
            canvasUpdater.strokeStyle = "#ffffff";
            canvasUpdater.lineWidth = 10;
        };
        if(isHighlighting){
            canvasUpdater.strokeStyle = "#ffde64";
            canvasUpdater.lineWidth = 5;
        }
        canvasUpdater.beginPath();
        canvasUpdater.moveTo(lastX, lastY);
        canvasUpdater.lineTo(mousePosition.x, mousePosition.y);
        setLastX(mousePosition.x);
        setLastY(mousePosition.y);
        canvasUpdater.stroke();

    }, [isDrawing, isErasing, isHighlighting, mousePosition]);   

    return(
        <div className = "whiteboard">
            <canvas className = "canvas" ref = {canvasRef} onMouseMove = {updateMouseLocation} onMouseDown = {handleMouseDown} onMouseUp = {handleMouseUp} onMouseLeave = {handleMouseUp}></canvas>
            <div className = "editingTools">
                <button onClick = {() => {setIsDrawing(!isDrawing); setIsErasing(false); setIsHighlight(false)}}>
                    <img src = "pencil-Stroke-Rounded.png" alt = "pencil"/>
                </button>
                <button onClick = {() => {setIsErasing(!isErasing); setIsDrawing(false); setIsHighlight(false)}}>
                    <img src = "eraser-Stroke-Rounded.png" alt = "eraser"/>
                </button>
                <button onClick = {() => {setIsHighlight(!isHighlighting); setIsDrawing(false); setIsErasing(false)}}>
                    <img src = "highlighter-Stroke-Rounded.png" alt = "highlighter"/>
                </button>
                <button>
                    <img src = "sticky-note-Stroke-Rounded.png" alt = "sticky note"/>
                </button>
                <button>
                    <img src = "shapes-Stroke-Rounded.png" alt = "shapes"/>
                </button>
                <button>
                    <img src = "text-Stroke-Rounded.png" alt = "text"/>
                </button>
            </div>
        </div>
    )
}