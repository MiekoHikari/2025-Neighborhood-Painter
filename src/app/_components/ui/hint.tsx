import type React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./tooltip";

interface HintProps {
	side?: "top" | "right" | "bottom" | "left";
	sideOffset?: number;
	align?: "start" | "center" | "end";
	alignOffset?: number;
	label: string;
}

function Hint({
	children,
	side,
	sideOffset,
	align,
	alignOffset,
	label,
}: React.PropsWithChildren<HintProps>) {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent
					className="border-black bg-black text-white"
					side={side}
					sideOffset={sideOffset}
					align={align}
					alignOffset={alignOffset}
				>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export default Hint;
