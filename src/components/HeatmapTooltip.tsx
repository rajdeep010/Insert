import React from 'react'

interface TooltipProps {
    content: string;
    position: { x: number; y: number };
    show: boolean;
}

const HeatmapTooltip = ({ content, position, show }: TooltipProps) => {
    if (!show) return null;

    const tooltipStyle: React.CSSProperties = {
        position: 'absolute',
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)',
        backgroundColor: '#333',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '5px',
        pointerEvents: 'none',
        zIndex: 1000,
    }

    return <div style={tooltipStyle}>{content}</div>;
}

export default HeatmapTooltip