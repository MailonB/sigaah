import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Users,
  Package,
  HeartHandshake,
  ClipboardList,
  LogOut,
    Map,
} from "lucide-react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FileText } from "lucide-react";
import { Siren } from "lucide-react";


function Sidebar() {

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
    { label: "Mapa Operacional", path: "/mapa-operacional", icon: Map },];
    

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

      <button
  className="sidebar-logout"
  onClick={handleLogout}
>
        <span>Sair</span>
      </button>
    </aside>
  );
}

export default Sidebar;