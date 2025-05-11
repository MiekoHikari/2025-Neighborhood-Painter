"use client";
import { PlusIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/app/_components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/app/_components/ui/dialog";
import NewTeamForm from "~/app/_components/teams/newTeamForm";

function NewTeamButton() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<div className="aspect-square">
					<Button
						variant="secondary"
						className="h-full w-full rounded-full p-0"
						onClick={() => setIsDialogOpen(true)}
						aria-label="Create new team"
					>
						<PlusIcon className="h-6 w-6 text-blue-500" />
					</Button>
				</div>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-center">Create New Team</DialogTitle>
					<DialogDescription className="text-center">Be a part of a group or create one! The neighborhood isn't that quiet ❤️</DialogDescription>
				</DialogHeader>
				<NewTeamForm />
			</DialogContent>
		</Dialog>
	);
}

export default NewTeamButton;
