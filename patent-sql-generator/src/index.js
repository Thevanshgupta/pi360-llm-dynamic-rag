(() => {
	// src/index.js
	addEventListener("fetch", (event) => {
	  event.respondWith(handleRequest(event.request));
	});
  
	// Workshop-specific schema and rules
	const WORKSHOP_SCHEMA = `
	  SELECT
-- columns from tbl_patent
t1.PatentCode,
t1.Type,
t1.Country,
t1.PatentTitle,
t1.PatentDesc,
t1.status, -- can be ['Filed','Granted','Refused','Published','Licensed','Commercialized']
t1.FilingMonthYear,
t1.IssueMonthYear,
t1.PatentNumber, -- unique number for each patent
t1.CoInvestigators,
t1.Proof_of_Acceptance_FileName,
CONCAT("https://pi360.net/mietjammu/institute_data/records/patent/", IFNULL(t1.Proof_of_Acceptance_FileName, '')) AS 'Proof_of_Acceptance',
t1.Paper_FileName,
CONCAT("https://pi360.net/mietjammu/institute_data/records/patent/", IFNULL(t1.Paper_FileName, '')) AS 'Paper',
t1.FilingYear,
t1.SubmitOn,
t1.SubmittedBy_UserCode,
t1.Verified, -- 0 for pending, 1 for verified, 2 for rejected
t1.Remarks,
t1.Verified_On,
t1.Verified_by,
t1.KAPILA, 
t1.KAPILA_Approved, -- 0 for no, 1 for yes
t1.KAPILA_Approval_Proof	,
CONCAT("https://pi360.net/mietjammu/institute_data/records/patent/", IFNULL(t1.KAPILA_Approval_Proof, '')) AS 'KAPILA_Approval',
t1.KAPILA_ID,
t1.KAPILA_Funds,
t1.Technology_Transferred_to,
t1.License_Name,
t1.Technology_Transfer_Date,


-- columns from tbl_ip_types (alias t2)
t2.IP_Type,


-- columns from tbl_dept_patent (alias t5)
t5.order_index,
t5.Emp_Code AS Emp_Code_t5,  
t5.DeptCode,


-- columns from tbl_profile (alias t3)
t3.Emp_Code AS Emp_Code_t3,  
t3.Dept_Code AS Department_Code_t3,
t3.DesignationID AS DesignationID_t3,
t3.Name AS Name_t3,
t3.ActiveUser AS ActiveUser_t3,


-- columns from tbl_departments (alias t4)
t4.Department_ID AS Department_ID_t4,
t4.Department_Code AS Department_Code_t4,
t4.Department_Name AS Department_Name_t4,
t4.School_ID AS School_ID_t4


FROM tbl_patent t1
LEFT JOIN tbl_ip_types t2
    ON t1.Type = t2.ID
LEFT JOIN tbl_dept_patent t5
    ON t1.PatentCode = t5.PatentCode
LEFT JOIN tbl_profile t3
    ON t5.Emp_Code = t3.Emp_Code
LEFT JOIN tbl_departments t4
    ON t3.Dept_Code = t4.Department_ID


WHERE YEAR(STR_TO_DATE(t1.FilingMonthYear, '%m-%Y')) BETWEEN 2022 AND 2024;
	`;
  
	const SYSTEM_PROMPT = `You are a SQL expert specialized in Patents data. 
	  Generate MariaDB queries using these rules:
	  1. Use exact table aliases: t1, t2, t3, t4, t5
	  2. Always include relevant JOINs from the schema
	  3. Use BETWEEN for date ranges
	  4. Prefer exact matches over LIKE
	  5. Never use LIMIT
	  6. Schema: ${WORKSHOP_SCHEMA}`;
  
	async function handleRequest(request) {
	  // Handle CORS preflight
	  if (request.method === "OPTIONS") {
		return new Response(null, {
		  status: 204,
		  headers: getCorsHeaders()
		});
	  }
  
	  try {
		// Parse request
		const { content } = await request.json();
		if (!content) throw new Error("Missing content");
  
		// Prepare LLM messages
		const messages = [
		  { role: "system", content: SYSTEM_PROMPT },
		  { role: "user", content: `Generate SQL for: ${content}` }
		];
  
		// Call LLM API
		const response = await fetch(
		  "https://api.cloudflare.com/client/v4/accounts/6dd7e955280ac6088c13797686130f8a/ai/run/@hf/meta-llama/meta-llama-3-8b-instruct",
		  {
			method: "POST",
			headers: {
			  "Content-Type": "application/json",
			  "Authorization": "Bearer GuS2-n5DeEsQghTWuSjQ-LDPgXXxhVeKIwRCFA05"
			},
			body: JSON.stringify({ messages })
		  }
		);
  
		// Process response
		const { result } = await response.json();
		const rawQuery = extractSQL(result.response);
		const cleanQuery = normalizeSQL(rawQuery);
  
		return new Response(JSON.stringify({ query: cleanQuery }), {
		  headers: {
			"Content-Type": "application/json",
			...getCorsHeaders()
		  }
		});
  
	  } catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
		  status: 400,
		  headers: getCorsHeaders()
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
		.replace(/`/g, '')
		.replace(/\bLIMIT \d+/gi, '')
		.replace(/\s+/g, ' ')
		.replace(/(SELECT|FROM|WHERE|JOIN|AND|OR)/g, '\n$1')
		.trim();
	}
  
	function getCorsHeaders() {
	  return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization"
	  };
	}
  })();