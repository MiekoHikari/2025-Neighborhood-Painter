import { HydrateClient } from "~/trpc/server";

export default async function Home() {
	return (
		<HydrateClient>
			<h1 className="text-4xl">Hello Neighbors!</h1>
		</HydrateClient>
	);
}
