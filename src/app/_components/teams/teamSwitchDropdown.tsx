"use client";
import type React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTeams } from "~/app/_lib/teamContext";
import { useS3 } from "~/app/_lib/s3Context";
import { useParams, useRouter } from "next/navigation";

function TeamSwitchDropdown({ children, ...props }: React.PropsWithChildren) {
	const params = useParams();
	const router = useRouter();

	const teamSlug = params?.teamSlug as string;

	const { teams } = useTeams();
	const { icons } = useS3();

	if (!teams) {
		return null;
	}

	const teamsContent = teams.map((team) => (
		<SelectItem key={team.id} value={team.uniqueId}>
			<Avatar>
				{team.icon ? (
					<AvatarImage
						src={icons?.find((t) => t.key === team.icon)?.url ?? undefined}
					/>
				) : (
					<AvatarFallback>
						{team.name
							.split(" ")
							.map((word) => word[0])
							.join("")
							.toUpperCase()}
					</AvatarFallback>
				)}
			</Avatar>
			{team.name}
		</SelectItem>
	));

	const onChange = (value: string) => {
		if (value !== teamSlug) {
			router.push(`/${value}`);
		}
	};

	return (
		<Select {...props} value={teamSlug ?? undefined} onValueChange={onChange}>
			<SelectTrigger>
				<SelectValue placeholder="Select a team" />
			</SelectTrigger>
			<SelectContent>{teamsContent}</SelectContent>
		</Select>
	);
}

export default TeamSwitchDropdown;
