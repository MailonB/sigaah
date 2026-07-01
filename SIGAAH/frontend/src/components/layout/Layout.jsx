import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

function Layout({ children }) {
  const [sidebarEncolhida, setSidebarEncolhida] = useState(() => {
    return localStorage.getItem("sidebarEncolhida") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarEncolhida", String(sidebarEncolhida));
  }, [sidebarEncolhida]);

  return (
    <div className="layout">
      <Sidebar
        encolhida={sidebarEncolhida}
        onToggle={() => setSidebarEncolhida((prev) => !prev)}
      />

      <main
        className={
          sidebarEncolhida
            ? "main-content main-content-collapsed"
            : "main-content"
        }
      >
        <Header />

        <section className="page-content">
          {children}
        </section>
      </main>
    </div>
  );
}

export default Layout;