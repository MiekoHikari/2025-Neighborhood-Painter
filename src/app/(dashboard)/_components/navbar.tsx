import React from "react";
import UserButton from "~/app/_components/auth/UserButton";
import { auth } from "~/server/auth";

async function Navbar() {
	const session = await auth();

	return (
		<div className="flex items-center gap-x-4 bg-green-500 p-5">
			<div className="hidden bg-yellow-500 lg:flex lg:flex-1">Navbar</div>
			<UserButton session={session} />
		</div>
	);
}

export default Navbar;
