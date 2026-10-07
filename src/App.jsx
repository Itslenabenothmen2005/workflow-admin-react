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
import {useSession} from "./hooks/useSession";
import {
  EmployeeDashboard,
  EmployeeProjects,
  EmployeeProjectDetail,
  EmployeeTasks,
  EmployeeCalendar,
  EmployeeAttendance,
  EmployeeLeave,
  EmployeeMeetings,
  EmployeeMessages,
  EmployeeNotifications,
  EmployeeSettings
} from "./pages/EmployeeSpace";
import {
  ChefDashboard,
  ChefTeam,
  ChefProjects,
  ChefProjectDetail,
  ChefTasks,
  ChefAttendance,
  ChefLeave,
  ChefReports,
  ChefMeetings,
  ChefMessages,
  ChefNotifications
} from "./pages/ChefSpace";

function Protected({children,title,subtitle,actions,role}) {
  const {user,loading}=useSession();

  if (loading) return <div className="app-loading">Chargement…</div>;
  if (!user) return <Navigate to="/login" replace/>;
  if (role && user.role !== role) {
    const home = user.role === "CHEF" ? "/chef" : user.role === "EMPLOYEE" ? "/employee" : user.role === "STAGIAIRE" ? "/stagiaire" : user.role === "FREELANCE" ? "/freelance" : "/dashboard";
    return <Navigate to={home} replace/>;
  }
  return <Layout title={title} subtitle={subtitle} actions={actions}>{children}</Layout>;
}

