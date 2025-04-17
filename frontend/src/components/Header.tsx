import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo.png" alt="Logo Capitolo Litorale Vesuviano" className="logo-image" />
        <div className="title-container">
          <h1 className="main-title">Conta Daimoku</h1>
          <h2 className="subtitle">Capitolo Litorale Vesuviano</h2>
        </div>
      </div>
    </header>
  );
};

export default Header;
