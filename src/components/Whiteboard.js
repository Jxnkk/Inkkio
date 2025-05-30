//Imports useEffect, useState, useRef from React to detect state changes and re-render components 
import { useEffect, useState, useRef } from "react";
//Importing items from frabic.js to use in the whiteboard 
import { Canvas, Circle, PencilBrush, Textbox, Rect, Group } from "fabric";
//Importing CSS file for styling the whiteboard
import "./Whiteboard.css";
//Importing components for the whiteboard 
import SoundCloud from "./SoundCloud";  
import clock from "./Clock";

export default function WhiteBoard() {
    //Creating references to the canvas and fabric canvas elements
    const canvasRef = useRef(null);
    const fabricCanvasRef = useRef(null);
    //State variables to manage the drawing, erasing, highlighting, and stroke properties
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasingStroke, setIsErasingStroke] = useState(false);
    const [isErasingArea, setIsErasingArea] = useState(false);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeSize, setStrokeSize] = useState(5);

    //Effect to initialize the fabric canvas and set up the dots in the grid background
    useEffect(() => {
        const fabricCanvas = new Canvas(canvasRef.current, {
            isDrawingMode: false,
            backgroundColor: "#fafafa", 
            selection: false,
            subTargetCheck: true,
        });

        //Fabric canvas is 3x bigger than the window to allow for zoom in and out 
        fabricCanvasRef.current = fabricCanvas;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const canvasWidth = width * 3;
        const canvasHeight = height * 3;

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

    //Effect to resize the canvas when the window is resized
    useEffect(() => {
        function resizeCanvas() {
            const fabricCanvas = fabricCanvasRef.current;
            if(fabricCanvas){
                fabricCanvas.setWidth(window.innerWidth);
                fabricCanvas.setHeight(window.innerHeight);
                fabricCanvas.renderAll();
            }
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    }, []);

    //Effect to handle drawing, erasing, and highlighting on the canvas
    //This effect runs whenever the drawing, erasing, highlighting state or stroke properties change
    useEffect(() => {   
        const fabricCanvas = fabricCanvasRef.current;
        if (!fabricCanvas || (!isDrawing && !isHighlighting && !isErasingStroke && !isErasingArea)) return;

        //Drawing follows users mouse pointer
        if(isDrawing){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = strokeColor;
            fabricCanvas.freeDrawingBrush.width = strokeSize;
            fabricCanvas.freeDrawingBrush.density = 1000; 
        } 
        //Eraser will detect objects under the mouse pointer and remove them if they are paths or path-groups
        else if(isErasingStroke){
            fabricCanvas.isDrawingMode = false; 
            const eraseHandler = (event) => {
            const pointer = fabricCanvas.getPointer(event.e);
            const objects = fabricCanvas.getObjects();
            objects.forEach((obj) => {
                if (obj.type === "path" || obj.type === "path-group") {
                    if (obj.containsPoint && obj.containsPoint(pointer)) {
                        fabricCanvas.remove(obj);
                    }
                }
            });
            };
            fabricCanvas.on("mouse:move", eraseHandler);
            return () => {
                fabricCanvas.off("mouse:move", eraseHandler);
            };
        } 
        //Eraser will white-out the area under the mouse pointer
        else if(isErasingArea){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = "#fafafa"; 
            fabricCanvas.freeDrawingBrush.width = strokeSize * 2;
            fabricCanvas.freeDrawingBrush.density = 1000; 
        }
        //Highlighter will follow the mouse pointer and highlight the area under it
        else if(isHighlighting){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = strokeColor;
            fabricCanvas.freeDrawingBrush.width = strokeSize * 2;
        } 
        fabricCanvas.renderAll();
    }, [isDrawing, isErasingStroke, isErasingArea, isHighlighting, strokeColor, strokeSize]);

    //Function to add a textbox to the canvas
    function addTextbox() {
        const fabricCanvas = fabricCanvasRef.current;
        if (!fabricCanvas) return;
        const handleMouseDown = (opt) => {
            //Creates a textbox at the mouse pointer position with default text and allows editing
            const pointer = fabricCanvas.getPointer(opt.e);
            const textbox = new Textbox("Tap to edit", {
                left: pointer.x - 75,
                top: pointer.y - 20,
                width: 150,
                fontSize: 12,
                fill: "#000000",
                editable: true,
            });
            //Adds textbox to the canvas and sets it as the active object
            fabricCanvas.add(textbox);
            fabricCanvas.setActiveObject(textbox);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", handleMouseDown); 
        };
        fabricCanvas.on("mouse:down", handleMouseDown);
    }

    //Function to add a sticky note to the whiteboard
    function addStickyNote() {
        const fabricCanvas = fabricCanvasRef.current;
        if (!fabricCanvas) return;
        const handleMouseDown = (opt) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            //Creates a rectangle and a textbox to form a sticky note
            const rectangle = new Rect({
                left: 0,
                top: 0,
                width: 150,
                height: 100,
                hasBorders: true,
                color: "#f0c040",
                fill: "#f0c040",
                selectable: false,
                evented: false,
            });
            const textbox = new Textbox("Tap to edit", {
                left: 10,
                top: 10,
                width: 150,
                fontSize: 12,
                fill: "#000000",
                editable: true,
                selectable: true,
            });
            //Sticky note is a group of rectangle and textbox
            const stickynote = new Group([rectangle, textbox], {
                left: pointer.x - 75,
                top: pointer.y - 50,
                width: 150,
                height: 100,
                selectable: true,
                evented: true,
            });
            //Adds the sticky note to the canvas and sets it as the active object
            fabricCanvas.add(stickynote);
            fabricCanvas.setActiveObject(stickynote);
            fabricCanvas.isDrawingMode = false;
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", handleMouseDown); 
        };
        fabricCanvas.on("mouse:down", handleMouseDown);
    }

    //Initialize the color picker using Webix UI
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
            {/*Buttons for soundcloud player and pomodoro timer*/}
            <div id = "mainTools">
                <button>
                    {/*Image to represent the button and alt in case image isn't visible*/}
                    <img src = "music-Stroke-Rounded.png" alt = "soundcloud pkayer"/>
                </button>
                <button>
                    <img src = "timer-Stroke-Rounded.png" alt = "pomodoro timer"/>
                </button>
            </div>
            {/*Buttons for editing tools*/}
            <div id = "editingTools">
                {/*On click, variable for respective said method is set to True so React knows what to do*/}
                <button onClick = {() => {setIsDrawing(!isDrawing); setIsErasingStroke(false); setIsErasingArea(false); setIsHighlighting(false)}}>
                    <img src = "pencil-Stroke-Rounded.png" alt = "pencil"/>
                </button>
                <button onClick = {() => {setIsErasingStroke(!isErasingStroke); setIsDrawing(false); setIsErasingArea(false); setIsHighlighting(false)}}>
                    <img src = "eraser-Stroke-Rounded.png" alt = "eraser"/>
                </button>
                <button onClick = {() => {setIsErasingArea(!isErasingArea); setIsDrawing(false); setIsErasingStroke(false); setIsHighlighting(false)}}>
                    <img src = "eraser-area-Stroke-Rounded.png" alt = "eraser"/>
                </button>
                <button onClick = {() => {setIsHighlighting(!isHighlighting); setIsDrawing(false); setIsErasingArea(false); setIsErasingStroke(false)}}>
                    <img src = "highlighter-Stroke-Rounded.png" alt = "highlighter"/>
                </button>
                <hr></hr>
                {/*Line break to seperate color picker and size changer from erasing and drawing options*/}
                <button id = "colorpicker_container"></button>
                <button onClick = {() => {setStrokeSize(Math.min(25, strokeSize + 5))}}>
                    <img src = "pen-add-Stroke-Rounded.png" alt = "increase pen size"/>
                </button>
                <button onClick = {() => {setStrokeSize(Math.max(1, strokeSize - 5))}}>
                    <img src = "pen-minus-Stroke-Rounded.png" alt = "decrease pen size"/>
                </button>
                <hr></hr>
                {/*Line break for sticky notes and textbox option*/}
                <button onClick = {() => {addStickyNote(); setIsDrawing(false); setIsErasingStroke(false); setIsErasingArea(false); setIsHighlighting(false)}}>
                    <img src = "sticky-note-Stroke-Rounded.png" alt = "sticky note"/>
                </button>
                <button onClick = {() => {addTextbox(); setIsDrawing(false); setIsErasingStroke(false); setIsErasingArea(false); setIsHighlighting(false)}}>
                    <img src = "text-Stroke-Rounded.png" alt = "text"/>
                </button>
            </div>
        </div>
    )
}
