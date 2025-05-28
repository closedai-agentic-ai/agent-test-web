import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

const TroubleshootingPanel = ({ error, config }) => {
  if (!error) return null;

  const is404Error = error.includes("Agent not found") || error.includes("404");
  const is403Error = error.includes("Access denied") || error.includes("403");

  const troubleshootingSteps = [
    {
      title: "Verify Agent Configuration",
      items: [
        "Check that your Agent ID is correct",
        "Verify the Agent Alias ID (usually 'TSTALIASID' for test agents)",
        "Ensure you're using the correct AWS region",
        "Confirm the agent exists in your AWS console",
      ],
      icon: <Info size={16} />,
      type: "info",
    },
    {
      title: "Check Agent Status",
      items: [
        "Go to AWS Console → Amazon Bedrock → Agents",
        "Find your agent and check its status",
        "Agent must be in 'PREPARED' state to receive requests",
        "If not prepared, click 'Prepare' and wait for completion",
      ],
      icon: <AlertTriangle size={16} />,
      type: "warning",
    },
    {
      title: "Verify IAM Permissions",
      items: [
        "Your IAM user needs 'bedrock:InvokeAgent' permission",
        "Check if 'bedrock:GetAgent' permission is also granted",
        "Ensure the resource ARN matches your agent",
        "Test with broader permissions first, then narrow down",
      ],
      icon: <XCircle size={16} />,
      type: "error",
    },
    {
      title: "Common Solutions",
      items: [
        "Try using 'TSTALIASID' as the Agent Alias ID",
        "Double-check the Agent ID format (should be alphanumeric)",
        "Ensure your AWS credentials have sufficient permissions",
        "Check if the agent is in the same region as your credentials",
      ],
      icon: <CheckCircle size={16} />,
      type: "success",
    },
  ];

  const getStepStyle = (type) => {
    const baseStyle = {
      padding: "1rem",
      borderRadius: "8px",
      marginBottom: "1rem",
      border: "1px solid",
    };

    switch (type) {
      case "error":
        return {
          ...baseStyle,
          backgroundColor: "#fef2f2",
          borderColor: "#fecaca",
          color: "#991b1b",
        };
      case "warning":
        return {
          ...baseStyle,
          backgroundColor: "#fffbeb",
          borderColor: "#fed7aa",
          color: "#92400e",
        };
      case "success":
        return {
          ...baseStyle,
          backgroundColor: "#f0fdf4",
          borderColor: "#bbf7d0",
          color: "#166534",
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: "#eff6ff",
          borderColor: "#bfdbfe",
          color: "#1e40af",
        };
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "800px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <AlertTriangle
            size={24}
            color="#dc2626"
            style={{ marginRight: "0.5rem" }}
          />
          <h2 style={{ margin: 0, color: "#dc2626" }}>
            Connection Error Troubleshooting
          </h2>
        </div>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fef2f2",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #fecaca",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#991b1b" }}>
            Error Details:
          </h3>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem",
              color: "#991b1b",
              fontFamily: "monospace",
            }}
          >
            {error}
          </pre>
        </div>

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0" }}>Current Configuration:</h3>
          <div>
            <strong>Region:</strong> {config.region}
          </div>
          <div>
            <strong>Agent ID:</strong> {config.agentId}
          </div>
          <div>
            <strong>Agent Alias ID:</strong> {config.agentAliasId}
          </div>
          <div>
            <strong>Session ID:</strong> {config.sessionId}
          </div>
        </div>

        {troubleshootingSteps.map((step, index) => (
          <div key={index} style={getStepStyle(step.type)}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              {step.icon}
              <h3 style={{ margin: "0 0 0 0.5rem", fontSize: "1rem" }}>
                {step.title}
              </h3>
            </div>
            <ul style={{ margin: "0", paddingLeft: "1.5rem" }}>
              {step.items.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  style={{ marginBottom: "0.25rem", fontSize: "0.9rem" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div
          style={{
            padding: "1rem",
            backgroundColor: "#eff6ff",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #bfdbfe",
          }}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e40af" }}>
            Quick Fix Checklist:
          </h3>
          <div style={{ fontSize: "0.9rem", color: "#1e40af" }}>
            <div>✓ Agent exists in AWS Console</div>
            <div>✓ Agent status is "PREPARED"</div>
            <div>✓ Agent ID and Alias ID are correct</div>
            <div>✓ IAM user has bedrock:InvokeAgent permission</div>
            <div>✓ Correct AWS region selected</div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
              marginRight: "1rem",
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingPanel;
