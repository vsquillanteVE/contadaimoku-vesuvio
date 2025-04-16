import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`logo-container ${className}`}>
      <img src="/logo.png" alt="Logo Capitolo Litorale Vesuviano" className="logo-image" />
    </div>
  );
};

export default Logo;
