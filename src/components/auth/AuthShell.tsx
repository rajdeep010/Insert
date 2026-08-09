import type { ReactNode } from "react";
import { BookOpenText, FolderGit2, Layers3, ShieldCheck, Sparkles, Users } from "lucide-react";

import InsertIcon from "@/components/InsertIcon";
import { Navbar } from "@/components/landing/Navbar";
import { Badge } from "@/components/ui/badge";

type AuthShellProps = {
    mode: "sign-in" | "sign-up";
    title: string;
    description: string;
    children: ReactNode;
    footer: ReactNode;
};

const workspaceItems = [
    { icon: Layers3, label: "Structured topics", detail: "Build focused coding sheets." },
    { icon: BookOpenText, label: "Technical writing", detail: "Draft and publish in context." },
    { icon: FolderGit2, label: "Project releases", detail: "Turn shipped work into stories." },
    { icon: Users, label: "Shared workspaces", detail: "Collaborate with clear roles." },
];

export default function AuthShell({ mode, title, description, children, footer }: AuthShellProps) {
    const isSignIn = mode === "sign-in";

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-white">
            <Navbar />
            <div aria-hidden="true" className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(100,116,139,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.09)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_82%)]" />
            <div aria-hidden="true" className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-indigo-500/15 blur-[120px]" />
            <div aria-hidden="true" className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[110px]" />

            <div className="relative mx-auto grid min-h-screen w-full max-w-[1560px] items-center gap-8 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-28">
                <section className="hidden overflow-hidden rounded-xl border border-white/10 bg-slate-950 text-white shadow-2xl shadow-indigo-950/20 lg:block">
                    <div className="relative p-10 xl:p-12">
                        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(99,102,241,0.28),transparent_34%),radial-gradient(circle_at_88%_82%,rgba(6,182,212,0.14),transparent_32%)]" />
                        <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
                        <div className="relative">
                            <div className="flex items-center gap-3"><InsertIcon height={42} width={42} className="rounded-md border border-white/10 bg-white p-1.5" /><span className="text-xl font-semibold tracking-[-0.04em]">Insert</span></div>
                            <Badge className="mt-16 rounded-md border-indigo-400/20 bg-indigo-400/10 text-indigo-200 hover:bg-indigo-400/10"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Developer workspace v7</Badge>
                            <h1 className="mt-5 max-w-2xl text-5xl font-semibold tracking-[-0.06em] xl:text-6xl">{isSignIn ? "Your work is ready when you are." : "One account. Every developer workflow."}</h1>
                            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">Move between coding sheets, technical blogs, typed collections, project releases, and collaboration without losing context.</p>
                            <div className="mt-12 grid gap-3 sm:grid-cols-2">
                                {workspaceItems.map(({ icon: Icon, label, detail }) => <div key={label} className="rounded-md border border-white/10 bg-white/[0.05] p-4 backdrop-blur"><Icon className="h-4 w-4 text-indigo-300" /><p className="mt-3 text-sm font-medium">{label}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>)}
                            </div>
                            <div className="mt-10 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-400"><ShieldCheck className="h-4 w-4 text-emerald-400" />Private work remains protected by account-level access controls.</div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white/75 p-5 shadow-[0_24px_90px_-48px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 sm:p-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 lg:hidden"><InsertIcon height={36} width={36} className="rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700" /><span className="font-semibold">Insert</span></div>
                        <p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">{isSignIn ? "Welcome back" : "Create your workspace"}</p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
                    </div>
                    {children}
                    <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 dark:border-slate-800">{footer}</div>
                </section>
            </div>
        </main>
    );
}
