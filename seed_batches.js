
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
        headers.forEach((h, index) => {
            // Clean keys
            let key = h;
            obj[key] = row[index] || null;
        });
        result.push(obj);
    }
    return result;
}

async function seedBatches() {
    console.log('Seeding Batches & Mappings...');

    // 1. Batches
    const batchPath = path.join(__dirname, '..', 'database', 'Batch_Master.csv');
    if (fs.existsSync(batchPath)) {
        console.log('Parsing Batches...');
        let batches = simpleCSVParse(fs.readFileSync(batchPath, 'utf8'));

        // Clean Data: Fix Faculty ID inconsistencies
        batches = batches.map(b => {
            if (b.faculty_id && b.faculty_id.startsWith('TDPFAC0000')) {
                b.faculty_id = b.faculty_id.replace('TDPFAC0000', 'TDPFAC000');
            }
            return b;
        });

        for (let i = 0; i < batches.length; i += 100) {
            const chunk = batches.slice(i, i + 100);
            const { error } = await supabase.from('batches').upsert(chunk);
            if (error) {
                console.log(`Batch Chunk ${i} Error:`, error.message);
                if (error.code === 'PGRST205') {
                    console.log('!!! TABLE MISSING: batches !!! Run SQL first.');
                    return;
                }
            } else {
                process.stdout.write('B');
            }
        }
    }

    // 2. Mapping
    const mapPath = path.join(__dirname, '..', 'database', 'Student_Batch_Mapping.csv');
    if (fs.existsSync(mapPath)) {
        console.log('\nParsing Mapping...');
        let mappings = simpleCSVParse(fs.readFileSync(mapPath, 'utf8'));

        // Clean Data: Fix Faculty ID inconsistencies
        mappings = mappings.map(m => {
            if (m.faculty_id && m.faculty_id.startsWith('TDPFAC0000')) {
                m.faculty_id = m.faculty_id.replace('TDPFAC0000', 'TDPFAC000');
            }
            return m;
        });

        for (let i = 0; i < mappings.length; i += 100) {
            const chunk = mappings.slice(i, i + 100);
            const { error } = await supabase.from('student_batch_mapping').upsert(chunk);
            if (error) {
                console.log(`Mapping Chunk ${i} Error:`, error.message);
                if (error.code === 'PGRST205') {
                    console.log('!!! TABLE MISSING: student_batch_mapping !!! Run SQL first.');
                    return;
                }
            } else {
                process.stdout.write('M');
            }
        }
    }
    console.log('\nDone.');
}

seedBatches();
