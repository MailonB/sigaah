import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  Package,
  HeartHandshake,
  ClipboardList,
  LogOut,
  Map,
  FileText,
  Siren,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import "./Sidebar.css";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ encolhida, onToggle }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Abrigos", path: "/abrigos", icon: Home },
    { label: "Pessoas", path: "/pessoas-acolhidas", icon: Users },
    { label: "Estoque", path: "/estoque", icon: Package },
    { label: "Voluntários", path: "/voluntarios", icon: HeartHandshake },
    { label: "Solicitações", path: "/solicitacoes", icon: ClipboardList },
    { label: "Relatórios", path: "/relatorios", icon: FileText },
    { label: "Central de Operações", path: "/central", icon: Siren },
    { label: "Mapa Operacional", path: "/mapa-operacional", icon: Map },
  ];

  return (
    <aside className={encolhida ? "sidebar collapsed" : "sidebar"}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <h2>{encolhida ? "S" : "SIGAAH"}</h2>
          {!encolhida && <span>Gestão Humanitária</span>}
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggle}
          title={encolhida ? "Expandir menu" : "Encolher menu"}
        >
          {encolhida ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
      </div>

      <nav className="sidebar-menu">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={encolhida ? item.label : ""}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout} title="Sair">
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </aside>
  );
}

export default Sidebar;