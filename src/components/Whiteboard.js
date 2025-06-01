//Imports useEffect, useState, useRef from React to detect state changes and re-render components 
import { useEffect, useState, useRef } from "react";
//Imports fabric.js to create a canvas and draw on it
import { Canvas, PencilBrush, Textbox, Rect, Group, Circle, Triangle, Polygon, Line } from "fabric";
//Imports CSS for the whiteboard component
import "./Whiteboard.css";
//Importing components to be used in the whiteboard
import SoundCloud from "./SoundCloud";  
import Clock from "./Clock";                

export default function WhiteBoard() {
    //Creating references to the canvas and fabric canvas elements
    //Fabric canvas uses the HTML canvas elements to render drawings but builds on top of it, allowing more complex interactions
    const canvasRef = useRef(null); 
    const fabricCanvasRef = useRef(null);
    //State variables to decide if user is the drawing, erasing, or highlighting
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasingStroke, setIsErasingStroke] = useState(false);
    const [isHighlighting, setIsHighlighting] = useState(false);
    //State variables to manage stroke color and size
    //Default stroke color is black and size is 5
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeSize, setStrokeSize] = useState(5);
    //State variables to manage the visibility of the SoundCloud player and clock
    const [isSoundCloudOpen, setIsSoundCloudOpen] = useState(false);
    const [isClockOpen, setIsClockOpen] = useState(false);
    //State variable to manage the visibility of the shapes menu and editing mode
    //When editing mode is on, the user can change draw, eraser, highlight, and change color and stroke size
    //When shapes menu is open, the user can add shapes like squares, circles, triangles, etc 
    const [isShapes, setIsShapes] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    //Effect to initialize the fabric canvas and set up the dots in the grid background
    useEffect(() => {
        //Creates fabricCanvas off the canvasRef off the HTML canvas element 
        const fabricCanvas = new Canvas(canvasRef.current, {
            //Gray-ish white backgroud that starts with pointer mode 
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
            const dot = new Circle({left: x, top: y, radius: 1.5, fill: "#b4b4b4", selectable: false, evented: false, erasable: false});
            fabricCanvas.add(dot);
            }
        }

        fabricCanvas.setZoom(1);
        fabricCanvas.absolutePan({x: canvasWidth/2 - width/2, y: canvasHeight/2 - height/2});
        fabricCanvas.renderAll();
    }, []);

    useEffect(() => {
        //ResizeCanvas function will create a reference of the fabric canvas to resize it to the window size
        function resizeCanvas(){
            const fabricCanvas = fabricCanvasRef.current;
            if(fabricCanvas){
                //Sets the width and height of the fabric canvas to the window size
                fabricCanvas.setWidth(window.innerWidth);
                fabricCanvas.setHeight(window.innerHeight); 
                //Renders the fabric canvas to reflect the changes 
                fabricCanvas.renderAll();
            }
        }
        //Event listener listens for resize event to call the resizeCanvas function
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();
        //Delete the event listener to not have duplicate listeners
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    //When not drawing, erasing, or highlighting, the canvas is back to pointer rather than drawing mode, so users can select objects like textboxes, shapes, or sections of the drawings 
    useEffect(() => {
        //Creates a reference to fabric canvas to update fabric canvas state
        const fabricCanvas = fabricCanvasRef.current;
        //If user isn't drawing, erasing, or highlighting, set the fabric canvas to not be in drawing mode
        if(!isDrawing && !isHighlighting && !isErasingStroke){
            fabricCanvas.isDrawingMode = false;
        }
        //Array dependencies are isDrawing, isHighlighting, and isErasingStroke to listen for changes in these variables
    }, [isDrawing, isHighlighting, isErasingStroke]);

    useEffect(() => {
        //deleteObject function listens for the delete key press and removes the active object from the canvas
        function deleteObject(event){
            //Checking if the key pressed is the delete key
            if (event.key === "Delete") {
                //Creates a reference to the fabric canvas to remove the active object
                const fabricCanvas = fabricCanvasRef.current;
                //Gets the object that is under the mouse pointer
                const activeObject = fabricCanvas.getActiveObject();
                //Removes the active object from the canvas and discards it 
                fabricCanvas.remove(activeObject);
                fabricCanvas.discardActiveObject();
                //Renders the canvas to reflect the changes
                fabricCanvas.requestRenderAll();
            }
        };
        //Event listener listens for keydown event to call the deleteObject function
        window.addEventListener("keydown", deleteObject);
        //Delete the event listener to not have duplicate listeners
        return () => window.removeEventListener("keydown", deleteObject);
    }, []);

    //Effect to handle drawing, erasing, and highlighting on the canvas
    //This effect runs whenever the drawing, erasing, highlighting state or stroke properties change
    useEffect(() => {   
        //Creates a reference to the fabric canvas to update fabric canvas state
        const fabricCanvas = fabricCanvasRef.current;
        //If the user is not drawing, erasing, or highlighting, return early
        if (!isDrawing && !isHighlighting && !isErasingStroke){
            return;
        }
        //Draws by following mouse pointer 
        if(isDrawing){
            //Sets drawing mode to be true 
            fabricCanvas.isDrawingMode = true;
            //Creates a new PencilBrush to draw on the canvas 
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            //Stroke color and size are set to the state variables
            fabricCanvas.freeDrawingBrush.color = strokeColor;
            fabricCanvas.freeDrawingBrush.width = strokeSize;
            //Density is set to a high value to create a smooth line
            fabricCanvas.freeDrawingBrush.density = 1000; 
        } 
        //Eraser will detect objects under the mouse pointer and remove them if they are paths or path-groups
        else if(isErasingStroke){
            //Sets drawing mode to false because we are not drawing, but erasing 
            fabricCanvas.isDrawingMode = false; 
            //eraseObject function will remove objects under the mouse pointer
            function eraseObject(event){
                //Pointer will get the mouse pointer position on the canvas
                const pointer = fabricCanvas.getPointer(event.e);
                //Objects will get all the objects on the canvas
                const objects = fabricCanvas.getObjects();
                //Loop through all the objects on the canvas
                //If the object is a path or path-group and contains the mouse pointer, remove it from the canvas
                for (let i = 0; i < objects.length; i++) {
                    const obj = objects[i];
                    if (obj.type === "path" || obj.type === "path-group") {
                        if (obj.containsPoint && obj.containsPoint(pointer)) {
                            fabricCanvas.remove(obj);
                        }
                    }
                }
            };
            //Adds the eraseObject function to the mouse:move event to erase objects under the mouse pointer
            fabricCanvas.on("mouse:move", eraseObject);
            //Removes the event listener when the user stops erasing
            return () => fabricCanvas.off("mouse:move", eraseObject);
        } 
        //Highlighter will follow the mouse pointer and highlight the area under it
        else if(isHighlighting){
            //Sets drawing mode to true because highlighter acts as a drawing tool
            fabricCanvas.isDrawingMode = true;
            //Creates a new PencilBrush but with a bigger width and a semi-transparent color than the pencil 
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = hexToRgba(strokeColor, 0.3);
            fabricCanvas.freeDrawingBrush.width = strokeSize * 3;
        } 
        //Renders the fabric canvas to reflect the changes
        fabricCanvas.renderAll();
        //Array dependencies are isDrawing, isErasingStroke, isHighlighting, strokeColor, and strokeSize to listen for changes in these variables
    }, [isDrawing, isErasingStroke, isHighlighting, strokeColor, strokeSize]);

    //Function to add a textbox to the canvas
    function addTextbox(){
        //Creates a reference to the fabric canvas to add the textbox
        const fabricCanvas = fabricCanvasRef.current;
        function makeTextBox(event){
            //Creates a textbox at the mouse pointer position with default text "Tap to edit" 
            const pointer = fabricCanvas.getPointer(event.e);
            const textbox = new Textbox("Tap to edit", {
                //Centers the textbox at mouse pointer x position and y position
                //Y position is set to the same y position as the pointer, but x position is set to pointer.x - 75 to center it because x width is 150
                left: pointer.x - 75,
                top: pointer.y,
                width: 150,
                //Sets the font size, fill color, and editable property to true so user can edit the text
                fontSize: 12,
                fill: "#000000",
                editable: true,
            });
            //Adds textbox to the canvas and sets it as the active object
            fabricCanvas.add(textbox);
            fabricCanvas.setActiveObject(textbox);
            //Renders the canvas to reflect the changes
            fabricCanvas.renderAll();
            //Removes the event listenert to prevent duplicate event listeners
            fabricCanvas.off("mouse:down", makeTextBox); 
        };
        //Event listener listens for mouse down event to call the handleMouseDown function
        fabricCanvas.on("mouse:down", makeTextBox);
    }

    function addSquare(){
        //Creates a reference to the fabric canvas to add the square
        const fabricCanvas = fabricCanvasRef.current;
        //makeSquareGroup to form the square and textbox group
        function makeSquareGroup(event){
            //Get the mouse pointer position on the canvas 
            const pointer = fabricCanvas.getPointer(event.e);
            //Create a square with width and height of 50 then center it at the mouse pointer position by doing - 25 to both pointer.x and pointer.y
            const square = new Rect({
                left: pointer.x - 25,
                top: pointer.y - 25, 
                width: 50, 
                height: 50,
                //Sets the fill color to a light yellow and stroke width to 2
                fill: "#ffee8c", 
                strokeWidth: 2
            });
            //Creates a textbox with default text "Double Tap to Edit" and centers it at the mouse pointer position but subtract less than x and y to give it some padding in the square
            const textbox = new Textbox("Double Tap to Edit", {
                left: pointer.x - 20,
                top: pointer.y - 20,
                width: 40,
                fontSize: 12,
                //Sets the fill color, font, text alignment, and background color
                //Background color is set to transparent so it doesn't cover the square
                fill: "#000000",
                textAlign: "center",
                backgroundColor: "transparent",
                fontFamily: "Arial",
                //Sets the textbox to be editable, so user can edit the text and select the textbox
                editable: true,
            });
            //Group is created with square and textbox and centered at the mouse pointer position by doing - 25 to both pointer.x and pointer.y
            const group = new Group([square, textbox], {
                left: pointer.x - 25,
                top: pointer.y - 25
            });
            //Add the group to the canvas and set it as an active object
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            //Renders the canvas to reflect the changes
            fabricCanvas.renderAll();
            //Removes the event listener to prevent duplicate event listeners
            fabricCanvas.off("mouse:down", makeSquareGroup); 
        };
        //Event listener listens for mouse down event to call the makeSquareGroup function
        fabricCanvas.on("mouse:down", makeSquareGroup);
    }

    function addCircle() {
        const fabricCanvas = fabricCanvasRef.current;
        const handleMouseDown = (opt) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            const circle = new Circle({
                left: pointer.x - 25,
                top: pointer.y - 25,
                radius: 25,
                fill: "#f0f0f0",
                strokeWidth: 2
            });
            fabricCanvas.add(circle);
            fabricCanvas.setActiveObject(circle);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", handleMouseDown);
        };
        fabricCanvas.on("mouse:down", handleMouseDown);
    }

    function addTriangle() {
        const fabricCanvas = fabricCanvasRef.current;
        const handleMouseDown = (opt) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            const triangle = new Triangle({
                left: pointer.x - 30,
                top: pointer.y - 26,
                width: 60,
                height: 52,
                fill: "#f0f0f0",
                strokeWidth: 2
            });
            fabricCanvas.add(triangle);
            fabricCanvas.setActiveObject(triangle);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", handleMouseDown);
        };
        fabricCanvas.on("mouse:down", handleMouseDown);
    }

    function addPentagon() {
        const fabricCanvas = fabricCanvasRef.current;
        const handleMouseDown = (opt) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            const size = 30;
            const points = Array.from({length: 5}).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                return {
                    x: pointer.x + size * Math.cos(angle),
                    y: pointer.y + size * Math.sin(angle)
                };
            });
            const pentagon = new Polygon(points, {
                fill: "#f0f0f0",
                strokeWidth: 2
            });
            fabricCanvas.add(pentagon);
            fabricCanvas.setActiveObject(pentagon);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", handleMouseDown);
        };
        fabricCanvas.on("mouse:down", handleMouseDown);
    }

    function addHexagon() {
        const fabricCanvas = fabricCanvasRef.current;
        const handleMouseDown = (opt) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            const size = 30;
            const points = Array.from({length: 6}).map((_, i) => {
                const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                return {
                    x: pointer.x + size * Math.cos(angle),
                    y: pointer.y + size * Math.sin(angle)
                };
            });
            const hexagon = new Polygon(points, {
                fill: "#f0f0f0",
                strokeWidth: 2,
                selectable: true,
            });
            const textbox = new Textbox("Double Tap to Edit", {
            left: pointer.x - 25,
            top: pointer.y - 12,
            width: 50,
            fontSize: 12,
            fill: "#000000",
            textAlign: "center",
            editable: true,
            backgroundColor: "transparent",
            selectable: true,
            fontFamily: "Arial"
            });
            const group = new Group([hexagon, textbox], {
                left: pointer.x - size,
                top: pointer.y - size
            });
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", handleMouseDown);
        };
        fabricCanvas.on("mouse:down", handleMouseDown);
    }

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        const handleDblClick = (opt) => {
            const target = opt.target;
            if (target && target.type === "group") {
                const textbox = target._objects.find(obj => obj.type === "textbox");
                if (textbox) {
                    fabricCanvas.setActiveObject(target);
                    setTimeout(() => {
                        fabricCanvas.setActiveObject(textbox);
                        textbox.enterEditing && textbox.enterEditing();
                        fabricCanvas.requestRenderAll();
                    }, 0);
                }
            }
            if (target && target.type === "textbox") {
                target.enterEditing && target.enterEditing();
                fabricCanvas.requestRenderAll();
            }
        };

        fabricCanvas.on("mouse:dblclick", handleDblClick);
        return () => {
            fabricCanvas.off("mouse:dblclick", handleDblClick);
        };
    }, []);

    function addArrow() {
        const fabricCanvas = fabricCanvasRef.current;
        const handleMouseDown = (opt) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            const line = new Line([pointer.x - 30, pointer.y, pointer.x + 30, pointer.y], {
                stroke: "#f0f0f0",
                strokeWidth: 4
            });
            const head = new Triangle({
                left: pointer.x + 35,
                top: pointer.y - 10,
                width: 20,
                height: 20,
                angle: 90,
                fill: "#f0f0f0"
            });
            const arrow = new Group([line, head], {
                left: pointer.x - 30,
                top: pointer.y - 10
            });
            fabricCanvas.add(arrow);
            fabricCanvas.setActiveObject(arrow);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", handleMouseDown);
        };
        fabricCanvas.on("mouse:down", handleMouseDown);
    }

    //Function to turn hex to rgba generated by copilot 
    function hexToRgba(hex, alpha = 1) {
        hex = hex.replace(/^#/, "");
        if (hex.length === 3) {
            hex = hex.split("").map(x => x + x).join("");
        }
        const num = parseInt(hex, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    }

    //Initialize the color picker using Webix UI
    useEffect(() => {
        setTimeout(() => {
            const container = document.getElementById("colorpicker_container");
            if(!container){
                return;
            }
            window.webix.ui({
                view: "colorpicker",
                container: "colorpicker_container",
                value: "#000000",
                on: {
                    onChange: (newColor) => {
                        setStrokeColor(newColor);
                    },
                },
            });
        }, 0);
    }, [isEditing]);

    return(
        <div id = "whiteboard">
            <canvas id = "canvas" ref = {canvasRef}></canvas>
            {/*Buttons for soundcloud player and pomodoro timer*/}
            <div id = "mainTools">
                <button onClick = {() => {setIsSoundCloudOpen(!isSoundCloudOpen); setIsClockOpen(false)}}>
                    {/*Image to represent the button and alt in case image isn't visible*/}
                    <img src = "music-Stroke-Rounded.png" alt = "soundcloud pkayer"/>
                </button>
                <button onClick = {() => {setIsClockOpen(!isClockOpen); setIsSoundCloudOpen(false)}}>
                    <img src = "timer-Stroke-Rounded.png" alt = "pomodoro timer"/>
                </button>
                {/*Conditional Rendering for SoundCloud player and clock*/}
                {isSoundCloudOpen && (
                    <div className = "floatingWidgets">
                        <SoundCloud/>
                    </div>
                )}
                {isClockOpen && (
                    <div className = "floatingWidgets">
                        <Clock/>
                    </div>
                )}
            </div>
            {/*Buttons for editing tools*/}
            <div id = "editingTools">
                {/*On click, variable for respective said method is set to True so React knows what to do*/}
                <button onClick = {() => {setIsEditing(!isEditing)}}>
                    <img src = "editing-Stroke-Rounded.png"/>
                </button>
                {isEditing && (
                    <div id = "editingMenu">
                        <button onClick = {() => {setIsDrawing(!isDrawing); setIsErasingStroke(false); setIsHighlighting(false)}}>
                            <img src = "pencil-Stroke-Rounded.png" alt = "pencil"/>
                        </button>
                        <button onClick = {() => {setIsHighlighting(!isHighlighting); setIsDrawing(false); setIsErasingStroke(false)}}>
                            <img src = "highlighter-Stroke-Rounded.png" alt = "highlighter"/>
                        </button>
                        <button onClick = {() => {setIsErasingStroke(!isErasingStroke); setIsDrawing(false); setIsHighlighting(false)}}>
                            <img src = "eraser-Stroke-Rounded.png" alt = "eraser"/>
                        </button>
                        <hr></hr>
                        <button id = "colorpicker_container"></button>
                        <button onClick = {() => {setStrokeSize(Math.min(25, strokeSize + 5))}}>
                            <img src = "pen-add-Stroke-Rounded.png" alt = "increase pen size"/>
                        </button>
                        <button onClick = {() => {setStrokeSize(Math.max(1, strokeSize - 5))}}>
                            <img src = "pen-minus-Stroke-Rounded.png" alt = "decrease pen size"/>
                        </button>
                    </div>
                )}
                {/*Line break for sticky notes and textbox option*/}
                <button onClick = {() => {addTextbox(); setIsDrawing(false); setIsErasingStroke(false); setIsHighlighting(false)}}>
                    <img src = "text-Stroke-Rounded.png" alt = "text"/>
                </button>
                <button onClick = {() => {setIsShapes(!isShapes)}}> 
                    <img src = "shapes-Stroke-Rounded.png" alt = "undo"/>
                </button>
                {isShapes && (
                    <div id = "shapesMenu">
                        <button onClick = {addSquare}>
                            <img src = "square-Stroke-Rounded.png" alt = "square"/>
                        </button>
                        <button onClick = {addCircle}>
                            <img src = "circle-Stroke-Rounded.png" alt = "circle"/>
                        </button>
                        <button onClick = {addTriangle}>
                            <img src = "triangle-Stroke-Rounded.png" alt = "triangle"/>
                        </button>
                        <button onClick = {addPentagon}>
                            <img src = "pentagon-Stroke-Rounded.png" alt = "pentagon"/>
                        </button>
                        <button onClick = {addHexagon}>
                            <img src = "hexagon-Stroke-Rounded.png" alt = "hexagon"/>
                        </button>
                        <button onClick = {addArrow}>
                            <img src = "arrow-Stroke-Rounded.png" alt = "arrow"/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
