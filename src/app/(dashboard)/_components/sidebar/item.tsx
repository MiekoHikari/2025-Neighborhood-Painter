"use client";

import React, { useEffect } from "react";
import { cn } from "~/app/_lib/utils";

import { useParams, useRouter } from "next/navigation";
import type { S3Grants, Team } from "@prisma/client";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "~/app/_components/ui/avatar";
import Hint from "~/app/_components/ui/hint";
import { useS3 } from "~/app/_lib/s3Context";

interface SidebarItemProps {
	team: Team;
}

function SidebarItem({ team }: SidebarItemProps) {
	const { teamSlug: currentTeamSlug } = useParams();
	const [teamIcon, setTeamIcon] = React.useState<S3Grants | null>(null);
	const router = useRouter();

	const isActive = team?.uniqueId === currentTeamSlug;
	const { icons, isLoading } = useS3();
	const teamIconGrant = icons?.find((t) => t.key === team.icon);

	useEffect(() => {
		if (teamIconGrant && !isLoading) {
			setTeamIcon(teamIconGrant);
		}
	});

	const teamOnClick = () => {
		router.push(`/${team?.uniqueId}`);
	};

	return (
		<Hint label={team?.name ?? "Team"} side="right" sideOffset={18}>
			<div className="relative aspect-square">
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
			</div>
		</Hint>
	);
}

export default SidebarItem;
