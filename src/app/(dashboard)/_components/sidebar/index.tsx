import React from "react";
import NewTeamButton from "./NewTeamButton";
import List from "./List";

function Sidebar() {
	return (
		<aside className="fixed left-0 z-[1] flex h-full w-[60px] flex-col gap-y-4 bg-blue-950 p-3">
			<List />
			<NewTeamButton />
		</aside>
	);
}

export default Sidebar;
