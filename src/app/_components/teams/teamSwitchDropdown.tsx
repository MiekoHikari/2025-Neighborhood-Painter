"use client";
import type React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import type { S3Grants, Team } from "@prisma/client";
import { Avatar, AvatarImage } from "../ui/avatar";
import { api } from "~/trpc/react";

interface teamSwitchProps extends React.PropsWithChildren {
	teams: Team[];
}

function TeamSwitchDropdown({ children, teams, ...props }: teamSwitchProps) {
	const teamIconQuery = api;
	const getTeamIcon = (teamId: string) => {
		// TODO: Implement logic to get team icon
	};
	return (
		<Select {...props}>
			<SelectTrigger>{children}</SelectTrigger>
			<SelectContent>
				{teams.map((team) => (
					<SelectItem key={team.id} value={team.uniqueId}>
						<Avatar>
							<AvatarImage />
						</Avatar>
						{team.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export default TeamSwitchDropdown;
