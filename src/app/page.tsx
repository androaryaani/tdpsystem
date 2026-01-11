import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Lightbulb,
  Users,
  Target,
  ChevronRight,
  Globe,
  Cpu,
  CheckCircle2,
  Zap,
  BookOpen
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-transparent">
                <Image src="/logo.png" alt="VGU Logo" width={100} height={50} className="h-12 w-auto object-contain" />
              </div>
              <div className="border-l border-gray-300 pl-3">
                <span className="block text-xl font-bold tracking-tight text-gray-900 leading-none">VGU-TDP</span>
                <span className="block text-xs font-medium text-gray-500 uppercase tracking-widest text-[0.65rem]">Research Portal</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#philosophy" className="hover:text-blue-600 transition-colors">Philosophy</a>
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#impact" className="hover:text-blue-600 transition-colors">SDG Impact</a>
              <Link
                href="/login"
                className="px-5 py-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-semibold"
              >
                Login to Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Vivekananda Global University, Jaipur
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Transdisciplinary</span> <br className="hidden md:block" /> Student and Faculty Management System
          </h1>

          <p className="max-w-3xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
            Where multi-domain students collaborate with expert faculty to research single problems
            and execute national-level innovations. A unified platform for next-gen technology and tools.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
            >
              Access Dashboard <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#philosophy"
              className="w-full sm:w-auto px-8 py-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
            >
              Explore Vision
            </a>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -z-10 opacity-60"></div>
      </section>

      {/* --- Core Philosophy Section --- */}
      <section id="philosophy" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-blue-600 uppercase tracking-wide mb-3">The Core Philosophy</h2>
            <h3 className="text-4xl font-bold text-gray-900">Convergence for Innovation</h3>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Breaking the silos of traditional education. We bring diverse minds together to solve complex challenges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 border-t-2 border-dashed border-gray-300 -z-10"></div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-4 border-white shadow-sm">
                <Users className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">Multi-Domain Teams</h4>
              <p className="text-gray-600">
                Students from Engineering, Management, Design, and Law come together. Diverse perspectives lead to holistic solutions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-4 border-white shadow-sm">
                <Target className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">Single Problem Focus</h4>
              <p className="text-gray-600">
                Expert faculty mentor these diverse teams to research deeply into one specific societal or industrial problem.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center relative hover:-translate-y-1 transition-transform">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-4 border-white shadow-sm">
                <RocketIcon />
              </div>
              <h4 className="text-xl font-bold mb-3">National Execution</h4>
              <p className="text-gray-600">
                Transforming research into tangible tools, technologies, and innovations executed at a national scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Key Features & Solutions --- */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Revolutionizing Academic Workflows</h2>
              <p className="text-lg text-gray-600 mb-8">
                Moving beyond manual spreadsheets and scattered communication. Our system addresses key challenges like inconsistent data entry, mismatched records, and delayed notifications.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Automated Batch Generation", desc: "System auto-generates unique Batch IDs (e.g., '2025-CSE-03') ensuring standardized identification." },
                  { title: "Smart Faculty Mapping", desc: "Intelligent allocation of faculty mentors based on expertise and availability for optimal guidance." },
                  { title: "Real-Time Data Sync", desc: "Instant updates across the platform eliminate data integrity issues and prevent mismatched records." },
                  { title: "Centralized Admin Control", desc: "A unified dashboard to manage students, faculty, and batches efficiently, replacing manual tracking." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 bg-green-100 p-1.5 rounded-full h-fit">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-2xl transform -rotate-2"></div>
              <div className="relative bg-white p-8 rounded-xl shadow-xl border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Digitized Workflow</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Data Redundancy</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Real-time Access</div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">High</div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Impact Factor</div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Current System Status</p>
                      <p className="text-xs text-green-600 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Operational</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">Security Level</p>
                      <p className="text-xs text-gray-500">Enterprise Grade</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SDG Impact Section (Based on Screenshot) --- */}
      <section id="impact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Commitment to Sustainable Development Goals</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-red-500 transition-colors bg-white hover:shadow-xl hover:shadow-red-500/10">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full inline-block mb-4">SDG 4</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Education</h3>
              <p className="text-gray-600 text-sm">
                Promoting improved access to information and effective learning through streamlined academic management.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-orange-500 transition-colors bg-white hover:shadow-xl hover:shadow-orange-500/10">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-8 w-8" />
              </div>
              <div className="bg-orange-600 text-white text-xs font-bold py-1 px-3 rounded-full inline-block mb-4">SDG 9</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry & Innovation</h3>
              <p className="text-gray-600 text-sm">
                Enhancing educational systems through digital automation and fostering a culture of technical innovation.
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-500 transition-colors bg-white hover:shadow-xl hover:shadow-blue-500/10">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Globe className="h-8 w-8" />
              </div>
              <div className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full inline-block mb-4">SDG 17</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Partnerships</h3>
              <p className="text-gray-600 text-sm">
                Encouraging collaboration across sectors and domains to build resilient educational frameworks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Leadership / Credits Section --- */}
      <section id="team" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">

            <div className="w-full md:w-1/2">
              <div className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
                Development Team
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Built by Innovators</h2>
              <p className="text-gray-600 mb-6 text-lg">
                This platform is a testament to VGU's commitment to student-led innovation.
                Designed and developed entirely by the in-house technical team.
              </p>

              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="h-12 w-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  AS
                </div>
                <div>
                  <div className="font-bold text-gray-900">Aryan Saini's Team</div>
                  <div className="text-sm text-gray-500">Lead Architecture & Development</div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-blue-300 uppercase text-xs font-bold tracking-wider mb-4">Under the Guidance of</h3>
                <h2 className="text-3xl font-bold mb-2">Dr. Amandeep Gill</h2>
                <p className="text-blue-200 mb-8 font-medium border-l-4 border-blue-500 pl-3">Dean R&D, Vivekananda Global University</p>

                <p className="text-lg leading-relaxed text-blue-100/90">
                  "Driving the vision of transdisciplinary research to create a generation of problem solvers and national leaders."
                </p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-gray-950 text-white py-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded">
                <Image src="/logo.png" alt="VGU Logo" width={40} height={40} className="h-8 w-auto object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight">VGU-TDP</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Vivekananda Global University. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm font-medium text-gray-400">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RocketIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
