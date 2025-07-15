"use client";

import { useEffect, useState } from "react";
import { treatise } from "lib/eden";
import { Supervisor } from "@api/modules/supervisors/supervisor.entity";
import { useRouter } from "next/navigation";

interface SupervisorsResponse {
	success: boolean;
	data: Supervisor[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

export default function CoursesPage() {
	const router = useRouter();
	const [data, setData] = useState<SupervisorsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSupervisors = async () => {
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

		fetchSupervisors();
	}, [router]);

	if (loading) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Supervisors</h1>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Supervisors</h1>
				<div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
					<strong>Error:</strong> {error}
				</div>
			</div>
		);
	}

	if (!data || !data.success) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Supervisors</h1>
				<div className="rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
					<strong>No data available</strong>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<h1 className="mb-4 text-2xl font-bold">Supervisors</h1>

			<div className="mb-4 text-sm text-gray-600">
				Total: {data.pagination.total} supervisors
			</div>

			<div className="space-y-4" data-testid="supervisors-table">
				{data.data.map((supervisorItem) => (
					<div
						key={supervisorItem.id}
						className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									{supervisorItem.user.name}
								</h3>
								<p className="text-sm text-gray-600">
									Supervisor: {supervisorItem.user.name}
								</p>
								<p className="text-xs text-gray-500">ID: {supervisorItem.id}</p>
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold text-blue-600">
									{supervisorItem.school?.name || "No school"}
								</div>
								<div className="text-xs text-gray-500">school</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{data.data.length === 0 && (
				<div className="py-8 text-center text-gray-500">
					No supervisors found
				</div>
			)}
		</div>
	);
}
