"use client";

import { useEffect, useState } from "react";
import { treatise } from "lib/eden";
import { Student } from "@api/modules/students/student.entity";
import { useRouter } from "next/navigation";

interface StudentsResponse {
	success: boolean;
	data: Student[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

export default function CoursesPage() {
	const router = useRouter();
	const [data, setData] = useState<StudentsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStudents = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await treatise.classes.get({
					query: {
						limit: 10,
						offset: 0,
					},
				});

				console.log(response.data);

				const result = response.data;
				setData(result);
			} catch (err: any) {
				// If unauthorized, redirect to login
				if (
					err?.response?.status === 401 ||
					err?.message?.toLowerCase().includes("unauthorized")
				) {
					router.push("/login");
					return;
				}
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		fetchStudents();
	}, [router]);

	if (loading) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Students</h1>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Students</h1>
				<div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
					<strong>Error:</strong> {error}
				</div>
			</div>
		);
	}

	if (!data || !data.success) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Students</h1>
				<div className="rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
					<strong>No data available</strong>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<h1 className="mb-4 text-2xl font-bold">Students</h1>

			<div className="mb-4 text-sm text-gray-600">
				Total: {data.pagination.total} students
			</div>

			<div className="space-y-4" data-testid="students-table">
				{data.data.map((studentItem) => (
					<div
						key={studentItem.id}
						className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									{studentItem.user.name}
								</h3>
								<p className="text-sm text-gray-600">
									Student: {studentItem.user.name}
								</p>
								<p className="text-xs text-gray-500">ID: {studentItem.id}</p>
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-blue-600">
									{studentItem.class.name}
								</div>
								<div className="text-xs text-gray-500">class</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{data.data.length === 0 && (
				<div className="py-8 text-center text-gray-500">No students found</div>
			)}
		</div>
	);
}
