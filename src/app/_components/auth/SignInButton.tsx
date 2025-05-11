"use client";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Loader2, LogIn } from "lucide-react";

function SignInButton() {
	const [signInLoading, setSignInLoading] = useState(false);

	const handleSignIn = () => {
		setSignInLoading(true);
		signIn();
	};

	const signInButton = signInLoading ? (
		<Button disabled>
			<Loader2 className="animate-spin" /> Sign In
		</Button>
	) : (
		<Button onClick={() => handleSignIn()}>
			<LogIn /> Sign In
		</Button>
	);

	return signInButton;
}

export default SignInButton;
