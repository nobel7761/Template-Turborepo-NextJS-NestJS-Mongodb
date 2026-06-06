import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Turborepo with Next Nest
        </h1>
        <p className="text-center text-lg text-gray-600">
          Frontend: Next.js with App Router, TypeScript, and Tailwind CSS
        </p>
        <p className="text-center text-lg text-gray-600 mt-4">
          Backend: NestJS with TypeScript and MongoDB
        </p>
        <div className="mt-8 text-center">
          <Link
            href="/users"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            View useAPI Hook Examples →
          </Link>
        </div>
      </div>
    </main>
  );
}
