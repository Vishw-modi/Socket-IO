"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://socket-io-447s.onrender.com");

function App() {
  const [users, setUsers] = useState([]);
  const [toUser, setToUser] = useState([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

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
    if (username.trim()) {
      socket.emit("register", username);
      setIsRegistered(true);
    }
  };

  const handleSend = () => {
    if (message.trim() && toUser) {
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
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (!isRegistered) {
        handleRegister();
      } else {
        handleSend();
      }
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`app ${isDarkMode ? "dark" : "light"}`}>
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">ChatApp</h1>
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Online Users</h2>
            <span className="user-count">{users.length}</span>
          </div>

          <div className="users-list">
            {users.map((user, i) => (
              <div key={i} className="user-item">
                <div className="user-avatar">{getInitials(user.name)}</div>
                <span className="user-name">{user.name}</span>
                <div className="user-status"></div>
              </div>
            ))}
          </div>
        </aside>

        <main className="chat-main">
          {!isRegistered ? (
            <div className="registration-container">
              <div className="registration-card">
                <h2>Welcome to ChatApp</h2>
                <p>Enter your name to start chatting</p>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="name-input"
                  />
                  <button
                    onClick={handleRegister}
                    className="register-btn"
                    disabled={!username.trim()}
                  >
                    Join Chat
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-info">
                  <h3>Private Chat</h3>
                  <span className="chat-subtitle">
                    {toUser
                      ? `Chatting with ${toUser}`
                      : "Select a user to start chatting"}
                  </span>
                </div>
              </div>

              <div className="chat-container">
                <div className="messages-container">
                  {chat.length === 0 ? (
                    <div className="empty-chat">
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    chat.map((chatItem, i) =>
                      chatItem ? (
                        <div
                          key={i}
                          className={`message ${
                            chatItem.from === "You" ? "sent" : "received"
                          }`}
                        >
                          <div className="message-bubble">
                            <div className="message-text">
                              {chatItem.message}
                            </div>
                            <div className="message-meta">
                              {chatItem.from === "You" ? "You" : chatItem.from}
                            </div>
                          </div>
                        </div>
                      ) : null
                    )
                  )}
                </div>
              </div>

              <div className="chat-input-container">
                <div className="input-row">
                  <select
                    onChange={(e) => setToUser(e.target.value)}
                    value={toUser}
                    className="user-select"
                  >
                    <option value="">Select recipient</option>
                    {users
                      .filter((user) => user.name !== username)
                      .map((user) => (
                        <option key={user.name} value={user.name}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="message-input-row">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="message-input"
                    disabled={!toUser}
                  />
                  <button
                    onClick={handleSend}
                    className="send-btn"
                    disabled={!message.trim() || !toUser}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
