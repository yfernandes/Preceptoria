"use client";

export default function StudentsPage() {
	return (
		<div className="p-8">
			<div className="mb-4">
				<a href="/dashboard" className="text-blue-600 hover:text-blue-500">
					← Back to Dashboard
				</a>
			</div>
			<h1 className="mb-4 text-2xl font-bold">Students</h1>
			<p>
				This is the Students resource page. Implement data fetching and UI here.
			</p>
		</div>
	);
}
