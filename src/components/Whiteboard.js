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
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeSize, setStrokeSize] = useState(5);
    const [isWriting, setIsWriting] = useState(false);
    const [isShape, setIsShape] = useState(false);
    const [isStickyNote, setIsStickyNote] = useState(false);

    useEffect(() => {
        window.webix.ui({
            view: "colorpicker",
            container: "colorpicker_container",
            value: "#000000",
            on:{
                onChange: function(newColor){
                setStrokeColor(newColor);
                }
            }
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvasUpdater = canvas.getContext("2d");
        canvasUpdater.fillStyle = "#cccccc";
        canvasUpdater.lineWidth = strokeSize;

        for(let x = 0; x < canvas.width; x += 20){
            for(let y = 0; y < canvas.height; y += 20){
                canvasUpdater.beginPath();
                canvasUpdater.arc(x, y, 1, 0, Math.PI * 2, true);
                canvasUpdater.fill();
            }
        }

        if(!isMouseDown || (!isDrawing && !isErasing && !isHighlighting)){ 
            return;
        }

        if(lastX === null && lastY === null){
            setLastX(mousePosition.x);
            setLastY(mousePosition.y);
        }

        if(isDrawing || isHighlighting){
            canvasUpdater.strokeStyle = strokeColor;
        }

        if(isErasing){
            canvasUpdater.strokeStyle = "#ffffff";
        }

        canvasUpdater.beginPath();
        canvasUpdater.moveTo(lastX, lastY);
        canvasUpdater.lineTo(mousePosition.x, mousePosition.y);
        setLastX(mousePosition.x);
        setLastY(mousePosition.y);
        canvasUpdater.stroke();
    }, [isMouseDown, isDrawing, isErasing, isHighlighting, mousePosition, lastX, lastY, strokeColor]);

    useEffect(() => {
        function resizeCanvas() {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    }, []);

    function updateMouseLocation(event){
        setMousePosition({x: event.clientX, y: event.clientY});
    };
    
    function handleMouseDown(){
        setIsMouseDown(true);
        setLastX(mousePosition.x);
        setLastY(mousePosition.y);
    }

    function handleMouseUp(){
        setIsMouseDown(false);
        setLastX(null);
        setLastY(null);
    }

    return(
        <div id = "whiteboard">
            <canvas id = "canvas" ref = {canvasRef} onMouseMove = {updateMouseLocation} onMouseDown = {handleMouseDown} onMouseUp = {handleMouseUp} onMouseLeave = {handleMouseUp}></canvas>
            <div id = "editingTools">
                <button onClick = {() => {setIsDrawing(!isDrawing); setIsErasing(false); setIsHighlight(false)}}>
                    <img src = "pencil-Stroke-Rounded.png" alt = "pencil"/>
                </button>
                <button onClick = {() => {setIsErasing(!isErasing); setIsDrawing(false); setIsHighlight(false)}}>
                    <img src = "eraser-Stroke-Rounded.png" alt = "eraser"/>
                </button>
                <button onClick = {() => {setIsHighlight(!isHighlighting); setIsDrawing(false); setIsErasing(false)}}>
                    <img src = "highlighter-Stroke-Rounded.png" alt = "highlighter"/>
                </button>
                <button id = "colorpicker_container"></button>
                <button onClick = {() => {setStrokeSize(Math.min(15, strokeSize + 2))}}>
                    <img src = "pen-add-Stroke-Rounded.png" alt = "increase pen size"/>
                </button>
                <button onClick = {() => {setStrokeSize(Math.max(1, strokeSize - 2))}}>
                    <img src = "pen-minus-Stroke-Rounded.png" alt = "decrease pen size"/>
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