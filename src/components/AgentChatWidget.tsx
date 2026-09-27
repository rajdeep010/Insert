"use client";

import { useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, type PanInfo } from "motion/react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

interface ChatMessage {
	role: "user" | "assistant" | "error";
	content: string;
}

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const ASSISTANT_NAME = "Dex";
const BUTTON_SIZE = 56; // h-14 / w-14
const EDGE_MARGIN = 24; // matches the old bottom-6/left-6 spacing
const PANEL_GAP = 12;
const PANEL_WIDTH = 432; // w-[27rem]

// Same radial-glow treatment as the landing page's dark CTA card
// (src/components/landing/CTA.tsx) — kept identical so Dex's panel reads as
// the same brand element, not a one-off color scheme.
const GLOW_BACKGROUND =
	"radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.3),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(6,182,212,0.18),transparent_32%)";

const SUGGESTION_POOL = [
	"How many hard problems do I have?",
	"What topics do I have?",
	"What does Insert provide?",
	"Tell me about the Projects module",
	"What's Insert Pro?",
	"Show me my problem stats",
	"What can the Chrome extension do?",
	"How does collaboration work?",
];

function pickSuggestions(count: number) {
	return [...SUGGESTION_POOL].sort(() => Math.random() - 0.5).slice(0, count);
}

function cornerPoint(corner: Corner) {
	const maxX = window.innerWidth - BUTTON_SIZE - EDGE_MARGIN;
	const maxY = window.innerHeight - BUTTON_SIZE - EDGE_MARGIN;
	return {
		x: corner.endsWith("left") ? EDGE_MARGIN : maxX,
		y: corner.startsWith("top") ? EDGE_MARGIN : maxY,
	};
}

function nearestCorner(pointX: number, pointY: number): Corner {
	const horizontal = pointX < window.innerWidth / 2 ? "left" : "right";
	const vertical = pointY < window.innerHeight / 2 ? "top" : "bottom";
	return `${vertical}-${horizontal}` as Corner;
}

function panelStyle(corner: Corner, buttonPoint: { x: number; y: number }): React.CSSProperties {
	const style: React.CSSProperties = { position: "fixed" };

	if (corner.startsWith("top")) {
		style.top = buttonPoint.y + BUTTON_SIZE + PANEL_GAP;
	} else {
		style.bottom = window.innerHeight - buttonPoint.y + PANEL_GAP;
	}

	if (corner.endsWith("left")) {
		style.left = buttonPoint.x;
	} else {
		style.right = window.innerWidth - buttonPoint.x - BUTTON_SIZE;
	}

	return style;
}

type MarkdownChildren = { children?: React.ReactNode };

const markdownComponents = {
	p: ({ children }: MarkdownChildren) => <p className="mb-2 last:mb-0">{children}</p>,
	strong: ({ children }: MarkdownChildren) => <strong className="font-semibold text-white">{children}</strong>,
	ul: ({ children }: MarkdownChildren) => (
		<ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
	),
	ol: ({ children }: MarkdownChildren) => (
		<ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
	),
	li: ({ children }: MarkdownChildren) => <li>{children}</li>,
	a: ({ href, children }: MarkdownChildren & { href?: string }) => (
		<a href={href} target="_blank" rel="noreferrer" className="text-cyan-300 underline underline-offset-2">
			{children}
		</a>
	),
	table: ({ children }: MarkdownChildren) => (
		<div className="dex-scrollbar mb-2 overflow-x-auto last:mb-0">
			<table className="w-full border-collapse text-xs">{children}</table>
		</div>
	),
	th: ({ children }: MarkdownChildren) => (
		<th className="border border-white/10 bg-white/5 px-2 py-1 text-left font-medium text-white">{children}</th>
	),
	td: ({ children }: MarkdownChildren) => <td className="border border-white/10 px-2 py-1">{children}</td>,
	pre: ({ children }: MarkdownChildren) => (
		<pre className="dex-scrollbar mb-2 overflow-x-auto whitespace-pre rounded-lg bg-black/30 p-3 text-xs last:mb-0">
			{children}
		</pre>
	),
	code: ({ className, children }: MarkdownChildren & { className?: string }) => {
		// Fenced code blocks get a language-* className from remark; inline
		// code doesn't. The <pre> wrapper above already handles scrolling for
		// blocks, so block-level code just needs to not double up on padding.
		if (className) {
			return <code className={className}>{children}</code>;
		}
		return <code className="rounded bg-white/10 px-1 py-0.5 text-xs">{children}</code>;
	},
};

