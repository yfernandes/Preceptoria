import { AppSidebar } from "@web/components/app-sidebar";
import { ChartAreaInteractive } from "@web/components/chart-area-interactive";
import { DataTable } from "@web/components/data-table";
import { SectionCards } from "@web/components/section-cards";
import { SiteHeader } from "@web/components/site-header";
import { SidebarInset, SidebarProvider } from "@web/components/ui/sidebar";

export default function Page() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<SectionCards />
							<div className="px-4 lg:px-6">
								<ChartAreaInteractive />
							</div>
							<DataTable data={[]} />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
