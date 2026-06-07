import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Dashboard from "../components/pages/dashboard/Dashboard";



function Placeholder({ title }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>Módulo em desenvolvimento.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />

      <Route
        path="/abrigos"
        element={
          <Layout>
            <Placeholder title="Abrigos" />
          </Layout>
        }
      />

      <Route
        path="/pessoas"
        element={
          <Layout>
            <Placeholder title="Pessoas Abrigadas" />
          </Layout>
        }
      />

      <Route
        path="/estoque"
        element={
          <Layout>
            <Placeholder title="Estoque" />
          </Layout>
        }
      />

      <Route
        path="/voluntarios"
        element={
          <Layout>
            <Placeholder title="Voluntários" />
          </Layout>
        }
      />

      <Route
        path="/solicitacoes"
        element={
          <Layout>
            <Placeholder title="Solicitações de Ajuda" />
          </Layout>
        }
      />
    </Routes>
  );
}

export default AppRoutes;