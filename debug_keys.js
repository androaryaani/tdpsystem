
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectData() {
    console.log("Checking Faculty IDs...");
    const { data: faculty, error: fError } = await supabase
        .from('faculty')
        .select('faculty_id')
        .limit(5);

    if (fError) console.log("Error fetching faculty:", fError.message);
    else console.log("Sample Faculty IDs in DB:", faculty);

    console.log("\nChecking Student IDs...");
    const { data: students, error: sError } = await supabase
        .from('students')
        .select('student_id')
        .limit(5);

    if (sError) console.log("Error fetching students:", sError.message);
    else console.log("Sample Student IDs in DB:", students);

    // Check specific ID from batch error likely suspect
    const specificId = 'TDPFAC00001';
    const { data: specific, error: spError } = await supabase
        .from('faculty')
        .select('faculty_id')
        .eq('faculty_id', specificId);

    console.log(`\nDoes ${specificId} exist?`, specific && specific.length > 0 ? "YES" : "NO");
}

inspectData();
