"use client";

import { memo } from "react";
import { Users, FileCheck, AlertTriangle } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { ClassData } from "../../types";
import { getStatusColor } from "../../utils/styleUtils";
import { formatDate } from "../../utils/dateUtils";

interface ClassProgressCardProps {
	classData: ClassData;
	onViewDetails?: (classId: number) => void;
}

export const ClassProgressCard = memo<ClassProgressCardProps>(
	({ classData, onViewDetails }) => {
		const {
			id,
			name,
			course,
			progress,
			status,
			studentsCount,
			documentsApproved,
			documentsTotal,
			lastUpdate,
			issues,
		} = classData;

		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<div className="mb-1 flex items-center justify-between">
							<h3 className="font-semibold text-gray-900">{name}</h3>
							<Badge className={getStatusColor(status)}>{status}</Badge>
						</div>
						<p className="mb-2 text-sm text-gray-600">{course}</p>

						<div className="mb-2 flex items-center space-x-4 text-sm text-gray-600">
							<span className="flex items-center">
								<Users className="mr-1 h-4 w-4" />
								{studentsCount} alunos
							</span>
							<span className="flex items-center">
								<FileCheck className="mr-1 h-4 w-4" />
								{documentsApproved}/{documentsTotal} documentos
							</span>
							{issues > 0 && (
								<span className="flex items-center font-medium text-yellow-600">
									<AlertTriangle className="mr-1 h-4 w-4" />
									{issues} pendência{issues > 1 ? "s" : ""}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Progresso da Aprovação</span>
						<span className="font-medium">{progress}%</span>
					</div>
					<ProgressBar progress={progress} />
				</div>

				<div className="flex items-center justify-between pt-2">
					<span className="text-xs text-gray-500">
						Última atualização: {formatDate(lastUpdate)}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onViewDetails?.(id)}
					>
						Ver Detalhes
					</Button>
				</div>
			</div>
		);
	}
);

ClassProgressCard.displayName = "ClassProgressCard";
