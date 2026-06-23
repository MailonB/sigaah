import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";

import Dashboard from "../components/pages/dashboard/Dashboard";
import Login from "../components/pages/auth/Login";
import PrivateRoute from "./PrivateRoute";
import ListarAbrigos from "../components/pages/abrigos/ListarAbrigos";
import FormAbrigo from "../components/pages/abrigos/FormAbrigo";
import ListarPessoas from "../components/pages/pessoas/ListarPessoas";
import FormPessoa from "../components/pages/pessoas/FormPessoa";
import ListarEstoque from "../components/pages/estoque/ListarEstoque";
import FormItemEstoque from "../components/pages/estoque/FormItemEstoque";
import MovimentarEstoque from "../components/pages/estoque/MovimentarEstoque";
import ListarVoluntarios from "../components/pages/voluntarios/ListarVoluntarios";
import FormVoluntario from "../components/pages/voluntarios/FormVoluntario";
import ListarSolicitacoes from "../components/pages/solicitacoes/ListarSolicitacoes";
import FormSolicitacao from "../components/pages/solicitacoes/FormSolicitacao";
import Relatorios from "../components/pages/relatorios/Relatorios";
import CentralOperacoes from "../components/pages/central/CentralOperacoes";
import MapaOperacional from "../components/pages/mapa/MapaOperacional";

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
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

    <Route
  path="/abrigos"
  element={
    <PrivateRoute>
      <Layout>
        <ListarAbrigos />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/abrigos/novo"
  element={
    <PrivateRoute>
      <Layout>
        <FormAbrigo />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/abrigos/editar/:id"
  element={
    <PrivateRoute>
      <Layout>
        <FormAbrigo />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/pessoas-acolhidas"
  element={
    <PrivateRoute>
      <Layout>
        <ListarPessoas />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/pessoas-acolhidas/novo"
  element={
    <PrivateRoute>
      <Layout>
        <FormPessoa />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/pessoas-acolhidas/editar/:id"
  element={
    <PrivateRoute>
      <Layout>
        <FormPessoa />
      </Layout>
    </PrivateRoute>
  }
/>

     <Route
  path="/estoque"
  element={
    <PrivateRoute>
      <Layout>
        <ListarEstoque />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/estoque/novo"
  element={
    <PrivateRoute>
      <Layout>
        <FormItemEstoque />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/estoque/editar/:id"
  element={
    <PrivateRoute>
      <Layout>
        <FormItemEstoque />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/estoque/movimentar/:id"
  element={
    <PrivateRoute>
      <Layout>
        <MovimentarEstoque />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/voluntarios"
  element={
    <PrivateRoute>
      <Layout>
        <ListarVoluntarios />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/voluntarios/novo"
  element={
    <PrivateRoute>
      <Layout>
        <FormVoluntario />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/voluntarios/editar/:id"
  element={
    <PrivateRoute>
      <Layout>
        <FormVoluntario />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/solicitacoes"
  element={
    <PrivateRoute>
      <Layout>
        <ListarSolicitacoes />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/solicitacoes/novo"
  element={
    <PrivateRoute>
      <Layout>
        <FormSolicitacao />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/solicitacoes/editar/:id"
  element={
    <PrivateRoute>
      <Layout>
        <FormSolicitacao />
      </Layout>
    </PrivateRoute>
  }
/>

<Route
  path="/relatorios"
  element={
    <PrivateRoute>
      <Layout>
        <Relatorios />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/central"
  element={
    <PrivateRoute>
      <Layout>
        <CentralOperacoes />
      </Layout>
    </PrivateRoute>
  }

/>
<Route
  path="/mapa-operacional"
  element={
    <PrivateRoute>
      <Layout>
        <MapaOperacional />
      </Layout>
    </PrivateRoute>
  }
/>

    </Routes>
  );
}

export default AppRoutes;