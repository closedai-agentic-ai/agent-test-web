import React, { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import ChatPanel from "./components/ChatPanel";
import TestRunner from "./components/TestRunner";
import { Zap, MessageCircle, Smartphone } from "lucide-react";
import "./index.css";
import awsService from "./services/awsService";

function App() {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    status: "disconnected",
    message: "Not connected",
  });
  const [activeTab, setActiveTab] = useState("chat"); // "chat" or "test"

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <Zap size={40} style={{ marginRight: "0.5rem", display: "inline" }} />
          AWS Agent Connect
        </h1>
        <p>Connect with AWS Bedrock agents and run mobile tests</p>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <MessageCircle size={20} />
            AWS Agent Chat
          </button>
          <button
            className={`tab-button ${activeTab === "test" ? "active" : ""}`}
            onClick={() => setActiveTab("test")}
          >
            <Smartphone size={20} />
            Mobile Test Runner
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === "chat" ? (
          <>
            <ConfigPanel
              connectionStatus={connectionStatus}
              setConnectionStatus={setConnectionStatus}
            />
            <ChatPanel connectionStatus={connectionStatus} />
          </>
        ) : (
          <TestRunner />
        )}
      </main>
    </div>
  );
}

export default App;
