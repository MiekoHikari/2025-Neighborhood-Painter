import { LoginForm } from "~/app/_components/auth/login-form";

export default function LoginPage() {
	return (
		<div
			className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10"
			style={{
				backgroundImage: "url('/jason-goodman-xSfrOv6x7uQ-unsplash.jpg')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			{/* Overlay to mute the background */}
			<div className="absolute inset-0 bg-black/40" />

			{/* Content */}
			<div className="relative z-10 w-full max-w-sm rounded-lg bg-background/80 p-6 shadow-lg backdrop-blur-sm md:max-w-3xl">
				<LoginForm />
			</div>
		</div>
	);
}
