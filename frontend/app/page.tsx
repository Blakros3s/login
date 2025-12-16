import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex lg:flex-col lg:gap-10">
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 text-center mb-8">
          Welcome to AuthSystem
        </h1>

        <div className="glass-panel p-10 flex flex-col md:flex-row gap-8 items-center justify-center min-w-[500px]">
          <Link href="/login" className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg hover:shadow-blue-500/50">
            Login
          </Link>
          <Link href="/register" className="px-8 py-3 rounded-full bg-transparent border-2 border-white/20 hover:bg-white/10 text-white font-bold transition-all backdrop-blur-sm">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
