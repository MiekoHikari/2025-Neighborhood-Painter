"use client";
import React from "react";

import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { cn } from "~/app/_lib/utils";
import { FaSnowman } from "react-icons/fa";
import TeamSwitchDropdown from "~/app/_components/teams/teamSwitchDropdown";

const font = Poppins({
	subsets: ["latin"],
	weight: ["600"],
});

function TeamSidebar() {
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
			<TeamSwitchDropdown />
		</div>
	);
}

export default TeamSidebar;
