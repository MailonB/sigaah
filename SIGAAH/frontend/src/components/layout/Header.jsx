import "./Header.css";

function Header() {
  return (
    <header className="header">
      <div>
        <h1>Sistema de Gestão de Abrigos e Ajuda Humanitária</h1>
        <p>Monitoramento operacional em tempo real</p>
      </div>

      <div className="header-user">
        <span>Mailon</span>
        <div className="avatar">M</div>
      </div>
    </header>
  );
}

export default Header;