const pool = require('../db');

async function createPatient(cleanedData, values, formattedbirthdDate) {

        const checkSql = `SELECT * FROM patients WHERE first_name = $1 AND last_name = $2 AND birthdate = $3`;
        const checkValues = [cleanedData.first_name, cleanedData.last_name, formattedbirthdDate];
        
        const existing = await pool.query(checkSql, checkValues);

        const sql = `INSERT INTO patients (first_name, middle_initial, last_name, birthdate, gender, contact_number, medical_history, building_number, street_name, barangay_subdivision, city_municipality, province, postal_code, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`;
   
        const result = await pool.query(sql, values);

        return { patient: result.rows[0] };   
}

async function getAllPatients({ page, limit, sortBy, sortOrder, filterBy, filterValue, dateRange, dateFrom, dateTo })
{
    try {
        const offset = (page - 1) * limit;
        let query = `SELECT * FROM patients`;
        let countQuery = `SELECT COUNT(*) FROM patients`;
        let whereClauses = [];
        let values = [];
        let i = 1;
        const countValues = values.slice(0, i - 1);

        if (filterBy && filterValue) {
            whereClauses.push(`${filterBy} ILIKE $${i}`);
            values.push(`%${filterValue}%`);
            i++;
        }        
        
        if (dateRange === "today") {
            dateCondition = `created_at::date = CURRENT_DATE`;
        } else if (dateRange === "week") {
            dateCondition = `created_at >= date_trunc('week', CURRENT_DATE)`;
        } else if (dateRange === "month") {
            dateCondition = `created_at >= date_trunc('month', CURRENT_DATE)`;
        } else if (dateRange === "year") {
            dateCondition = `created_at >= date_trunc('year', CURRENT_DATE)`;
        }

        if (dateFrom && dateTo) {
            dateCondition = `created_at BETWEEN $${i} AND $${i+1}`
            values.push(dateFrom, dateTo);
            i++;
        } else if (dateFrom) {
            dateCondition = `created_at >= $${i}`;
            values.push(dateFrom);
            i++;
        } else if (dateTo) {
            dateCondition = `created_at <= $${i}`;
            values.push(dateTo);
            i++;
        }


        if (whereClauses.length > 0) {
            query += ` WHERE ` + whereClauses.join(' AND ');
            countQuery += ` WHERE ` + whereClauses.join(' AND ');
        }

        query += ` ORDER BY ${sortBy} ${sortOrder}`;
        query += ` LIMIT $${i} OFFSET $${i + 1}`;
        values.push(limit, offset);
     

        const[patientResult, countResult] = await Promise.all ([
            pool.query(query, values),
            pool.query(countQuery, countValues)
        ]);

        const totalRecords = parseInt(countResult.rows[0].count, 10);
        const totalpages = Math.ceil(totalRecords / limit);

        return {
            patients: patientResult.rows,
            totalRecords,
            totalpages
        };

    } catch (error) {
        console.error("Error fetching patients:", error);
    return { error: "Database query failed" };
  }    
}

async function getPatientById (patient_id) {

    const sql = `SELECT * FROM patients WHERE patient_id = $1`;
    const result = await pool.query (sql, [patient_id]);
    return result.rows[0];
}


module.exports = { getAllPatients };