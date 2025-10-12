export function getLastModifiedText(
	lastEdited?: Date | string | null,
	options?: { empty?: string }
): string {
	const empty = options?.empty ?? "—";
	if (!lastEdited) return empty;

	const date = typeof lastEdited === "string" ? new Date(lastEdited) : lastEdited;
	if (!(date instanceof Date) || isNaN(date.getTime())) return empty;

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	if (diffMs < 0) {
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffMin < 1) return "Just now";
	if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
	if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;

	const day = date.getDate();
	const month = date.toLocaleString("en-US", { month: "short" });
	const year = date.getFullYear();
	const ordinal = (n: number) => (n > 3 && n < 21 ? "th" : ["th", "st", "nd", "rd"][Math.min(n % 10, 4)] || "th");

	return `Last modified on ${day}${ordinal(day)} ${month}, ${year}`;
}

export const formatRelativeTime = (input?: string | Date | null): string => {
	if (!input) return "";
	const date = typeof input === "string" ? new Date(input) : input;
	if (!(date instanceof Date) || isNaN(date.getTime())) return "";

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	if (diffMs < 0) return ""; // future

	const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
	if (diffInHours < 24) {
		return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
	}
	const diffInDays = Math.floor(diffInHours / 24);
	return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
};
