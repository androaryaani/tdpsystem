
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixData() {
    const fId = 'TDPFAC0101';
    const targetBatchId = 'VGUTDP0201';

    console.log('--- Starting Fix Operation ---');

    // 1. Identify "bad" mappings in batch VGUTDP0201 (those present are pointing to other faculties)
    const { data: badMappings, error: bmError } = await supabase
        .from('student_batch_mapping')
        .select('*')
        .eq('batch_id', targetBatchId);

    if (bmError) {
        console.error('Error fetching bad mappings:', bmError);
        return;
    }

    console.log(`Found ${badMappings.length} conflicting mappings in batch ${targetBatchId}. Deleting them...`);
    if (badMappings.length > 0) {
        const idsToDelete = badMappings.map(m => m.mapping_id);
        const { error: delError } = await supabase
            .from('student_batch_mapping')
            .delete()
            .in('mapping_id', idsToDelete);

        if (delError) console.error('Error deleting bad mappings:', delError);
        else console.log('Deleted conflicting mappings.');
    }

    // 2. Identify the correct students for TDPFAC0101
    const { data: correctStudents, error: csError } = await supabase
        .from('student_batch_mapping')
        .select('*')
        .eq('faculty_id', fId);

    if (csError) {
        console.error('Error fetching correct students:', csError);
        return;
    }

    console.log(`Found ${correctStudents.length} students correctly mapped to faculty ${fId} but potentially wrong batches.`);

    // 3. Update them to use VGUTDP0201
    if (correctStudents.length > 0) {
        const studentIds = correctStudents.map(m => m.student_id);
        const { error: updError, data: updData } = await supabase
            .from('student_batch_mapping')
            .update({ batch_id: targetBatchId })
            .in('student_id', studentIds)
            .eq('faculty_id', fId); // Safety check 

        if (updError) console.error('Error updating valid students:', updError);
        else console.log(`Updated ${studentIds.length} students to batch ${targetBatchId}.`);
    }

    console.log('--- Verification ---');
    // Verify
    const { data: finalCheck } = await supabase
        .from('student_batch_mapping')
        .select('*')
        .eq('batch_id', targetBatchId);

    console.log('Mappings in batch now:', finalCheck);
}

fixData();
