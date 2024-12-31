// page.jsx
"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import "./page.css";

export default function ChatOnline({ onlineUsers, currentId, setCurrentChat }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const params = useParams();
  const lang = params?.lang || 'pl';
  const t = useTranslations();

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await axios.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    getAllUsers();
  }, []);

  const filteredUsers = Array.isArray(users) ? users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleClick = async (user) => {
    try {
      const res = await axios.get(
        `/conversations/find/${currentId}/${user._id}`
      );
      setCurrentChat(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chatOnline">
      <input
        type="text"
        placeholder={t.messages.search}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div key={user._id} className="chatOnlineFriend" onClick={() => handleClick(user)}>
            <div className="chatOnlineImgContainer">
              <img
                className="chatOnlineImg"
                src={user.profilePicture ? PF + user.profilePicture : "/noAvatar.png"}
                alt={t.common?.avatar || "avatar"}
              />
              <div className="chatOnlineBadge"></div>
            </div>
            <span className="chatOnlineName">{user.username}</span>
            <span className="userStatus">
              {onlineUsers.includes(user._id) ? t.messages.online : t.messages.offline}
            </span>
          </div>
        ))
      ) : (
        <div className="no-users-message">
          {t.messages.noMessages}
        </div>
      )}
    </div>
  );
}