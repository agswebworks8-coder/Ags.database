import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'white' | 'dark';
}

export default function Logo({ size = 40, className = '', variant = 'default' }: LogoProps) {
  const colors = {
    default: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      text: '#ffffff',
      bg: 'url(#logoGradient)',
    },
    white: {
      primary: '#ffffff',
      secondary: '#e0e7ff',
      text: '#2563eb',
      bg: '#ffffff',
    },
    dark: {
      primary: '#1e40af',
      secondary: '#6d28d9',
      text: '#ffffff',
      bg: 'url(#logoGradientDark)',
    },
  };

  const color = colors[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color.primary} />
          <stop offset="100%" stopColor={color.secondary} />
        </linearGradient>
        <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      
      {/* Circle background */}
      <circle cx="50" cy="50" r="48" fill={color.bg} />
      
      {/* AGS text */}
      <text
        x="50"
        y="45"
        textAnchor="middle"
        fill={color.text}
        fontSize="28"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        AGS
      </text>
      
      {/* WEBWORKS text */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fill={color.text}
        fontSize="10"
        fontWeight="600"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        WEBWORKS
      </text>
      
      {/* Decorative elements - code brackets */}
      <path
        d="M 20 50 L 15 55 L 20 60"
        stroke={color.text}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 80 50 L 85 55 L 80 60"
        stroke={color.text}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
