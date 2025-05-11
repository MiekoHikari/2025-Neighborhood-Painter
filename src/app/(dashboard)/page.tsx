import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import WhiteboardCanvas from "../_components/whiteboardCanvas";

export default async function Home() {
	const hello = await api.post.hello({ text: "from tRPC" });
	const session = await auth();

	if (session?.user) {
		void api.post.getLatest.prefetch();
	}

	return (
		<HydrateClient>
			<h1 className="text-4xl">Hello Neighbors!</h1>
		</HydrateClient>
	);
}
