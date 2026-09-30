import {useEffect,useMemo,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {Icon} from "./Icon";
import {DB,saveDb} from "../data/mockData";
import {ago,avatarStyle,initials} from "../utils";

const NAV=[
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

function Avatar({name,size=36}) {
  return <span className="avatar" style={{"--size":`${size}px`,...avatarStyle(name)}} aria-hidden="true">{initials(name)}</span>;
}

export function useAppSettings() {
  const [settings,setSettings]=useState(()=>JSON.parse(localStorage.getItem("workflow_admin_settings")||"null")||{
    theme:"dark",accent:"#7c5cff",density:"comfortable",
    profile:{name:"Yassine Belhadj",email:"admin@atlas-numerique.tn",phone:"+216 71 234 567",role:"Directeur général (CEO)"},
    app:{company:"Atlas Numérique",timezone:"Africa/Tunis",lateThreshold:3}
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
  const [settings,setSettings]=useAppSettings();
  const [drawer,setDrawer]=useState(false);
  const [query,setQuery]=useState("");
  const [notifOpen,setNotifOpen]=useState(false);
  const [profileOpen,setProfileOpen]=useState(false);

  const unread=DB.alerts.filter(a=>!a.read&&!a.archived).length;

  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return [];
    // Modification demandée : les CLIENTS ne sont plus proposés dans la barre de recherche.
    const index=[
      ...DB.chefs.map(c=>({name:c.name,sub:`Chef · équipe ${DB.teams.find(t=>t.id===c.team)?.name}`,to:`/chefs?q=${encodeURIComponent(c.name)}`,icon:"briefcase"})),
      ...DB.employees.map(e=>({name:e.name,sub:`Employee · équipe ${DB.teams.find(t=>t.id===e.team)?.name}`,to:`/employees?q=${encodeURIComponent(e.name)}`,icon:"user"})),
      ...DB.projects.map(p=>({name:p.name,sub:`Projet · ${p.status.toLowerCase()}`,to:`/projets?q=${encodeURIComponent(p.name)}`,icon:"folder"}))
    ];
    return index.filter(x=>x.name.toLowerCase().includes(q)).slice(0,7);
  },[query]);

  function logout(){
    localStorage.removeItem("workflow_admin_session");
    navigate("/login");
  }

  function markAllRead(){
    DB.alerts.forEach(a=>a.read=true);
    saveDb();
    setNotifOpen(false);
  }

  return <div className="app">
    <a className="skip-link" href="#main">Aller au contenu</a>

    <aside className={`sidebar ${drawer?"open":""}`}>
      <Link className="brand" to="/dashboard" onClick={()=>setDrawer(false)}>
        <span className="brand-mark"><Icon name="target" size={24}/></span>
        <span className="brand-text"><strong>Cadran</strong><small>Espace administrateur</small></span>
      </Link>
      <nav className="nav" aria-label="Navigation principale">
        {NAV.map(group=><div key={group.title}>
          <p className="nav-title">{group.title}</p>
          {group.items.map(([icon,label,to])=><Link
            key={to} to={to} onClick={()=>setDrawer(false)}
            className="nav-link" aria-current={location.pathname===to?"page":undefined}>
            <Icon name={icon} size={20}/><span>{label}</span>
            {to==="/alertes" && unread>0 && <span className="nav-badge">{unread}</span>}
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
              type="search" placeholder="Rechercher un chef, un projet, un employee…" autoComplete="off"/>
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
            <button className="btn-icon has-dot" onClick={()=>setNotifOpen(v=>!v)} aria-label="Notifications">
              <Icon name="bell" size={21}/>{unread>0&&<span className="dot"/>}
            </button>
            {notifOpen&&<div className="popover notif-panel">
              <div className="notif-head"><strong>Notifications</strong><button className="link" onClick={markAllRead}>Tout marquer comme lu</button></div>
              <div className="notif-list">{DB.alerts.filter(a=>!a.archived).slice(0,5).map(a=><Link className="notif-item" to="/alertes" key={a.id}>
                <span className={`tone-ico tone-${a.level==="urgent"?"danger":a.level==="warning"?"warn":"info"}`}><Icon name={a.level==="urgent"?"zap":a.level==="warning"?"alert":"info"} size={18}/></span>
                <div><p>{a.title}</p><small>{ago(a.ago)}</small></div>
              </Link>)}</div>
              <div className="notif-foot"><Link className="link" to="/alertes">Voir toutes les alertes</Link></div>
            </div>}
          </div>

          <div className="pop-wrap">
            <button className="profile-btn" onClick={()=>setProfileOpen(v=>!v)}>
              <Avatar name={settings.profile.name} size={32}/><span className="pname">{settings.profile.name}</span><Icon name="chevron-down" size={16}/>
            </button>
            {profileOpen&&<div className="popover">
              <Link className="menu-item" to="/parametres"><Icon name="user" size={18}/>Mon profil</Link>
              <Link className="menu-item" to="/parametres#affichage"><Icon name="sun" size={18}/>Préférences d'affichage</Link>
              <Link className="menu-item" to="/alertes"><Icon name="bell" size={18}/>Alertes</Link>
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
