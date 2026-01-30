# Dev³ - Setup & Configuration Guide

This guide details how to set up, configure, and run the Dev³ autonomous AI agent system locally.

## Prerequisities

- **Node.js**: Version 20 or higher is recommended.
- **npm** (or pnpm/yarn): Package manager.
- **Git**: For version control.

## Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

## Configuration

The system uses environment variables for configuration. You need to create a `.env` file in the root directory.

1.  **Create `.env` File**
    Copy the example or create a new file named `.env` in the project root:
    ```bash
    touch .env
    ```

2.  **Configure Environment Variables**
    Add the following content to your `.env` file. You **must** configure the AI API settings.

    ```env
    # ------------------------------
    # AI API Configuration (Required)
    # ------------------------------
    # Base URL for the OpenAI-compatible API (e.g., OpenRouter, NewAPI, OneAPI)
    # MUST end with /v1
    AI_INTEGRATIONS_OPENROUTER_BASE_URL=https://api.openai.com/v1

    # Your API Key (sk-...)
    # This key must have access to: gpt-4o-mini, claude-3-5-haiku, grok-beta, deepseek-chat, qwen-turbo
    AI_INTEGRATIONS_OPENROUTER_API_KEY=sk-your-api-key-here

    # ------------------------------
    # AI Model Configuration (Optional)
    # ------------------------------
    # Override default model IDs if needed
    # AI_MODEL_GROK=x-ai/grok-3-mini-beta
    # AI_MODEL_CHATGPT=openai/gpt-4o-mini
    # AI_MODEL_CLAUDE=anthropic/claude-3.5-haiku:beta
    # AI_MODEL_DEEPSEEK=deepseek/deepseek-chat
    # AI_MODEL_QWEN=qwen/qwen-turbo

    # ------------------------------
    # Server Configuration (Optional)
    # ------------------------------
    # Port to run the server on (default: 5000)
    PORT=5000

    # ------------------------------
    # Solana Configuration (Optional)
    # ------------------------------
    # RPC URL for Solana connection (default: https://api.mainnet-beta.solana.com)
    SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
    ```

## Running the Application

### Development Mode
Use this for local development. It uses `tsx` to run TypeScript files directly with hot-reloading.

```bash
npm run dev
```
*The server will start on http://localhost:5000*

### Production Build
Use this for deployment.

1.  **Build the project**
    ```bash
    npm run build
    ```

2.  **Start the server**
    ```bash
    npm start
    ```

## Important Notes

### 1. Wallet Management
- The system automatically manages a local Solana wallet.
- **Private Key**: The wallet's private key is stored locally (typically in a file like `.dev3-wallet.json` or managed via the internal wallet logic).
- **Security Warning**: Ensure `.dev3-wallet.json` is added to your `.gitignore` to prevent accidental upload to public repositories.

### 2. Database / Storage
- **Current Mode**: The system currently defaults to **In-Memory Storage** (`MemStorage`).
- **Data Persistence**: Data (decisions, logs) will be reset when the server restarts.
- **Production DB**: The dependencies include `pg` and `drizzle-orm`. To switch to a persistent PostgreSQL database, you would need to configure a `DATABASE_URL` and switch the storage implementation in `server/storage.ts` (this requires code modification).

### 3. AI Models
The system is configured to use the following 5 multi-agent personas. Ensure your API provider supports these model IDs or map them in `server/ai-deliberation.ts`:
- `x-ai/grok-3-mini-beta` (Grok)
- `openai/gpt-4o-mini` (ChatGPT)
- `anthropic/claude-3.5-haiku:beta` (Claude)
- `deepseek/deepseek-chat` (DeepSeek)
- `qwen/qwen-turbo` (Qwen)