export default function AgentChatWidget() {
	const { status, data: session } = useSession();
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [question, setQuestion] = useState("");
	const [loading, setLoading] = useState(false);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [corner, setCorner] = useState<Corner>("bottom-left");
	const [buttonPoint, setButtonPoint] = useState({ x: EDGE_MARGIN, y: EDGE_MARGIN });
	const bottomRef = useRef<HTMLDivElement>(null);
	const hasDraggedRef = useRef(false);
	const x = useMotionValue(EDGE_MARGIN);
	const y = useMotionValue(EDGE_MARGIN);

	useEffect(() => {
		const initial = cornerPoint("bottom-left");
		x.set(initial.x);
		y.set(initial.y);
		setButtonPoint(initial);

		const unsubX = x.on("change", (value) => setButtonPoint((prev) => ({ ...prev, x: value })));
		const unsubY = y.on("change", (value) => setButtonPoint((prev) => ({ ...prev, y: value })));
		return () => {
			unsubX();
			unsubY();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const target = cornerPoint(corner);
		const controlsX = animate(x, target.x, { type: "spring", stiffness: 400, damping: 32 });
		const controlsY = animate(y, target.y, { type: "spring", stiffness: 400, damping: 32 });
		return () => {
			controlsX.stop();
			controlsY.stop();
		};
	}, [corner, x, y]);

	useEffect(() => {
		const handleResize = () => {
			const target = cornerPoint(corner);
			x.set(target.x);
			y.set(target.y);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [corner, x, y]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	useEffect(() => {
		if (open && messages.length === 0 && suggestions.length === 0) {
			setSuggestions(pickSuggestions(3));
		}
	}, [open, messages.length, suggestions.length]);

	if (status !== "authenticated") {
		return null;
	}

	const sendQuestion = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || loading) return;

		setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
		setQuestion("");
		setLoading(true);

		try {
			const response = await fetch("/api/agent/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: trimmed }),
			});
			const data = await response.json();

			if (data.success) {
				setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
			} else {
				setMessages((prev) => [
					...prev,
					{ role: "error", content: data.message ?? "Something went wrong." },
				]);
			}
		} catch {
			setMessages((prev) => [
				...prev,
				{ role: "error", content: "Could not reach the assistant. Try again." },
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void sendQuestion(question);
		}
	};

	const handleDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
		setCorner(nearestCorner(info.point.x, info.point.y));
	};

	const firstName = session?.user?.name?.split(" ")[0];

	return (
		<>
			<motion.button
				drag
				dragMomentum={false}
				dragElastic={0.1}
				style={{ position: "fixed", top: 0, left: 0, x, y, zIndex: 50 }}
				onDragStart={() => {
					hasDraggedRef.current = true;
				}}
				onDragEnd={handleDragEnd}
				onClick={() => {
					if (hasDraggedRef.current) {
						hasDraggedRef.current = false;
						return;
					}
					setOpen((prev) => !prev);
				}}
				whileTap={{ scale: 0.94 }}
				whileHover={{ scale: 1.05 }}
				aria-label={open ? `Close ${ASSISTANT_NAME}` : `Open ${ASSISTANT_NAME}, your Insert assistant`}
				className="flex h-14 w-14 cursor-grab items-center justify-center rounded-full border border-white/10 bg-slate-950 text-white shadow-xl shadow-indigo-500/20 active:cursor-grabbing"
			>
				<span aria-hidden="true" className="absolute inset-0 rounded-full" style={{ backgroundImage: GLOW_BACKGROUND }} />
				{open ? <X className="relative h-5 w-5" /> : <MessageCircle className="relative h-5 w-5" />}
			</motion.button>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.97 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.97 }}
						transition={{ duration: 0.18, ease: "easeOut" }}
						style={{ ...panelStyle(corner, buttonPoint), width: PANEL_WIDTH, zIndex: 50 }}
						className="flex h-[75vh] max-h-[44rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl"
					>
						<div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: GLOW_BACKGROUND }} />

						<div className="relative flex items-center gap-2 border-b border-white/10 px-4 py-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
								<Sparkles className="h-4 w-4" />
							</div>
							<div>
								<p className="text-sm font-semibold leading-none">{ASSISTANT_NAME}</p>
								<p className="text-xs text-slate-400">Insert&apos;s AI Assistant</p>
							</div>
						</div>

						<div className="dex-scrollbar relative flex-1 overflow-y-auto px-4 py-3">
							{messages.length === 0 && (
								<div className="space-y-3">
									<p className="text-sm text-slate-400">
										{firstName ? `Hey ${firstName}, ` : "Hi, "}ask me about your topics, or what
										Insert can do. I can answer questions, but I can&apos;t create or edit anything
										yet.
									</p>
									<div className="flex flex-wrap gap-2">
										{suggestions.map((suggestion) => (
											<button
												key={suggestion}
												onClick={() => void sendQuestion(suggestion)}
												className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-200 transition-colors hover:bg-indigo-500/20"
											>
												{suggestion}
											</button>
										))}
									</div>
								</div>
							)}
							<div className="space-y-3">
								{messages.map((message, index) => (
									<div
										key={index}
										className={cn(
											"max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
											message.role === "user" && "ml-auto rounded-br-sm bg-white text-slate-950",
											message.role === "assistant" &&
												"rounded-bl-sm border border-cyan-500/10 bg-cyan-500/10 text-slate-100",
											message.role === "error" && "rounded-bl-sm bg-red-500/10 text-red-300"
										)}
									>
										{message.role === "assistant" ? (
											<ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
												{message.content}
											</ReactMarkdown>
										) : (
											message.content
										)}
									</div>
								))}
								{loading && (
									<div className="flex items-center gap-2 text-sm text-slate-400">
										<span className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
										{ASSISTANT_NAME} is thinking...
									</div>
								)}
							</div>
							<div ref={bottomRef} />
						</div>

						<div className="relative flex items-end gap-2 border-t border-white/10 p-3">
							<textarea
								value={question}
								onChange={(event) => setQuestion(event.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Ask a question..."
								rows={1}
								className="min-h-10 flex-1 resize-none rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
							/>
							<button
								onClick={() => void sendQuestion(question)}
								disabled={loading || !question.trim()}
								aria-label="Send"
								className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-40"
							>
								<Send className="h-4 w-4" />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
