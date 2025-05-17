"use client";
import React from "react";
import SidebarItem from "./item";
import { api } from "~/trpc/react";

function ListTeams() {
	const { data: teams, isLoading } = api.team.readAll.useQuery();

	// If loading return many skeleton buttons
	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{Array.from({ length: 10 }).map((_, index) => (
					<div
						key={`skeleton-item-${crypto.randomUUID()}`}
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
