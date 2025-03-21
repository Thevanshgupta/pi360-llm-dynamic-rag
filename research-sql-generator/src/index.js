(() => {
	// src/index.js
	addEventListener("fetch", (event) => {
	  event.respondWith(handleRequest(event.request));
	});
  
	// Research paper-specific schema and rules
	const RESEARCH_SCHEMA = `
	  SELECT 
    t1.ResearchCode, 
    t1.ResearchTitle AS Title,
    t1.ResearchDesc AS Abstract, 
    t1.PrincipalInvestigator,
    t1.CoInvestigators, 
    t1.Keywords,
    t1.ResearchStatus AS PublishedIn,
    t1.Financial_Support, 
    t1.Support_Amount, 
    t1.PublicationName, 
    t1.ISSN, 
    t1.ISBN, 
    t1.Publication AS PublicationType, 
    t1.ImpactFactor,
    t1.IndexedIn,
    t1.PubMonth, 
    t1.PubYear, 
    t1.PaperURL, 
    t1.ResearchGateURL,
    t1.GoogleScholarURL, 
    t1.DOI, 
    t1.Citations,
 t1.verified, 
    
    t3.Emp_Code AS Emp_Code_t3, 
    t3.Dept_Code AS Department_Code_t3, 
    t3.DesignationID AS DesignationID_t3, 
    t3.Name AS Name_t3, 
    t3.ActiveUser AS ActiveUser_t3,
    t4.Department_ID AS Department_ID_t4, 
    t4.Department_Code AS Department_Code_t4, 
    t4.Department_Name AS Department_Name_t4
FROM tbl_research t1
LEFT JOIN research_authors t2 ON t1.ResearchCode = t2.ResearchCode
LEFT JOIN tbl_profile t3 ON t2.Emp_Code = t3.Emp_Code
LEFT JOIN tbl_departments t4 ON t3.Dept_Code = t4.Department_ID and t1.verified=1

	`;
  
	const SYSTEM_PROMPT = `You are a SQL expert specialized in research paper data. 
	  Generate MariaDB queries using these rules:
	  1. Use exact table aliases: t1, t2, t3, t4
	  2. Always include relevant JOINs from the schema
	  3. Use BETWEEN for date ranges
	  4. Prefer exact matches over LIKE
	  5. Never use LIMIT
	  6. Schema: ${RESEARCH_SCHEMA}`;
  
	async function handleRequest(request) {
	  // Handle CORS preflight
	  if (request.method === "OPTIONS") {
		return new Response(null, {
		  status: 204,
		  headers: getCorsHeaders(),
		});
	  }
  
	  try {
		// Parse request
		const { content } = await request.json();
		if (!content) throw new Error("Missing content");
  
		// Prepare LLM messages
		const messages = [
		  { role: "system", content: SYSTEM_PROMPT },
		  { role: "user", content: `Generate SQL for: ${content}` },
		];
  
		// Call LLM API
		const response = await fetch(
		  "https://api.cloudflare.com/client/v4/accounts/6dd7e955280ac6088c13797686130f8a/ai/run/@hf/meta-llama/meta-llama-3-8b-instruct",
		  {
			method: "POST",
			headers: {
			  "Content-Type": "application/json",
			  Authorization: "Bearer GuS2-n5DeEsQghTWuSjQ-LDPgXXxhVeKIwRCFA05",
			},
			body: JSON.stringify({ messages }),
		  }
		);
  
		// Process response
		const { result } = await response.json();
		const rawQuery = extractSQL(result.response);
		const cleanQuery = normalizeSQL(rawQuery);
  
		return new Response(JSON.stringify({ query: cleanQuery }), {
		  headers: {
			"Content-Type": "application/json",
			...getCorsHeaders(),
		  },
		});
	  } catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
		  status: 400,
		  headers: getCorsHeaders(),
		});
	  }
	}
  
	// Helper functions
	function extractSQL(text) {
	  const codeBlock = text.match(/```sql([\s\S]*?)```/i);
	  return codeBlock ? codeBlock[1].trim() : text;
	}
  
	function normalizeSQL(query) {
	  return query
		.replace(/`/g, "")
		.replace(/\bLIMIT \d+/gi, "")
		.replace(/\s+/g, " ")
		.replace(/(SELECT|FROM|WHERE|JOIN|AND|OR)/g, "\n$1")
		.trim();
	}
  
	function getCorsHeaders() {
	  return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
	  };
	}
  })();