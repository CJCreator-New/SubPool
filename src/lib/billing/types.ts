export type BillingCapability = 'placeholder' | 'enabled';
export type PaymentStatus = 'not_configured' | 'pending_manual' | 'recorded';

export interface BillingCycleSummary {
    poolName: string;
    poolIcon: string;
    billingDate: string;
    members: number;
    collected: number;
    outstanding: number;
}

export interface UpcomingBillingItem {
    date: string;
    pool: string;
    amount: number;
}

export interface InvoiceSummary {
    cycleRangeLabel: string;
    daysElapsed: number;
    totalDays: number;
    cycles: BillingCycleSummary[];
    upcoming: UpcomingBillingItem[];
}

export interface BillingCapabilitiesResponse {
    capability: BillingCapability;
    paymentStatus: PaymentStatus;
    message: string;
}

export interface BillingService {
    getCapabilities(): Promise<BillingCapabilitiesResponse>;
    getInvoiceSummary(): Promise<InvoiceSummary>;
    recordManualSettlementPlaceholder(input: {
        ledgerId: string;
        amount: number;
        note?: string;
    }): Promise<{ ok: true; status: PaymentStatus }>;
}
