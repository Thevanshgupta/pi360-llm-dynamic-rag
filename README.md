PI360 SQL Generator Chatbot

This project includes a Cloudflare Worker for generating SQL queries using AI and embeddings, and a React-based chatbot frontend for user interaction. It processes natural language queries, matches them to schemas with embeddings, generates SQL, fetches data, and displays results in a styled UI.

Features:
- Cloudflare Worker: Generates SQL using Workers AI (LLM and embeddings).
- React Chatbot: UI with section selection, query input, SQL display, embeddings, and data tables.
- Embedding Support: Uses @cf/baai/bge-small-en-v1.5 for schema matching.
- Data Export: Export results as CSV.
- Error Handling: Fallbacks for embedding failures and API errors.

        ├── worker.js           # Cloudflare Worker script
        ├── src/
        │   ├── Chatbot.js      # React component
        │   ├── Chatbot.css     # Styles for the chatbot
        └── README.md           # This file
Prerequisites:
- Cloudflare Account: With Workers and Workers AI enabled.
- Node.js: For running React app locally (requires npm).
- Wrangler: Cloudflare CLI tool (install with: npm install -g wrangler).
- API Token: Cloudflare API token with "Workers AI" permissions.

Setup:

1. Cloudflare Worker
   a. Update Configuration:
      - Open worker.js.
      - Replace placeholders:
         const LLM_API_URL = "https://api.cloudflare.com/client/v4/accounts/YOUR_CORRECT_ACCOUNT_ID/ai/run/@hf/meta-llama/meta-llama-3-8b-instruct";
        const EMBEDDING_API_URL = "https://api.cloudflare.com/client/v4/accounts/YOUR_CORRECT_ACCOUNT_ID/ai/run/@cf/baai/bge-small-en-v1.5";
        const API_KEY = "Bearer YOUR_CORRECT_API_KEY";
        - YOUR_CORRECT_ACCOUNT_ID: Find in Cloudflare Dashboard -> Workers -> Overview.
        - YOUR_CORRECT_API_KEY: Generate in Dashboard -> API Tokens.
      - Update SCHEMA_CONFIG with your database schemas:
        const SCHEMA_CONFIG = {
          workshop: { schema: `SELECT t1.Workshop_ID, t1.Title, t1.Year FROM workshops t1`, prompt: `You are a SQL expert for workshops...` },
          // Add other schemas
        };

   b. Deploy Worker:
      - Run: wrangler deploy worker.js --name pi360-rag-sql-generator
      - Deployed URL: https://pi360-rag-sql-generator.YOUR_USERNAME.workers.dev

   c. Test Worker:
      - Run: curl -X POST -H "Content-Type: application/json" -d '{"schemaName": "workshop", "content": "How many workshops in 2024?"}' https://pi360-rag-sql-generator.YOUR_USERNAME.workers.dev
      - Expected output:
        {"query": "SELECT COUNT(*) FROM workshops WHERE year = 2024"}

2. React Chatbot
   a. Setup Project:
      - Create React app: npx create-react-app pi360-chatbot
      - Navigate: cd pi360-chatbot
      - Replace src/App.js with Chatbot.js, add Chatbot.css to src/.

   b. Install Dependencies:
      - No extra dependencies beyond standard React.

   c. Update Worker URL:
      - In Chatbot.js, set WORKER_URLS:
        const WORKER_URLS = {
          workshop: 'https://pi360-rag-sql-generator.YOUR_USERNAME.workers.dev',
          // Update other sections
        };

   d. Run Locally:
      - Start: npm start
      - Open: http://localhost:3000

Usage:
1. Select a Section: Click a button (e.g., "Workshops") to set the schema.
2. Enter a Query: Type a query (e.g., "How many workshops in 2024?").
3. View Results: See SQL, beautified response, embeddings, and data table. Export as CSV with "Export CSV".
4. Debugging: Use browser console (F12 -> Console) or Cloudflare Worker logs.

        Example Output:
        Generated SQL: SELECT COUNT(*) FROM workshops WHERE year = 2024
        The count of workshops in 2024 is 18.
[Data Table with results]

Troubleshooting:

Worker Issues:
- "No route for that URI" Error:
  - Verify YOUR_CORRECT_ACCOUNT_ID and API_KEY.
  - Test embedding API: curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_CORRECT_API_KEY" -d '{"text": "workshop"}' https://api.cloudflare.com/client/v4/accounts/YOUR_CORRECT_ACCOUNT_ID/ai/run/@cf/baai/bge-small-en-v1.5
  - Check model support in Cloudflare Workers AI docs.

- Embeddings Show "N/A":
  - Check Cloudflare logs (Dashboard -> Workers -> Logs) for:
    - "Embedding API response: ..."
    - "getEmbedding Error: ..."
  - Confirm EMBEDDING_API_URL matches tested curl command.

React Issues:
- "Failed to fetch":
  - Verify Worker URL in WORKER_URLS.
  - Ensure CORS headers in worker.js (getCorsHeaders).
- No Data Table:
  - Check chat.php response (response_code === "200").

Dependencies:
- Cloudflare Workers: Backend and AI inference.
- React: Frontend framework (v17+ recommended).
- Wrangler: CLI for deploying Workers.

Notes:
- Replace schema placeholders in SCHEMA_CONFIG with your database schemas.
- Worker falls back to exact schema matching if embeddings fail.
- CSS provides a clean, modern UI with animations.

Contributing:
Fork, submit issues, or PRs to improve the project.

License:
MIT License - Free to use, modify, and distribute.
