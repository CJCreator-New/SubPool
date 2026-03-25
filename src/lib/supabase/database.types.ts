export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            pools: {
                Row: {
                    id: string;
                    owner_id: string;
                    platform: string;
                    plan_name: string;
                    total_cost: number;
                    total_slots: number;
                    filled_slots: number;
                    price_per_slot: number;
                    category: string | null;
                    status: string;
                    billing_cycle: string | null;
                    description: string | null;
                    auto_approve: boolean | null;
                    search_vector: unknown | null;
                    deleted_at: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    owner_id: string;
                    platform: string;
                    plan_name: string;
                    total_cost: number;
                    total_slots: number;
                    filled_slots?: number;
                    price_per_slot: number;
                    category?: string | null;
                    status?: string;
                    billing_cycle?: string | null;
                    description?: string | null;
                    auto_approve?: boolean | null;
                    search_vector?: unknown | null;
                    deleted_at?: string | null;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['pools']['Insert']>;
                Relationships: [];
            };
            profiles: {
                Row: {
                    id: string;
                    username: string;
                    display_name: string | null;
                    avatar_url: string | null;
                    avatar_color: string | null;
                    bio: string | null;
                    rating: number | null;
                    rating_count: number | null;
                    total_hosted: number | null;
                    disputes: number | null;
                    avg_response_time_mins: number | null;
                    created_at: string | null;
                };
                Insert: {
                    id: string;
                    username: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    avatar_color?: string | null;
                    bio?: string | null;
                    rating?: number | null;
                    rating_count?: number | null;
                    total_hosted?: number | null;
                    disputes?: number | null;
                    avg_response_time_mins?: number | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
                Relationships: [];
            };
            memberships: {
                Row: {
                    id: string;
                    pool_id: string;
                    user_id: string;
                    status: string;
                    price_per_slot: number;
                    joined_at: string | null;
                    created_at: string | null;
                    next_billing_at: string | null;
                    billing_anchor_day: number | null;
                    cancelled_at: string | null;
                };
                Insert: {
                    id?: string;
                    pool_id: string;
                    user_id: string;
                    status?: string;
                    price_per_slot: number;
                    joined_at?: string | null;
                    created_at?: string | null;
                    next_billing_at?: string | null;
                    billing_anchor_day?: number | null;
                    cancelled_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
                Relationships: [];
            };
            join_requests: {
                Row: {
                    id: string;
                    pool_id: string;
                    requester_id: string;
                    status: string;
                    message: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    pool_id: string;
                    requester_id: string;
                    status?: string;
                    message?: string | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['join_requests']['Insert']>;
                Relationships: [];
            };
            messages: {
                Row: {
                    id: string;
                    pool_id: string | null;
                    thread_id: string | null;
                    sender_id: string;
                    content: string | null;
                    body: string | null;
                    read_at: string | null;
                    read_by: string[] | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    pool_id?: string | null;
                    thread_id?: string | null;
                    sender_id?: string;
                    content?: string | null;
                    body?: string | null;
                    read_at?: string | null;
                    read_by?: string[] | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['messages']['Insert']>;
                Relationships: [];
            };
            credentials: {
                Row: {
                    id: string;
                    pool_id: string;
                    encrypted_data: string;
                    nonce: string;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    pool_id: string;
                    encrypted_data: string;
                    nonce: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['credentials']['Insert']>;
                Relationships: [];
            };
            wishlist_requests: {
                Row: {
                    id: string;
                    user_id: string | null;
                    platform: string;
                    budget_max: number | null;
                    urgency: string | null;
                    status: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    platform: string;
                    budget_max?: number | null;
                    urgency?: string | null;
                    status?: string | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['wishlist_requests']['Insert']>;
                Relationships: [];
            };
            ledger: {
                Row: {
                    id: string;
                    pool_id: string | null;
                    user_id: string | null;
                    membership_id: string | null;
                    amount: number | null;
                    amount_cents: number | null;
                    type: string | null;
                    status: string;
                    due_date: string | null;
                    paid_at: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    pool_id?: string | null;
                    user_id?: string | null;
                    membership_id?: string | null;
                    amount?: number | null;
                    amount_cents?: number | null;
                    type?: string | null;
                    status?: string;
                    due_date?: string | null;
                    paid_at?: string | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['ledger']['Insert']>;
                Relationships: [];
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    icon: string | null;
                    title: string;
                    body: string;
                    read: boolean | null;
                    action_url: string | null;
                    source_id: string | null;
                    source_type: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: string;
                    icon?: string | null;
                    title: string;
                    body: string;
                    read?: boolean | null;
                    action_url?: string | null;
                    source_id?: string | null;
                    source_type?: string | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
                Relationships: [];
            };
            notification_preferences: {
                Row: {
                    user_id: string;
                    all_notifs: boolean;
                    payment_reminders: boolean;
                    weekly_digest: boolean;
                    digest_day: number;
                    digest_hour_utc: number;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    user_id: string;
                    all_notifs?: boolean;
                    payment_reminders?: boolean;
                    weekly_digest?: boolean;
                    digest_day?: number;
                    digest_hour_utc?: number;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>;
                Relationships: [];
            };
            platform_pricing: {
                Row: {
                    id: string;
                    platform_id: string;
                    platform: string | null;
                    platform_name: string;
                    category: string;
                    plan_name: string;
                    billing_cycle: string;
                    country_code: string;
                    currency: string;
                    official_price: number;
                    price_per_seat: number | null;
                    max_seats: number | null;
                    min_slots: number | null;
                    supports_sharing: boolean | null;
                    sharing_policy: string | null;
                    source: string;
                    last_checked_at: string | null;
                    updated_at: string | null;
                    is_active: boolean | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    platform_id: string;
                    platform?: string | null;
                    platform_name: string;
                    category: string;
                    plan_name: string;
                    billing_cycle: string;
                    country_code: string;
                    currency: string;
                    official_price: number;
                    price_per_seat?: number | null;
                    max_seats?: number | null;
                    min_slots?: number | null;
                    supports_sharing?: boolean | null;
                    sharing_policy?: string | null;
                    source: string;
                    last_checked_at?: string | null;
                    updated_at?: string | null;
                    is_active?: boolean | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['platform_pricing']['Insert']>;
                Relationships: [];
            };
            pool_market_metrics: {
                Row: {
                    platform_id: string | null;
                    active_pools: number | null;
                    avg_price_cents: number | null;
                };
                Insert: {
                    platform_id: string;
                    active_pools?: number | null;
                    avg_price_cents?: number | null;
                };
                Update: Partial<Database['public']['Tables']['pool_market_metrics']['Insert']>;
                Relationships: [];
            };
            rate_limits: {
                Row: {
                    id: string;
                    ip_address: string | null;
                    user_id: string | null;
                    endpoint: string;
                    request_count: number | null;
                    window_start: string | null;
                };
                Insert: {
                    id?: string;
                    ip_address?: string | null;
                    user_id?: string | null;
                    endpoint: string;
                    request_count?: number | null;
                    window_start?: string | null;
                };
                Update: Partial<Database['public']['Tables']['rate_limits']['Insert']>;
                Relationships: [];
            };
            platforms: {
                Row: {
                    id: string;
                    name: string;
                    icon: string;
                    category: string;
                    created_at: string | null;
                };
                Insert: {
                    id: string;
                    name: string;
                    icon: string;
                    category: string;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['platforms']['Insert']>;
                Relationships: [];
            };
            threads: {
                Row: {
                    id: string;
                    last_message: string | null;
                    last_message_at: string | null;
                };
                Insert: {
                    id?: string;
                    last_message?: string | null;
                    last_message_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['threads']['Insert']>;
                Relationships: [];
            };
            ratings: {
                Row: {
                    id: string;
                    rater_id: string;
                    rated_id: string;
                    pool_id: string;
                    score: number;
                    review: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    rater_id: string;
                    rated_id: string;
                    pool_id: string;
                    score: number;
                    review?: string | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
                Relationships: [];
            };
            push_tokens: {
                Row: {
                    id: string;
                    user_id: string;
                    token: string;
                    platform: string;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    token: string;
                    platform: string;
                    created_at?: string | null;
                    updated_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['push_tokens']['Insert']>;
                Relationships: [];
            };
            user_plans: {
                Row: {
                    id: string;
                    user_id: string;
                    plan_id: string;
                    billing_cycle: string | null;
                    started_at: string | null;
                    expires_at: string | null;
                    stripe_subscription_id: string | null;
                    is_active: boolean | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    plan_id?: string;
                    billing_cycle?: string | null;
                    started_at?: string | null;
                    expires_at?: string | null;
                    stripe_subscription_id?: string | null;
                    is_active?: boolean | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['user_plans']['Insert']>;
                Relationships: [];
            };
            analytics_events: {
                Row: {
                    id: string;
                    user_id: string | null;
                    event_name: string;
                    properties: Json | null;
                    session_id: string | null;
                    created_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    event_name: string;
                    properties?: Json | null;
                    session_id?: string | null;
                    created_at?: string | null;
                };
                Update: Partial<Database['public']['Tables']['analytics_events']['Insert']>;
                Relationships: [];
            };
        };
        Views: {
            pool_market_metrics: {
                Row: {
                    platform_id: string | null;
                    active_pools: number | null;
                    avg_price_cents: number | null;
                };
            };
        };
        Functions: {
            soft_delete_pool: {
                Args: {
                    pool_uuid: string;
                };
                Returns: undefined;
            };
            mark_messages_read: {
                Args: {
                    p_pool_id: string;
                };
                Returns: undefined;
            };
            mark_all_notifications_read: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
        };
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}

export type PublicSchema = Database['public'];
export type PublicTables = PublicSchema['Tables'];
export type PublicTableName = keyof PublicTables;
