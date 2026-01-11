
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema() {
    console.log('Inspecting Tables...');

    // List of potential table names to check
    const tablesToCheck = ['students', 'student', 'faculty', 'faculties', 'staff', 'admin', 'admins', 'users'];

    for (const table of tablesToCheck) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            // console.log(`Table '${table}' not found or distinct error:`, error.message);
        } else {
            console.log(`\n[FOUND TABLE] ${table}`);
            if (data && data.length > 0) {
                console.log('Sample Row Keys:', Object.keys(data[0]).join(', '));
            } else {
                console.log('Table is empty, cannot infer columns.');
            }
        }
    }
}

inspectSchema();
