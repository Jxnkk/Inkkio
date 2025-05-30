import { useEffect, useState, useRef } from "react";
import { Canvas, Circle, PencilBrush, Image, Textbox } from "fabric";
import "./Whiteboard.css";

export default function WhiteBoard() {
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [isHighlighting, setIsHighlighting] = useState(false); 
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeSize, setStrokeSize] = useState(5);

    useEffect(() => {
        const fabricCanvas = new Canvas(canvasRef.current, {
            isDrawingMode: false,
            backgroundColor: "#fafafa", 
            selection: false,
        });

        fabricCanvasRef.current = fabricCanvas;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const canvasWidth = width * 3;
        const canvasHeight = height * 3;

        fabricCanvas.setWidth(canvasWidth);
        fabricCanvas.setHeight(canvasHeight);

        for(let x = 0; x < canvasWidth; x += 30){
            for(let y = 0; y < canvasHeight; y += 30){
            const dot = new Circle({left: x, top: y, radius: 1.5, fill: "#b4b4b4", selectable: false, evented: false});
            fabricCanvas.add(dot);
            }
        }
        fabricCanvas.setZoom(1);
        fabricCanvas.absolutePan({x: canvasWidth/2 - width/2, y: canvasHeight/2 - height/2});
        fabricCanvas.renderAll();
    }, []);

    useEffect(() => {
        function resizeCanvas() {
            const fabricCanvas = fabricCanvasRef.current;
            if (fabricCanvas) {
                fabricCanvas.setWidth(window.innerWidth);
                fabricCanvas.setHeight(window.innerHeight);
                fabricCanvas.renderAll();
            }
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    }, []);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        if (!fabricCanvas || (!isDrawing && !isHighlighting && !isErasing)) return;

        if(isDrawing){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = strokeColor;
            fabricCanvas.freeDrawingBrush.width = strokeSize;
            fabricCanvas.freeDrawingBrush.globalAlpha = 1.0;
        } 
        else if(isErasing){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = "#ffffff"; 
            fabricCanvas.freeDrawingBrush.width = strokeSize;
            fabricCanvas.freeDrawingBrush.globalAlpha = 1.0;
        } 
        else if(isHighlighting){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = strokeColor;
            fabricCanvas.freeDrawingBrush.width = strokeSize * 2;
            fabricCanvas.freeDrawingBrush.globalAlpha = 0.3;
        } 
        else{
           fabricCanvas.isDrawingMode = false;
        }
        fabricCanvas.renderAll();
    }, [isDrawing, isErasing, isHighlighting, strokeColor, strokeSize]);

    useEffect(() => {
        window.webix.ui({
            view: "colorpicker",
            container: "colorpicker_container",
            value: "#000000",
            on:{
                onChange: (newColor) => {
                    setStrokeColor(newColor);
                },
            },
        });
    }, []);

    return(
        <div id = "whiteboard">
            <canvas id = "canvas" ref = {canvasRef}></canvas>
            <div id = "editingTools">
                <button onClick = {() => {setIsDrawing(!isDrawing); setIsErasing(false); setIsHighlighting(false)}}>
                    <img src = "pencil-Stroke-Rounded.png" alt = "pencil"/>
                </button>
                <button onClick = {() => {setIsErasing(!isErasing); setIsDrawing(false); setIsHighlighting(false)}}>
                    <img src = "eraser-Stroke-Rounded.png" alt = "eraser"/>
                </button>
                <button onClick = {() => {setIsHighlighting(!isHighlighting); setIsDrawing(false); setIsErasing(false)}}>
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
