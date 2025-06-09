import { useEffect, useState, useRef } from "react";
import { Canvas, PencilBrush, Textbox, Rect, Group, Circle, Triangle, Polygon, FabricImage } from "fabric";
import "./Whiteboard.css";          
import Clock from "./Clock.js";
import SoundCloud from "./SoundCloud.js";   

export default function WhiteBoard() {
    const canvasRef = useRef(null); 
    const fabricCanvasRef = useRef(null);

    const [tool, setTool] = useState(null)
    const [shape, setShape] = useState(null);
    
    const [selectedTextbox, setSelectedTextbox] = useState(null);
    const [selectedShape, setSelectedShape] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeSize, setStrokeSize] = useState(5);

    const [fontSizeInput, setFontSizeInput] = useState(6);
    const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);
    const [textAlignment, setTextAlignment] = useState("left");
    const [borderSizeInput, setBorderSizeInput] = useState(1);
    const [strokeColorInput, setStrokeColorInput] = useState("#000000");
    const [backgroundColorInput, setBackgroundColorInput] = useState("#ffee8c");
    const [borderColorInput, setBorderColorInput] = useState("#000000");

    const [isShapes, setIsShapes] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
    const [menuPosition2, setMenuPosition2] = useState({x: 0, y: 0});
    const [showSoundCloud, setShowSoundCloud] = useState(false);
    const [showClock, setClock] = useState(false);

    useEffect(() => {
        const fabricCanvas = new Canvas(canvasRef.current, {
            isDrawingMode: false,
            backgroundColor: "#fafafa", 
            selection: true,
            subTargetCheck: true,
        });

        fabricCanvasRef.current = fabricCanvas;
        const canvasWidth = window.innerWidth * 2;
        const canvasHeight = window.innerHeight * 2;

        canvasRef.current.width = canvasWidth;
        canvasRef.current.height = canvasHeight;
        fabricCanvas.setDimensions({width: canvasWidth, height: canvasHeight});

        for(let x = 0; x < canvasWidth; x += 30){
            for(let y = 0; y < canvasHeight; y += 30){
            const dot = new Circle({left: x, top: y, radius: 1.5, fill: "#b4b4b4", selectable: false, evented: false, erasable: false});
            fabricCanvas.add(dot);
            }
        }

        fabricCanvas.setZoom(1/2);
    }, []);

    useEffect(() => {
        function deleteObject(event){
            if(event.key === "Delete"){
                const fabricCanvas = fabricCanvasRef.current;
                const activeObject = fabricCanvas.getActiveObject();
                if(activeObject){
                    fabricCanvas.remove(activeObject);
                    fabricCanvas.discardActiveObject();
                    fabricCanvas.requestRenderAll();
                    }
                }
            }
        window.addEventListener("keydown", deleteObject);
        return () => window.removeEventListener("keydown", deleteObject);
    }, []);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;

        if(tool === "draw"){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = strokeColor;
            fabricCanvas.freeDrawingBrush.width = strokeSize;
            fabricCanvas.freeDrawingBrush.density = 1000;
        } 
        else if(tool === "highlight"){
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = hexToRgba(strokeColor, 0.3);
            fabricCanvas.freeDrawingBrush.width = strokeSize * 3;
            fabricCanvas.freeDrawingBrush.density = 1000;
        } 
        else if(tool === "erase"){
            fabricCanvas.isDrawingMode = false;
            function eraseObject(event){
                const pointer = fabricCanvas.getPointer(event.e);
                const objects = fabricCanvas.getObjects();
                for (let i = 0; i < objects.length; i++) {
                    const obj = objects[i];
                    if (obj.type === "path" || obj.type === "path-group") {
                        if (obj.containsPoint && obj.containsPoint(pointer)) {
                            fabricCanvas.remove(obj);
                        }
                    }
                }
            }
            fabricCanvas.on("mouse:move", eraseObject);
            return () => fabricCanvas.off("mouse:move", eraseObject);
        } 
        else{
            fabricCanvas.isDrawingMode = false;
        }
        fabricCanvas.renderAll();
    }, [tool, strokeColor, strokeSize]);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;

        function addShape(event){
            
            const pointer = fabricCanvas.getPointer(event.e);
            let chosenShape = null;
            let textbox = null; 

            if(shape === "textbox"){
                textbox = new Textbox("Tap to edit", {
                    left: pointer.x - 75,
                    top: pointer.y,
                    width: 150,
                    fontSize: 6,
                    fontFamily: "Arial",
                    fill: "#000000",
                    editable: true,
                    breakWords: true,
                });
                fabricCanvas.add(textbox);
                fabricCanvas.setActiveObject(textbox);
                fabricCanvas.renderAll();
                fabricCanvas.off("mouse:down", addShape);
                return;
            }
            else if(shape === "square"){
                chosenShape = new Rect({
                    width: 50,
                    height: 50,
                    fill: "#ffee8c",
                    originX: "center",
                    originY: "center",
                });
            }
            else if(shape === "circle"){
                chosenShape = new Circle({
                    radius: 25,
                    fill: "#ffee8c",
                    originX: "center",
                    originY: "center",
                });
            }
            else if(shape === "triangle"){
                chosenShape = new Triangle({
                    width: 50,
                    height: 50,
                    fill: "#ffee8c",
                    originX: "center",
                    originY: "center",
                });
            }
            else if(shape === "hexagon"){
                chosenShape = new Polygon([{ x: 0, y: -25 }, { x: 21.65, y: -12.5 }, { x: 21.65, y: 12.5 }, { x: 0, y: 25 }, { x: -21.65, y: 12.5 }, { x: -21.65, y: -12.5 }], {
                    fill: "#ffee8c",
                    originX: "center",
                    originY: "center",
                });
            }
            else if(shape === "pentagon") {
                chosenShape = new Polygon([{ x: 0, y: -25 }, { x: 23.78, y: -7.73 }, { x: 14.69, y: 20.23 }, { x: -14.69, y: 20.23 }, { x: -23.78, y: -7.73 }], {
                    fill: "#ffee8c",
                    originX: "center",
                    originY: "center",
                });
            }
            if(!chosenShape){
                return;
            }
            textbox = new Textbox("Double Tap to Edit", {
                width: 40,
                fontSize: 6,
                fill: "#000000",
                backgroundColor: "transparent",
                fontFamily: "Arial",
                editable: true,
                breakWords: true,
                originX: "center",
                originY: "center",
            });
            const group = new Group([chosenShape, textbox], {
                left: pointer.x,
                top: pointer.y,
                originX: "center",
                originY: "center",
            });
            fabricCanvas.add(group);
            fabricCanvas.setActiveObject(group);
            fabricCanvas.renderAll();
            fabricCanvas.off("mouse:down", addShape);
        }
        fabricCanvas.on("mouse:down", addShape);
        return () => fabricCanvas.off("mouse:down", addShape);
    }, [shape]);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;

        function setTextAndShape(event) {
            const target = event.target;

            if(target.type === "textbox"){
                target.enterEditing && target.enterEditing();
                setSelectedTextbox(target);
                fabricCanvas.requestRenderAll();
            }

            if(target.type === "group"){
                const textbox = target.getObjects().find(obj => obj.type === "textbox");
                if(textbox){
                    fabricCanvas.setActiveObject(target);
                    fabricCanvas.setActiveObject(textbox);
                    setSelectedTextbox(textbox)
                    textbox.enterEditing && textbox.enterEditing();
                    fabricCanvas.requestRenderAll();
                }
            }
        }

        fabricCanvas.on("mouse:dblclick", setTextAndShape);
        return () => fabricCanvas.off("mouse:dblclick", setTextAndShape);
    }, []);

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;

        function textEditing(){
            const obj = fabricCanvas.getActiveObject();
            if(obj && obj.type === "textbox"){
                setSelectedTextbox(obj);
                const rect = obj.getBoundingRect();
                setFontSizeInput(obj.fontSize);
                const screenPos = canvasToScreenCoords(fabricCanvas, {
                    x: rect.left + rect.width / 2, 
                    y: rect.top
                });
                setMenuPosition({
                    x: screenPos.x,
                    y: screenPos.y - 300
                });
            } 
            else{
                setSelectedTextbox(null);
            }
            if(obj && obj.type === "group"){
                setSelectedGroup(obj);
                const groupObjects = obj.getObjects();
                const shape = groupObjects.find(o => o.type !== "textbox");
                setSelectedShape(shape);
                const rect = shape.getBoundingRect();
                const screenPos = canvasToScreenCoords(fabricCanvas, {
                    x: rect.left + rect.width / 2, 
                    y: rect.top
                });
                setMenuPosition2({
                    x: screenPos.x,
                    y: screenPos.y - 300
                });
            }
            else{
                setSelectedShape(null);
                setSelectedGroup(null);
            }
        }

        fabricCanvas.on("selection:created", textEditing);
        fabricCanvas.on("selection:updated", textEditing);
        fabricCanvas.on("selection:cleared", textEditing);
        fabricCanvas.on("object:moving", textEditing);
        fabricCanvas.on("object:modified", textEditing);

        return () => {
            fabricCanvas.off("selection:created", textEditing);
            fabricCanvas.off("selection:updated", textEditing);
            fabricCanvas.off("selection:cleared", textEditing);
            fabricCanvas.off("object:moving", textEditing);
            fabricCanvas.off("object:modified", textEditing);
        }
    }, []);

    useEffect(() => {
        if(!selectedTextbox){
            return;
        }

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
        selectedTextbox.set("fontSize", fontSizeInput);
        selectedTextbox.set("textAlign", textAlignment);
        selectedTextbox.canvas.requestRenderAll();

    }, [selectedTextbox, fontSizeInput, bold, italic, underline, textAlignment]);

    useEffect(() => {
        if(!selectedShape || !selectedGroup){
            return;
        }
        selectedShape.set("strokeWidth", borderSizeInput);
        selectedGroup.set("width", selectedShape.width + 2 * borderSizeInput);
        selectedGroup.set("height", selectedShape.height + 2 * borderSizeInput);
        selectedShape.canvas.requestRenderAll();

    }, [selectedTextbox, selectedShape, borderSizeInput, selectedGroup])

    useEffect(() => {
        const fabricCanvas = fabricCanvasRef.current;
        function handlePaste(event) {
            const pastedText = event.clipboardData.getData("text");
            if(!pastedText){
                return;
            }
            const imageUrlPattern = /(https?:\/\/.*\.(gif|webp|png|jpg|jpeg|svg))/i;
            if(imageUrlPattern.test(pastedText)){
                FabricImage.fromURL(pastedText)
                    .then(img => {
                        console.log("Loaded image:", img);
                        img.set({
                            left: fabricCanvas.width / 2,
                            top: fabricCanvas.height / 2,
                            originX: "center",
                            originY: "center",
                            scaleX: 0.5,
                            scaleY: 0.5,
                        });
                        fabricCanvas.add(img);
                        fabricCanvas.setActiveObject(img);
                        fabricCanvas.requestRenderAll();
                    }
                )
            }
        }
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, []);

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

    useEffect(() => {
        setTimeout(() => {
            const container = document.getElementById("colorpicker_container3");
            if(!container){
                return;
            }
            container.innerHTML = "";
            window.webix.ui({
                view: "colorpicker",
                container: "colorpicker_container3",
                value: "#ffee8c",
                on: { 
                    onChange: (newColor) => {
                        setBackgroundColorInput(newColor);
                        if(selectedShape){
                            selectedShape.set("fill", newColor);
                            selectedShape.canvas?.requestRenderAll();
                        }
                    },
                },
            });
        }, 0);
    }, [selectedShape]);

    useEffect(() => {
        setTimeout(() => {
            const container = document.getElementById("colorpicker_container4");
            if(!container){
                return;
            }
            container.innerHTML = "";
            window.webix.ui({
                view: "colorpicker",
                container: "colorpicker_container4",
                value: "#000000",
                on: { 
                    onChange: (newColor) => {
                        setBorderColorInput(newColor);
                        if(selectedShape){
                            selectedShape.set("stroke", newColor);
                            selectedShape.canvas?.requestRenderAll();
                        }
                    },
                },
            });
        }, 0);
    }, [selectedShape]);

    function canvasToScreenCoords(canvas, point) {
        const zoom = canvas.getZoom();
        const vpt = canvas.viewportTransform;
        return {
            x: point.x * zoom + vpt[4],
            y: point.y * zoom + vpt[5]
        };
    }

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

    return(
        <div id = "whiteboard">
            <canvas id = "canvas" ref = {canvasRef}></canvas>
            <div id = "mainTools">
                <button onClick = {() => setShowSoundCloud(!showSoundCloud)}>
                    <img src = "music-Stroke-Rounded.png"></img>
                </button>
                <button onClick = {() => setClock(!showClock)}>
                    <img src = "timer-Stroke-Rounded.png"></img>
                </button>
            </div>
            {showSoundCloud && (
                <div className = "floatingWidgets">
                    <SoundCloud/>
                </div>
            )}      
            {showClock && (
                <div className = "floatingWidgets">
                    <Clock/>
                </div>
            )}
            <div id = "editingTools">
                <button onClick = {() => {setIsEditing(!isEditing)}}>
                    <img src = "editing-Stroke-Rounded.png"/>
                </button>
                {isEditing && (
                    <div id = "editingMenu">
                        <button onClick = {() => setTool(tool === "draw" ? null : "draw")}>
                            <img src = "pencil-Stroke-Rounded.png" alt = "draw"></img>
                        </button>
                        <button onClick = {() => setTool(tool === "erase" ? null : "erase")}>  
                            <img src = "eraser-Stroke-Rounded.png" alt = "erase"></img>
                        </button>
                        <button onClick = {() => setTool(tool === "highlight" ? null : "highlight")}>  
                            <img src = "highlighter-Stroke-Rounded.png" alt = "highlight"></img>
                        </button>
                        <button id = "colorpicker_container"></button>
                        <button onClick = {() => {setStrokeSize(Math.min(25, strokeSize + 5))}}>
                            <img src = "pen-add-Stroke-Rounded.png" alt = "increase pen size"/>
                        </button>
                        <button onClick = {() => {setStrokeSize(Math.max(1, strokeSize - 5))}}>
                            <img src = "pen-minus-Stroke-Rounded.png" alt = "decrease pen size"/>
                        </button>
                    </div>
                )}
                <button onClick = {() => setShape(shape === "textbox" ? null : "textbox")}>
                    <img src = "text-Stroke-Rounded.png" alt = "text"/>
                </button>
                <button onClick = {() => {setIsShapes(!isShapes)}}> 
                    <img src = "shapes-Stroke-Rounded.png" alt = "undo"/>
                </button>
                {isShapes && (
                    <div id = "shapesMenu">
                        <button onClick = {() => setShape(shape === "square" ? null : "square")}>
                            <img src = "square-Stroke-Rounded.png" alt = "square"/>
                        </button>
                        <button onClick = {() => setShape(shape === "circle" ? null : "circle")}>
                            <img src = "circle-Stroke-Rounded.png" alt = "circle"/>
                        </button>
                        <button onClick = {() => setShape(shape === "triangle" ? null : "triangle")}>
                            <img src = "triangle-Stroke-Rounded.png" alt = "triangle"/>
                        </button>
                        <button onClick = {() => setShape(shape === "pentagon" ? null : "pentagon")}>
                            <img src = "pentagon-Stroke-Rounded.png" alt = "pentagon"/>
                        </button>
                        <button onClick = {() => setShape(shape === "hexagon" ? null : "hexagon")}>
                            <img src = "hexagon-Stroke-Rounded.png" alt = "hexagon"/>
                        </button>
                    </div>
                )}
                {selectedTextbox && (
                <div id = "textEditingTools" style = {{left: `${menuPosition.x}px`, top: `${menuPosition.y}px`}}>
                    <button onClick = {e => setFontSizeInput(Math.min(25, fontSizeInput + 3))}>
                        <img src = "pen-add-Stroke-Rounded.png" alt = "increase font size"></img>
                    </button>
                    <button onClick = {e => setFontSizeInput(Math.max(6, fontSizeInput - 3))}>
                        <img src = "pen-minus-Stroke-Rounded.png" alt = "decrease font size" />
                    </button>
                    <button id = "colorpicker_container2"></button>
                    <button onClick = {e => setBold(!bold)}>
                        <img src = "text-bold-Stroke-Rounded.png" alt = "bold text"/>
                    </button>
                    <button onClick = {e => setItalic(!italic)}>
                        <img src = "text-italic-Stroke-Rounded.png" alt = "italic text"/>
                    </button>
                    <button onClick = {e => setUnderline(!underline)}>
                        <img src="text-underline-Stroke-Rounded.png" alt="underline"/>
                    </button>
                    <button onClick = {e => setTextAlignment("left")}>
                        <img src = "text-align-left-Stroke-Rounded.png" alt = "text align left"/>
                    </button>
                    <button onClick = {e => setTextAlignment("center")}>
                        <img src = "text-align-center-Stroke-Rounded.png" alt = "text align center"/>
                    </button>
                    <button onClick = {e => setTextAlignment("right")}>
                        <img src = "text-align-right-Stroke-Rounded.png" alt = "text align right"/>
                    </button>
                </div>
            )}
            {selectedShape && selectedGroup && (
            <div id = "shapeEditingTools" style = {{left: `${menuPosition2.x}px`, top: `${menuPosition2.y}px`}}>
            <button id = "colorpicker_container3"></button>
            <button onClick = {e => setBorderSizeInput(Math.min(4, borderSizeInput + 1))}>
                <img src="add-square-Stroke-Rounded.png" alt="increase border size" />
            </button>
                <button onClick = {e => setBorderSizeInput(Math.max(0, borderSizeInput - 1))}>
                    <img src = "minus-square-Stroke-Rounded.png" alt = "decrease border size"></img>
                </button>
                <button id = "colorpicker_container4"></button>
            </div>
            )}
            </div>
        </div>
    )
}
