"use client";
import React from "react";
import { useS3 } from "~/app/_lib/s3Context";
import { useTeams } from "~/app/_lib/teamContext";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ChevronsUpDown, Plus, PlusIcon, Settings } from "lucide-react";
import { CardTitle } from "../ui/card";
import { useSession } from "next-auth/react";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import Hint from "../ui/hint";
import NewTeamForm from "./newTeamForm";

function TeamSwitchDropdown() {
	const router = useRouter();
	const { teams } = useTeams();
	const { icons } = useS3();
	const session = useSession();
	const [DialogOpen, setDialogOpen] = React.useState(false);

	const params = useParams();
	const teamSlug = params?.teamSlug as string;
	const currentTeam = teams?.find((team) => team.uniqueId === teamSlug);
	const currentTeamIcon = icons?.find((t) => t.key === currentTeam?.icon)?.url;

	const onTeamSelect = (value: string) => {
		const selectedTeam = teams?.find((team) => team.uniqueId === value);
		if (selectedTeam) {
			router.push(`/${selectedTeam.uniqueId}`);
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="w-full" asChild>
				<Button variant="outline" className="w-full p-4">
					{currentTeam ? (
						<div className="flex items-center justify-between gap-2 space-x-2">
							<Avatar>
								{currentTeam?.icon ? (
									<AvatarImage width={32} height={32} src={currentTeamIcon} />
								) : (
									<AvatarFallback className="flex items-center justify-center bg-primary font-bold text-primary-foreground">
										{currentTeam?.name
											.split(" ")
											.map((word) => word[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								)}
							</Avatar>
							{currentTeam.name.length > 12
								? `${currentTeam.name.slice(0, 12)}...`
								: currentTeam.name}
						</div>
					) : (
						<span className="text-muted-foreground">Select a team</span>
					)}
					<ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="flex flex-col gap-2">
				<DropdownMenuLabel className="flex h-[50px] w-[250px] items-center justify-center text-center">
					{currentTeam ? (
						<div className="flex items-center justify-center gap-2 space-x-2">
							<Avatar>
								{currentTeam?.icon ? (
									<AvatarImage src={currentTeamIcon} />
								) : (
									<AvatarFallback className="flex items-center justify-center bg-primary font-bold text-primary-foreground">
										{currentTeam?.name
											.split(" ")
											.map((word) => word[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								)}
							</Avatar>
							<div className="flex flex-col items-start justify-center">
								<strong>{currentTeam.name}</strong>
								<Badge>
									{session.data?.user.id === currentTeam?.owner_user_id
										? "Owner"
										: "Member"}
								</Badge>
							</div>
						</div>
					) : (
						<CardTitle className="text-center">Select a team</CardTitle>
					)}
				</DropdownMenuLabel>
				<Button className="w-full" variant="outline">
					<Settings className="mr-2 h-4 w-4" />
					Manage Team
				</Button>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup
					value={currentTeam?.uniqueId}
					onValueChange={onTeamSelect}
				>
					{teams?.map((team) => (
						<DropdownMenuRadioItem key={team.uniqueId} value={team.uniqueId}>
							<Avatar>
								{team.icon ? (
									<AvatarImage src={icons?.find((t) => t.key === team.icon)?.url} />
								) : (
									<AvatarFallback className="flex items-center justify-center bg-primary font-bold text-primary-foreground">
										{team.name
											.split(" ")
											.map((word) => word[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								)}
							</Avatar>
							{team.name}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
				<DropdownMenuSeparator />
				<Dialog open={DialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button className="w-full" variant="outline">
							<Plus className="mr-2 h-4 w-4" />
							Create a new team
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle className="text-center font-semibold text-lg">
							Let's create a new team!
							<div className="text-muted-foreground text-sm">
								You can create a new team to manage your projects and collaborate
								with others.
							</div>
						</DialogTitle>
						<NewTeamForm setDialogOpen={setDialogOpen} />
					</DialogContent>
				</Dialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default TeamSwitchDropdown;
