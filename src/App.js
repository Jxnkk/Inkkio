//Importing CSS file for styling the whiteboard
import "./App.css";
//Getting whiteboard component
import WhiteBoard from "./components/Whiteboard.js"

export default function App() {
  return (
    <>
      {/*Call the whiteboard component to render it*/}
      <WhiteBoard id = "whiteboard"/>
    </>
  )
}