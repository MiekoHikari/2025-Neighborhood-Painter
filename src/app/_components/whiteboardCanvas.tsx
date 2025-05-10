"use client";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

function WhiteboardCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
	const [drawing, setDrawing] = useState(false);
	const [currentColor, setCurrentColor] = useState("#000000");
	const [lineWidth, setLineWidth] = useState(3);
	const [drawingActions, setDrawingActions] = useState<{ path: { x: number; y: number }[]; style: { color: string; lineWidth: number } }[]>([]);
	const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
	const [currentStyle, setCurrentStyle] = useState({
		color: "#000000",
		lineWidth: 3,
	});

	const startDrawing = (e: React.MouseEvent) => {
		if (context) {
			context.beginPath();
			context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
			setDrawing(true);
		}
	};

	const draw = (e: React.MouseEvent) => {
		if (!drawing) return;
		if (context) {
			context.strokeStyle = currentStyle.color;
			context.lineWidth = currentStyle.lineWidth;
			context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
			context.stroke();
			setCurrentPath([...currentPath, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }]);
		}
	};

	const endDrawing = () => {
		setDrawing(false);
		if (context) context.closePath();

		if (currentPath.length > 0) {
			setDrawingActions([...drawingActions, { path: currentPath, style: currentStyle }]);
		}

		setCurrentPath([]);
	}

	const changeColor = (color: string) => {
		setCurrentColor(color);
		setCurrentStyle({ ...currentStyle, color });
	};

	const changeWidth = (width: number) => {
		setLineWidth(width);
		setCurrentStyle({ ...currentStyle, lineWidth: width });
	}

	const undoDrawing = () => {
		if (drawingActions.length > 0) {
			drawingActions.pop();

			if (canvasRef.current) {
				const newContext = canvasRef.current?.getContext("2d");
				
				if (newContext) {
					newContext?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

					for (const { path, style } of drawingActions) {
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
		}
	}

	const clearDrawing = () => {
		setDrawingActions([]);
		setCurrentPath([]);

		const newContext = canvasRef.current?.getContext("2d");
		if (newContext) {
			canvasRef.current && newContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		}
	}

	const reDrawPreviousData = useCallback((ctx: CanvasRenderingContext2D | null) => {
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
	}, [drawingActions]);

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

	return <canvas
			ref={canvasRef}
			onMouseDown={startDrawing}
			onMouseMove={draw}
			onMouseUp={endDrawing}
			onMouseOut={endDrawing}
			onBlur={endDrawing}
			className="border border-gray-400" />;
}

export default WhiteboardCanvas;
