import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  Package,
  HeartHandshake,
  ClipboardList,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

function Sidebar() {
  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Abrigos", path: "/abrigos", icon: Home },
    { label: "Pessoas", path: "/pessoas", icon: Users },
    { label: "Estoque", path: "/estoque", icon: Package },
    { label: "Voluntários", path: "/voluntarios", icon: HeartHandshake },
    { label: "Solicitações", path: "/solicitacoes", icon: ClipboardList },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>SIGAAH</h2>
        <span>Gestão Humanitária</span>
      </div>

      <nav className="sidebar-menu">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
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

      <button className="sidebar-logout">
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </aside>
  );
}

export default Sidebar;