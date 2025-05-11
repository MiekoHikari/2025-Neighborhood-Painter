"use client";
import { cn } from "~/app/_lib/utils";
import { Button } from "~/app/_components/ui/button";
import { Card, CardContent } from "~/app/_components/ui/card";
import { FaDiscord, FaGithub, FaSlack } from "react-icons/fa";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const handleAuthClick = (provider: string) => {
		setIsLoading(provider);
		signIn(provider).then(() => {
			setIsLoading(null);
		});
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8">
						<div className="flex flex-col gap-6">
							<div className="flex flex-col items-center text-center">
								<h1 className="font-bold text-2xl">Welcome!</h1>
								<p className="text-balance text-muted-foreground">
									Let's get you authenticated!
								</p>
							</div>

							<div className="flex flex-col gap-4">
								<Button
									variant="outline"
									type="button"
									className="w-full"
									disabled={isLoading !== null}
									onClick={() => handleAuthClick("discord")}
								>
									<FaDiscord className="mr-2" />
									<span>
										{isLoading === "discord"
											? "Loading..."
											: "Login with Discord"}
									</span>
								</Button>
								<Button
									variant="outline"
									type="button"
									className="w-full"
									disabled={isLoading !== null}
									onClick={() => handleAuthClick("github")}
								>
									<FaGithub className="mr-2" />
									<span>
										{isLoading === "github"
											? "Loading..."
											: "Login with Github"}
									</span>
								</Button>
								<Button
									variant="outline"
									type="button"
									className="w-full"
									disabled={isLoading !== null}
									onClick={() => handleAuthClick("slack")}
								>
									<FaSlack className="mr-2" />
									<span>
										{isLoading === "slack" ? "Loading..." : "Login with Slack"}
									</span>
								</Button>
							</div>
						</div>
					</form>
					<div className="relative hidden bg-muted md:block">
						<img
							src="/arno-senoner-iCzxZ4dPz_0-unsplash.jpg"
							alt="A whiteboard next to a bright window"
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
						/>
					</div>
				</CardContent>
			</Card>
			<div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
				By clicking continue, you agree to our{" "}
				<a href="/terms">Terms of Service</a> and{" "}
				<a href="/privacy">Privacy Policy</a>.
			</div>
		</div>
	);
}
