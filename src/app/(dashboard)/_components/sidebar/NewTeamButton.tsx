"use client";
import { DialogTitle } from "@radix-ui/react-dialog";
import { PlusIcon } from "lucide-react";
import React from "react";
import NewTeamForm from "~/app/_components/teams/newTeamForm";
import { Button } from "~/app/_components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTrigger,
} from "~/app/_components/ui/dialog";

function NewTeamButton() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className="aspect-square">
					<Button
						variant="secondary"
						className="h-full w-full rounded-full p-0"
					>
						<PlusIcon className="h-6 w-6 text-blue-500" />
					</Button>
				</div>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle className="text-center font-semibold text-lg">
					Let's create a new team!
					<div className="text-muted-foreground text-sm">
						You can create a new team to manage your projects and collaborate
						with others.
					</div>
				</DialogTitle>
				<NewTeamForm />
			</DialogContent>
		</Dialog>
	);
}

export default NewTeamButton;
