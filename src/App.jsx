import {Navigate,Route,Routes} from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Statistics from "./pages/Statistics";
import Employees from "./pages/Employees";
import Chiefs from "./pages/Chiefs";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Overview from "./pages/Overview";

function Protected({children,title,subtitle,actions}) {
  const logged=!!localStorage.getItem("workflow_admin_session");
  if(!logged) return <Navigate to="/login" replace/>;
  return <Layout title={title} subtitle={subtitle} actions={actions}>{children}</Layout>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/dashboard" element={<Protected title="Dashboard" subtitle="Vue d'ensemble de l'activité"><Dashboard/></Protected>}/>
    <Route path="/vue-globale" element={<Protected title="Vue globale" subtitle="Synthèse de l'activité de l'entreprise"><Overview/></Protected>}/>
    <Route path="/statistiques" element={<Protected title="Statistiques" subtitle="Indicateurs de performance et tendances"><Statistics/></Protected>}/>
    <Route path="/chefs" element={<Protected title="Chefs d'équipe" subtitle="Gestion des comptes responsables"><Chiefs/></Protected>}/>
    <Route path="/employees" element={<Protected title="Employees" subtitle="Gestion des comptes collaborateurs"><Employees/></Protected>}/>
    <Route path="/projets" element={<Protected title="Projets" subtitle="Suivi et gestion des projets"><Projects/></Protected>}/>
    <Route path="/alertes" element={<Protected title="Alertes" subtitle="Notifications et signalements"><Alerts/></Protected>}/>
    <Route path="/parametres" element={<Protected title="Paramètres" subtitle="Configuration de votre espace"><Settings/></Protected>}/>
    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
  </Routes>
}
