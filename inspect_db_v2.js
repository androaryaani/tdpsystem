
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectSchema() {
    console.log('Inspecting Tables via explicit select...');

    const tables = ['students', 'student', 'Faculty', 'faculty', 'Admin', 'admin', 'users'];

    for (const table of tables) {
        // Try selecting 1 row
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`[MISSING/ERROR] ${table}: ${error.code} - ${error.message}`);
        } else {
            console.log(`[FOUND] ${table}`);
            if (data && data.length > 0) {
                console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
            } else {
                console.log(`   (Table is empty)`);
            }
        }
    }
}

inspectSchema();
