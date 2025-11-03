import React from 'react';

interface LegoGoldBrickIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const LegoGoldBrickIcon: React.FC<LegoGoldBrickIconProps> = ({ size = 32, color = '#FFD700', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    {/* Main brick body */}
    <rect x="2" y="8" width="20" height="12" rx="1" fill={color} stroke="#D4AF37" strokeWidth="1" />
    
    {/* Top surface highlight */}
    <rect x="2" y="6" width="20" height="4" rx="0.5" fill="#FFE55C" stroke="#D4AF37" strokeWidth="1" />
    
    {/* Studs */}
    <circle cx="8" cy="8" r="2" fill="#FFE55C" stroke="#D4AF37" strokeWidth="0.5" />
    <circle cx="16" cy="8" r="2" fill="#FFE55C" stroke="#D4AF37" strokeWidth="0.5" />
    
    {/* Stud highlights */}
    <circle cx="8" cy="8" r="1.2" fill="rgba(255,255,255,0.3)" />
    <circle cx="16" cy="8" r="1.2" fill="rgba(255,255,255,0.3)" />
    
    {/* Brick side shading */}
    <path d="M2 6 L6 8 L6 20 L2 18 Z" fill="rgba(0,0,0,0.15)" />
  </svg>
);

export default LegoGoldBrickIcon;

