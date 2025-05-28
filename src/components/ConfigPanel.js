import React, { useState, useEffect } from "react";
import awsService from "../services/awsService";

const ConfigPanel = ({
  onConnect,
  onDisconnect,
  connectionStatus,
  isConnecting,
}) => {
  const [config, setConfig] = useState({
    region: "us-east-1",
    agentId: "",
    agentAliasId: "TSTALIASID",
    accessKeyId: "",
    secretAccessKey: "",
    sessionId: "",
  });

  // Load existing configuration on component mount
  useEffect(() => {
    const existingConfig = awsService.getConfig();
    if (existingConfig.agentId || existingConfig.accessKeyId) {
      setConfig(existingConfig);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConnect(config);
  };

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const getStatusClass = () => {
    if (isConnecting) return "connecting";
    return connectionStatus.isConnected ? "connected" : "disconnected";
  };

  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    if (connectionStatus.isConnected) {
      return `Connected to Agent: ${connectionStatus.agentId}`;
    }
    return "Disconnected";
  };

  return (
    <div className="config-panel">
      <h2>AWS Agent Configuration</h2>

      <div className={`status ${getStatusClass()}`}>
        {getStatusText()}
        {connectionStatus.sessionId && (
          <div className="message-time">
            Session: {connectionStatus.sessionId}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
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
            placeholder="Enter your AWS Agent ID"
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
            placeholder="Enter Agent Alias ID (default: TSTALIASID)"
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
            placeholder="Enter your AWS Access Key ID"
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
            placeholder="Enter your AWS Secret Access Key"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sessionId">Session ID (Optional)</label>
          <input
            type="text"
            id="sessionId"
            name="sessionId"
            value={config.sessionId}
            onChange={handleInputChange}
            placeholder="Leave empty for auto-generated session ID"
          />
        </div>

        <button
          type="submit"
          className="btn"
          disabled={isConnecting || connectionStatus.isConnected}
        >
          {isConnecting
            ? "Connecting..."
            : connectionStatus.isConnected
            ? "Connected"
            : "Connect to Agent"}
        </button>
      </form>

      {connectionStatus.isConnected && (
        <div style={{ marginTop: "1rem" }}>
          <button
            type="button"
            className="btn"
            onClick={handleDisconnect}
            style={{ background: "#dc3545" }}
          >
            Disconnect
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>
          Setup Instructions:
        </h3>
        <ol style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>
          <li>Create an AWS Bedrock Agent in your AWS console</li>
          <li>Note down the Agent ID and Alias ID</li>
          <li>Create IAM credentials with Bedrock permissions</li>
          <li>Enter your credentials above and connect</li>
        </ol>
      </div>
    </div>
  );
};

export default ConfigPanel;
