import React from 'react';
import { C, F } from '../../tokens';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const earningsData = [
  { month: 'Sep', amount: 120 },
  { month: 'Oct', amount: 180 },
  { month: 'Nov', amount: 150 },
  { month: 'Dec', amount: 240 },
  { month: 'Jan', amount: 310 },
  { month: 'Feb', amount: 280 },
];

const memberReliability = [
  { name: 'Alex T', score: 98 },
  { name: 'Sarah M', score: 95 },
  { name: 'Mike D', score: 92 },
  { name: 'Riya K', score: 100 },
];

export function ProAnalytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>📊</span>
        <h2 style={{ margin: 0, fontFamily: F.syne, fontWeight: 700, fontSize: 18, color: C.textPrimary }}>
          Pro Analytics
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Pool Performance Card */}
        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              color: C.textMuted,
            }}
          >
            POOL PERFORMANCE
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <MetricItem label="Fill Rate" value="94%" />
            <MetricItem label="Avg Fill Time" value="1.3d" />
            <MetricItem label="Payment Rate" value="96%" />
          </div>

          {/* Earnings Chart */}
          <div style={{ height: 120, width: '100%', marginTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsData}>
                <XAxis 
                  dataKey="month" 
                  hide 
                />
                <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: C.bgSurface, border: `1px solid ${C.borderDefault}`, borderRadius: 4 }}
                  itemStyle={{ color: C.accentLime, fontFamily: F.mono, fontSize: 11 }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={C.accentLime} 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: C.accentLime, strokeWidth: 0 }} 
                  activeDot={{ r: 5, fill: C.accentLime, stroke: C.bgBase, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {earningsData.map(d => (
                <span key={d.month} style={{ fontFamily: F.mono, fontSize: 9, color: C.textMuted }}>{d.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Member Reliability Card */}
        <div
          style={{
            backgroundColor: C.bgSurface,
            border: `1px solid ${C.borderDefault}`,
            borderRadius: 6,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              color: C.textMuted,
            }}
          >
            MEMBER RELIABILITY
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {memberReliability.map((member) => (
              <div key={member.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: F.syne, fontSize: 12, color: C.textPrimary, width: 60, flexShrink: 0 }}>
                  {member.name}
                </span>
                <div style={{ flex: 1, height: 8, backgroundColor: C.bgBase, borderRadius: 100, overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${member.score}%`, 
                      backgroundColor: member.score > 95 ? C.accentLime : C.statusWarning, 
                      borderRadius: 100 
                    }} 
                  />
                </div>
                <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMuted, width: 32, textAlign: 'right' }}>
                  {member.score}%
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 10 }}>
            <p style={{ margin: 0, fontFamily: F.syne, fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>
              Scores based on payment speed and communication responsiveness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: F.mono, fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: F.mono, fontSize: 16, fontWeight: 600, color: C.textPrimary }}>{value}</span>
    </div>
  );
}
