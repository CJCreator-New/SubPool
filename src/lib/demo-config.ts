export interface DemoStep {
    step: number;
    label: string;
    path: string;
    insight?: string;
}

export const DEMO_STEPS: DemoStep[] = [
    {
        step: 1,
        label: "Open Browse — point to 142 pools stat",
        path: "/browse",
        insight: "142 open pools = immediate liquidity. Users find a match in under 4 minutes on average."
    },
    {
        step: 2,
        label: "Filter Entertainment — show instant response",
        path: "/browse",
    },
    {
        step: 3,
        label: "Click Netflix card — highlight $4.99 vs $15.99",
        path: "/browse",
        insight: "$4.99 vs $15.99 solo. The value is obvious at a glance. No convincing needed."
    },
    {
        step: 4,
        label: "Point to ratings — mention trust layer",
        path: "/browse",
        insight: "⭐ 4.9 from 38 pools. Our rating system makes sharing with strangers feel safe."
    },
    {
        step: 5,
        label: "Request to Join — show 2-sided marketplace",
        path: "/browse",
    },
    {
        step: 6,
        label: "Go to Notifications — show approval flow",
        path: "/notifications",
    },
    {
        step: 7,
        label: "Go to My Pools — show Sarah's perspective",
        path: "/my-pools",
    },
    {
        step: 8,
        label: "Go to Ledger — explain monthly stickiness",
        path: "/ledger",
        insight: "Ledger = monthly return visits. Built-in re-engagement, zero effort."
    },
    {
        step: 9,
        label: "Mark as Paid — show loop closing",
        path: "/ledger",
    },
    {
        step: 10,
        label: "Show Profile — mention owner economics",
        path: "/profile",
        insight: "Owner earns back 75% of subscription cost. That's why they list — and stay."
    }
];

export const DEMO_INSIGHTS: Record<string, { title: string; body: string; position: 'top-right' | 'bottom-left' | 'right' }> = {
    'browse-stats': {
        title: "WHY THIS MATTERS",
        body: "142 open pools = immediate liquidity. Users find a match in under 4 minutes on average.",
        position: 'top-right'
    },
    'netflix-card': {
        title: "WHY THIS MATTERS",
        body: "$4.99 vs $15.99 solo. The value is obvious at a glance. No convincing needed.",
        position: 'right'
    },
    'pool-rating': {
        title: "WHY THIS MATTERS",
        body: "⭐ 4.9 from 38 pools. Our rating system makes sharing with strangers feel safe.",
        position: 'bottom-left'
    },
    'ledger-table': {
        title: "WHY THIS MATTERS",
        body: "Ledger = monthly return visits. Built-in re-engagement, zero effort.",
        position: 'top-right'
    },
    'profile-rating': {
        title: "WHY THIS MATTERS",
        body: "Owner earns back 75% of subscription cost. That's why they list — and stay.",
        position: 'right'
    }
};
