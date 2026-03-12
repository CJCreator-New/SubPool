const PLACEHOLDER_PATTERNS = ['placeholder', 'your_url', 'your_supabase'];

export type DataMode = 'demo' | 'hybrid' | 'production';

function isPlaceholderUrl(url?: string): boolean {
    if (!url) return true;
    return PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
}

export function hasLiveSupabaseConfig(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    return Boolean(url && key && !isPlaceholderUrl(url));
}

export function resolveDataMode(options?: { allowDemoFallback?: boolean }): DataMode {
    if (hasLiveSupabaseConfig()) return 'production';
    if (options?.allowDemoFallback) return 'demo';
    return 'hybrid';
}

export function getHybridModeError(scope: string): string {
    return `Live data unavailable for ${scope}. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or open a demo route.`;
}
