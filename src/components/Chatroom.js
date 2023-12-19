import "./Chatroom.css"
import { useState } from 'react';
// import background from './images/background.png';
import SendIcon from '@mui/icons-material/Send';

function Chatroom() {
    const [message, setMessage] = useState("");
    return (
        <div className="App">
            <div>
                <input
                value={message}
                className="input"
                placeholder="Type your message here"
                onChange={event => setMessage(event.target.value)}
                />
                &nbsp;&nbsp;
                <button className="button" onClick={() => setMessage("")}><SendIcon/></button>
            </div>
        </div>
    )
}

export default Chatroom;