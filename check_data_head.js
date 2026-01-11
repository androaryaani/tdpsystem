
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkHead() {
    console.log("Checking first few rows...");

    // Check Batches
    const { data: bData, error: bError } = await supabase.from('batches').select('batch_id').limit(5).order('batch_id', { ascending: true });
    if (bError) console.log("Batches Error:", bError.message);
    else console.log("First Batches:", bData);

    // Check Mapping
    const { data: mData, error: mError } = await supabase.from('student_batch_mapping').select('mapping_id').limit(5).order('mapping_id', { ascending: true });
    if (mError) console.log("Mapping Error:", mError.message);
    else console.log("First Mappings:", mData);

    // Check Policy
    const { data: pData, error: pError } = await supabase.from('batches').insert([{
        batch_id: 'TEST_POLICY_BATCH',
        faculty_id: 'TDPFAC0005', // Use a valid ID from seeding
        batch_number: '99',
        status: 'Active'
    }]).select();

    if (pError) {
        console.log("Insert Test Error:", pError.message);
        if (pError.code === '42501') console.log("RLS BLOCKING INSERTS");
    } else {
        console.log("Insert Test Success (Cleaning up...)");
        await supabase.from('batches').delete().eq('batch_id', 'TEST_POLICY_BATCH');
    }
}

checkHead();
