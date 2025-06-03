//Imports useEffect, useState, useRef from React to detect state changes and re-render components 
import { useEffect, useState, useRef } from "react";
//Imports fabric.js to create a canvas and draw on it
import { Canvas, PencilBrush, Textbox, Rect, Group, Circle, Triangle, Polygon } from "fabric";
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

    //State variables to decide if user is the drawing, erasing, highlighting, or editing a textbox 
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasingStroke, setIsErasingStroke] = useState(false);
    const [isHighlighting, setIsHighlighting] = useState(false);
    const [selectedTextbox, setSelectedTextbox] = useState(null);

    //State variables to manage stroke color and size
    //Default stroke color is black and size is 5
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeSize, setStrokeSize] = useState(5);

    //State variables to manage manage font size input for textboxes
    const [fontSizeInput, setFontSizeInput] = useState(6);
    const [strokeColorInput, setStrokeColorInput] = useState("#000000");
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);

    //State variables to manage the visibility of the SoundCloud player and clock
    const [isSoundCloudOpen, setIsSoundCloudOpen] = useState(false);
    const [isClockOpen, setIsClockOpen] = useState(false);

    //State variable to manage the visibility of the shapes menu and editing mode
    //When editing mode is on, the user can change draw, eraser, highlight, and change color and stroke size
    //When shapes menu is open, the user can add shapes like squares, circles, triangles, etc 
    const [isShapes, setIsShapes] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});

    //Effect to initialize the fabric canvas and set up the dots in the grid background
    useEffect(() => {
        //Creates fabricCanvas off the canvasRef
        const fabricCanvas = new Canvas(canvasRef.current, {
            //Canvas is has a gray-ish white backgroud that starts with pointer mode 
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

        //Looping through the canvas width and height to create a grid of dots
        for(let x = 0; x < canvasWidth; x += 30){
            for(let y = 0; y < canvasHeight; y += 30){
            const dot = new Circle({left: x, top: y, radius: 1.5, fill: "#b4b4b4", selectable: false, evented: false, erasable: false});
            fabricCanvas.add(dot);
            }
        }
    }, []);

    useEffect(() => {
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

    //Sets canvas to pointer mode when user isn't drawing, erasing, or highlighting
    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        if(!isDrawing && !isHighlighting && !isErasingStroke){
            fabricCanvas.isDrawingMode = false;
        }
        //Array dependencies are isDrawing, isHighlighting, and isErasingStroke to listen for changes in these variables 
    }, [isDrawing, isHighlighting, isErasingStroke]);

    //Delete key will remove the any active object from the canvas
    useEffect(() => {
        function deleteObject(event){
            //Checking if the key pressed is the delete key
            if(event.key === "Delete"){
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
        //Event listener listens for any keydown event and sends it to the deleteObject function
        window.addEventListener("keydown", deleteObject);
        //Delete the event listener to not have duplicate listeners  
        return () => window.removeEventListener("keydown", deleteObject);
    }, []);

    //Allows user to draw on the canvas using their mouse pointer
    useEffect(() => {
        //Checks if drawing is true and if so, user will be able to draw on the canvas using their mouse pointer
        if(isDrawing){ 
            const fabricCanvas = fabricCanvasRef.current;
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            //Stroke color and size are set to the state variables
            fabricCanvas.freeDrawingBrush.color = strokeColor;
            fabricCanvas.freeDrawingBrush.width = strokeSize;
            fabricCanvas.freeDrawingBrush.density = 1000;
            fabricCanvas.renderAll();
        } 
    //Array dependencies are isDrawing, strokeColor, and strokeSize to listen for changes in these variables
    }, [isDrawing, strokeColor, strokeSize]);

    //Allows user to erase active objects on the canvas using their mouse pointer
    useEffect(() => {
        if(isErasingStroke){
            const fabricCanvas = fabricCanvasRef.current;
            function eraseObject(event){
                //Get the mouse pointer position on the canvas
                const pointer = fabricCanvas.getPointer(event.e);
                //Get  all the objects on the canvas
                const objects = fabricCanvas.getObjects();
                //Loop through all the objects on the canvas
                //If the object is a path or path-group and contains the mouse pointer, remove it from the canvas
                for(let i = 0; i < objects.length; i++){
                    const obj = objects[i];
                    if (obj.type === "path" || obj.type === "path-group"){
                        if (obj.containsPoint && obj.containsPoint(pointer)){
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
    //Array dependencies are isErasingStroke to listen for changes in this variable
    }, [isErasingStroke]);

    //Allows user to highlight on the canvas using their mouse pointer
    useEffect(() => {
        if(isHighlighting){
            const fabricCanvas = fabricCanvasRef.current;
            fabricCanvas.isDrawingMode = true;
            //Similar to pencil, but the color is semi-transparent and the stroke size is larger
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = hexToRgba(strokeColor, 0.3);
            fabricCanvas.freeDrawingBrush.width = strokeSize * 3;
        }
    //Array dependencies are isHighlighting, strokeColor, and strokeSize to listen for changes in these variables
    }, [isHighlighting, strokeColor, strokeSize]);

    //Function to add a textbox to the canvas
    function addTextbox(){
        const fabricCanvas = fabricCanvasRef.current;
        function makeTextBox(event){
            //Creates a textbox at the mouse pointer position with default text "Tap to edit" 
            const pointer = fabricCanvas.getPointer(event.e);
            const textbox = new Textbox("Tap to edit", {
                left: pointer.x - 75,
                top: pointer.y,
                width: 150,
                fontSize: 12,
                fontFamily: "Arial",
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

    //Function to add a square to the canvas
    function addSquare(){
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
                //Sets the fill color to a light yellow 
                fill: "#ffee8c", 
            });
            //Creates a textbox with default text "Double Tap to Edit" and centers it at the mouse pointer position but subtract less than x and y to give it some padding in the square
            const textbox = new Textbox("Double Tap to Edit", {
                left: pointer.x - 20,
                top: pointer.y - 20,
                width: 40,
                fontSize: 6,
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
            //Event listener listens for mouse down event to call the makeSquareGroup function
            fabricCanvas.off("mouse:down", makeSquareGroup);
        };
        fabricCanvas.on("mouse:down", makeSquareGroup);
        //Removes the event listener to prevent duplicate event listeners
    }

    function addCircle(){
        //Creates a reference to the fabric canvas to add the square
        const fabricCanvas = fabricCanvasRef.current;
        //makeCircleGroup function forms the circle and textbox group
        function makeCircleGroup(event){
            //Get the mouse pointer position on the canvas
            const pointer = fabricCanvas.getPointer(event.e);
            //Create a circle with radius of 25 then center it at the mouse pointer position by doing - 25 to both x and y positions
            const circle = new Circle({
                left: pointer.x - 25,
                top: pointer.y - 25,
                radius: 25,
                //Set the fill color to light yellow
                fill: "#ffee8c"
            });
            const textbox = new Textbox("Double Tap to Edit", {
                left: pointer.x - 20,
                top: pointer.y - 10,
                width: 40,
                fontSize: 6,
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
            const group = new Group([circle, textbox], {
                left: pointer.x - 25,
                top: pointer.y - 25
            });
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", makeCircleGroup);
        };
        fabricCanvas.on("mouse:down", makeCircleGroup);
    }

    function addTriangle(){
        //Creates a reference to the fabric canvas to add the triangle
        const fabricCanvas = fabricCanvasRef.current;
        function makeTriangleGroup(event){
            //Get the mouse pointer position on the canvas
            const pointer = fabricCanvas.getPointer(event.e);
            //Create a new triangle with width and height of 50 then center it at the mouse pointer position by doing - 25 to both pointer.x and pointer.y 
            const triangle = new Triangle({
                left: pointer.x - 25,
                top: pointer.y - 25,
                width: 50,
                height: 50,
                //Set the fill color to light yellow
                fill: "#ffee8c"
            });
            const textbox = new Textbox("Double Tap to Edit", {
                left: pointer.x - 10,
                top: pointer.y - 20,
                width: 20,
                fontSize: 6,
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
            const group = new Group([triangle, textbox], {
                left: pointer.x - 25,
                top: pointer.y - 25
            });
            //Add the group to the canvas and set it as an active object
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            //Renders the canvas to reflect the changes
            fabricCanvas.renderAll();
            //Removes the event listener to prevent duplicate event listeners
            fabricCanvas.off("mouse:down", makeTriangleGroup);
        };
        //Event listener listens for mouse down event to call the makeTriangleGroup function
        fabricCanvas.on("mouse:down", makeTriangleGroup);
    }

    function addHexagon(){
        const fabricCanvas = fabricCanvasRef.current;
        function makeHexagonGroup(event){
            const pointer = fabricCanvas.getPointer(event.e);
            //Six points that will form a pentagon with radius of 25 
            const points = [{x: 0, y: -25}, {x: 21.65, y: -12.5}, {x: 21.65, y: 12.5}, {x: 0, y: 25}, {x: -21.65, y: 12.5}, {x: -21.65, y: -12.5}]
            //Create hexagon given the poiunts and set fill color to light yellow
            const hexagon = new Polygon(points, {
                left: pointer.x - 25,
                top: pointer.y - 25,
                fill: "#ffee8c",
            });
            const textbox = new Textbox("Double Tap to Edit", {
                left: pointer.x - 20,
                top: pointer.y - 10,
                width: 35,
                fontSize: 6,
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
            const group = new Group([hexagon, textbox], {
                left: pointer.x - 25,
                top: pointer.y - 25
            });
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", makeHexagonGroup);
        };
        fabricCanvas.on("mouse:down", makeHexagonGroup);
    }

    function addPentagon() {
        const fabricCanvas = fabricCanvasRef.current;
        function makePentagonGroup(event){
            const pointer = fabricCanvas.getPointer(event.e);
            //Five points that will form a pentagon with radius of 25
            const points = [{x: 0, y: -25},{x: 23.78,  y: -7.73}, {x: 14.69,  y: 20.23}, {x: -14.69, y: 20.23}, {x: -23.78, y: -7.73}];
            //Create pentagon given the points and set fill color to light yellow
            const pentagon = new Polygon(points, {
                left: pointer.x - 25,
                top: pointer.y - 25,
                fill: "#ffee8c",
            });
            const textbox = new Textbox("Double Tap to Edit", {
                left: pointer.x - 20,
                top: pointer.y - 10,
                width: 35,
                fontSize: 6,
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
            const group = new Group([pentagon, textbox], {
                left: pointer.x - 20,
                top: pointer.y - 25
            });
            //Add the group to the canvas and set it as an active object
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            //Render to reflect canvas changes 
            fabricCanvas.renderAll();
            //Delete event listener to prevent duplicate event listeners
            fabricCanvas.off("mouse:down", makePentagonGroup);
        };
        //Event listener listens for mouse down event to call the makePentagonGroup function
        fabricCanvas.on("mouse:down", makePentagonGroup);
    }

    //Effect to handle double click on canvas to editing textboxes and groups containing textboxes
    useEffect(() => {
        //Creates a reference to the fabric canvas to handle double click events
        const fabricCanvas = fabricCanvasRef.current;
        function doubleClick(event){
            //Get the target of the event, which is the object that was double clicked
            const target = event.target;
            //Checks if the target is in a group 
            if(target.type === "group"){
                //Finds the textbox object within the group
                const textbox = target.getObjects().find(obj => obj.type === "textbox");
                //If a textbox is found, set the textbox as an active object and edit the textbox 
                if(textbox){
                    fabricCanvas.setActiveObject(target);
                    fabricCanvas.setActiveObject(textbox);
                    setSelectedTextbox(textbox)
                    textbox.enterEditing && textbox.enterEditing();
                    fabricCanvas.requestRenderAll();
                }
            }
            //Checks if target is a textbox and enters editing mode for the textbox
            if(target.type === "textbox"){
                target.enterEditing && target.enterEditing();
                setSelectedTextbox(target);
                fabricCanvas.requestRenderAll();
            }
        };
        //Adds the double click event listener to the fabric canvas
        fabricCanvas.on("mouse:dblclick", doubleClick);
        //Removes the event listener to prevent duplicate event listeners
        return () => fabricCanvas.off("mouse:dblclick", doubleClick);
    }, []);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;

        function textEditing(){
            const obj = fabricCanvas.getActiveObject();
            if(obj && obj.type === "textbox"){
                setSelectedTextbox(obj);
                console.log(fontSizeInput, strokeColorInput, bold, italic, underline);
                const rect = obj.getBoundingRect();
                setMenuPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 40
                });
            } 
            else{
                setSelectedTextbox(null);
            }
        }

        fabricCanvas.on("selection:created", textEditing);
        fabricCanvas.on("selection:updated", textEditing);
        fabricCanvas.on("selection:cleared", textEditing);

        return () => {
            fabricCanvas.off("selection:created", textEditing);
            fabricCanvas.off("selection:updated", textEditing);
            fabricCanvas.off("selection:cleared", textEditing);
        }
    }, []);

    /** 
    useEffect(() => {
        if(selectedTextbox){
            selectedTextbox.set("fontSize", fontSizeInput);
            selectedTextbox.set("fill", strokeColorInput);
            if(bold){
                selectedTextbox.set("fontWeight", "bold");
            }
            else{
                selectedTextbox.set("fontWeight", "normal");
            }
            if(italic){
                selectedTextbox.set("fontStyle", "italic");
            }
            else{
                selectedTextbox.set("fontStyle", "normal");
            }
            selectedTextbox.set("underline", underline);
            selectedTextbox.canvas?.requestRenderAll();
        }
    }, [fontSizeInput, selectedTextbox, strokeColorInput, bold, italic, underline]);
    */

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

    useEffect(() => {
        setTimeout(() => {
            const container = document.getElementById("colorpicker_container2");
            if(!container){
                return;
            }
            container.innerHTML = "";
            window.webix.ui({
                view: "colorpicker",
                container: "colorpicker_container2",
                value: "#000000",
                on: { 
                    onChange: (newColor) => {
                        setStrokeColorInput(newColor);
                        if(selectedTextbox){
                            selectedTextbox.set("fill", newColor);
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    },
                },
            });
        }, 0);
    }, [selectedTextbox]);

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
                    </div>
                )}
                {selectedTextbox && (
                <div id = "textEditingTools" style = {{left: `${menuPosition.x}px`, top: `${menuPosition.y}px`}}>
                    <button onClick = {e => {
                        if(selectedTextbox){
                            setFontSizeInput(Math.min(25, fontSizeInput + 3));
                            selectedTextbox.set("fontSize", fontSizeInput);
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src = "pen-add-Stroke-Rounded.png" alt = "increase font size" />
                    </button>
                    <button onClick = {e => {
                        if(selectedTextbox){
                            setFontSizeInput(Math.min(1, fontSizeInput - 3));
                            selectedTextbox.set("fontSize", fontSizeInput);
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src="pen-minus-Stroke-Rounded.png" alt = "decrease font size" />
                    </button>
                    <button id = "colorpicker_container2"></button>
                    <button onClick = {e => {
                        setBold(!bold);
                        if(selectedTextbox){
                            if(!bold){
                                selectedTextbox.set("fontWeight", "bold");
                            } else {
                                selectedTextbox.set("fontWeight", "normal");
                            }
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src = "text-bold-Stroke-Rounded.png" alt = "bold text"/>
                    </button>
                    <button onClick = {e => {
                        setItalic(!italic);
                        if(selectedTextbox){
                            if(!italic){
                                selectedTextbox.set("fontStyle", "italic");
                            } else {
                                selectedTextbox.set("fontStyle", "normal");
                            }
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src = "text-italic-Stroke-Rounded.png" alt = "italic text"/>
                    </button>
                    <button onClick = {e => {
                        if(selectedTextbox){
                            setUnderline(!underline);
                            selectedTextbox.set("underline", underline);
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src="text-underline-Stroke-Rounded.png" alt="underline" />
                    </button>
                    <button onClick = {e => {
                        if(selectedTextbox){
                            selectedTextbox.set("textAlign", "left");
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src = "text-align-left-Stroke-Rounded.png" alt = "text align left"/>
                    </button>
                    <button onClick = {e => {
                        if(selectedTextbox){
                            selectedTextbox.set("textAlign", "center");
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src = "text-align-center-Stroke-Rounded.png" alt = "text align center"/>
                    </button>
                    <button onClick = {e => {
                        if(selectedTextbox){
                            selectedTextbox.set("textAlign", "right");
                            selectedTextbox.canvas?.requestRenderAll();
                        }
                    }}>
                        <img src = "text-align-right-Stroke-Rounded.png" alt = "text align right"/>
                    </button>
                </div>
            )}
            </div>
        </div>
    )
}
