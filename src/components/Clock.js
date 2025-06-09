import { useEffect, useState } from "react";
import "./Clock.css";

export default function Clock() {
    const [input, setInput] = useState(""); 
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [todos, setTodos] = useState([]);
    const [todoInput, setTodoInput] = useState("");
    const [finishedTodos, setFinishedTodos] = useState([]);
    const [lastDoneTime, setLastDoneTime] = useState(Date.now());

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

    function handleSet() {
        const parts = input.split(":");
        setSeconds(Number(parts[0]) * 60 + Number(parts[1]));
    }

    function addTodo(){
        setTodos([...todos, todoInput])
    }
    
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
                    <input
                        type = "text"
                        onChange = {e => setInput(e.target.value)}
                        placeholder = "mm:ss"
                        id = "time-input"
                    />
                    <button onClick = {handleSet} id = "time"> Set </button>
                </div>
                <div> {formatTime(seconds)} </div>
                <button onClick = {() => {setRunning(!running); setLastDoneTime(Date.now());}} disabled = {seconds === 0}>
                    {running ? "Pause" : "Start"}
                </button>
                <button onClick={() => {setSeconds(0); setRunning(false);}}> Reset </button>
            </div>
            <div id = "todo-list">
                <input onChange = {e => setTodoInput(e.target.value)} placeholder = "Enter a task"></input>
                <button onClick = {addTodo}> Add </button>
                <button onClick = {() => {setTodos([]); setFinishedTodos([])}}> Clear All </button>
                <div>
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
            {!running && finishedTodos.length > 0 && (
            <div>
                <h4>Finished Todos</h4>
                <ul>
                    {finishedTodos.map((item, i) => (
                        <li key = {i}>
                            <span style = {{fontWeight: 500}}> {item.text} </span>
                            <span style = {{marginLeft: 10, color: "#555"}}>
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