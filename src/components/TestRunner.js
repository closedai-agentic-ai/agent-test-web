import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  FileText,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";

const TestRunner = () => {
  const [testInstructions, setTestInstructions] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [currentStep, setCurrentStep] = useState("");
  const [logs, setLogs] = useState([]);
  const [templates, setTemplates] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const fileInputRef = useRef(null);

  const API_BASE_URL = "http://localhost:5001/api";

  useEffect(() => {
    // Load templates and devices on component mount
    loadTemplates();
    loadDevices();
  }, []);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test/templates`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
        addLog("Loaded test templates", "info");
      } else {
        addLog("Failed to load templates", "error");
      }
    } catch (error) {
      addLog(`Error loading templates: ${error.message}`, "error");
    }
  };

  const loadDevices = async () => {
    try {
      addLog("Searching for available devices...", "info");
      const response = await fetch(`${API_BASE_URL}/device/list`);
      const data = await response.json();

      if (data.success) {
        setDevices(data.devices);
        if (data.devices.length > 0) {
          setSelectedDevice(data.devices[0].id);
          addLog(`Found ${data.devices.length} device(s)`, "success");
        } else {
          addLog("No devices found. Please check device connections.", "error");
          addLog(
            "Troubleshooting: Make sure MCP is running and devices are connected",
            "info"
          );
        }
      } else {
        addLog(`Failed to load devices: ${data.error}`, "error");
        addLog("Make sure the backend API is running on port 5001", "info");
      }
    } catch (error) {
      addLog(`Error loading devices: ${error.message}`, "error");
      addLog(
        "Check if backend server is running: python backend_api.py",
        "info"
      );
    }
  };

  const selectDevice = async (deviceId) => {
    try {
      const device = devices.find((d) => d.id === deviceId);
      if (!device) return;

      const response = await fetch(`${API_BASE_URL}/device/select`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: deviceId,
          device_type: device.type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSelectedDevice(deviceId);
        addLog(`Selected device: ${device.name}`, "success");
      } else {
        addLog(`Failed to select device: ${data.error}`, "error");
      }
    } catch (error) {
      addLog(`Error selecting device: ${error.message}`, "error");
    }
  };

  const runTest = async () => {
    if (!testInstructions.trim()) {
      addLog("Please provide test instructions", "error");
      return;
    }

    if (!selectedDevice) {
      addLog("Please select a device first", "error");
      return;
    }

    setIsRunning(true);
    setTestResults(null);
    setLogs([]);
    addLog("Starting test execution...", "info");
    addLog(`Using device: ${selectedDevice}`, "info");

    try {
      // First, parse the instructions to show what will be executed
      const parseResponse = await fetch(`${API_BASE_URL}/test/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructions: testInstructions,
        }),
      });

      const parseData = await parseResponse.json();

      if (parseData.success) {
        addLog(`Parsed ${parseData.total_actions} test actions`, "info");

        // Show parsed actions
        parseData.actions.forEach((action, index) => {
          addLog(`Step ${index + 1}: ${action.description}`, "info");
        });
      }

      // Run the actual test
      setCurrentStep("Initializing test execution...");

      const response = await fetch(`${API_BASE_URL}/test/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructions: testInstructions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResults(data.data);
        addLog("Test execution completed!", "success");
        addLog(
          `Success rate: ${data.data.success_rate}%`,
          data.data.success_rate >= 80 ? "success" : "error"
        );
      } else {
        addLog(`Test execution failed: ${data.error}`, "error");
      }
    } catch (error) {
      addLog(`Test execution failed: ${error.message}`, "error");
    } finally {
      setIsRunning(false);
      setCurrentStep("");
    }
  };

  const loadTestFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTestInstructions(e.target.result);
        addLog(`Loaded test file: ${file.name}`, "info");
      };
      reader.readAsText(file);
    }
  };

  const downloadReport = () => {
    if (!testResults?.report) return;

    const blob = new Blob([testResults.report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (templateKey) => {
    if (templates[templateKey]) {
      setTestInstructions(templates[templateKey].instructions);
      setSelectedTemplate(templateKey);
      addLog(`Loaded template: ${templates[templateKey].name}`, "info");
    }
  };

  return (
    <div className="test-runner-panel">
      <h2>
        <Smartphone size={24} />
        Mobile Test Runner
      </h2>

      {/* Device Selection */}
      <div className="device-selection">
        <h3>Device Selection</h3>
        <div className="device-controls">
          <select
            value={selectedDevice}
            onChange={(e) => selectDevice(e.target.value)}
            disabled={isRunning}
            className="device-select"
          >
            <option value="">
              {devices.length === 0
                ? "No devices found..."
                : "Select a device..."}
            </option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name} ({device.type}) - {device.status}
              </option>
            ))}
          </select>
          <button
            onClick={loadDevices}
            disabled={isRunning}
            className="refresh-btn"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {devices.length === 0 && (
          <div className="device-troubleshooting">
            <h4>No Devices Found</h4>
            <p>If you're not seeing any devices, try these steps:</p>
            <ul>
              <li>Make sure your mobile device is connected via USB</li>
              <li>Enable USB debugging on Android devices</li>
              <li>Check that MCP mobile server is running</li>
              <li>Verify the backend API is running on port 5001</li>
              <li>Click the Refresh button to scan again</li>
            </ul>
          </div>
        )}
      </div>

      {/* Test Instructions Input */}
      <div className="test-input-section">
        <div className="input-header">
          <h3>Test Instructions</h3>
          <div className="input-actions">
            <select
              value={selectedTemplate}
              onChange={(e) => loadTemplate(e.target.value)}
              disabled={isRunning}
              className="template-select"
            >
              <option value="">Select template...</option>
              {Object.entries(templates).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="file-btn"
              disabled={isRunning}
            >
              <FileText size={16} />
              Load File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md"
              onChange={loadTestFile}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <textarea
          value={testInstructions}
          onChange={(e) => setTestInstructions(e.target.value)}
          placeholder="Enter your test instructions here or select a template..."
          className="test-instructions-input"
          disabled={isRunning}
          rows={15}
        />

        <div className="run-section">
          <button
            onClick={runTest}
            disabled={isRunning || !testInstructions.trim() || !selectedDevice}
            className="run-test-btn"
          >
            <Play size={20} />
            {isRunning ? "Running Test..." : "Run Test"}
          </button>
        </div>
      </div>

      {/* Current Step Display */}
      {isRunning && currentStep && (
        <div className="current-step">
          <Clock size={16} />
          <span>{currentStep}</span>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="test-results">
          <div className="results-header">
            <h3>Test Results</h3>
            <button onClick={downloadReport} className="download-btn">
              <Download size={16} />
              Download Report
            </button>
          </div>

          <div className="results-summary">
            <div className="summary-card">
              <div className="summary-item">
                <span className="label">Total Steps:</span>
                <span className="value">{testResults.total_steps}</span>
              </div>
              <div className="summary-item">
                <span className="label">Passed:</span>
                <span className="value success">
                  {testResults.passed_steps}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Failed:</span>
                <span className="value error">{testResults.failed_steps}</span>
              </div>
              <div className="summary-item">
                <span className="label">Success Rate:</span>
                <span
                  className={`value ${
                    testResults.success_rate >= 80 ? "success" : "error"
                  }`}
                >
                  {testResults.success_rate}%
                </span>
              </div>
            </div>
          </div>

          {testResults.screenshots && testResults.screenshots.length > 0 && (
            <div className="screenshots-section">
              <h4>Screenshots Captured</h4>
              <div className="screenshots-list">
                {testResults.screenshots.map((screenshot, index) => (
                  <div key={index} className="screenshot-item">
                    <FileText size={16} />
                    <span>{screenshot}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      <div className="logs-section">
        <h3>Execution Logs</h3>
        <div className="logs-container">
          {logs.length === 0 ? (
            <div className="no-logs">
              No logs yet. Run a test to see execution details.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="log-timestamp">{log.timestamp}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRunner;
