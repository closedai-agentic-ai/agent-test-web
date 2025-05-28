import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import TroubleshootingPanel from "./TroubleshootingPanel";
import awsService from "../services/awsService";

const ChatPanel = ({ connectionStatus, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [lastError, setLastError] = useState("");
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [shouldAutoScroll]);

  // Check if user is near the bottom of the chat
  const checkScrollPosition = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  // Only scroll on new messages, not during streaming updates
  useEffect(() => {
    const messageCount = messages.length;
    if (messageCount > 0) {
      const lastMessage = messages[messageCount - 1];
      // Only auto-scroll for new messages, not streaming updates
      if (lastMessage.id !== streamingMessageId) {
        scrollToBottom();
      }
    }
  }, [messages.length, streamingMessageId, scrollToBottom]);

  // Scroll when streaming starts (new message added)
  useEffect(() => {
    if (streamingMessageId && shouldAutoScroll) {
      scrollToBottom();
    }
  }, [streamingMessageId, shouldAutoScroll, scrollToBottom]);

  const addMessage = (message, type = "user", id = null) => {
    const messageId = id || Date.now();
    const newMessage = {
      id: messageId,
      text: message,
      type: type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return messageId;
  };

  const updateMessage = (messageId, newText) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, text: newText } : msg
      )
    );
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

    // Create a placeholder message for the agent response
    const agentMessageId = Date.now() + 1;
    addMessage("", "agent", agentMessageId);
    setStreamingMessageId(agentMessageId);

    try {
      // Use the streaming method for real-time updates
      await awsService.sendMessageStream(userMessage, {
        onStart: () => {
          // Message placeholder already created
        },
        onChunk: (chunk, fullResponse) => {
          // Update the agent message with the new chunk
          updateMessage(agentMessageId, fullResponse);
          // Only scroll if user is near bottom during streaming
          if (shouldAutoScroll) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }
        },
        onComplete: (fullResponse) => {
          // Ensure the final response is set
          updateMessage(
            agentMessageId,
            fullResponse || "Agent response completed"
          );
          setLastError(""); // Clear any previous errors
          setIsLoading(false);
          setStreamingMessageId(null);
        },
        onError: (error) => {
          // Remove the empty agent message and add error message
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== agentMessageId)
          );
          const errorMessage = `Error: ${error.message}`;
          addMessage(errorMessage, "error");
          setLastError(error.message);

          // Show troubleshooting panel for specific errors
          if (
            error.message &&
            (error.message.includes("Agent not found") ||
              error.message.includes("404") ||
              error.message.includes("Access denied") ||
              error.message.includes("403"))
          ) {
            setShowTroubleshooting(true);
          }

          setIsLoading(false);
          setStreamingMessageId(null);
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove the empty agent message and add error message
      setMessages((prev) => prev.filter((msg) => msg.id !== agentMessageId));
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

      setIsLoading(false);
      setStreamingMessageId(null);
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
    setStreamingMessageId(null);
    setShouldAutoScroll(true);
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
          marginBottom: "1.5rem",
        }}
      >
        <h2>
          <MessageCircle size={24} />
          Chat with AWS Agent
        </h2>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {lastError && (
            <button
              onClick={() => setShowTroubleshooting(true)}
              className="troubleshoot-btn"
              style={{
                padding: "0.75rem 1.25rem",
                fontSize: "0.9rem",
                borderRadius: "12px",
              }}
            >
              Troubleshoot
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="clear-chat-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                fontSize: "0.9rem",
                borderRadius: "12px",
              }}
            >
              <Trash2 size={16} />
              Clear Chat
            </button>
          )}
        </div>
      </div>

      <div
        className="chat-messages"
        ref={chatMessagesRef}
        onScroll={checkScrollPosition}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "rgba(255, 255, 255, 0.7)",
              padding: "3rem 2rem",
              fontStyle: "italic",
              fontSize: "1.1rem",
            }}
          >
            {connectionStatus.isConnected
              ? "✨ Start a conversation with your AWS agent..."
              : "🔗 Please connect to an AWS agent first to start chatting."}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div style={{ whiteSpace: "pre-wrap" }}>
                {message.text}
                {/* Show typing indicator for streaming messages */}
                {streamingMessageId === message.id &&
                  message.type === "agent" && (
                    <span
                      style={{
                        opacity: 0.7,
                        animation: "blink 1s infinite",
                        marginLeft: "2px",
                      }}
                    >
                      ▋
                    </span>
                  )}
              </div>
              <div className="message-time">{message.timestamp}</div>
            </div>
          ))
        )}

        {isLoading && !streamingMessageId && (
          <div className="message agent">
            <div className="loading">
              <div className="spinner"></div>
              Connecting to agent...
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
              ? isLoading
                ? "Agent is responding..."
                : "Type your message here..."
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
        <div className="warning-box" style={{ marginTop: "1.5rem" }}>
          <strong>💡 Note:</strong> You need to configure and connect to an AWS
          agent before you can start chatting.
        </div>
      )}

      <div className="sample-questions" style={{ marginTop: "1.5rem" }}>
        <h4
          style={{
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          💬 Sample Questions to Try:
        </h4>
        <ul style={{ marginLeft: "1.5rem", lineHeight: "1.6" }}>
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
