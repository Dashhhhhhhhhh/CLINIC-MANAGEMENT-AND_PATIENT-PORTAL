const express = require('express');
const { get } = require('../routes/patient');
const router = express.Router();


const patientModel = require('../models/patientModel');
const { Result } = require('pg');

async function createPatient (req, res) { 
    try {
        const {
        first_name,
        middle_initial,
        last_name,
        birthdate,
        gender,
        building_number,
        street_name,
        barangay_subdivision,
        city_municipality,
        province,
        postal_code,
        country,
        contact_number,
        medical_history
        } = req.body;

        const requiredFields = [
            'first_name',
            'last_name',
            'birthdate',
            'gender',
            'street_name',
            'city_municipality',
            'postal_code',
            'country'
        ];
        
        const cleanedData = {};

        for (const field of requiredFields) {
            const value = req.body[field];

            if (value === undefined || value == null) {
            return res.status(400).json({ error: `${field} is required.`});   
            }

            if (typeof value === "string") {
                const trimmed = value.trim();

            if (trimmed === "") {
                return res.status(400).json({ error: `${field} cannot be empty.` });
            }
           
            cleanedData[field] = trimmed;
        }

        else if (typeof value === "number") {
            cleanedData[field] = value;
        }
        else {
            return res.status(400).json({ error: `${field} has an invalid type.`});
        }
    }


        const optionalFields = [
            'middle_initial',
            'building_number',
            'barangay_subdivision',
            'province',
            'contact_number',
            'medical_history'
        ];


        for (const field of optionalFields) {
            const value = req.body[field];
            if (value !== undefined) {
            cleanedData[field]= typeof value === 'string' ? value.trim() : value
        }
    }
        const formattedbirthdDate = new Date(cleanedData.birthdate);

        const intlNum = /^\+639\d{9}$/;

        const allowedGender = ['male', 'female'];

        if (!allowedGender.includes(cleanedData.gender.toLowerCase())) {
            return res.status(400).json({ error: "Invalid gender value."});
        }

        if (isNaN(formattedbirthdDate.getTime())) {
            return res.status(400).json({ error: "Invalid input." });
        }

        if (cleanedData.contact_number.startsWith('09')) {
            cleanedData.contact_number = cleanedData.contact_number.replace(/^09/, '+639');
        }

        if(cleanedData.contact_number && !intlNum.test(cleanedData.contact_number)) {
            return res.status(400).json({ error: "Invalid mobile number." });
        }

        const values = [
            cleanedData.first_name,
            cleanedData.middle_initial,
            formattedbirthdDate, 
            cleanedData.gender,
            cleanedData.contact_number,
            cleanedData.medical_history,
            cleanedData.building_number,
            cleanedData.street_name,
            cleanedData.barangay_subdivision,
            cleanedData.city_municipality,
            cleanedData.province,
            cleanedData.postal_code,
            cleanedData.country
        ];

    
        const result = await patientModel.createPatient(cleanedData, values, formattedbirthdDate);

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json({ message: "Patient added", patient_id: result.rows[0].patient_id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }    
}

async function getAllPatients (req, res) { 
    try {
    
    const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'ASC',
        filterBy,
        filterValue,
        dateRange,
        dateFrom,
        dateTo
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (!["ASC", "DESC"].includes(sortOrder.toUpperCase())) {
        return res.status(400).json({ error: "Invalid sortOrder. Use ASC or DESC." });  
    }
    
    const allowedSortFields = ["created_at", "last_name", "first_name"];
    
    if (!allowedSortFields.includes(sortBy)) {
        return res.status(400).json({ error: "Invalid sortBy field." });
    }

    const allowedFilterFields = ["first_name", "last_name", "gender", "created_at"];

    if (filterBy && !allowedFilterFields.includes(filterBy)) {
        return res.status(400).json({ error: "Invalid filterBy field"});
    }

    const allowedDateRanges = ["today", "week", "month", "year"];

    if ((dateFrom && isNaN(Date.parse(dateFrom))) || (dateTo && isNaN(Date.parse(dateTo))) ) {
        return res.status(400).json({ error: "Invalid custom date format" });
    }

    if (dateRange && !allowedDateRanges.includes(dateRange)) {
        return res.status(400).json({ error: "Invalid dateRange value" });
    }

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
        return res.status(400).json({ error: "dateFrom cannot be later than dateTo" });
    }
    
    if (dateRange && (dateFrom || dateTo)) {
    return res.status(400).json({
        error: "You cannot use dateRange together with dateFrom/dateTo. Choose one method."
    });
    }



    const result = await patientModel.getAllPatient( pageNum, limitNum, sortBy, sortOrder, filterBy, filterValue );

    if (result.error) {
        return res.status(404).json({ error: result.error });
    }

        res.status(200).json({
            patient: result.patient,
            currentPage: pageNum,
            totalPages: result.totalPages,
            totalCount: result.totalRecords,
            requested_at: new Date().toISOString()
        });

    } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
    }   
    
}

async function getPatientById (req, res) {
    try {

        const { id } = req.params;

        const result = await patientModel.getPatientById(id);

        if (!result) {
            return res.status(404).json({ error: "Patient not found"});            
        } else {
        res.status(200).json({ patient: result });
        }

    } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
    }   
}