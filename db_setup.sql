
-- 1. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    student_id TEXT PRIMARY KEY,
    enrollment_number TEXT,
    student_name TEXT,
    email TEXT,
    mobile_number TEXT,
    programme TEXT,
    branch TEXT,
    academic_year TEXT,
    status TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Faculty Table
CREATE TABLE IF NOT EXISTS public.faculty (
    faculty_id TEXT PRIMARY KEY,
    employee_number TEXT,
    faculty_name TEXT,
    branch TEXT,
    designation TEXT,
    email TEXT,
    mobile_number TEXT,
    total_students INTEGER,
    total_batches INTEGER,
    status TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Admin Table (Optional, for now hardcoded password)
-- But in real app, you might want this.
CREATE TABLE IF NOT EXISTS public.admins (
    admin_id SERIAL PRIMARY KEY,
    username TEXT,
    password_hash TEXT
);

-- Enable Row Level Security (RLS) is generally good practice, 
-- but for this "Zero Level" test, we can keep it Open or basic.
-- For now, we assume public access or authenticated access is fine.
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- Allow anon access for checking mobile numbers (LOGIN)
-- Note: In production, you would only return count or exists, not select *, 
-- OR use a Postgres Function (RPC) to verify login secureley.
-- For this prototype:
CREATE POLICY "Allow Anon Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow Anon Read Faculty" ON public.faculty FOR SELECT USING (true);
