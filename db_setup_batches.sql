
-- 1. Create Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    batch_id TEXT PRIMARY KEY,
    faculty_id TEXT REFERENCES public.faculty(faculty_id),
    batch_number TEXT,
    academic_year TEXT,
    total_students INTEGER,
    status TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Student_Batch_Mapping Table
CREATE TABLE IF NOT EXISTS public.student_batch_mapping (
    mapping_id TEXT PRIMARY KEY,
    student_id TEXT REFERENCES public.students(student_id),
    batch_id TEXT REFERENCES public.batches(batch_id),
    faculty_id TEXT REFERENCES public.faculty(faculty_id),
    status TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS and Policies
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batch_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow Anon Read Batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Allow Anon Read Mapping" ON public.student_batch_mapping FOR SELECT USING (true);

-- Allow Seed Script to Insert (Temporary/Dev)
CREATE POLICY "Allow Anon Insert Batches" ON public.batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anon Insert Mapping" ON public.student_batch_mapping FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Anon Update Batches" ON public.batches FOR UPDATE USING (true);
CREATE POLICY "Allow Anon Update Mapping" ON public.student_batch_mapping FOR UPDATE USING (true);
