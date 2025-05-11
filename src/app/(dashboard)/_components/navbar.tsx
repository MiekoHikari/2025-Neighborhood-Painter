import React from "react";
import UserButton from "~/app/_components/auth/UserButton";
import { auth } from "~/server/auth";

async function Navbar() {
	const session = await auth();

	return (
		<div className="flex items-center gap-x-4 bg-green-500 p-5">
			<div>Navbar</div>
			<div>
				<UserButton session={session} />
			</div>
		</div>
	);
}

export default Navbar;
