"use client";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

import type { S3Grants } from "@prisma/client";
import { api } from "~/trpc/react";

// ! I believe this is rather inefficient, as it will refetch the S3 grants every time the slugs change
// ! It is fetching all S3 grants for all teams, which is not ideal, but it is what we have for now
// ! TODO: We should probably refactor this to only fetch the S3 grant for the resource we are trying to access
// ! TODO: Expiration Handling is also not ideal, as it will not refetch the S3 grant if it is expired

interface s3ContextValue {
	icons: S3Grants[] | undefined;
	isLoading: boolean;
	refetch: () => void;
}

const s3Context = createContext<s3ContextValue | null>(null);

export function S3Provider({ children }: React.PropsWithChildren) {
	const [slugs, setSlugs] = useState<string[]>([]);

	const { data: teams, refetch: teamRefetch } = api.team.readAll.useQuery();
	const {
		data: s3Grants,
		isLoading: isLoadingS3,
		refetch,
	} = api.s3.readMany.useQuery({ slugs: slugs });
	const onTeamUpdate = api.team.onUpdate.useSubscription();

	// Refetch the teams when the subscription updates
	useEffect(() => {
		if (onTeamUpdate.data) {
			teamRefetch();
			onTeamUpdate.reset();
		}
	}, [onTeamUpdate.data, teamRefetch, onTeamUpdate]);

	// Refetch the teams when the teams change
	useEffect(() => {
		if (teams) {
			const slugs = teams.map((team) => team.uniqueId);
			setSlugs(slugs);
		}
	}, [teams]);

	// Refetch the S3 grants when the slugs change
	useEffect(() => {
		if (slugs.length > 0) {
			refetch();
		}
	}, [slugs, refetch]);

	return (
		<s3Context.Provider
			value={{ icons: s3Grants, isLoading: isLoadingS3, refetch }}
		>
			{children}
		</s3Context.Provider>
	);
}

export function useS3() {
	const context = useContext(s3Context);

	if (!context) {
		throw new Error("useS3 must be used within a TeamProvider");
	}

	return context;
}
