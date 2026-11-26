import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleDropdown({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    return (
        <div className={className} {...props}>
            <Button
                type="button"
                variant="ghost"
                className="h-9 gap-2 rounded-full px-2"
                onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                aria-label="Ganti tema terang gelap"
            >
                <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${isDark ? 'bg-slate-700' : 'bg-amber-300'}`}>
                    <span className={`flex size-5 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}>
                        {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
                    </span>
                </span>
            </Button>
        </div>
    );
}
