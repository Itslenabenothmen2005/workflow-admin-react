import {useEffect,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {Icon} from "./Icon";
import {useSession} from "../hooks/useSession";
import {avatarStyle,initials} from "../utils";

const ADMIN_NAV = [
  {title:"Pilotage",items:[
    ["dashboard","Dashboard","/dashboard"],
    ["globe","Vue globale","/vue-globale"],
    ["chart","Statistiques","/statistiques"]
  ]},
  {title:"Organisation",items:[
    ["briefcase","Chefs","/chefs"],
    ["users","Employees","/employees"],
    ["folder","Projets","/projets"]
  ]},
  {title:"Suivi",items:[["bell","Alertes","/alertes"]]},
  {title:"Compte",items:[["settings","Paramètres","/parametres"]]}
];

const CHEF_NAV = [
  {title:"Pilotage",items:[
    ["dashboard","Dashboard","/chef"],
    ["chart","Présences","/chef/presences"],
    ["folder","Projets","/chef/projets"]
  ]},
  {title:"Opérations",items:[
    ["users","Mon équipe","/chef/equipe"],
    ["check","Tâches","/chef/taches"],
    ["calendar","Réunions","/chef/reunions"],
    ["calendar","Congés","/chef/conges"]
  ]},
  {title:"Suivi",items:[
    ["bell","Notifications","/chef/notifications"],
    ["message","Messages","/chef/messages"],
    ["shield","Rapports","/chef/rapports"]
  ]},
  {title:"Paramètres",items:[["settings","Paramètres","/chef/parametres"]]}
];

const EMPLOYEE_NAV = [
  {title:"Mon activité",items:[
    ["dashboard","Dashboard","/employee"],
    ["folder","Mes projets","/employee/projets"],
    ["check","Mes tâches","/employee/taches"],
    ["calendar","Calendrier","/employee/calendrier"]
  ]},
  {title:"Vie d'équipe",items:[
    ["clock","Mes présences","/employee/presences"],
    ["calendar","Mes congés","/employee/conges"],
    ["calendar","Mes réunions","/employee/reunions"],
    ["message","Messages","/employee/messages"]
  ]},
  {title:"Suivi",items:[
    ["bell","Notifications","/employee/notifications"]
  ]},
  {title:"Compte",items:[
    ["settings","Paramètres","/employee/parametres"]
  ]}
];

function Avatar({name,size=36}) {
  return <span className="avatar" style={{"--size":`${size}px`,...avatarStyle(name)}} aria-hidden="true">{initials(name)}</span>;
}

export function useAppSettings() {
  const {user}=useSession();
  const [settings,setSettings]=useState(()=>{
    const saved = JSON.parse(localStorage.getItem("workflow_admin_settings")||"null");
    return saved || {
      theme:"dark",accent:"#7c5cff",density:"comfortable",
      profile:{name:user?.name || "Utilisateur",email:user?.email || "",phone:user?.phone || "",role:user?.role || "Utilisateur"}
    };
  });

  useEffect(()=>{
    localStorage.setItem("workflow_admin_settings",JSON.stringify(settings));
    document.documentElement.dataset.theme=settings.theme==="light"?"light":"dark";
    document.documentElement.dataset.density=settings.density;
    document.documentElement.style.setProperty("--accent",settings.accent);
  },[settings]);

  return [settings,setSettings];
}

export default function Layout({title,subtitle,actions,children}) {
  const location=useLocation();
  const navigate=useNavigate();
  const {user,role,logout: signOut}=useSession();
  const [settings]=useAppSettings();
  const [drawer,setDrawer]=useState(false);
  const [query,setQuery]=useState("");
  const [notifOpen,setNotifOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);

  useEffect(()=>{
    document.title = role === "EMPLOYEE" || role === "STAGIAIRE" || role === "FREELANCE" ? "Workflow Employé" : role === "CHEF" ? "Workflow Chef" : "Workflow Admin";
  },[role,location.pathname]);

  const NAV = role === "CHEF" ? CHEF_NAV : role === "EMPLOYEE" || role === "STAGIAIRE" || role === "FREELANCE" ? EMPLOYEE_NAV : ADMIN_NAV;
  const dashboardHome = role === "CHEF" ? "/chef" : role === "EMPLOYEE" ? "/employee" : role === "STAGIAIRE" ? "/stagiaire" : role === "FREELANCE" ? "/freelance" : "/dashboard";
  const profileRoute = role === "CHEF" ? "/chef/parametres" : role === "EMPLOYEE" ? "/employee/parametres" : role === "STAGIAIRE" ? "/stagiaire/parametres" : role === "FREELANCE" ? "/freelance/parametres" : "/parametres";
  const alertsRoute = role === "CHEF" ? "/chef/notifications" : role === "EMPLOYEE" ? "/employee/notifications" : role === "STAGIAIRE" ? "/stagiaire/notifications" : role === "FREELANCE" ? "/freelance/notifications" : "/alertes";

  async function logout(){
    await signOut();
    navigate("/login", {replace:true});
  }

  return <div className="app">
    <a className="skip-link" href="#main">Aller au contenu</a>

    <aside className={`sidebar ${drawer?"open":""}`}>
      <Link className="brand" to={dashboardHome} onClick={()=>setDrawer(false)}>
        <span className="brand-mark"><Icon name="target" size={24}/></span>
        <span className="brand-text"><strong>Cadran</strong><small>{role === "chef" ? "Espace chef" : role === "employee" ? "Espace employé" : "Espace administrateur"}</small></span>
      </Link>
      <nav className="nav" aria-label="Navigation principale">
        {NAV.map(group=><div key={group.title}>
          <p className="nav-title">{group.title}</p>
          {group.items.map(([icon,label,to])=><Link
            key={to} to={to} onClick={()=>setDrawer(false)}
            className="nav-link" aria-current={location.pathname===to?"page":undefined}>
            <Icon name={icon} size={20}/><span>{label}</span>
            {to === alertsRoute && unread>0 && <span className="nav-badge">{unread}</span>}
          </Link>)}
        </div>)}
      </nav>
      <div className="sidebar-foot">
        <div className="me"><Avatar name={settings.profile.name} size={38}/><div>
          <strong>{settings.profile.name}</strong><small>{settings.profile.role}</small>
        </div></div>
        <button className="nav-link nav-logout" onClick={logout}><Icon name="logout" size={20}/><span>Déconnexion</span></button>
      </div>
    </aside>

    {drawer && <div className="backdrop show" onClick={()=>setDrawer(false)}/>} 
    <div className="main">
      <header className="topbar">
        <button className="btn-icon menu-btn" onClick={()=>setDrawer(v=>!v)} aria-label="Ouvrir le menu"><Icon name="menu" size={22}/></button>
        <div className="gsearch">
          <label className="search"><span className="sr-only">Recherche globale</span><Icon name="search" size={18}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Escape"&&setQuery("")}
              type="search" placeholder={role === "chef" ? "Rechercher un membre, un projet, une réunion…" : role === "employee" ? "Rechercher un projet, une tâche, une réunion…" : "Rechercher un chef, un projet, un employee…"} autoComplete="off"/>
          </label>
          <kbd>/</kbd>
          {query && <div className="gsearch-panel">
            {results.length ? results.map(r=><Link key={r.to+r.name} className="gsearch-item" to={r.to} onClick={()=>setQuery("")}>
              <span className="g-ico"><Icon name={r.icon} size={18}/></span><div><strong>{r.name}</strong><small>{r.sub}</small></div>
            </Link>) : <div className="gsearch-empty">Aucun résultat pour « {query} »</div>}
          </div>}
        </div>

        <div className="topbar-right">
          <div className="clock">{new Date().toLocaleString("fr-FR",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
          <div className="pop-wrap">
            <Link className="btn-icon has-dot" to={alertsRoute} aria-label="Notifications">
              <Icon name="bell" size={21}/>
            </Link>
          </div>

          <div className="pop-wrap">
            <button className="profile-btn" onClick={()=>setProfileOpen(v=>!v)}>
              <Avatar name={settings.profile.name} size={32}/><span className="pname">{settings.profile.name}</span><Icon name="chevron-down" size={16}/>
            </button>
            {profileOpen&&<div className="popover">
              <Link className="menu-item" to={profileRoute}><Icon name="user" size={18}/>Mon profil</Link>
              <Link className="menu-item" to={`${profileRoute}#affichage`}><Icon name="sun" size={18}/>Préférences d'affichage</Link>
              <Link className="menu-item" to={alertsRoute}><Icon name="bell" size={18}/>{role === "employee" ? "Notifications" : "Alertes"}</Link>
              <div className="menu-sep"/>
              <button className="menu-item danger" onClick={logout}><Icon name="logout" size={18}/>Se déconnecter</button>
            </div>}
          </div>
        </div>
      </header>

      <main className="content" id="main" tabIndex="-1">
        <div className="page-head"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div><div className="page-actions">{actions}</div></div>
        {children}
      </main>
    </div>
  </div>
}
