import { useState, useCallback, useEffect } from 'react';

interface CursorPaginationOptions<T> {
    fetchPage: (cursor: string | undefined, limit: number) => Promise<{ items: T[]; nextCursor: string | undefined }>;
    limit?: number;
}

export function useCursorPagination<T>(options: CursorPaginationOptions<T>) {
    const { limit = 10, fetchPage } = options;
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [totalApprox, setTotalApprox] = useState<number>(0);

    const fetchPageData = useCallback(async (cursorParam: string | undefined) => {
        setLoading(true);
        setError(null);
        try {
            const { items, nextCursor } = await fetchPage(cursorParam, limit);
            setData(prev => [...prev, ...items]);
            setCursor(nextCursor);
            setHasMore(!!nextCursor);
            setTotalApprox(prev => prev + items.length); // Approximation
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [fetchPage, limit]);

    const loadMore = useCallback(() => {
        if (!hasMore || loading) return;
        fetchPageData(cursor);
    }, [cursor, hasMore, loading, fetchPageData]);

    const reset = useCallback(() => {
        setData([]);
        setCursor(undefined);
        setHasMore(true);
        setTotalApprox(0);
    }, []);

    const refetch = useCallback(() => {
        reset();
        fetchPageData(undefined);
    }, [reset, fetchPageData]);

    // Initial load
    useEffect(() => {
        fetchPageData(undefined);
    }, [fetchPageData]);

    return {
        data: { items: data, nextCursor: cursor, totalApprox },
        loading,
        error,
        refetch,
        loadMore,
        hasMore,
        cursor,
    };
}