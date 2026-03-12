export interface ListQuery<TFilters extends Record<string, unknown> = Record<string, unknown>> {
    cursor?: string;
    limit: number;
    sort?: string;
    filters?: TFilters;
}

export interface ListResult<T> {
    items: T[];
    nextCursor?: string;
    totalApprox?: number;
}
