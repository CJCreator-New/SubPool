import React, { useEffect, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { cn } from './ui/utils';

// ─── COMPONENT 1: EarningsSparkline ──────────────────────────────────────────

interface EarningsSparklineProps {
    data: { month: string; amount: number }[];
    color?: string;
}

export function EarningsSparkline({ data, color }: EarningsSparklineProps) {
    return (
        <div style={{ width: '120px', height: '40px' }}>
            <ResponsiveContainer width="100%" height={40}>
                <LineChart data={data}>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-[#161616] border border-[#2A2A2A] font-mono text-[11px] px-2 py-1 rounded">
                                        ${payload[0].value}
                                    </div>
                                );
                            }
                            return null;
                        }}
                        cursor={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke={color || '#C8F135'}
                        strokeWidth={1.5}
                        dot={false}
                        animationDuration={800}
                        animationEasing="ease-out"
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── COMPONENT 2: EarningsBarChart ───────────────────────────────────────────

interface EarningsBarChartProps {
    data: { month: string; earned: number; would_have_paid: number }[];
}

export function EarningsBarChart({ data }: EarningsBarChartProps) {
    return (
        <div className="w-full">
            <div style={{ height: '180px' }}>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#2A2A2A" strokeDasharray="3" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6B6860', fontFamily: 'monospace' }} dy={10} />
                        <YAxis hide={true} />
                        <Tooltip
                            cursor={{ fill: '#1A1A1A' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length === 2) {
                                    const wouldHavePaid = payload[0].value as number;
                                    const earned = payload[1].value as number;
                                    return (
                                        <div className="bg-[#161616] border border-[#2A2A2A] rounded-[6px] p-3 shadow-lg">
                                            <p className="font-mono text-[11px] text-[#F0ECE4]">
                                                Earned ${earned} · Solo would cost ${wouldHavePaid} · Net ${earned - wouldHavePaid}/mo
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="would_have_paid" fill="#2A2A2A" radius={[4, 4, 0, 0]} animationBegin={0} animationDuration={1000} />
                        <Bar dataKey="earned" fill="#C8F135" radius={[4, 4, 0, 0]} animationBegin={0} animationDuration={1000} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 font-mono text-[10px] text-[#6B6860]">
                <div className="flex items-center gap-1.5">
                    <span className="text-[#2A2A2A]" role="img" aria-label="icon">■</span> Would pay
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[#C8F135]" role="img" aria-label="icon">■</span> Earned
                </div>
            </div>
        </div>
    );
}

// ─── COMPONENT 3: PoolHealthGauge ────────────────────────────────────────────

interface PoolHealthGaugeProps {
    score: number; // 0-100
}

export function PoolHealthGauge({ score }: PoolHealthGaugeProps) {
    const [offset, setOffset] = useState(Math.PI * 60);
    const arcLength = Math.PI * 60; // Approx 188.49

    const getColor = (s: number) => {
        if (s <= 60) return '#FF4D4D';
        if (s <= 80) return '#F5A623';
        return '#4DFF91';
    };

    useEffect(() => {
        // Animate on mount
        const timeout = setTimeout(() => {
            setOffset(arcLength * (1 - score / 100));
        }, 100);
        return () => clearTimeout(timeout);
    }, [score, arcLength]);

    return (
        <div className="relative inline-flex flex-col items-center">
            <svg width="160" height="120" viewBox="0 0 160 120">
                {/* Background Arc */}
                <path
                    d="M 20,100 A 60,60 0 0,1 140,100"
                    stroke="#2A2A2A"
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Progress Arc */}
                <path
                    d="M 20,100 A 60,60 0 0,1 140,100"
                    stroke={getColor(score)}
                    strokeWidth={8}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={arcLength}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1200ms ease-out' }}
                />
            </svg>
            <div className="absolute top-[60px] flex flex-col items-center">
                <span className="font-display font-bold text-2xl" style={{ color: getColor(score) }}>
                    {score}
                </span>
                <span className="font-mono text-xs text-[#6B6860] mt-0.5">/100</span>
            </div>
            <div className="absolute top-[102px] flex justify-between w-[140px] font-mono text-[9px] text-[#6B6860]">
                <span>Poor</span>
                <span>Great</span>
            </div>
        </div>
    );
}

// ─── COMPONENT 4: MemberPaymentTimeline ──────────────────────────────────────

type PaymentStatus = 'paid' | 'late' | 'missed' | 'pending';

interface MemberPaymentTimelineProps {
    members: {
        name: string;
        avatar?: string;
        payments: { month: string; status: PaymentStatus }[];
    }[];
}

export function MemberPaymentTimeline({ members }: MemberPaymentTimelineProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!members || members.length === 0) return null;

    const months = members[0].payments.map(p => p.month);

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case 'paid': return '#4DFF91';
            case 'late': return '#F5A623';
            case 'missed': return '#FF4D4D';
            case 'pending': return '#2A2A2A';
            default: return '#2A2A2A';
        }
    };

    const getStatusLabel = (status: PaymentStatus) => {
        switch (status) {
            case 'paid': return 'Paid on time';
            case 'late': return 'Paid late';
            case 'missed': return 'Missed payment';
            case 'pending': return 'Pending';
            default: return 'Unknown';
        }
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-fit">
                {/* Header Row */}
                <div className="flex mb-3">
                    <div className="w-24 shrink-0" />
                    <div className="flex gap-4">
                        {months.map(month => (
                            <div key={month} className="w-6 text-center font-mono text-[10px] text-[#6B6860]">
                                {month}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Member Rows */}
                <div className="space-y-4">
                    {members.map((member, rowIndex) => (
                        <div key={member.name} className="flex items-center">
                            <div className="w-24 shrink-0 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-[9px] text-foreground shrink-0 border border-border">
                                    {member.avatar || member.name.charAt(0)}
                                </div>
                                <span className="font-mono text-[11px] text-muted-foreground truncate">{member.name}</span>
                            </div>
                            <div className="flex gap-4">
                                {member.payments.map((payment, colIndex) => {
                                    const delay = rowIndex * 100 + colIndex * 30;
                                    return (
                                        <div
                                            key={payment.month}
                                            className="group relative w-6 flex justify-center"
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor: getStatusColor(payment.status),
                                                    transform: mounted ? 'scale(1)' : 'scale(0)',
                                                    transitionDelay: mounted ? `${delay}ms` : '0ms'
                                                }}
                                            />
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-[#161616] border border-[#2A2A2A] rounded px-2 py-1 font-mono text-[10px] text-foreground whitespace-nowrap z-10 shadow-lg">
                                                {member.name} · {payment.month} · {getStatusLabel(payment.status)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
