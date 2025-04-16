import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo.png" alt="Logo Capitolo Litorale Vesuviano" className="logo-image" />
        <h1>Conta Daimoku Capitolo Litorale Vesuviano</h1>
      </div>
    </header>
  );
};

export default Header;
