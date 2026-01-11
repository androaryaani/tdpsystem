
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configure Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function simpleCSVParse(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return [];

    // Remove BOM if present
    let firstLine = lines[0];
    if (firstLine.charCodeAt(0) === 0xFEFF) {
        firstLine = firstLine.substr(1);
    }

    const headers = firstLine.split(',').map(h => h.trim().toLowerCase());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
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
        row.push(currentCell.trim());

        const obj = {};
        let hasData = false;
        headers.forEach((h, index) => {
            let key = h;
            // Align keys with DB schema
            if (key === 'enrollment_no') key = 'enrollment_number';

            const value = row[index];
            if (value) hasData = true;

            obj[key] = value || null; // Convert empty strings to null
        });

        if (hasData) result.push(obj);
    }
    return result;
}

async function startSeeding() {
    console.log('Starting upload...');

    // Students
    const studentPath = path.join(__dirname, '..', 'database', 'Student_Master.csv');
    if (fs.existsSync(studentPath)) {
        console.log('Parsing Students...');
        const students = simpleCSVParse(fs.readFileSync(studentPath, 'utf8'));

        // Chunk upload
        for (let i = 0; i < students.length; i += 100) {
            const chunk = students.slice(i, i + 100);
            const { error } = await supabase.from('students').upsert(chunk);
            if (error) {
                console.log(`Student Chunk ${i} Error:`, error.message);
                if (error.code === 'PGRST205') {
                    console.log('!!! TABLE MISSING !!! Please run SQL to create table "students"');
                    return;
                }
            } else {
                process.stdout.write('S');
            }
        }
        console.log('\nStudents done.');
    }

    // Faculty
    const facultyPath = path.join(__dirname, '..', 'database', 'Faculty_Master.csv');
    if (fs.existsSync(facultyPath)) {
        console.log('Parsing Faculty...');
        const faculty = simpleCSVParse(fs.readFileSync(facultyPath, 'utf8'));

        for (let i = 0; i < faculty.length; i += 100) {
            const chunk = faculty.slice(i, i + 100);
            const { error } = await supabase.from('faculty').upsert(chunk);
            if (error) {
                console.log(`Faculty Chunk ${i} Error:`, error.message);
            } else {
                process.stdout.write('F');
            }
        }
        console.log('\nFaculty done.');
    }
}

startSeeding();
