"use client";

import { useEffect, useState } from "react";
import { treatise } from "lib/eden";
import { Document } from "@api/modules/documents/document.entity";

interface DocumentsResponse {
	success: boolean;
	data: Document[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

export default function DocumentsPage() {
	const [mounted, setMounted] = useState(false);
	const [data, setData] = useState<DocumentsResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setMounted(true);
		const fetchDocuments = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await treatise.documents.get({
					query: {
						limit: 10,
						offset: 0,
					},
				});

				console.log(response.data);

				const result = response.data;
				setData(result);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		};

		fetchDocuments();
	}, []);

	if (!mounted || loading) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Documents</h1>
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Documents</h1>
				<div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
					<strong>Error:</strong> {error}
				</div>
			</div>
		);
	}

	if (!data || !data.success) {
		return (
			<div className="p-8">
				<h1 className="mb-4 text-2xl font-bold">Documents</h1>
				<div className="rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700">
					<strong>No data available</strong>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8">
			<h1 className="mb-4 text-2xl font-bold">Documents</h1>

			<div className="mb-4 text-sm text-gray-600">
				Total: {data.pagination.total} documents
			</div>

			<div className="space-y-4">
				{data.data.map((doc) => (
					<div
						key={doc.id}
						className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									{doc.name}
								</h3>
								<p className="text-sm text-gray-600">Type: {doc.type}</p>
								<p className="text-xs text-gray-500">ID: {doc.id}</p>
								<p className="text-xs text-gray-500">Status: {doc.status}</p>
								{doc.student && (
									<p className="text-xs text-gray-500">
										Student ID: {doc.student.id}
									</p>
								)}
							</div>
							<div className="text-right">
								<a
									href={doc.url}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 underline text-sm"
								>
									View Document
								</a>
								{doc.thumbnailUrl && (
									<div className="mt-2">
										<img
											src={doc.thumbnailUrl}
											alt={doc.name}
											className="h-16 w-16 object-cover rounded"
										/>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{data.data.length === 0 && (
				<div className="py-8 text-center text-gray-500">No documents found</div>
			)}
		</div>
	);
}
