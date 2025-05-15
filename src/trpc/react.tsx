"use client";

import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	httpBatchStreamLink,
	httpSubscriptionLink,
	loggerLink,
	retryLink,
	splitLink,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import type { AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";
let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return createQueryClient();
	}
	// Browser: use singleton pattern to keep the same query client
	clientQueryClientSingleton ??= createQueryClient();

	return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();

	const [trpcClient] = useState(() =>
		api.createClient({
			links: [
				loggerLink({
					enabled: (op) =>
						process.env.NODE_ENV === "development" ||
						(op.direction === "down" && op.result instanceof Error),
				}),
				splitLink({
					condition: (op) => op.type === "subscription",
					true: [
						retryLink({
							retry: (opts) => {
								// opts.op.type will always be 'subscription' since we're in a splitLink
								const code = opts.error.data?.code;
								if (!code) {
									// This shouldn't happen as our httpSubscriptionLink will automatically retry within when there's a non-parsable response
									console.error("No error code found, retrying", opts);
									return true;
								}
								if (code === "UNAUTHORIZED" || code === "FORBIDDEN") {
									console.log("Retrying due to 401/403 error");
									return true;
								}
								return false;
							},
						}),
						httpSubscriptionLink({
							transformer: SuperJSON,
							url: `${getBaseUrl()}/api/trpc`,
							eventSourceOptions: async ({ op }) => {
								const headers = new Headers();

								return { headers };
							},
						}),
					],
					false: httpBatchStreamLink({
						transformer: SuperJSON,
						url: `${getBaseUrl()}/api/trpc`,
						headers: () => {
							const headers = new Headers();
							headers.set("x-trpc-source", "nextjs-react");
							return headers;
						},
					}),
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<api.Provider client={trpcClient} queryClient={queryClient}>
				{props.children}
			</api.Provider>
		</QueryClientProvider>
	);
}

function getBaseUrl() {
	if (typeof window !== "undefined") return window.location.origin;
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT ?? 3000}`;
}
