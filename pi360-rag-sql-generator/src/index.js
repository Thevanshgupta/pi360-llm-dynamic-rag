(() => {
	// Configurable LLM API endpoints
	const LLM_API_URL = "https://api.cloudflare.com/client/v4/accounts/6dd7e955280ac6088c13797686130f8a/ai/run/@hf/meta-llama/meta-llama-3-8b-instruct";
	const EMBEDDING_API_URL = "https://api.cloudflare.com/client/v4/accounts/6dd7e955280ac6088c13797686130f8a/ai/run/@hf/sentence-transformers/all-MiniLM-L6-v2";
	const API_KEY = "Bearer GuS2-n5DeEsQghTWuSjQ-LDPgXXxhVeKIwRCFA05";
  
	// Schema Configuration
	const SCHEMA_CONFIG = {
		patent: {
		  schema: `
  SELECT
	  t1.PatentCode, t1.Type, t1.Country, t1.PatentTitle, t1.PatentDesc, t1.status,
	  t1.FilingMonthYear, t1.IssueMonthYear, t1.PatentNumber, t1.CoInvestigators,
	  t1.Proof_of_Acceptance_FileName,
	  CONCAT("https://pi360.net/mietjammu/institute_data/records/patent/", IFNULL(t1.Proof_of_Acceptance_FileName, '')) AS 'Proof_of_Acceptance',
	  t1.Paper_FileName,
	  CONCAT("https://pi360.net/mietjammu/institute_data/records/patent/", IFNULL(t1.Paper_FileName, '')) AS 'Paper',
	  t1.FilingYear, t1.SubmitOn, t1.SubmittedBy_UserCode, t1.Verified, t1.Remarks,
	  t1.Verified_On, t1.Verified_by, t1.KAPILA, t1.KAPILA_Approved, t1.KAPILA_Approval_Proof,
	  CONCAT("https://pi360.net/mietjammu/institute_data/records/patent/", IFNULL(t1.KAPILA_Approval_Proof, '')) AS 'KAPILA_Approval',
	  t1.KAPILA_ID, t1.KAPILA_Funds, t1.Technology_Transferred_to, t1.License_Name, t1.Technology_Transfer_Date,
	  t2.IP_Type,
	  t5.order_index, t5.Emp_Code AS Emp_Code_t5, t5.DeptCode,
	  t3.Emp_Code AS Emp_Code_t3, t3.Dept_Code AS Department_Code_t3, t3.DesignationID AS DesignationID_t3,
	  t3.Name AS Name_t3, t3.ActiveUser AS ActiveUser_t3,
	  t4.Department_ID AS Department_ID_t4, t4.Department_Code AS Department_Code_t4,
	  t4.Department_Name AS Department_Name_t4, t4.School_ID AS School_ID_t4
  FROM tbl_patent t1
  LEFT JOIN tbl_ip_types t2 ON t1.Type = t2.ID
  LEFT JOIN tbl_dept_patent t5 ON t1.PatentCode = t5.PatentCode
  LEFT JOIN tbl_profile t3 ON t5.Emp_Code = t3.Emp_Code
  LEFT JOIN tbl_departments t4 ON t3.Dept_Code = t4.Department_ID
  WHERE YEAR(STR_TO_DATE(t1.FilingMonthYear, '%m-%Y')) BETWEEN 2022 AND 2024;
		  `,
		  prompt: `You are a SQL expert for patent data. Generate MariaDB queries using these rules:
			1. Use exact table aliases: t1, t2, t3, t4, t5
			2. Always include relevant JOINs from the schema
			3. Use BETWEEN for date ranges
			4. Prefer exact matches over LIKE
			5. Never use LIMIT`
		},
		workshop: {
		  schema: `
  SELECT
	  t1.Workshop_ID AS Workshop_ID_t1, t1.Workshop_Mode, t1.IPR, t1.IAInnovation, t1.EDP, t1.RM,
	  t1.Financial_Support, t1.Support_Amount, t1.Platform, t1.Venue_Type, t1.Conducting_Agency,
	  t1.Workshop_Duration_Hrs, t1.Workshop_Duration_Days, t1.Workshop_Name, t1.Workshop_Desc,
	  t1.Institute_Agency, t1.Workshop_Venue, t1.Trainer_Code, t1.Start_Date, t1.End_Date, t1.Session,
	  t1.Dept_Code AS Department_Code_t1, t1.Submitted_On AS Submitted_On_t1, t1.DeleteFlag,
	  t1.SubmittedBy_UserCode, t1.Verified AS Verified_t1,
	  t2.Emp_Code AS Emp_Code_t2, t2.Workshop_ID AS Workshop_ID_t2, t2.Dept_Code AS Department_Code_t2,
	  CONCAT("https://pi360.net/mietjammu/institute_data/records/workshop/", IFNULL(t2.Certificates, '')) AS CertificateFileLink,
	  t2.Submitted_On AS Submitted_On_t2, t2.Verified AS Verified_t2, t2.Remarks AS Remarks_t2,
	  t2.Verified_On AS Verified_On_t2, t2.Verified_By AS Verified_By_t2,
	  t3.Emp_Code AS Emp_Code_t3, t3.Dept_Code AS Department_Code_t3, t3.DesignationID AS DesignationID_t3,
	  t3.Name AS Name_t3, t3.ActiveUser AS ActiveUser_t3,
	  t4.Department_ID AS Department_ID_t4, t4.Department_Code AS Department_Code_t4,
	  t4.Department_Name AS Department_Name_t4, t4.School_ID AS School_ID_t4
  FROM tbl_staffdev_workshops_info t1
  LEFT JOIN tbl_staffdev_workshops t2 ON t1.Workshop_ID = t2.Workshop_ID
  LEFT JOIN tbl_profile t3 ON t2.Emp_Code = t3.Emp_Code
  LEFT JOIN tbl_departments t4 ON t3.Dept_Code = t4.Department_ID
  WHERE YEAR(t1.Start_Date) BETWEEN 2022 AND 2024;
		  `,
		  prompt: `You are a SQL expert for workshops. Generate MariaDB queries using these rules:
			1. Use exact table aliases: t1, t2, t3, t4
			2. Always include relevant JOINs from the schema
			3. Use BETWEEN for date ranges
			4. Prefer exact matches over LIKE
			5. never use t1.Verified_t1 only use t1.Verified
			6. Never use LIMIT`
		},
		research: {
		  schema: `
  SELECT
	  t1.ResearchCode, t1.ResearchTitle AS Title, t1.ResearchDesc AS Abstract, t1.PrincipalInvestigator,
	  t1.CoInvestigators, t1.Keywords, t1.ResearchStatus AS PublishedIn, t1.Financial_Support,
	  t1.Support_Amount, t1.PublicationName, t1.ISSN, t1.ISBN, t1.Publication AS PublicationType,
	  t1.ImpactFactor, t1.IndexedIn, t1.PubMonth, t1.PubYear, t1.PaperURL, t1.ResearchGateURL,
	  t1.GoogleScholarURL, t1.DOI, t1.Citations, t1.verified,
	  t3.Emp_Code AS Emp_Code_t3, t3.Dept_Code AS Department_Code_t3, t3.DesignationID AS DesignationID_t3,
	  t3.Name AS Name_t3, t3.ActiveUser AS ActiveUser_t3,
	  t4.Department_ID AS Department_ID_t4, t4.Department_Code AS Department_Code_t4,
	  t4.Department_Name AS Department_Name_t4
  FROM tbl_research t1
  LEFT JOIN research_authors t2 ON t1.ResearchCode = t2.ResearchCode
  LEFT JOIN tbl_profile t3 ON t2.Emp_Code = t3.Emp_Code
  LEFT JOIN tbl_departments t4 ON t3.Dept_Code = t4.Department_ID AND t1.verified = 1;
		  `,
		  prompt: `You are a SQL expert for research. Generate MariaDB queries using these rules:
			1. Use exact table aliases: t1, t2, t3, t4
			2. Always include relevant JOINs from the schema
			3. Use BETWEEN for date ranges where applicable
			4. Prefer exact matches over LIKE
			5. never use t1.Verified_t1 only use t1.Verified
			6. Never use LIMIT`
		},
		training: {
		  schema: `
  SELECT
	  t1.Training_ID AS Training_ID_t1, t1.Training_Mode, t1.IPR, t1.IAInnovation, t1.EDP, t1.RM,
	  t1.Platform, t1.Other_Platform, t1.Venue_Type, t1.Conducting_Agency, t1.Training_Duration_Hrs,
	  t1.Training_Duration_Days, t1.Training_Name, t1.Training_Desc, t1.Institute_Agency,
	  t1.Training_Venue, t1.Start_Date, t1.End_Date, t1.Session, t1.Dept_Code AS Department_Code_t1,
	  t1.Submitted_On AS Submitted_On_t1, t1.DeleteFlag, t1.SubmittedBy_UserCode, t1.Verified AS Verified_t1,
	  t2.Emp_Code AS Emp_Code_t2, t2.Training_ID AS Training_ID_t2, t2.Dept_Code AS Department_Code_t2,
	  CONCAT("https://pi360.net/mietjammu/institute_data/records/training/", IFNULL(t2.Certificates, '')) AS CertificateFileLink,
	  t2.Submitted_On AS Submitted_On_t2, t2.Verified AS Verified_t2, t2.Remarks AS Remarks_t2,
	  t2.Verified_On AS Verified_On_t2, t2.Verified_By AS Verified_By_t2,
	  t3.Emp_Code AS Emp_Code_t3, t3.Dept_Code AS Department_Code_t3, t3.DesignationID AS DesignationID_t3,
	  t3.Name AS Name_t3, t3.ActiveUser AS ActiveUser_t3,
	  t4.Department_ID AS Department_ID_t4, t4.Department_Code AS Department_Code_t4,
	  t4.Department_Name AS Department_Name_t4, t4.School_ID AS School_ID_t4
  FROM tbl_staffdev_training_info t1
  LEFT JOIN tbl_staffdev_training t2 ON t1.Training_ID = t2.Training_ID
  LEFT JOIN tbl_profile t3 ON t2.Emp_Code = t3.Emp_Code
  LEFT JOIN tbl_departments t4 ON t3.Dept_Code = t4.Department_ID
  WHERE YEAR(t1.Start_Date) BETWEEN 2022 AND 2024;
		  `,
		  prompt: `You are a SQL expert for training. Generate MariaDB queries using these rules:
			1. Use exact table aliases: t1, t2, t3, t4
			2. Always include relevant JOINs from the schema
			3. Use BETWEEN for date ranges
			4. Prefer exact matches over LIKE
			5. never use t1.Verified_t1 only use t1.Verified
			6. Never use LIMIT`
		},
		seminar: {
		  schema: `
  SELECT
	  t1.Seminar_ID AS Seminar_ID_t1, t1.Seminar_Mode, t1.IPR, t1.IAInnovation, t1.Platform,
	  t1.Venue_Type, t1.Conducting_Agency, t1.Seminar_Duration_Hrs, t1.Seminar_Duration_Days,
	  t1.Seminar_Name, t1.Seminar_Desc, t1.Institute_Agency, t1.Seminar_Venue, t1.Start_Date,
	  t1.End_Date, t1.Session, t1.Dept_Code AS Department_Code_t1, t1.Submitted_On AS Submitted_On_t1,
	  t1.DeleteFlag, t1.SubmittedBy_UserCode, t1.Verified AS Verified_t1,
	  t2.Emp_Code AS Emp_Code_t2, t2.Seminar_ID AS Seminar_ID_t2, t2.Dept_Code AS Department_Code_t2,
	  CONCAT("https://pi360.net/mietjammu/institute_data/records/seminar/", IFNULL(t2.Certificates, '')) AS CertificateFileLink,
	  t2.Submitted_On AS Submitted_On_t2, t2.Verified AS Verified_t2, t2.Remarks AS Remarks_t2,
	  t2.Verified_On AS Verified_On_t2, t2.Verified_By AS Verified_By_t2,
	  t3.Emp_Code AS Emp_Code_t3, t3.Dept_Code AS Department_Code_t3, t3.DesignationID AS DesignationID_t3,
	  t3.Name AS Name_t3, t3.ActiveUser AS ActiveUser_t3,
	  t4.Department_ID AS Department_ID_t4, t4.Department_Code AS Department_Code_t4,
	  t4.Department_Name AS Department_Name_t4, t4.School_ID AS School_ID_t4
  FROM tbl_staffdev_seminar_info t1
  LEFT JOIN tbl_staffdev_seminar t2 ON t1.Seminar_ID = t2.Seminar_ID
  LEFT JOIN tbl_profile t3 ON t2.Emp_Code = t3.Emp_Code
  LEFT JOIN tbl_departments t4 ON t3.Dept_Code = t4.Department_ID
  WHERE YEAR(t1.Start_Date) BETWEEN 2022 AND 2024;
		  `,
		  prompt: `You are a SQL expert for seminars. Generate MariaDB queries using these rules:
			1. Use exact table aliases: t1, t2, t3, t4
			2. Always include relevant JOINs from the schema
			3. Use BETWEEN for date ranges
			4. Prefer exact matches over LIKE
			5. never use t1.Verified_t1 only use t1.Verified
			6. Never use LIMIT`
		},
		conference: {
		  schema: `
  SELECT
	  t1.conference_ID AS conference_ID_t1, t1.conference_Name, t1.conference_Desc, t1.Institute_Agency,
	  t1.conference_Venue, t1.Start_Date, t1.End_Date, t1.Session, t1.Dept_Code AS Department_Code_t1,
	  t1.Submitted_On AS Submitted_On_t1, t1.DeleteFlag, t1.SubmittedBy_UserCode, t1.Verified AS Verified_t1,
	  t2.Emp_Code AS Emp_Code_t2, t2.conference_ID AS conference_ID_t2, t2.Dept_Code AS Department_Code_t2,
	  CONCAT("https://pi360.net/mietjammu/institute_data/records/conferences/", IFNULL(t2.Certificates, '')) AS CertificateFileLink,
	  t2.Submitted_On AS Submitted_On_t2, t2.Verified AS Verified_t2, t2.Remarks AS Remarks_t2,
	  t2.Verified_On AS Verified_On_t2, t2.Verified_By AS Verified_By_t2,
	  t3.Emp_Code AS Emp_Code_t3, t3.Dept_Code AS Department_Code_t3, t3.DesignationID AS DesignationID_t3,
	  t3.Name AS Name_t3, t3.ActiveUser AS ActiveUser_t3,
	  t4.Department_ID AS Department_ID_t4, t4.Department_Code AS Department_Code_t4,
	  t4.Department_Name AS Department_Name_t4, t4.School_ID AS School_ID_t4
  FROM tbl_staffdev_conference_info t1
  LEFT JOIN tbl_staffdev_conference t2 ON t1.conference_ID = t2.conference_ID
  LEFT JOIN tbl_profile t3 ON t2.Emp_Code = t3.Emp_Code
  LEFT JOIN tbl_departments t4 ON t3.Dept_Code = t4.Department_ID
  WHERE YEAR(t1.Start_Date) BETWEEN 2022 AND 2024;
		  `,
		  prompt: `You are a SQL expert for conferences. Generate MariaDB queries using these rules:
			1. Use exact table aliases: t1, t2, t3, t4
			2. Always include relevant JOINs from the schema
			3. Use BETWEEN for date ranges
			4. Prefer exact matches over LIKE
			5. never use t1.Verified_t1 only use t1.Verified
			6. Never use LIMIT`
		}
	  };
  
	// Embedding function with error handling
	async function getEmbedding(text) {
	  try {
		const response = await fetch(EMBEDDING_API_URL, {
		  method: "POST",
		  headers: { "Content-Type": "application/json", "Authorization": API_KEY },
		  body: JSON.stringify({ text })
		});
  
		if (!response.ok) {
		  const errorText = await response.text();
		  throw new Error(`Embedding API failed: ${response.status} - ${errorText}`);
		}
  
		const data = await response.json();
		console.log(`Embedding API response for "${text}":`, data);
  
		if (!data || !data.result || !data.result.embedding) {
		  throw new Error(`Invalid embedding response for "${text}": missing embedding data`);
		}
  
		return data.result.embedding;
	  } catch (error) {
		console.error("getEmbedding Error:", error.message);
		throw error;
	  }
	}
  
	// Cosine similarity for vector comparison
	function cosineSimilarity(vecA, vecB) {
	  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
	  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
	  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
	  return dotProduct / (magA * magB);
	}
  
	// Find the best schema match using embeddings
	async function findBestSchema(userSchemaName) {
	  const schemaNames = Object.keys(SCHEMA_CONFIG);
	  let matchedSchema = userSchemaName;
  
	  // If userSchemaName is not an exact match, use embeddings
	  if (!SCHEMA_CONFIG[userSchemaName]) {
		try {
		  const userEmbedding = await getEmbedding(userSchemaName);
		  let bestMatch = null;
		  let highestSimilarity = -1;
  
		  for (const schemaName of schemaNames) {
			const schemaEmbedding = await getEmbedding(schemaName);
			const similarity = cosineSimilarity(userEmbedding, schemaEmbedding);
			console.log(`Similarity between "${userSchemaName}" and "${schemaName}": ${similarity}`);
			if (similarity > highestSimilarity) {
			  highestSimilarity = similarity;
			  bestMatch = schemaName;
			}
		  }
  
		  if (highestSimilarity > 0.8) { // Threshold for a good match
			matchedSchema = bestMatch;
		  }
		} catch (error) {
		  console.error("Embedding match failed, falling back to default:", error.message);
		}
	  }
  
	  return matchedSchema in SCHEMA_CONFIG ? matchedSchema : null;
	}
  
	async function handleRequest(request) {
	  if (request.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: getCorsHeaders() });
	  }
  
	  try {
		const { schemaName, content } = await request.json();
		if (!content) throw new Error("Missing content");
  
		const matchedSchemaName = await findBestSchema(schemaName || "workshop"); // Default to "workshop" if null
		if (!matchedSchemaName) throw new Error(`Invalid schemaName: ${schemaName}`);
  
		const { schema, prompt } = SCHEMA_CONFIG[matchedSchemaName];
		const systemPrompt = `${prompt}\nSchema: ${schema}`;
		console.log(`Matched schema: ${matchedSchemaName}, content: ${content}`);
  
		const messages = [
		  { role: "system", content: systemPrompt },
		  { role: "user", content: `Generate SQL for: ${content}` }
		];
  
		const response = await fetch(LLM_API_URL, {
		  method: "POST",
		  headers: { "Content-Type": "application/json", "Authorization": API_KEY },
		  body: JSON.stringify({ messages })
		});
  
		if (!response.ok) throw new Error(`LLM API error: ${response.statusText}`);
  
		const { result } = await response.json();
		const rawQuery = extractSQL(result.response);
		const cleanQuery = normalizeSQL(rawQuery);
  
		console.log(`Generated SQL: ${cleanQuery}`);
		return new Response(JSON.stringify({ query: cleanQuery }), {
		  headers: { "Content-Type": "application/json", ...getCorsHeaders() }
		});
	  } catch (error) {
		console.error("HandleRequest Error:", error.message);
		return new Response(JSON.stringify({ error: error.message, details: error.stack }), {
		  status: 400,
		  headers: getCorsHeaders()
		});
	  }
	}
  
	function extractSQL(text) {
	  const codeBlock = text.match(/```sql([\s\S]*?)```/i);
	  return codeBlock ? codeBlock[1].trim() : text;
	}
  
	function normalizeSQL(query) {
	  let normalized = query
		.replace(/`/g, '')
		.replace(/\bLIMIT \d+/gi, '')
		.replace(/\s+/g, ' ')
		.replace(/(SELECT|FROM|WHERE|JOIN|AND|OR)/g, '\n$1')
		.trim();
  
	  if (!normalized.toUpperCase().startsWith("SELECT")) {
		throw new Error("Generated query must start with SELECT");
	  }
	  return normalized;
	}
  
	function getCorsHeaders() {
	  return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type"
	  };
	}
  
	addEventListener("fetch", (event) => {
	  event.respondWith(handleRequest(event.request));
	});
  })();