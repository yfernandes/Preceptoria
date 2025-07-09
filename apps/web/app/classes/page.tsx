"use client";

import { useEffect, useState } from "react";

interface Class {
	id: string;
	name: string;
	course: {
		id: string;
		name: string;
	};
	students: Array<{ id: string }>;
	createdAt: string;
	updatedAt: string;
}

interface ClassesResponse {
	success: boolean;
	data: Class[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

export default function ClassesPage() {
	const [data, setData] = useState<ClassesResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchClasses = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch("http://localhost:3000/classes", {
					credentials: "include", // Include cookies
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`HTTP ${response.status}: ${errorText}`);
				}

				const result = await response.json();
				setData(result);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		fetchClasses();
	}, []);

	if (loading) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Classes</h1>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Classes</h1>
				<div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
					<strong>Error:</strong> {error}
				</div>
			</div>
		);
	}

	if (!data || !data.success) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Classes</h1>
				<div className="rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
					<strong>No data available</strong>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<h1 className="mb-4 text-2xl font-bold">Classes</h1>

			<div className="mb-4 text-sm text-gray-600">
				Total: {data.pagination.total} classes
			</div>

			<div className="space-y-4">
				{data.data.map((classItem) => (
					<div
						key={classItem.id}
						className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									{classItem.name}
								</h3>
								<p className="text-sm text-gray-600">
									Course: {classItem.course.name}
								</p>
								<p className="text-xs text-gray-500">ID: {classItem.id}</p>
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-blue-600">
									{classItem.students.length}
								</div>
								<div className="text-xs text-gray-500">students</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{data.data.length === 0 && (
				<div className="py-8 text-center text-gray-500">No classes found</div>
			)}
		</div>
	);
}
