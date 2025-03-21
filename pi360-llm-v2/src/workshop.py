def generate_workshop_query(user_query):
    """
    Generates an SQL query for workshop details based on the user's question.
    
    Args:
        user_query (str): The user's question about workshops.
    
    Returns:
        str: The generated SQL query.
    """
    # Base SQL query template
    base_query = """
    SELECT
        t1.Workshop_ID AS Workshop_ID_t1,
        t1.Workshop_Mode,
        t1.IPR,
        t1.IAInnovation,
        t1.EDP,
        t1.RM,
        t1.Financial_Support,
        t1.Support_Amount,
        t1.Platform,
        t1.Venue_Type,
        t1.Conducting_Agency,
        t1.Workshop_Duration_Hrs,
        t1.Workshop_Duration_Days,
        t1.Workshop_Name,
        t1.Workshop_Desc,
        t1.Institute_Agency,
        t1.Workshop_Venue,
        t1.Trainer_Code,
        t1.Start_Date,
        t1.End_Date,
        t1.Session,
        t1.Dept_Code AS Department_Code_t1,
        t1.Submitted_On AS Submitted_On_t1,
        t1.DeleteFlag,
        t1.SubmittedBy_UserCode,
        t1.Verified AS Verified_t1,
        t2.Emp_Code AS Emp_Code_t2,
        t2.Workshop_ID AS Workshop_ID_t2,
        t2.Dept_Code AS Department_Code_t2,
        CONCAT("https://pi360.net/mietjammu/institute_data/records/workshop/", IFNULL(t2.Certificates, '')) AS CertificateFileLink,
        t2.Submitted_On AS Submitted_On_t2,
        t2.Verified AS Verified_t2,
        t2.Remarks AS Remarks_t2,
        t2.Verified_On AS Verified_On_t2,
        t2.Verified_By AS Verified_By_t2,
        t3.Emp_Code AS Emp_Code_t3,
        t3.Dept_Code AS Department_Code_t3,
        t3.DesignationID AS DesignationID_t3,
        t3.Name AS Name_t3,
        t3.ActiveUser AS ActiveUser_t3,
        t4.Department_ID AS Department_ID_t4,
        t4.Department_Code AS Department_Code_t4,
        t4.Department_Name AS Department_Name_t4,
        t4.School_ID AS School_ID_t4
    FROM tbl_staffdev_workshops_info t1
    LEFT JOIN tbl_staffdev_workshops t2
        ON t1.Workshop_ID = t2.Workshop_ID
    LEFT JOIN tbl_profile t3
        ON t2.Emp_Code = t3.Emp_Code
    LEFT JOIN tbl_departments t4
        ON t3.Dept_Code = t4.Department_ID
    WHERE YEAR(t1.Start_Date) BETWEEN 2022 AND 2024
    """

    # Add conditions based on the user's query
    conditions = []

    if "online" in user_query.lower():
        conditions.append("t1.Workshop_Mode = 'Online'")
    if "offline" in user_query.lower():
        conditions.append("t1.Workshop_Mode = 'Offline'")
    if "IPR" in user_query.upper():
        conditions.append("t1.IPR = 'Yes'")
    if "entrepreneurship" in user_query.lower():
        conditions.append("t1.EDP = 'Yes'")
    if "research methodology" in user_query.lower():
        conditions.append("t1.RM = 'Yes'")
    if "industry-academia" in user_query.lower():
        conditions.append("t1.IAInnovation = 'Yes'")
    if "financial support" in user_query.lower():
        conditions.append("t1.Financial_Support = 'Yes'")
    if "certificate" in user_query.lower():
        conditions.append("t2.Certificates IS NOT NULL")
    if "department" in user_query.lower():
        # Extract department name from the query (example: "workshops in Computer Science")
        department_keywords = ["computer science", "electrical", "mechanical", "civil"]
        for keyword in department_keywords:
            if keyword in user_query.lower():
                conditions.append(f"t4.Department_Name LIKE '%{keyword.title()}%'")
                break

    # Combine conditions into the WHERE clause
    if conditions:
        base_query += " AND " + " AND ".join(conditions)

    return base_query