// app/components/SearchCreateConversation.tsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from "@clerk/clerk-react";
import { Search } from 'lucide-react';

const SearchCreateConversation = ({ onConversationCreated, currentChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim()) {
        try {
          const response = await axios.get(`/api/users/search?query=${encodeURIComponent(searchTerm)}`);
          setSearchResults(response.data);
          setError('');
        } catch (err) {
          console.error("Error searching users:", err);
          setError('Error searching users');
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleCreateConversation = async (receiver) => {
    if (!user?.id) {
        setError('User ID is not available');
        return;
    }

    try {
        onConversationCreated(receiver.id, receiver.role);
        setSearchTerm('');
        setSearchResults([]);
    } catch (err) {
        console.error("Error creating conversation:", err);
        setError('Error creating conversation');
    }
};

  return (
    <div className="search-section">
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div key={result.id} className="search-result-item">
              <img
                src="/noAvatar.png"
                alt="avatar"
                className="user-avatar"
              />
              <div className="user-info">
                <span className="username">{result.displayName}</span>
                <span className="role">{result.role.toLowerCase()}</span>
              </div>
              <button
                onClick={() => handleCreateConversation(result)}
                className="chat-button"
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SearchCreateConversation;