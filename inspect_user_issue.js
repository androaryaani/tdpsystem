
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectData() {
    const fId = 'TDPFAC0101';
    const bId = 'VGUTDP0201';
    const fIdWrong = 'TDPFAC0071';

    console.log(`--- Inspecting Faculty ${fId} ---`);
    const { data: faculty, error: fError } = await supabase
        .from('faculty')
        .select('*')
        .eq('faculty_id', fId);

    if (fError) console.error(fError);
    console.log('Faculty found:', faculty?.length);
    if (faculty?.length > 0) console.log(faculty[0]);

    console.log(`\n--- Inspecting Batch ${bId} ---`);
    const { data: batch, error: bError } = await supabase
        .from('batches')
        .select('*')
        .eq('batch_id', bId);

    if (bError) console.error(bError);
    console.log('Batch found:', batch?.length);
    if (batch?.length > 0) console.log(batch[0]);

    console.log(`\n--- Inspecting Mappings for batch ${bId} ---`);
    const { data: mapsBatch, error: mbError } = await supabase
        .from('student_batch_mapping')
        .select('mapping_id, student_id, batch_id, faculty_id')
        .eq('batch_id', bId);

    if (mbError) console.error(mbError);
    console.log('Mappings count (by batch):', mapsBatch?.length);
    if (mapsBatch?.length > 0) console.log(mapsBatch);

    console.log(`\n--- Inspecting Mappings for faculty ${fId} ---`);
    const { data: mapsFaculty, error: mfError } = await supabase
        .from('student_batch_mapping')
        .select('mapping_id, student_id, batch_id, faculty_id')
        .eq('faculty_id', fId);

    if (mfError) console.error(mfError);
    console.log('Mappings count (by faculty):', mapsFaculty?.length);
    if (mapsFaculty?.length > 0) console.log(mapsFaculty);

    console.log(`\n--- Inspecting Faculty ${fIdWrong} ---`);
    const { data: faculty71, error: f71Error } = await supabase
        .from('faculty')
        .select('*')
        .eq('faculty_id', fIdWrong);

    if (f71Error) console.error(f71Error);
    console.log('Faculty 71 found:', faculty71?.length);
    if (faculty71?.length > 0) console.log(faculty71[0]);
}

inspectData();
