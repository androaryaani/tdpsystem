
# Supabase Database Setup

Since I cannot create tables directly using the API key provided (it requires the SQL Editor or a different connection string), please perform the following steps to set up your database for the login system.

## Step 1: Run SQL Query
1.  Go to your **Supabase Dashboard** for project `khlcgjztuldhiyepaavy`.
2.  Click on the **SQL Editor** icon in the left sidebar.
3.  Click **New Query**.
4.  **Copy and Paste** the following SQL code into the editor:

```sql
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

-- 3. Create Admin Table (Optional)
CREATE TABLE IF NOT EXISTS public.admins (
    admin_id SERIAL PRIMARY KEY,
    username TEXT,
    password_hash TEXT
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies to allow Login (Read Access)
-- This allows anyone to read the tables to verify login credentials.
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public Read Faculty" ON public.faculty FOR SELECT USING (true);
```

5.  Click **Run** (bottom right).

## Step 2: Confirm
Once you have successfully run the SQL, please tell me **"SQL Ran"** or **"Tables Created"**.

After that, I will immediately run the script to upload all your CSV data (`Student_Master.csv`, `Faculty_Master.csv`) into these new tables.
