import { ApiClient, healthEndpoint, HealthResponse } from "@preceptoria/api-client";

export default async function Page() {
	const client = new ApiClient({
		baseUrl: process.env.API_BASE_URL || "http://localhost:3000/api",
	});
	let health: HealthResponse | null = null;
	try {
		const res = await client.get<HealthResponse>(
			typeof healthEndpoint.url === "string" ? healthEndpoint.url : healthEndpoint.url()
		);
		console.log(res);
		health = res.data;
	} catch (e) {
		health = { status: "error" };
	}

	return (
		<div className="text-center">
			<h1 className="text-4ont-bold text-gray-900">Welcome to Dashboard</h1>
			<p className="text-gray-600">Sistema de Gestão de Estágios - Visão Geral</p>
			<pre className="mt-4 rounded bg-gray-100 p-2 text-left text-xs">
				{JSON.stringify(health, null, 2)}
			</pre>
		</div>
	);
}
