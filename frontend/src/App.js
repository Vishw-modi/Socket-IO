import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function App() {
  const [user, setUser] = useState([]);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("all-users", (users) => {
      setUser(users);
    });

    socket.on("new-user", (users) => {
      setUser((prev) => [...prev, users]);
    });
    return () => socket.disconnect();
  }, []);
  return (
    <div className="App">
      <h1>Users</h1>

      <ul>
        {user.map((user, i) =>
          user?.name ? <li key={i}>{user.name}</li> : null
        )}
      </ul>
    </div>
  );
}

export default App;
