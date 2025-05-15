"use client";
import React from "react";
import { DropdownMenu, DropdownMenuContent } from "../ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import type { Session } from "next-auth";
import SignInButton from "./SignInButton";
import SignOutButton from "./SignOutButton";

interface UserButtonProps {
	session: Session | null;
}

function UserButton({ session }: Readonly<UserButtonProps>) {
	if (!session) {
		return <SignInButton />;
	}

	const userName = session.user?.name ?? "No name";
	const userEmail = session.user?.email ?? "No email";

	const initials = (session.user?.name ?? "")
		.split(" ")
		.map((name) => name[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const avatar = (
		<Avatar className="h-10 w-10">
			<AvatarImage src={session.user.image ?? " "} alt="User Avatar" />
			<AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-gray-900 bg-opacity-25 text-white">
				{initials}
			</AvatarFallback>
		</Avatar>
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>{avatar}</DropdownMenuTrigger>
			<DropdownMenuContent>
				<div className="flex items-center justify-center rounded-md border border-gray-200 p-4">
					<div>{avatar}</div>
					<div className="ml-2 flex flex-col items-start justify-center">
						<div>{userName}</div>
						<div className="text-gray-500 text-sm">{userEmail}</div>
					</div>
				</div>
				<div className="my-2 flex justify-between gap-2">
					<Button variant="outline">
						<Settings /> Manage Account
					</Button>
					<SignOutButton />
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default UserButton;
