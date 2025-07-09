"use client";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-24">
			<h1 className="mb-4 text-3xl font-bold">Welcome to Preceptoria</h1>
			<a href="/login" className="text-blue-600 underline">
				Login
			</a>
		</main>
	);
}
