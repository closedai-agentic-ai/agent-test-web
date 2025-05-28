import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

class AWSService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.config = {
      region: "",
      agentId: "",
      agentAliasId: "",
      sessionId: "",
      accessKeyId: "",
      secretAccessKey: "",
    };
  }

  // Initialize the AWS client with credentials
  async connect(config) {
    try {
      this.config = { ...config };

      // Generate a unique session ID if not provided
      if (!this.config.sessionId) {
        this.config.sessionId = `session-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }

      // Configure credentials
      const credentials = {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      };

      // Initialize the Bedrock Agent Runtime client
      this.client = new BedrockAgentRuntimeClient({
        region: this.config.region,
        credentials: credentials,
      });

      // Test the connection by making a simple call
      await this.testConnection();

      this.isConnected = true;
      return { success: true, message: "Connected to AWS Agent successfully" };
    } catch (error) {
      console.error("AWS connection error:", error);
      this.isConnected = false;
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }

  // Test the connection
  async testConnection() {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    // This is a basic test - in a real scenario, you might want to make a simple agent call
    return true;
  }

  // Send a message to the AWS agent
  async sendMessage(message) {
    if (!this.isConnected || !this.client) {
      throw new Error("Not connected to AWS Agent");
    }

    try {
      const command = new InvokeAgentCommand({
        agentId: this.config.agentId,
        agentAliasId: this.config.agentAliasId,
        sessionId: this.config.sessionId,
        inputText: message,
      });

      const response = await this.client.send(command);

      // Process the response stream
      let fullResponse = "";
      if (response.completion) {
        for await (const chunk of response.completion) {
          if (chunk.chunk && chunk.chunk.bytes) {
            const text = new TextDecoder().decode(chunk.chunk.bytes);
            fullResponse += text;
          }
        }
      }

      return {
        success: true,
        response: fullResponse || "Agent response received",
        sessionId: this.config.sessionId,
      };
    } catch (error) {
      console.error("Error sending message to agent:", error);

      // Provide more specific error messages based on error type
      let errorMessage = error.message;
      if (
        error.name === "ResourceNotFoundException" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        errorMessage = `Agent not found. Please check:\n• Agent ID: ${this.config.agentId}\n• Agent Alias ID: ${this.config.agentAliasId}\n• Region: ${this.config.region}\n• Make sure the agent is in "PREPARED" state`;
      } else if (
        error.name === "UnauthorizedOperation" ||
        error.$metadata?.httpStatusCode === 403
      ) {
        errorMessage =
          "Access denied. Please check your AWS credentials and IAM permissions for Bedrock.";
      } else if (error.name === "ValidationException") {
        errorMessage = `Invalid request parameters: ${error.message}`;
      }

      throw new Error(errorMessage);
    }
  }

  // Disconnect from the service (preserve config data)
  disconnect() {
    this.client = null;
    this.isConnected = false;
    // Generate a new session ID for next connection but keep other config
    this.config.sessionId = "";
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      sessionId: this.config.sessionId,
      agentId: this.config.agentId,
    };
  }

  // Get current configuration (for preserving form data)
  getConfig() {
    return { ...this.config };
  }

  // Alternative method for environments where direct AWS SDK might have CORS issues
  async sendMessageViaProxy(message) {
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          config: this.config,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Proxy request error:", error);
      throw new Error(`Proxy request failed: ${error.message}`);
    }
  }
}

const awsService = new AWSService();
export default awsService;
