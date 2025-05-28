import React, { useState, useEffect } from "react";
import "./App.css";
import ConfigPanel from "./components/ConfigPanel";
import ChatPanel from "./components/ChatPanel";
import awsService from "./services/awsService";

function App() {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    sessionId: "",
    agentId: "",
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");

  useEffect(() => {
    // Check initial connection status
    const status = awsService.getConnectionStatus();
    setConnectionStatus(status);
  }, []);

  // Function to update connection status
  const updateConnectionStatus = () => {
    const status = awsService.getConnectionStatus();
    setConnectionStatus(status);
  };

  const handleConnect = async (config) => {
    setIsConnecting(true);
    setConnectionMessage("");

    try {
      const result = await awsService.connect(config);

      if (result.success) {
        updateConnectionStatus();
        setConnectionMessage("Successfully connected to AWS Agent!");
      } else {
        setConnectionMessage(result.message);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionMessage(`Connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    awsService.disconnect();
    updateConnectionStatus();
    setConnectionMessage("Disconnected from AWS Agent");
  };

  const handleSendMessage = async (message) => {
    try {
      const response = await awsService.sendMessage(message);
      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>AWS Agent React App</h1>
          <p>Connect and interact with your AWS Bedrock agents</p>
        </header>

        {connectionMessage && (
          <div
            className={`status ${
              connectionStatus.isConnected ? "connected" : "disconnected"
            }`}
          >
            {connectionMessage}
          </div>
        )}

        <main className="main-content">
          <ConfigPanel
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            connectionStatus={connectionStatus}
            isConnecting={isConnecting}
          />

          <ChatPanel
            connectionStatus={connectionStatus}
            onSendMessage={handleSendMessage}
          />
        </main>

        <footer
          style={{
            textAlign: "center",
            marginTop: "2rem",
            padding: "1rem",
            color: "white",
            opacity: 0.8,
            fontSize: "0.9rem",
          }}
        >
          <p>Built with React and AWS Bedrock Agent Runtime</p>
          <p>
            Make sure your AWS credentials have the necessary Bedrock
            permissions
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
