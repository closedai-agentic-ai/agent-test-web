# AWS Agent React App

A modern React web application that connects to AWS Bedrock agents, allowing users to interact with AI agents through a beautiful and intuitive chat interface.

## Features

- 🚀 **Modern React Interface**: Clean, responsive design with real-time chat
- 🔐 **Secure AWS Integration**: Direct connection to AWS Bedrock agents
- 💬 **Real-time Chat**: Interactive messaging with AWS agents
- 🎨 **Beautiful UI**: Modern gradient design with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚙️ **Easy Configuration**: Simple form-based AWS credentials setup

## Prerequisites

Before running this application, you need:

1. **AWS Account** with access to Amazon Bedrock
2. **AWS Bedrock Agent** created and deployed
3. **IAM User** with appropriate Bedrock permissions
4. **Node.js** (version 14 or higher)
5. **npm** or **yarn** package manager

## AWS Setup

### 1. Create a Bedrock Agent

1. Go to the AWS Console → Amazon Bedrock → Agents
2. Click "Create Agent"
3. Configure your agent with:
   - Agent name and description
   - Foundation model (e.g., Claude, Titan)
   - Instructions for the agent
4. Note down the **Agent ID** and **Agent Alias ID**

### 2. Create IAM User and Permissions

1. Go to AWS Console → IAM → Users
2. Create a new user with programmatic access
3. Attach the following policy (or create a custom one):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeAgent",
        "bedrock:InvokeModel",
        "bedrock:GetAgent",
        "bedrock:ListAgents"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Save the **Access Key ID** and **Secret Access Key**

## Installation

1. **Clone or download this project**
2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### 1. Configure AWS Connection

1. Fill in the configuration form on the left panel:

   - **AWS Region**: Select your agent's region
   - **Agent ID**: Your Bedrock agent ID
   - **Agent Alias ID**: Usually "TSTALIASID" for test agents
   - **Access Key ID**: Your IAM user's access key
   - **Secret Access Key**: Your IAM user's secret key
   - **Session ID**: (Optional) Leave empty for auto-generation

2. Click **"Connect to Agent"**

### 2. Start Chatting

1. Once connected, use the chat panel on the right
2. Type your message and press Enter or click Send
3. The agent will respond based on its configuration
4. Chat history is maintained during the session

### 3. Sample Questions

Try asking your agent:

- "What can you help me with?"
- "Tell me about your capabilities"
- "How can I use AWS services effectively?"
- Any domain-specific questions based on your agent's training

## Project Structure

```
src/
├── components/
│   ├── ConfigPanel.js      # AWS configuration form
│   └── ChatPanel.js        # Chat interface
├── services/
│   └── awsService.js       # AWS Bedrock integration
├── App.js                  # Main application component
├── App.css                 # App-specific styles
├── index.js               # React entry point
└── index.css              # Global styles
```

## Configuration Options

### AWS Regions

- US East (N. Virginia) - us-east-1
- US West (Oregon) - us-west-2
- Europe (Ireland) - eu-west-1
- Asia Pacific (Singapore) - ap-southeast-1
- Asia Pacific (Tokyo) - ap-northeast-1

### Environment Variables (Optional)

You can set default values using environment variables:

```bash
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AGENT_ID=your-agent-id
REACT_APP_AGENT_ALIAS_ID=TSTALIASID
```

## Troubleshooting

### Common Issues

1. **Connection Failed**

   - Verify your AWS credentials are correct
   - Check that your IAM user has Bedrock permissions
   - Ensure the agent ID and region are correct

2. **CORS Errors**

   - This app uses direct AWS SDK calls
   - For production, consider implementing a backend proxy
   - Check browser console for detailed error messages

3. **Agent Not Responding**
   - Verify the agent is in "PREPARED" state
   - Check the agent alias is correct
   - Ensure the agent has proper instructions configured

### Error Messages

- **"Not connected to AWS Agent"**: Complete the configuration form first
- **"Connection failed"**: Check your AWS credentials and permissions
- **"Failed to send message"**: Verify agent ID and alias are correct

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit AWS credentials** to version control
2. **Use environment variables** for production deployments
3. **Consider implementing a backend proxy** for production use
4. **Rotate credentials regularly**
5. **Use least-privilege IAM policies**

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Dependencies

- **React 18** - UI framework
- **AWS SDK v3** - AWS Bedrock integration
- **Lucide React** - Icons
- **Create React App** - Build tooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review AWS Bedrock documentation
3. Check browser console for error details
4. Verify AWS agent configuration

---

**Happy chatting with your AWS agents! 🤖✨**
# agent-test-web
