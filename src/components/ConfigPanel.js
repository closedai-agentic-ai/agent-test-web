import React, { useState, useEffect } from "react";
import { Settings, Wifi, WifiOff, Loader } from "lucide-react";
import awsService from "../services/awsService";

const ConfigPanel = ({ connectionStatus, setConnectionStatus }) => {
  const [config, setConfig] = useState({
    region: "us-east-1",
    agentId: "",
    agentAliasId: "TSTALIASID",
    accessKeyId: "",
    secretAccessKey: "",
    sessionId: "",
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");

  useEffect(() => {
    // Check initial connection status
    const status = awsService.getConnectionStatus();
    setConnectionStatus(status);

    // Load saved config
    const savedConfig = awsService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, [setConnectionStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateSessionId = () => {
    const sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setConfig((prev) => ({
      ...prev,
      sessionId,
    }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectionMessage("");

    try {
      const result = await awsService.connect(config);

      if (result.success) {
        setConnectionStatus({
          isConnected: true,
          status: "connected",
          message: "Connected successfully",
        });
        setConnectionMessage("Successfully connected to AWS Agent!");
      } else {
        setConnectionStatus({
          isConnected: false,
          status: "disconnected",
          message: result.message,
        });
        setConnectionMessage(result.message);
      }
    } catch (error) {
      console.error("Connection error:", error);
      const errorMessage = `Connection failed: ${error.message}`;
      setConnectionStatus({
        isConnected: false,
        status: "disconnected",
        message: errorMessage,
      });
      setConnectionMessage(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    awsService.disconnect();
    setConnectionStatus({
      isConnected: false,
      status: "disconnected",
      message: "Disconnected",
    });
    setConnectionMessage("Disconnected from AWS Agent");
  };

  const getStatusIcon = () => {
    if (isConnecting) return <Loader className="animate-spin" size={20} />;
    if (connectionStatus.isConnected) return <Wifi size={20} />;
    return <WifiOff size={20} />;
  };

  const getStatusClass = () => {
    if (isConnecting) return "connecting";
    if (connectionStatus.isConnected) return "connected";
    return "disconnected";
  };

  return (
    <div className="config-panel">
      <h2>
        <Settings size={24} />
        AWS Configuration
      </h2>

      <div className={`connection-status ${getStatusClass()}`}>
        {getStatusIcon()}
        <span>
          {isConnecting
            ? "Connecting..."
            : connectionStatus.isConnected
            ? "Connected"
            : "Disconnected"}
        </span>
      </div>

      {connectionMessage && (
        <div
          className={
            connectionStatus.isConnected ? "success-message" : "error-message"
          }
          style={{
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            background: connectionStatus.isConnected
              ? "rgba(76, 175, 80, 0.2)"
              : "rgba(244, 67, 54, 0.2)",
            border: `1px solid ${
              connectionStatus.isConnected
                ? "rgba(76, 175, 80, 0.4)"
                : "rgba(244, 67, 54, 0.4)"
            }`,
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "0.9rem",
          }}
        >
          {connectionMessage}
        </div>
      )}

      <form onSubmit={handleConnect}>
        <div className="form-group">
          <label htmlFor="region">AWS Region</label>
          <select
            id="region"
            name="region"
            value={config.region}
            onChange={handleInputChange}
            required
          >
            <option value="us-east-1">US East (N. Virginia)</option>
            <option value="us-west-2">US West (Oregon)</option>
            <option value="eu-west-1">Europe (Ireland)</option>
            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="agentId">Agent ID</label>
          <input
            type="text"
            id="agentId"
            name="agentId"
            value={config.agentId}
            onChange={handleInputChange}
            placeholder="Enter your Bedrock Agent ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="agentAliasId">Agent Alias ID</label>
          <input
            type="text"
            id="agentAliasId"
            name="agentAliasId"
            value={config.agentAliasId}
            onChange={handleInputChange}
            placeholder="TSTALIASID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="accessKeyId">Access Key ID</label>
          <input
            type="text"
            id="accessKeyId"
            name="accessKeyId"
            value={config.accessKeyId}
            onChange={handleInputChange}
            placeholder="Your AWS Access Key ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="secretAccessKey">Secret Access Key</label>
          <input
            type="password"
            id="secretAccessKey"
            name="secretAccessKey"
            value={config.secretAccessKey}
            onChange={handleInputChange}
            placeholder="Your AWS Secret Access Key"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sessionId">Session ID</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              id="sessionId"
              name="sessionId"
              value={config.sessionId}
              onChange={handleInputChange}
              placeholder="Auto-generated session ID"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={generateSessionId}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "rgba(255, 255, 255, 0.9)",
                padding: "0.75rem 1rem",
                fontSize: "0.9rem",
                minWidth: "auto",
              }}
            >
              Generate
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          {!connectionStatus.isConnected ? (
            <button type="submit" disabled={isConnecting} style={{ flex: 1 }}>
              {isConnecting ? "Connecting..." : "Connect"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDisconnect}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
              }}
            >
              Disconnect
            </button>
          )}
        </div>
      </form>

      <div
        className="warning-box"
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          fontSize: "0.9rem",
          lineHeight: "1.5",
        }}
      >
        <h4 style={{ marginBottom: "1rem", color: "white", fontWeight: "600" }}>
          Setup Instructions:
        </h4>
        <ol style={{ marginLeft: "1.5rem", color: "rgba(255, 255, 255, 0.9)" }}>
          <li>Create a Bedrock Agent in AWS Console</li>
          <li>Note down the Agent ID and Alias ID</li>
          <li>Ensure your AWS credentials have Bedrock permissions</li>
          <li>Fill in the configuration above and click Connect</li>
        </ol>
      </div>
    </div>
  );
};

export default ConfigPanel;
