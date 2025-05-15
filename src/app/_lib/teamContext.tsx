"use client";
import type React from "react";
import { createContext, useContext, useEffect, useMemo } from "react";

import type { Team } from "@prisma/client";
import { api } from "~/trpc/react";

interface TeamContextValue {
	teams: Team[] | undefined;
	isLoading: boolean;
	refetch: () => void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: Readonly<React.PropsWithChildren>) {
	const { data: teams, isLoading, refetch } = api.team.readAll.useQuery();
	const onTeamUpdate = api.team.onUpdate.useSubscription();

	useEffect(() => {
		if (onTeamUpdate.data) {
			refetch();
			onTeamUpdate.reset();
		}
	}, [onTeamUpdate.data, refetch, onTeamUpdate]);

	const value = useMemo(() => ({ teams, isLoading, refetch }), [teams, isLoading, refetch]);

	return (
		<TeamContext.Provider value={value}>
			{children}
		</TeamContext.Provider>
	);
}

export function useTeams() {
	const context = useContext(TeamContext);

	if (!context) {
		throw new Error("useTeams must be used within a TeamProvider");
	}

	return context;
}
