"use client";
import React from "react";

function TeamSidebar() {
	return (
		// biome-ignore lint/nursery/useSortedClasses: Dynamic class names must be in order
		<div className="hidden lg:flex flex-col space-y-6 w-[206px] pt-5 pl-5 bg-red-500">
			Org Sidebar
		</div>
	);
}

export default TeamSidebar;
