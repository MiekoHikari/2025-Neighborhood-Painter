"use client";
import React, { useEffect, useRef, useState } from "react";

function WhiteboardCanvas() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
	const [drawing, setDrawing] = useState(false);
	const [currentColor, setCurrentColor] = useState("#000000");
	const [lineWidth, setLineWidth] = useState(3);
	const [drawingActions, setDrawingActions] = useState([]);
	const [currentPath, setCurrentPath] = useState([]);
	const [currentStyle, setCurrentStyle] = useState({
		color: "#000000",
		lineWidth: 3,
	});

	useEffect(() => {
		if (canvasRef.current) {
			const canvas = canvasRef.current;
			canvas.width = 900;
			canvas.height = 500;

			const ctx = canvas.getContext("2d");
			setContext(ctx);
			reDrawPreviousData(ctx);
		}
	});

	return <div>WhiteboardCanvas</div>;
}

export default WhiteboardCanvas;

function reDrawPreviousData(ctx: CanvasRenderingContext2D | null) {
	throw new Error("Function not implemented.");
}