function HomeRedirect() {
  const {user,loading}=useSession();

  if (loading) return <div className="app-loading">Chargement…</div>;
  if (!user) return <Navigate to="/login" replace/>;

  const home = user.role === "CHEF" ? "/chef" : user.role === "EMPLOYEE" ? "/employee" : user.role === "STAGIAIRE" ? "/stagiaire" : user.role === "FREELANCE" ? "/freelance" : "/dashboard";
  return <Navigate to={home} replace/>;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login/>}/>

    <Route path="/dashboard" element={<Protected role="CEO" title="Dashboard" subtitle="Vue d'ensemble de l'activité"><Dashboard/></Protected>}/>
    <Route path="/vue-globale" element={<Protected role="CEO" title="Vue globale" subtitle="Synthèse de l'activité de l'entreprise"><Overview/></Protected>}/>
    <Route path="/statistiques" element={<Protected role="CEO" title="Statistiques" subtitle="Indicateurs de performance et tendances"><Statistics/></Protected>}/>
    <Route path="/chefs" element={<Protected role="CEO" title="Chefs d'équipe" subtitle="Gestion des comptes responsables"><Chiefs/></Protected>}/>
    <Route path="/employees" element={<Protected role="CEO" title="Employees" subtitle="Gestion des comptes collaborateurs"><Employees/></Protected>}/>
    <Route path="/projets" element={<Protected role="CEO" title="Projets" subtitle="Suivi et gestion des projets"><Projects/></Protected>}/>
    <Route path="/alertes" element={<Protected role="CEO" title="Alertes" subtitle="Notifications et signalements"><Alerts/></Protected>}/>
    <Route path="/parametres" element={<Protected role="CEO" title="Paramètres" subtitle="Configuration de votre espace"><Settings/></Protected>}/>

    <Route path="/chef" element={<Protected role="CHEF" title="Dashboard Chef" subtitle="Suivi opérationnel de votre équipe"><ChefDashboard/></Protected>}/>
    <Route path="/chef/equipe" element={<Protected role="CHEF" title="Mon équipe" subtitle="Suivi des membres et de leur charge"><ChefTeam/></Protected>}/>
    <Route path="/chef/projets" element={<Protected role="CHEF" title="Projets" subtitle="Projets de votre équipe et suivi de progression"><ChefProjects/></Protected>}/>
    <Route path="/chef/projets/:id" element={<Protected role="CHEF" title="Détail du projet" subtitle="Membres, tâches et risques"><ChefProjectDetail/></Protected>}/>
    <Route path="/chef/taches" element={<Protected role="CHEF" title="Tâches" subtitle="Planification, assignation et suivi des actions"><ChefTasks/></Protected>}/>
    <Route path="/chef/presences" element={<Protected role="CHEF" title="Présences" subtitle="Suivi des arrivées, absences et retards"><ChefAttendance/></Protected>}/>
    <Route path="/chef/conges" element={<Protected role="CHEF" title="Congés" subtitle="Demandes et validations"><ChefLeave/></Protected>}/>
    <Route path="/chef/rapports" element={<Protected role="CHEF" title="Rapports" subtitle="Validation des comptes-rendus et suivi"><ChefReports/></Protected>}/>
    <Route path="/chef/reunions" element={<Protected role="CHEF" title="Réunions" subtitle="Planning et organisation du travail"><ChefMeetings/></Protected>}/>
    <Route path="/chef/messages" element={<Protected role="CHEF" title="Messages" subtitle="Communication avec votre équipe"><ChefMessages/></Protected>}/>
    <Route path="/chef/notifications" element={<Protected role="CHEF" title="Notifications" subtitle="Alertes et rappels prioritaires"><ChefNotifications/></Protected>}/>
    <Route path="/chef/parametres" element={<Protected role="CHEF" title="Paramètres" subtitle="Configuration de votre espace"><Settings/></Protected>}/>

    <Route path="/employee" element={<Protected role="EMPLOYEE" title="Mon espace" subtitle="Votre activité et vos priorités"><EmployeeDashboard/></Protected>}/>
    <Route path="/employee/projets" element={<Protected role="EMPLOYEE" title="Mes projets" subtitle="Les projets auxquels vous participez"><EmployeeProjects/></Protected>}/>
    <Route path="/employee/projets/:id" element={<Protected role="EMPLOYEE" title="Détail du projet" subtitle="Avancement et tâches du projet"><EmployeeProjectDetail/></Protected>}/>
    <Route path="/employee/taches" element={<Protected role="EMPLOYEE" title="Mes tâches" subtitle="Vos actions et leur avancement"><EmployeeTasks/></Protected>}/>
    <Route path="/employee/calendrier" element={<Protected role="EMPLOYEE" title="Mon calendrier" subtitle="Échéances, réunions et absences"><EmployeeCalendar/></Protected>}/>
    <Route path="/employee/presences" element={<Protected role="EMPLOYEE" title="Mes présences" subtitle="Votre suivi des présences"><EmployeeAttendance/></Protected>}/>
    <Route path="/employee/conges" element={<Protected role="EMPLOYEE" title="Mes congés" subtitle="Demandes et suivi de validation"><EmployeeLeave/></Protected>}/>
    <Route path="/employee/reunions" element={<Protected role="EMPLOYEE" title="Mes réunions" subtitle="Les réunions auxquelles vous participez"><EmployeeMeetings/></Protected>}/>
    <Route path="/employee/messages" element={<Protected role="EMPLOYEE" title="Messages" subtitle="Échanges avec votre équipe"><EmployeeMessages/></Protected>}/>
    <Route path="/employee/notifications" element={<Protected role="EMPLOYEE" title="Notifications" subtitle="Les informations qui vous concernent"><EmployeeNotifications/></Protected>}/>
    <Route path="/employee/parametres" element={<Protected role="EMPLOYEE" title="Paramètres personnels" subtitle="Votre profil et vos préférences"><EmployeeSettings/></Protected>}/>

    <Route path="/stagiaire" element={<Protected role="STAGIAIRE" title="Mon espace" subtitle="Votre activité et vos priorités"><EmployeeDashboard/></Protected>}/>
    <Route path="/freelance" element={<Protected role="FREELANCE" title="Mon espace" subtitle="Votre activité et vos priorités"><EmployeeDashboard/></Protected>}/>

    <Route path="/" element={<HomeRedirect/>}/>
    <Route path="*" element={<HomeRedirect/>}/>
  </Routes>
}
