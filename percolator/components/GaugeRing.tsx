// components/GaugeRing.tsx — SVG ring gauge for ratio metrics
'use client';

interface GaugeRingProps {
    value: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    unit?: string;
}

export function GaugeRing({
    value,
    size = 120,
    strokeWidth = 8,
    color = 'var(--accent-blue)',
    label,
    unit = '%',
}: GaugeRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(value, 100) / 100) * circumference;

    return (
        <div className="gauge-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={strokeWidth}
                />
                {/* Value arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: `drop-shadow(0 0 6px ${color})`,
                    }}
                />
            </svg>
            <div className="gauge-label">
                <div className="gauge-value" style={{ color }}>
                    {value.toFixed(1)}
                </div>
                <div className="gauge-unit">{unit || label}</div>
            </div>
        </div>
    );
}
