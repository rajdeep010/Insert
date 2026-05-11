import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Privacy Policy | Insert",
	description: "Privacy policy for Insert and the Insert Chrome extension.",
}

const sections = [
	{
		title: "Information We Collect",
		body: [
			"Insert stores account details you provide directly, such as your username, email address, and profile information.",
			"When you connect GitHub, Insert stores the access token and the repository metadata needed to create and sync projects and release notes.",
			"The Insert Chrome extension only sends data required to authenticate you with Insert and save release-note content to your Insert account.",
		],
	},
	{
		title: "How We Use Information",
		body: [
			"We use your information to sign you in, show your projects, sync repositories, generate release notes, and improve the Insert experience.",
			"We do not sell your personal data.",
		],
	},
	{
		title: "Chrome Extension Data Use",
		body: [
			"The extension communicates only with Insert services to authenticate your session and save project-related content.",
			"The extension does not read unrelated browsing history, does not inject remote code, and does not transfer user data to third parties for advertising.",
		],
	},
	{
		title: "Data Sharing",
		body: [
			"We share data only with service providers required to operate Insert, such as hosting, database, analytics, and email delivery providers.",
			"GitHub data is accessed only when you authorize Insert to connect your GitHub account.",
		],
	},
	{
		title: "Data Retention",
		body: [
			"We retain account and project data for as long as your account remains active or as needed to provide the service.",
			"You can request deletion of your account-related data by contacting us.",
		],
	},
	{
		title: "Security",
		body: [
			"We use reasonable technical and organizational measures to protect your information. No online service can guarantee absolute security.",
		],
	},
	{
		title: "Contact",
		body: [
			"For privacy questions or deletion requests, contact us at rajdeepmallick999@gmail.com.",
		],
	},
]

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-16 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70 sm:p-10">
				<div className="space-y-4">
					<Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">
						Back to Insert
					</Link>
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600/80 dark:text-indigo-300/80">Privacy Policy</p>
						<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Insert Privacy Policy</h1>
						<p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
							This policy explains what data Insert collects, how it is used, and how the Insert Chrome extension handles user data.
						</p>
						<p className="text-xs text-slate-500 dark:text-slate-400">Effective date: May 11, 2026</p>
					</div>
				</div>

				<div className="space-y-8">
					{sections.map((section) => (
						<section key={section.title} className="space-y-3">
							<h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
							<div className="space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
								{section.body.map((paragraph) => (
									<p key={paragraph}>{paragraph}</p>
								))}
							</div>
						</section>
					))}
				</div>
			</div>
		</div>
	)
}