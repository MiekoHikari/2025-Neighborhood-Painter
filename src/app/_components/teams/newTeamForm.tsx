"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImageIcon, PlusIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// TODO: Add slug to schema
// TODO: Implement feature to handle creating new Teams
// TODO: Implement feature to joining teams
// TODO: Fix Issue with image upload being so tiny
// TODO: Validate image files properly
// Pass in Dialog props to form

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Team name must be at least 2 characters.",
	}),
	slug: z
		.string()
		.min(2, {
			message: "Team slug must be at least 2 characters.",
		})
		.regex(/^[a-z0-9-]+$/, {
			message:
				"Team slug can only contain lowercase letters, numbers, and hyphens.",
		}),
	image: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

function NewTeamForm() {
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});

	async function onSubmit(data: FormData) {
		try {
			setIsSubmitting(true);
			console.log(data);

			await new Promise((resolve) => setTimeout(resolve, 500));

			form.reset();
			setImagePreview(null);
		} catch (error) {
			console.error("Error creating team:", error);
		} finally {
			setIsSubmitting(false);
		}
	}

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			form.setValue("image", file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		const subscription = form.watch((value, { name }) => {
			if (name === "name") {
				const newSlug = value.name
					? value.name
							.toLowerCase()
							.replace(/\s+/g, "-")
							.replace(/[^a-z0-9-]/g, "")
					: "";
				form.setValue("slug", newSlug, { shouldValidate: true });
			}
		});

		return () => subscription.unsubscribe();
	}, [form]);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<div className="flex flex-col items-center justify-center space-y-4">
					<div className="group relative flex h-24 w-24 items-center justify-center">
						<Avatar className="h-24 w-24 border-2 border-gray-300 border-dashed transition-colors group-hover:border-primary">
							{imagePreview ? (
								<AvatarImage src={imagePreview} alt="Team image preview" />
							) : (
								<AvatarFallback className="bg-muted">
									<ImageIcon className="h-10 w-10 text-muted-foreground" />
								</AvatarFallback>
							)}
						</Avatar>
						<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
							<PlusIcon className="h-6 w-6 text-white" />
						</div>
						<Input
							accept="image/*"
							className="absolute inset-0 cursor-pointer opacity-0"
							id="image"
							onChange={handleImageChange}
							type="file"
							aria-label="Upload team image"
						/>
					</div>
					<FormDescription>Click to upload team logo</FormDescription>
				</div>

				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Team Name</FormLabel>
							<FormControl>
								<Input placeholder="Awesome Team" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="slug"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Team URL</FormLabel>
							<div className="flex items-center gap-1">
								<FormControl>
									<Input placeholder="awesome-team" {...field} />
								</FormControl>
							</div>
							<FormDescription>
								Auto-generated from name (you can modify if needed)
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							form.reset();
							setImagePreview(null);
						}}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						className="relative min-w-24"
					>
						{isSubmitting ? (
							<>
								<span className="opacity-0">Create Team</span>
								<span className="absolute inset-0 flex items-center justify-center">
									<svg
										className="h-5 w-5 animate-spin"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										role="img"
										aria-label="Loading"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
								</span>
							</>
						) : (
							"Create Team"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
}

export default NewTeamForm;
