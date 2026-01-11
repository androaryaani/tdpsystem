const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://khlcgjztuldhiyepaavy.supabase.co';
// User provided key
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobGNnanp0dWxkaGl5ZXBhYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTgwOTIsImV4cCI6MjA4MzUzNDA5Mn0.wQYdDpjf0Ye62P30EyGxnhxESb9LRiR3DQV6PdwQjTs';

console.log('Testing Supabase Connection...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
    try {
        // Try to fetch something simple. If tables don't exist, this might error, but the connection itself should be valid.
        // We'll check if we get a network error vs a 404/API error.
        const { data, error } = await supabase.from('students').select('count', { count: 'exact', head: true });

        if (error) {
            console.log('Connection Response Code:', error.code);
            console.log('Message:', error.message);

            if (error.code === 'PGRST204' || error.message.includes('relation "public.students" does not exist')) {
                console.log('[SUCCESS] Connected to Supabase! (Tables missing, which is expected).');
            } else {
                console.log('[ERROR] Connection failed or other issue.');
            }
        } else {
            console.log('[SUCCESS] Connected and found "students" table (unexpected but good).');
        }

    } catch (e) {
        console.error('[CRITICAL] Script crashed:', e);
    }
}

testConnection();
