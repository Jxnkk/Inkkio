//Connecting to css file for styling 
import "./Clock.css"; 

export default function Clock() {
    return (
        <div>
            <iframe
                //Connects to the Pomodoro timer from Flocus
                src = "https://flocus.com/minimalist-pomodoro-timer"
                allowFullScreen
            />
        </div>
    );
}
