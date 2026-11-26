import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-emerald-100 via-sky-100 to-amber-100 p-6 md:p-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="w-full max-w-sm rounded-md border bg-white/90 p-7 shadow-lg shadow-emerald-900/10 dark:bg-slate-950/85">
                <div className="flex flex-col gap-7">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-md bg-emerald-500 text-white shadow-sm">
                                <AppLogoIcon className="size-8" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-semibold">{title}</h1>
                            <p className="text-muted-foreground text-center text-sm">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
