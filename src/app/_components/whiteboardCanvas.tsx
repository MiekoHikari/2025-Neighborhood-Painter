"use client";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

function WhiteboardCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
	const [drawing, setDrawing] = useState(false);
	const [currentColor, setCurrentColor] = useState("#FF0000");
	const [lineWidth, setLineWidth] = useState(5);
	const [drawingActions, setDrawingActions] = useState<
		{
			path: { x: number; y: number }[];
			style: { color: string; lineWidth: number };
		}[]
	>([]);
	const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
		[],
	);
	const [currentStyle, setCurrentStyle] = useState({
		color: currentColor,
		lineWidth: lineWidth,
	});

	const startDrawing = useCallback(
		(e: React.MouseEvent) => {
			if (context) {
				context.beginPath();
				context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
				setDrawing(true);
			}
		},
		[context],
	);

	const draw = useCallback(
		(e: React.MouseEvent) => {
			if (!drawing) return;
			if (context) {
				context.strokeStyle = currentStyle.color;
				context.lineWidth = currentStyle.lineWidth;
				context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
				context.stroke();
				setCurrentPath((prevPath) => [
					...prevPath,
					{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY },
				]);
			}
		},
		[drawing, context, currentStyle],
	);

	const endDrawing = useCallback(() => {
		setDrawing(false);
		if (context) context.closePath();

		if (currentPath.length > 0) {
			setDrawingActions((prevActions) => [
				...prevActions,
				{ path: currentPath, style: currentStyle },
			]);
		}

		setCurrentPath([]);
	}, [context, currentPath, currentStyle]);

	const changeColor = useCallback((color: string) => {
		setCurrentColor(color);
		setCurrentStyle((prevStyle) => ({ ...prevStyle, color }));
	}, []);

	const changeWidth = useCallback((width: number) => {
		setLineWidth(width);
		setCurrentStyle((prevStyle) => ({ ...prevStyle, lineWidth: width }));
	}, []);

	const undoDrawing = useCallback(() => {
		setDrawingActions((prevActions) => {
			const updatedActions = [...prevActions];
			updatedActions.pop();

			if (canvasRef.current) {
				const newContext = canvasRef.current?.getContext("2d");

				if (newContext) {
					newContext.clearRect(
						0,
						0,
						canvasRef.current.width,
						canvasRef.current.height,
					);

					for (const { path, style } of updatedActions) {
						newContext.beginPath();
						newContext.strokeStyle = style.color;
						newContext.lineWidth = style.lineWidth;
						path[0] && newContext.moveTo(path[0].x, path[0].y);

						for (const point of path) {
							newContext.lineTo(point.x, point.y);
						}

						newContext.stroke();
					}
				}
			}

			return updatedActions;
		});
	}, []);

	const clearDrawing = useCallback(() => {
		setDrawingActions([]);
		setCurrentPath([]);

		const newContext = canvasRef.current?.getContext("2d");
		if (newContext) {
			canvasRef.current &&
				newContext.clearRect(
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height,
				);
		}
	}, []);

	const reDrawPreviousData = useCallback(
		(ctx: CanvasRenderingContext2D | null) => {
			for (const { path, style } of drawingActions) {
				if (ctx) {
					ctx.beginPath();
					ctx.strokeStyle = style.color;
					ctx.lineWidth = style.lineWidth;
					path[0] && ctx.moveTo(path[0].x, path[0].y);

					for (const point of path) {
						ctx.lineTo(point.x, point.y);
					}

					ctx.stroke();
				}
			}
		},
		[drawingActions],
	);

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			canvas.width = 900;
			canvas.height = 500;

			const ctx = canvas.getContext("2d");
			setContext(ctx);
			reDrawPreviousData(ctx);
		}
	}, [reDrawPreviousData]);

	return (
		<canvas
			ref={canvasRef}
			onMouseDown={startDrawing}
			onMouseMove={draw}
			onMouseUp={endDrawing}
			onMouseOut={endDrawing}
			onBlur={endDrawing}
			className="border border-gray-400"
		/>
	);
}

export default WhiteboardCanvas;
