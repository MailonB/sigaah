import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem("usuario");
    return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  });

  const login = async (email, senha) => {
    const response = await api.post("/auth/login", {
      email,
      senha,
    });

    const { token, usuario } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    setUsuario(usuario);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const autenticado = !!localStorage.getItem("token");

  const temPerfil = (...perfisPermitidos) => {
    return perfisPermitidos.includes(usuario?.perfil);
  };

  const podeGerenciar = () => {
    return temPerfil("ADMIN", "GESTOR");
  };

  const podeExcluir = () => {
    return temPerfil("ADMIN");
  };

  const apenasVisualizar = () => {
    return temPerfil("VOLUNTARIO");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        autenticado,
        temPerfil,
        podeGerenciar,
        podeExcluir,
        apenasVisualizar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}