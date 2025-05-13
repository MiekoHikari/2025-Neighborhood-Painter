"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { cn } from "~/app/_lib/utils";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import type { S3Grants, Team } from "@prisma/client";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "~/app/_components/ui/avatar";
import Hint from "~/app/_components/ui/hint";

interface SidebarItemProps {
	team: Team;
}

function SidebarItem({ team }: SidebarItemProps) {
	const { teamSlug: currentTeamSlug } = useParams();
	const [teamIcon, setTeamIcon] = React.useState<S3Grants | null>(null);
	const router = useRouter();

	const isActive = team?.uniqueId === currentTeamSlug;
	const teamIconGrant = team.icon
		? api.s3.read.useQuery({ objectKey: team?.icon ?? "" })
		: null;

	useEffect(() => {
		if (teamIconGrant && !teamIconGrant.isLoading && teamIconGrant.data) {
			setTeamIcon(teamIconGrant.data);
		}
	});

	const teamOnClick = () => {
		router.push(`/${team?.uniqueId}`);
	};

	return (
		<Hint label={team?.name ?? "Team"} side="right" sideOffset={18}>
			<div className="relative aspect-square">
				<a href={`/${team?.uniqueId}`} className="flex h-full w-full">
					<Avatar
						className={cn(
							"cursor-pointer rounded-md opacity-75 transition hover:opacity-100",
							isActive && "opacity-100",
						)}
						onClick={teamOnClick}
					>
						<AvatarImage
							src={teamIcon?.url ?? undefined}
							alt={team?.name ?? undefined}
						/>
						<AvatarFallback
							className="flex h-full w-full items-center justify-center rounded-full border-2 bg-blue-950 text-blue-100"
							delayMs={600}
						>
							{team?.name
								?.split(" ")
								.map((word) => word[0])
								.join("") ?? "T"}
						</AvatarFallback>
					</Avatar>
				</a>
			</div>
		</Hint>
	);
}

export default SidebarItem;
