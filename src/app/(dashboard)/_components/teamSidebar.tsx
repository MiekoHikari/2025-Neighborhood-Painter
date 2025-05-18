"use client";
import React from "react";

import Link from "next/link";
import { Poppins } from "next/font/google";
import { cn } from "~/app/_lib/utils";
import { FaSnowman } from "react-icons/fa";
import TeamSwitchDropdown from "~/app/_components/teams/teamSwitchDropdown";
import { Button } from "~/app/_components/ui/button";
import { LayoutDashboard, Pin } from "lucide-react";
import { useSearchParams } from "next/navigation";

const font = Poppins({
	subsets: ["latin"],
	weight: ["600"],
});

// TODO: Work on inviting team members via email
// TODO: Complete Manage Teams Button
// TODO: Delete Team Button Implementation

function TeamSidebar() {
	const searchParams = useSearchParams();
	const filter = searchParams.get("filter") ?? "all";
	return (
		// biome-ignore lint/nursery/useSortedClasses: Dynamic class names must be in order
		<div className="hidden lg:flex flex-col space-y-6 w-[206px] pt-5 pl-5">
			<Link href="/" className="flex items-center space-x-2">
				<FaSnowman
					width={40}
					height={40}
					className="text-2xl text-slate-900 dark:text-slate-50"
				/>
				<span className={cn("font-semibold text-2xl", font.className)}>
					NordBoard
				</span>
			</Link>
			<div className="flex flex-col space-y-2 gap-2">
				<TeamSwitchDropdown />
				<div>
					<Button asChild variant={filter === "all" ? "default" : "ghost"} className="w-full">
						<Link href={{ query: { filter: "all" } }} className="w-full">
							<LayoutDashboard className="h-4 w-4 mr-2" />
							Boards
						</Link>
					</Button>
					<Button asChild variant={filter === "pinned" ? "default" : "ghost"} className="w-full">
						<Link href={{
							query: { filter: "pinned" }
						}} className="w-full">
							<Pin className="h-4 w-4 mr-2" />
							Pinned
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

export default TeamSidebar;
