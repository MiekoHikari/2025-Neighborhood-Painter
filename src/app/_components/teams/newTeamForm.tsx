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
import { Loader2, PlusIcon, UploadCloud } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { api } from "~/trpc/react";

const formSchema = z.object({
	name: z
		.string()
		.min(2, {
			message: "Team name must be at least 2 characters.",
		})
		.max(16, {
			message: "Team name cannot exceed 16 characters.",
		}),
	slug: z
		.string()
		.min(2, {
			message: "Team slug must be at least 2 characters.",
		})
		.max(16, {
			message: "Team slug cannot exceed 16 characters.",
		})
		.regex(/^[a-z0-9-]+$/, {
			message:
				"Team slug can only contain lowercase letters, numbers, and hyphens.",
		}),
	image: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewTeamFormProps {
	setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function NewTeamForm({ setDialogOpen }: Readonly<NewTeamFormProps>) {
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<string | null>(null);

	const preSigner = api.s3.CreateOrUpdate.useMutation();
	const teamCreator = api.team.create.useMutation();
	const tRPCutils = api.useUtils();

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
			if (data.image) {
				setSubmitStatus("Creating Team...");
				const iconObjectKey = `${data.slug}/icon.${data.image?.name.split(".").pop()}`;

				await teamCreator.mutateAsync({
					name: data.name,
					slug: data.slug,
					icon: iconObjectKey,
				});

				setSubmitStatus("Uploading Icon...");

				const fileSize = data.image.size;
				if (fileSize > 10 * 1024 * 1024) {
					throw new Error("File size exceeds 10MB limit");
				}

				if (!data.image.type.startsWith("image/")) {
					throw new Error("Invalid file type. Only images are allowed.");
				}

				// Estimate how long the upload will take based on the file size

				const s3grant = await preSigner.mutateAsync({
					objectKey: iconObjectKey,
					expiresIn: 60
				});

				const uploadResponse = await fetch(s3grant, {
					method: "PUT",
					headers: {
						"Content-Type": data.image.type,
					},
					body: data.image,
				});

				if (!uploadResponse.ok) {
					throw new Error("Failed to upload image to S3");
				}

				setDialogOpen(false);

				await tRPCutils.team.readAll.refetch();
				await tRPCutils.s3.ReadMany.refetch();

				form.reset();
			}
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

	const resetForm = () => {
		form.reset();
		setImagePreview(null);
		setSubmitStatus(null);
		setIsSubmitting(false);
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
							<AvatarImage
								src={imagePreview ?? undefined}
								alt="Team image preview"
							/>
							<AvatarFallback className="flex flex-col items-center justify-center">
								<UploadCloud />
								<strong className="text-muted-foreground text-xs">
									UPLOAD
								</strong>
							</AvatarFallback>
						</Avatar>
						<div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
							<PlusIcon className="h-6 w-6 text-white" />
						</div>
						<Input
							accept="image/*"
							className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0"
							id="image"
							onChange={handleImageChange}
							type="file"
							aria-label="Upload team image"
						/>
					</div>
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
						onClick={() => resetForm()}
						data-slot="dialog-close"
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
								<Loader2 className="animate-spin" />{" "}
								{submitStatus ?? "Create Team"}
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
