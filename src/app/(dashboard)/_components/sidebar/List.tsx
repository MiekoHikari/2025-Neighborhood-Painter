"use client";
import React, { useEffect } from "react";
import { api } from "~/trpc/react";
import SidebarItem from "./item";
import { useTeams } from "~/app/_lib/teamContext";

function ListTeams() {
	const { teams, isLoading } = useTeams();

	// If loading return many skeleton buttons
	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{Array.from({ length: 10 }).map((_, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={index}
						className="h-10 w-full animate-pulse rounded-md bg-gray-200"
					/>
				))}
			</div>
		);
	}

	if (!teams || teams.length === 0) {
		return null;
	}

	return (
		<div>
			<ul className="space-y-4">
				{teams.map((team) => (
					<SidebarItem key={team.uniqueId} team={team} />
				))}
			</ul>
		</div>
	);
}

export default ListTeams;
