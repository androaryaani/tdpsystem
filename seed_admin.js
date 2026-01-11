
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khlcgjztuldhiyepaavy.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedAdmin() {
    console.log("Seeding Admin Data...");

    const adminUser = {
        username: '9414966535',
        password_hash: 'vgutdparyaanivana'
    };

    const { data, error } = await supabase
        .from('admins')
        .insert([adminUser])
        .select();

    if (error) {
        console.log("Error inserting admin:", error.message);
    } else {
        console.log("Success! Admin inserted:", data);
    }
}

seedAdmin();
