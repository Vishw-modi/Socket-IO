import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000");

function App() {
  const [users, setUsers] = useState([]);
  const [toUser, setToUser] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("all-users", (users) => {
      console.log(users);
      setUsers(users);
    });

    socket.on("recieve-message", ({ from, message }) => {
      setChat((prev) => [...prev, { from, message }]);
    });
    return () => {
      socket.off("all-users");
      socket.off("recieve-message");
    };
  }, []);

  const handleRegister = () => {
    socket.emit("register", username);
  };

  const handleSend = () => {
    try {
      socket.emit("private-message", {
        to: toUser,
        message,
        from: username,
      });
      setChat((prev) => [...prev, { from: "You", message }]);
      setMessage("");
    } catch (error) {
      console.log("error while sending message", error);
    }
  };

  return (
    <div className="App">
      <h1>Users</h1>

      <ul>
        {users.map((user, i) => (
          <li key={i}>{user.name}</li>
        ))}
      </ul>

      <div>
        <h2>Private Chat</h2>
        <div>
          <input
            type="text"
            placeholder="Your name"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleRegister}>Register Your Self</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <select onChange={(e) => setToUser(e.target.value)}>
            <option value="">-- Select a user --</option>
            {users.map((user) => (
              <option key={user.name} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>

          <button onClick={handleSend}>Send</button>
        </div>
        <div>
          <h2>Chat: </h2>
          <div className="chat-container">
            {chat.map((chat, i) =>
              chat ? (
                <div
                  key={i}
                  className={`message ${
                    chat.from === "You" ? "sent" : "received"
                  }`}
                >
                  <div className="meta">
                    {chat.from === "You" ? "You" : chat.from}
                  </div>
                  <div className="text">{chat.message}</div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
