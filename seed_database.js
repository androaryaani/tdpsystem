
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configure Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseCSVLine(text) {
    const re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    const re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

    // Simple fallback for standard CSV without complex quotes if regex is too heavy
    // But since we saw standard data, let's try a simpler split respecting quotes if present
    const matches = [];
    let match;
    while ((match = re_value.exec(text + ',')) !== null) {
        matches.push(match[1] || match[2] || match[3] || "");
    }
    // Remove last empty match from the trailing comma
    return matches; // Actually the above regex is complex. Let's use a simpler "split by comma but ignore commas inside quotes" approach.
}

function simpleCSVParse(content) {
    const lines = content.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quotes: split by comma only if not in quotes
        const row = [];
        let inQuote = false;
        let currentCell = '';

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                row.push(currentCell.trim());
                currentCell = '';
            } else {
                currentCell += char;
            }
        }
        row.push(currentCell.trim()); // Push last cell

        // Map to object
        const obj = {};
        headers.forEach((h, index) => {
            // Normalize header keys to match our DB columns
            let key = h.toLowerCase().trim();
            if (key === 'enrollment_no') key = 'enrollment_number'; // Handle variations if any
            obj[key] = row[index] || null;
        });

        // Clean up empty strings to null for certain fields if needed
        result.push(obj);
    }
    return result;
}

async function uploadData(tableName, filePath, mappingFunc) {
    console.log(`\nProcessing ${tableName} from ${filePath}...`);
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        let data = simpleCSVParse(fileContent);

        // Apply mapping/cleaning instructions
        if (mappingFunc) {
            data = data.map(mappingFunc);
        }

        console.log(`Parsed ${data.length} records.`);

        // Split into chunks
        const chunkSize = 100;
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const { error } = await supabase.from(tableName).upsert(chunk, { onConflict: tableName === 'students' ? 'student_id' : 'faculty_id' });

            if (error) {
                console.error(`Error uploading chunk ${i}:`, error.message);
                // console.log('Failed Chunk Sample:', chunk[0]);
            } else {
                process.stdout.write('.');
            }
        }
        console.log('\nUpload complete!');

    } catch (err) {
        console.error(`Failed to upload ${tableName}:`, err);
    }
}

async function main() {
    console.log('Starting Data Seed...');

    // 1. Upload Students
    // Mapping: CSV Headers -> DB Columns (Lowecase_underscore is what simpleCSVParse produces)
    // DB Columns: student_id, enrollment_number, student_name, email, mobile_number, programme, branch, academic_year, status, created_date, updated_date
    // CSV Headers produced keys: student_id, enrollment_number, student_name, email, mobile_number, programme, branch, academic_year, status, created_date, updated_date
    // It seems they match perfectly if CSV headers are used as keys.
    await uploadData('students', path.join(__dirname, '../database/Student_Master.csv'), (row) => ({
        student_id: row.student_id,
        enrollment_number: row.enrollment_number,
        student_name: row.student_name,
        email: row.email,
        mobile_number: row.mobile_number,
        programme: row.programme,
        branch: row.branch,
        academic_year: row.academic_year,
        status: row.status,
        created_date: row.created_date, // Ensure format is timestamp compatible
        updated_date: row.updated_date
    }));

    // 2. Upload Faculty
    await uploadData('faculty', path.join(__dirname, '../database/Faculty_Master.csv'), (row) => ({
        faculty_id: row.faculty_id,
        employee_number: row.employee_number,
        faculty_name: row.faculty_name,
        branch: row.branch,
        designation: row.designation,
        email: row.email,
        mobile_number: row.mobile_number,
        total_students: parseInt(row.total_students) || 0,
        total_batches: parseInt(row.total_batches) || 0,
        status: row.status,
        created_date: row.created_date,
        updated_date: row.updated_date
    }));
}

main();
