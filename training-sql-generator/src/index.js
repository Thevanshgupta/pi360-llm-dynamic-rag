(() => {
	// Training-specific schema and rules
	const TRAINING_SCHEMA = `
	  SELECT
 -- Columns from tbl_staffdev_training_info
    t1.Training_ID AS Training_ID_t1,
    t1.Training_Mode, -- (Online/Offline)
    t1.IPR, -- (Yes/No) whether the training was on Intellectual property rights
    t1.IAInnovation, -- (Yes/No) whether the training was on Industry-Academia Innovative practices
    t1.EDP, -- (Yes/No) whether the training was on Entrepreneurship
    t1.RM, -- (Yes/No) whether the training was on Research Methodology
    t1.Platform, -- If online, platform name
    t1.Other_Platform,
    t1.Venue_Type, -- Internal/External
    t1.Conducting_Agency,
    t1.Training_Duration_Hrs, -- Duration in hours
    t1.Training_Duration_Days, -- Duration in days
    t1.Training_Name, -- Name of workshop
    t1.Training_Desc, -- Description
    t1.Institute_Agency,
    t1.Training_Venue,
    t1.Start_Date,
    t1.End_Date,
    t1.Session,
    t1.Dept_Code AS Department_Code_t1,  
    t1.Submitted_On AS Submitted_On_t1,
    t1.DeleteFlag,
    t1.SubmittedBy_UserCode,
    t1.Verified AS Verified_t1, -- Ensure this column exists in your table
 -- Columns from tbl_staffdev_training
    t2.Emp_Code AS Emp_Code_t2,
    t2.Training_ID AS Training_ID_t2,
    t2.Dept_Code AS Department_Code_t2,
    CONCAT("https://pi360.net/mietjammu/institute_data/records/training/", IFNULL(t2.Certificates, '')) AS CertificateFileLink,
    t2.Submitted_On AS Submitted_On_t2,
    t2.Verified AS Verified_t2,
    t2.Remarks AS Remarks_t2,
    t2.Verified_On AS Verified_On_t2,
    t2.Verified_By AS Verified_By_t2,
 -- Columns from tbl_profile   
t3.Emp_Code AS Emp_Code_t3,
    t3.Dept_Code AS Department_Code_t3,
    t3.DesignationID AS DesignationID_t3,
    t3.Name AS Name_t3,
    t3.ActiveUser AS ActiveUser_t3,
 -- Columns from tbl_departments
    t4.Department_ID AS Department_ID_t4,
    t4.Department_Code AS Department_Code_t4,
    t4.Department_Name AS Department_Name_t4,
    t4.School_ID AS School_ID_t4
FROM tbl_staffdev_training_info t1
LEFT JOIN tbl_staffdev_training t2
    ON t1.Training_ID = t2.Training_ID
LEFT JOIN tbl_profile t3
    ON t2.Emp_Code = t3.Emp_Code
LEFT JOIN tbl_departments t4
    ON t3.Dept_Code = t4.Department_ID
WHERE YEAR(t1.Start_Date) BETWEEN 2022 AND 2024;
	`;
  
	const SYSTEM_PROMPT = `You are a SQL expert specialized in Training data. 
	  Generate MariaDB queries using these rules:
	  1. Use exact table aliases: t1, t2, t3, t4
	  2. Always include relevant JOINs from the schema
	  3. Use BETWEEN for date ranges
	  4. Prefer exact matches over LIKE
	  5. Never use LIMIT
	  6. Schema: ${TRAINING_SCHEMA}
	  7. t1.Verified AS Verified_t1, -- Ensure this column exists in your table`;
  
	addEventListener("fetch", (event) => {
	  event.respondWith(handleRequest(event.request));
	});
  
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
  
		// Validate SQL query
		if (!rawQuery.toLowerCase().includes("select")) {
		  throw new Error("Generated query is invalid - missing SELECT statement");
		}
  
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