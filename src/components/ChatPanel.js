import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import TroubleshootingPanel from "./TroubleshootingPanel";
import awsService from "../services/awsService";

const ChatPanel = ({ connectionStatus, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [lastError, setLastError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message, type = "user") => {
    const newMessage = {
      id: Date.now(),
      text: message,
      type: type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !connectionStatus.isConnected || isLoading) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message
    addMessage(userMessage, "user");

    try {
      // Send message to AWS agent
      const response = await onSendMessage(userMessage);

      if (response.success) {
        addMessage(response.response, "agent");
        setLastError(""); // Clear any previous errors
      } else {
        const errorMessage = `Error: ${
          response.message || "Failed to get response from agent"
        }`;
        addMessage(errorMessage, "error");
        setLastError(response.message || "Unknown error");

        // Show troubleshooting panel for specific errors
        if (
          response.message &&
          (response.message.includes("Agent not found") ||
            response.message.includes("404") ||
            response.message.includes("Access denied") ||
            response.message.includes("403"))
        ) {
          setShowTroubleshooting(true);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = `Error: ${error.message}`;
      addMessage(errorMessage, "error");
      setLastError(error.message);

      // Show troubleshooting panel for connection errors
      if (
        error.message &&
        (error.message.includes("Agent not found") ||
          error.message.includes("404") ||
          error.message.includes("Access denied") ||
          error.message.includes("403"))
      ) {
        setShowTroubleshooting(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setLastError("");
    setShowTroubleshooting(false);
  };

  const closeTroubleshooting = () => {
    setShowTroubleshooting(false);
  };

  return (
    <div className="chat-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>Chat with AWS Agent</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {lastError && (
            <button
              onClick={() => setShowTroubleshooting(true)}
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Troubleshoot
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{
                background: "none",
                border: "1px solid #ccc",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#666",
              padding: "2rem",
              fontStyle: "italic",
            }}
          >
            {connectionStatus.isConnected
              ? "Start a conversation with your AWS agent..."
              : "Please connect to an AWS agent first to start chatting."}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div style={{ whiteSpace: "pre-wrap" }}>{message.text}</div>
              <div className="message-time">{message.timestamp}</div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message agent">
            <div className="loading">
              <div className="spinner"></div>
              Agent is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            connectionStatus.isConnected
              ? "Type your message here..."
              : "Connect to an agent first..."
          }
          disabled={!connectionStatus.isConnected || isLoading}
        />
        <button
          type="submit"
          disabled={
            !connectionStatus.isConnected || !inputMessage.trim() || isLoading
          }
        >
          <Send size={20} />
        </button>
      </form>

      {!connectionStatus.isConnected && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            color: "#856404",
            fontSize: "0.9rem",
          }}
        >
          <strong>Note:</strong> You need to configure and connect to an AWS
          agent before you can start chatting.
        </div>
      )}

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "0.9rem",
          color: "#666",
        }}
      >
        <h4 style={{ marginBottom: "0.5rem" }}>Sample Questions to Try:</h4>
        <ul style={{ marginLeft: "1rem", lineHeight: "1.4" }}>
          <li>What can you help me with?</li>
          <li>Tell me about your capabilities</li>
          <li>How can I use AWS services effectively?</li>
          <li>What's the weather like today?</li>
        </ul>
      </div>

      {showTroubleshooting && (
        <TroubleshootingPanel
          error={lastError}
          config={awsService.getConfig()}
          onClose={closeTroubleshooting}
        />
      )}
    </div>
  );
};

export default ChatPanel;
