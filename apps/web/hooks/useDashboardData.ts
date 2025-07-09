"use client";

import { useState, useEffect, useMemo } from "react";
import type { ClassData, ShiftData, DashboardStats } from "../types";
import { treatise as api } from "../lib/eden";

export const useDashboardData = () => {
	const [classes, setClasses] = useState<ClassData[]>([]);
	const [shifts, setShifts] = useState<ShiftData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch real data from API
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				console.log("Fetching dashboard data...");

				// Test API calls individually first
				try {
					// Try different ways to access the list endpoint
					console.log("Available API methods:", Object.keys(api));
					console.log("Classes API structure:", api.classes);

					// Try accessing the root endpoint
					const classesResponse = await api.classes.get();
					console.log("Classes response:", classesResponse);
				} catch (err) {
					console.error("Classes API error:", err);
				}

				try {
					const shiftsResponse = await api.shifts.get();
					console.log("Shifts response:", shiftsResponse);
				} catch (err) {
					console.error("Shifts API error:", err);
				}

				// For now, use empty arrays until we debug the API
				setClasses([]);
				setShifts([]);
			} catch (err) {
				console.error("Error fetching dashboard data:", err);
				setError("Erro ao carregar dados do dashboard");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const stats: DashboardStats = useMemo(
		() => ({
			totalClasses: classes.length,
			completedClasses: classes.filter((c) => c.status === "Concluído").length,
			classesNeedingAttention: classes.filter((c) => c.issues > 0).length,
			todayShifts: shifts.filter(
				(s) => s.date === formatDate(new Date().toISOString())
			).length,
		}),
		[classes, shifts]
	);

	const getShiftsByDate = (date: string) => {
		return shifts.filter((shift) => shift.date === date);
	};

	const getUpcomingShifts = (fromDate: string, limit = 3) => {
		return shifts.filter((shift) => shift.date > fromDate).slice(0, limit);
	};

	return {
		classes,
		shifts,
		stats,
		loading,
		error,
		getShiftsByDate,
		getUpcomingShifts,
	};
};

// Helper functions for data transformation
const calculateClassProgress = (classItem: any): number => {
	// Calculate progress based on approved documents vs total documents
	const totalDocs = calculateTotalDocuments(classItem);
	const approvedDocs = calculateApprovedDocuments(classItem);

	if (totalDocs === 0) return 0;
	return Math.round((approvedDocs / totalDocs) * 100);
};

const determineClassStatus = (
	classItem: any
): "Concluído" | "Em Andamento" | "Pendente Revisão" | "Início do Processo" => {
	const progress = calculateClassProgress(classItem);
	const issues = calculateIssues(classItem);

	if (progress === 100) return "Concluído";
	if (progress === 0) return "Início do Processo";
	if (issues > 0) return "Pendente Revisão";
	return "Em Andamento";
};

const calculateApprovedDocuments = (classItem: any): number => {
	// Count approved documents across all students in the class
	return (
		classItem.students?.reduce((total: number, student: any) => {
			return (
				total +
				(student.documents?.filter((doc: any) => doc.status === "approved")
					?.length || 0)
			);
		}, 0) || 0
	);
};

const calculateTotalDocuments = (classItem: any): number => {
	// Count total documents across all students in the class
	return (
		classItem.students?.reduce((total: number, student: any) => {
			return total + (student.documents?.length || 0);
		}, 0) || 0
	);
};

const calculateIssues = (classItem: any): number => {
	// Count documents with issues (pending, rejected, etc.)
	return (
		classItem.students?.reduce((total: number, student: any) => {
			return (
				total +
				(student.documents?.filter(
					(doc: any) => doc.status === "pending" || doc.status === "rejected"
				)?.length || 0)
			);
		}, 0) || 0
	);
};

const formatDate = (dateString: string): string => {
	return new Date(dateString).toISOString().split("T")[0];
};

const formatTimeRange = (startTime: string, endTime: string): string => {
	const start = new Date(startTime).toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
	});
	const end = new Date(endTime).toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${start} - ${end}`;
};
