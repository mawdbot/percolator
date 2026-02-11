// components/StatCard.tsx — Animated metric card
'use client';

import { useEffect, useRef, useState } from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    suffix?: string;
    icon?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan';
    animDelay?: number;
    tooltip?: string;
}

const colorMap: Record<string, string> = {
    blue: 'var(--accent-blue)',
    emerald: 'var(--accent-emerald)',
    violet: 'var(--accent-violet)',
    amber: 'var(--accent-amber)',
    rose: 'var(--accent-rose)',
    cyan: 'var(--accent-cyan)',
};

const bgMap: Record<string, string> = {
    blue: 'rgba(59, 130, 246, 0.12)',
    emerald: 'rgba(52, 211, 153, 0.12)',
    violet: 'rgba(163, 139, 250, 0.12)',
    amber: 'rgba(251, 191, 36, 0.12)',
    rose: 'rgba(251, 113, 133, 0.12)',
    cyan: 'rgba(34, 211, 238, 0.12)',
};

export function StatCard({
    label,
    value,
    suffix,
    icon,
    trend,
    trendValue,
    color = 'blue',
    animDelay = 0,
    tooltip,
}: StatCardProps) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), animDelay * 1000);
        return () => clearTimeout(timer);
    }, [animDelay]);

    return (
        <div
            ref={ref}
            className={tooltip ? 'tooltip-trigger' : ''}
            data-tooltip={tooltip}
            style={{
                background: 'var(--gradient-card)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                boxShadow: 'var(--shadow-card)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Top glow line */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent 0%, ${colorMap[color]} 50%, transparent 100%)`,
                    opacity: 0.6,
                }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                    style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}
                >
                    {label}
                </span>
                {icon && (
                    <span
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            background: bgMap[color],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.95rem',
                        }}
                    >
                        {icon}
                    </span>
                )}
            </div>

            <div
                style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: colorMap[color],
                    lineHeight: 1.2,
                }}
            >
                {value}
                {suffix && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 500 }}>
                        {suffix}
                    </span>
                )}
            </div>

            {trend && trendValue && (
                <div style={{ marginTop: '8px' }}>
                    <span
                        className={`stat-pill ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral'}`}
                    >
                        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'}
                        {trendValue}
                    </span>
                </div>
            )}
        </div>
    );
}
