(() => {
	// src/index.js
	addEventListener("fetch", (event) => {
	  event.respondWith(handleRequest(event.request));
	});
	async function handleRequest(request) {
	  const apiUrl = "https://api.cloudflare.com/client/v4/accounts/6dd7e955280ac6088c13797686130f8a/ai/run/@hf/meta-llama/meta-llama-3-8b-instruct";
	  if (request.method === "OPTIONS") {
		return new Response(null, {
		  status: 204,
		  headers: getCorsHeaders()
		});
	  }
	  const systemMessage = await Pi360.get("system-message");
	  if (!systemMessage) {
		return new Response("System message not found", { status: 500, headers: getCorsHeaders() });
	  }
	  let userContent;
	  try {
		const requestBody = await request.json();
		if (requestBody.content) {
		  userContent = requestBody.content;
		} else {
		  return new Response("Invalid request format", { status: 400, headers: getCorsHeaders() });
		}
	  } catch (err) {
		return new Response("Invalid JSON format", { status: 400, headers: getCorsHeaders() });
	  }
	  userContent = "Considering system prompt mention simple MariaDB Server query for " + userContent;
	  const messages = [
		{ "role": "system", "content": systemMessage },
		{ "role": "user", "content": userContent }
	  ];
	  const apiRequest = new Request(apiUrl, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		  "Authorization": `Bearer GuS2-n5DeEsQghTWuSjQ-LDPgXXxhVeKIwRCFA05`
		},
		body: JSON.stringify({ messages })
	  });
	  const response = await fetch(apiRequest);
	  const responseBody = await response.json();
	  let extractedQuery = "";
	  const responseText = responseBody.result.response;
	  const queryMatch = responseText.match(/```([\s\S]*?)```/);
	  if (queryMatch) {
		extractedQuery = queryMatch[1].replace(/\n/g, "").trim();
		const sqlQueryMatch = extractedQuery.match(/SELECT[\s\S]*?;/i);
		if (sqlQueryMatch) {
		  extractedQuery = sqlQueryMatch[0];
		  extractedQuery = extractedQuery.replace(/,/g, ", ").replace(/FROM/g, " FROM ").replace(/WHERE/g, " WHERE ").replace(/LIMIT/g, " LIMIT ").replace(/AND/g, " AND ").replace(/ORDER BY/g, " ORDER BY ").replace(/GROUP BY/g, " GROUP BY ").replace(/HAVING/g, " HAVING ").replace(/UNION/g, " UNION ").replace(/JOIN/g, " JOIN ").replace(/\s+/g, " ").trim();
		}
	  }
	  return new Response(JSON.stringify({ query: extractedQuery }), {
		status: response.status,
		headers: {
		  "Content-Type": "application/json",
		  ...getCorsHeaders()
		  // Add CORS headers here
		}
	  });
	}
	function getCorsHeaders() {
	  return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization"
	  };
	}
  })();
  //# sourceMappingURL=index.js.map
  