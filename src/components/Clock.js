import { useEffect, useState } from "react";
import "./Clock.css";

export default function Clock() {
    //Input is the time user inputs in the text box in format mm:ss
    const [input, setInput] = useState(""); 
    //Seconds is converted from input to just seconds 
    const [seconds, setSeconds] = useState(0);
    //Running is whether the timer is currently running or not
    const [running, setRunning] = useState(false);
    //Todos is the list of tasks user inputs
    const [todos, setTodos] = useState([]);
    //todoInput is the current task user is typing in the text box
    const [todoInput, setTodoInput] = useState("");
    //finishedTodos is the list of tasks user has completed
    const [finishedTodos, setFinishedTodos] = useState([]);
    //lastDoneTime is the last time user completed a task
    const [lastDoneTime, setLastDoneTime] = useState(Date.now());

    //Use effect to update the timer every second if running is true and seconds is greater than 0
    //Every 1000 milliseconds, decrease seconds by 1
    useEffect(() => {
        let interval = null;
        if(running && seconds > 0){
            interval = setInterval(() => {
                setSeconds(s => s - 1);
            }, 1000);
        } 
        else if(seconds === 0){
            setRunning(false);
        }
        return () => clearInterval(interval);
    }, [running, seconds]);

    //Turns mm:ss input into seconds for calculation
    function handleSet() {
        const parts = input.split(":");
        setSeconds(Number(parts[0]) * 60 + Number(parts[1]));
    }

    //Format time in seconds to mm:ss format for display
    function formatTime(sec){
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        let minStr, secStr;

        if (minutes < 10){
            minStr = "0" + minutes;
        } 
        else {
            minStr = "" + minutes;
        }

        if(seconds < 10){
            secStr = "0" + seconds;
        } 
        else{
            secStr = "" + seconds;
        }
        return minStr + ":" + secStr;
    }

    //Add todo to the list of tasks
    function addTodo(){
        setTodos([...todos, todoInput])
    }
    
    //Adds a todo to the finished list if it is not already there
    function removeTodo(idx){
        let alreadyFinished = false;
        for(let i = 0; i < finishedTodos.length; i++){
            if(finishedTodos[i].text === todos[idx]){
                alreadyFinished = true
            }
        }
        if(!alreadyFinished){
            const now = Date.now();
            const diffSeconds = Math.floor((now - lastDoneTime) / 1000);
            setLastDoneTime(now);
            setFinishedTodos([...finishedTodos, {text: todos[idx], time: diffSeconds}]);
        }
    }

    return (
        <div id = "main-containers">
           <div id = "clock">
                <div>
                    {/* Input box for time in mm:ss format */}
                    <input
                        type = "text"
                        onChange = {e => setInput(e.target.value)}
                        placeholder = "mm:ss"
                        id = "time-input"
                    />
                    {/* When set is clicked, convert input to seconds */}
                    <button onClick = {handleSet} id = "time"> Set </button>
                </div>
                {/* Display the time in mm:ss format */}
                <div> {formatTime(seconds)} </div>
                {/* Start/Pause button toggles running state, Reset button sets seconds to 0 and running to false */}
                <button onClick = {() => {setRunning(!running); setLastDoneTime(Date.now());}} disabled = {seconds === 0}>
                    {running ? "Pause" : "Start"}
                </button>
                {/* Reset button sets seconds to 0 and running to false */}
                <button onClick={() => {setSeconds(0); setRunning(false);}}> Reset </button>
            </div>
            <div id = "todo-list">
                {/* Input box for todo */}
                <input onChange = {e => setTodoInput(e.target.value)} placeholder = "Enter a task"></input>
                {/* Add button adds todo to the list */}
                <button onClick = {addTodo}> Add </button>
                {/* Clear All button clears both todos and finishedTodos */}
                <button onClick = {() => {setTodos([]); setFinishedTodos([])}}> Clear All </button>
                <div>
                    {/* Display the list of todos and those on the finishedTodos as striked through */}
                    {todos.map((todo, idx) => (
                        <div
                            key = {idx}
                            onClick = {() => removeTodo(idx)}
                            style={{
                                textDecoration: finishedTodos.some(f => f.text === todo) ? "line-through" : "none"
                            }}
                        >
                            {todo}
                        </div>
                    ))}
                </div>
            </div>
            {/* Display the list of finished todos with the time taken to finish them */}
            {!running && finishedTodos.length > 0 && (
            <div>
                <h4>Finished Todos</h4>
                <ul>
                    {finishedTodos.map((item, i) => (
                        <li key = {i}>
                            <span style = {{fontWeight: 500}}> {item.text} </span>
                            <span style = {{marginLeft: 10, color: "#555555"}}>
                                — finished in {typeof item.time === "number" ? formatTime(item.time) : item.time}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        </div>
    );
}