import React from 'react';

interface LegoStudIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

const LegoStudIcon: React.FC<LegoStudIconProps> = ({ size = 24, color = '#60a5fa', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Base of the stud */}
    <circle cx="12" cy="12" r="8" fill={color} stroke="none" />
    {/* Top highlight/bevel */}
    <circle cx="12" cy="10" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    {/* Inner circle for the stud effect */}
    <circle cx="12" cy="12" r="4" fill="rgba(0,0,0,0.1)" stroke="none" />
  </svg>
);

export default LegoStudIcon;