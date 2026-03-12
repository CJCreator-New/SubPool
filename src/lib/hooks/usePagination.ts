import { useState, useCallback } from 'react';

interface UsePaginationOptions {
    size?: number;
    initialPage?: number;
}

export function usePagination<T>(options: UsePaginationOptions = {}) {
    const { size = 12, initialPage = 0 } = options;
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const applyPagination = useCallback((
        query: any,
        currentPage: number = page
    ): any => {
        const from = currentPage * size;
        const to = from + size - 1;
        return query.range(from, to);
    }, [page, size]);

    const loadMore = useCallback(async (fetchCallback: (page: number) => Promise<T[]>) => {
        if (!hasMore || isLoadingMore) return [];

        setIsLoadingMore(true);
        try {
            const nextPage = page + 1;
            const newItems = await fetchCallback(nextPage);

            if (newItems.length < size) {
                setHasMore(false);
            }
            setPage(nextPage);
            return newItems;
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, page, size]);

    const reset = useCallback(() => {
        setPage(initialPage);
        setHasMore(true);
    }, [initialPage]);

    return {
        page,
        size,
        hasMore,
        isLoadingMore,
        applyPagination,
        loadMore,
        reset,
    };
}
