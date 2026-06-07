import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="page-content">
          {children}
        </section>
      </main>
    </div>
  );
}

export default Layout;