"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

function SignOutButton() {
	const [signOutLoading, setSignOutLoading] = useState(false);

	const handleSignOut = () => {
		setSignOutLoading(true);
		signOut({ redirectTo: "/" });
	};

	const signOutButton = signOutLoading ? (
		<Button variant="outline" disabled>
			<Loader2 className="animate-spin" /> Sign Out
		</Button>
	) : (
		<Button variant="outline" onClick={() => handleSignOut()}>
			<LogOut /> Sign Out
		</Button>
	);

	return signOutButton;
}

export default SignOutButton;
