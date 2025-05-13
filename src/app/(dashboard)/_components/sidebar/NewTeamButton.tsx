"use client";
import { DialogTitle } from "@radix-ui/react-dialog";
import { PlusIcon } from "lucide-react";
import React from "react";
import NewTeamForm from "~/app/_components/teams/newTeamForm";
import { Button } from "~/app/_components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "~/app/_components/ui/dialog";
import Hint from "~/app/_components/ui/hint";

function NewTeamButton() {
	const [DialogOpen, setDialogOpen] = React.useState(false);

	return (
		<Dialog open={DialogOpen} onOpenChange={setDialogOpen}>
			<DialogTrigger asChild>
				<div className="aspect-square">
					<Hint label="Create a new team" side="right" sideOffset={18}>
						<Button
							variant="secondary"
							className="h-full w-full rounded-full p-0"
						>
							<PlusIcon className="h-6 w-6 text-blue-500" />
						</Button>
					</Hint>
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
				<NewTeamForm setDialogOpen={setDialogOpen} />
			</DialogContent>
		</Dialog>
	);
}

export default NewTeamButton;
