//Importing CSS file for styling the whiteboard
import "./App.css";
import Chatbot from "./components/Chatbot.js";
//Getting whiteboard component
import WhiteBoard from "./components/Whiteboard.js"

export default function App() {
  return (
    <>
      <WhiteBoard id = "whiteboard"/>
    </>
  )
}