import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>Conta Daimoku</h1>
      </div>
      <h2>Conta Daimoku Vesuvio</h2>
    </header>
  );
};

export default Header;
