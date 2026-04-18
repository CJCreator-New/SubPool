import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Command } from 'cmdk';
import { 
    Search, 
    Home, 
    Globe, 
    CreditCard, 
    Plus, 
    Settings, 
    LogOut,
    Sparkles,
    Shield
} from 'lucide-react';
import { useAuth } from '../../lib/supabase/auth';
import { NAV_ITEMS } from '../../lib/constants';
import { cn } from './ui/utils';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    // Listen for Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!user) return null;

    return (
        <>
            {/* Visual Trigger - Helper for users who don't know shortcuts */}
            <button
                onClick={() => setOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 h-9 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all text-xs font-mono"
            >
                <Search size={14} />
                <span>Search everything...</span>
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase font-sans">
                    ⌘K
                </kbd>
            </button>

            {/* The actual Palette */}
            <Command.Dialog
                open={open}
                onOpenChange={setOpen}
                label="Global Command Palette"
                className="fixed inset-0 z-[100] flex items-start justify-center pt-32 p-4 bg-black/60 backdrop-blur-sm"
            >
                <div className="w-full max-w-xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-premium shadow-premium">
                    <div className="flex items-center border-b border-white/5 px-4 h-14">
                        <Search className="mr-3 text-muted-foreground" size={18} />
                        <Command.Input
                            placeholder="Where would you like to go?"
                            className="flex-1 bg-transparent border-none outline-none text-foreground font-display text-base placeholder:text-muted-foreground/50"
                        />
                    </div>

                    <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-hide">
                        <Command.Empty className="p-8 text-center text-sm text-muted-foreground font-mono uppercase tracking-widest">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="px-2 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            {NAV_ITEMS.map((item) => (
                                <Command.Item
                                    key={item.path}
                                    onSelect={() => runCommand(() => navigate(item.path))}
                                    className="flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 aria-selected:bg-white/5 aria-selected:text-primary transition-colors cursor-pointer"
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>

                        <Command.Group heading="Quick Actions" className="mt-4 px-2 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-t border-white/5">
                            <Command.Item
                                onSelect={() => runCommand(() => navigate('/list'))}
                                className="flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 aria-selected:bg-white/5 aria-selected:text-primary cursor-pointer"
                            >
                                <Plus size={18} />
                                <span>Create a New Pool</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => navigate('/market'))}
                                className="flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 aria-selected:bg-white/5 aria-selected:text-primary cursor-pointer"
                            >
                                <Sparkles size={18} />
                                <span>View Market Intelligence</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Account" className="mt-4 px-2 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-t border-white/5 pb-2">
                             <Command.Item
                                onSelect={() => runCommand(() => navigate('/profile'))}
                                className="flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 aria-selected:bg-white/5 aria-selected:text-primary cursor-pointer"
                            >
                                <Settings size={18} />
                                <span>Settings & Security</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => signOut())}
                                className="flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5 aria-selected:bg-destructive/10 cursor-pointer"
                            >
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>

                    <div className="flex items-center justify-between border-t border-white/5 px-4 h-10 bg-white/[0.02]">
                        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1 rounded bg-white/10 uppercase">↑↓</kbd> Navigate
                            </span>
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1 rounded bg-white/10 uppercase">↵</kbd> Select
                            </span>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground/40">
                             FAST-PATH V1.0
                        </div>
                    </div>
                </div>
            </Command.Dialog>
        </>
    );
}
