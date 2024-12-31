import axios from "axios";
import { useEffect, useState } from "react";

export default function ChatOnline({ onlineUsers, currentId, setCurrentChat }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await axios.get("/users"); // Zmieniamy to na odpowiedni endpoint, aby uzyskać wszystkich użytkowników
        setUsers(res.data); // Zakładając, że res.data jest tablicą użytkowników
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    getAllUsers();
  }, []);

  // Filtrujemy użytkowników na podstawie wyszukiwanego terminu
  const filteredUsers = Array.isArray(users) ? users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div>
      <input
        type="text"
        placeholder="Search for users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="chatOnline">
        {filteredUsers.map((user) => (
          <div key={user._id} className="chatOnlineFriend" onClick={() => handleClick(user)}>
            <div className="chatOnlineImgContainer">
              <img
                className="chatOnlineImg"
                src={user.profilePicture || "defaultProfilePicture.png"}
                alt=""
              />
              <div className="chatOnlineBadge"></div>
            </div>
            <span className="chatOnlineName">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
