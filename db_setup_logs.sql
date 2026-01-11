
CREATE TABLE IF NOT EXISTS public.system_logs (
    log_id SERIAL PRIMARY KEY,
    action_type TEXT, 
    entity_type TEXT, 
    entity_id TEXT,
    description TEXT,
    performed_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Anon Select Logs" ON public.system_logs FOR SELECT USING (true);
CREATE POLICY "Allow Anon Insert Logs" ON public.system_logs FOR INSERT WITH CHECK (true);
