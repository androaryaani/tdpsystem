# VGU-TDP System

**Transdisciplinary Student and Faculty Management System** for Vivekananda Global University.

## 🚀 Overview
The **VGU-TDP System** is a platform designed to streamline the management of student projects, faculty assignments, and batch coordination. It promotes cross-disciplinary collaboration by enabling students and faculty from different domains to work together on national-level problems.

## ✨ Features
- **Proactive Dashboarding**: Dedicated portals for Students, Faculty, and Admins.
- **Smart Faculty Mapping**: Automated and manual assignment of faculty to student batches.
- **Real-Time Data Sync**: Powered by Supabase for instant updates.
- **Batch Management**: Comprehensive tools for creating and managing student batches.
- **Secure Authentication**: Role-based access control (RBAC).
- **Responsive Design**: Optimized for Desktop, Tablet, and Mobile.

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Directory)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [Supabase](https://supabase.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📂 Project Structure
- `/src/app`: Main application routes (Home, Login, Dashboard).
- `/src/lib`: Utility functions and Supabase client configuration.
- `/public`: Static assets (Logos, Images).

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/androaryaani/tdpsystem.git
    cd tdpsystem
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add some NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Developed by Aryan Saini's Team** for Vivekananda Global University.
