import {useEffect,useMemo,useState} from "react";
import {Icon} from "../components/Icon";
import {BarChart,HealthGauge,Sparkline} from "../components/Charts";
import {getDashboard} from "../services/workflowApi";
import {formatDate,statusClass} from "../utils";

function display(value, fallback="-") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

export default function Dashboard() {
  const [collapsed,setCollapsed]=useState(false);
  const [data,setData]=useState({projects:[],alerts:[],activity:[],metrics:{},statistics:{}});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(() => {
    let active=true;
    getDashboard().then(result => active && setData(result)).catch(error => active && setError(error.message)).finally(() => active && setLoading(false));
    return () => {active=false};
  }, []);

  const projects=data.projects;
  const metrics=data.metrics;
  const activeProjects=projects.filter(project=>String(project.status||"").toLowerCase().includes("cours"));
  const completedProjects=projects.filter(project=>String(project.status||"").toLowerCase().includes("termin"));
  const delayedProjects=projects.filter(project=>String(project.status||"").toLowerCase().includes("retard"));
  const chartSeries = useMemo(() => {
    const values = Array.isArray(data.statistics?.monthly || data.statistics?.series) ? data.statistics.monthly || data.statistics.series : [];
    return values.length ? values : [];
  }, [data.statistics]);
  const labels=chartSeries.map(item=>item.label || item.month || "");
  const totals=chartSeries.map(item=>Number(item.total || item.value || 0));
  const completed=chartSeries.map(item=>Number(item.completed || item.done || 0));

  return <>
    <div className="grid grid-kpi stack-gap">
      <Kpi icon="folder" label="Total projets" value={projects.length} color="var(--accent)" detail={display(metrics.totalProjects)} />
      <Kpi icon="clock" label="Projets en cours" value={activeProjects.length} color="var(--info)" detail={display(metrics.activeProjects)} />
      <Kpi icon="check-circle" label="Projets terminés" value={completedProjects.length} color="var(--ok)" detail={display(metrics.completedProjects)} />
      <Kpi icon="alert" label="Projets en retard" value={delayedProjects.length} color="var(--danger)" detail={display(metrics.delayedProjects)} />
    </div>

    {loading ? <div className="card card-pad">Chargement du tableau de bord…</div> : error ? <div className="card card-pad"><strong>Impossible de charger le tableau de bord.</strong><p className="muted-p">{error}</p></div> : <>
      <div className="dashboard-preview-wrap">
        <button className="btn btn-sm btn-ghost preview-collapse" onClick={()=>setCollapsed(v=>!v)}><Icon name={collapsed?"chevron-down":"chevron-up"} size={16}/>{collapsed?"Afficher l'aperçu":"Réduire l'aperçu"}</button>
        {!collapsed && <div className="dashboard-preview">
          <div className="grid cols-2-1 stack-gap" style={{marginTop:"1.5rem"}}>
            <div className="card"><div className="card-head"><h3>Évolution des projets</h3></div><div className="card-body chart-box"><BarChart labels={labels} series={[{name:"Total",data:totals,color:"var(--accent)"},{name:"Terminés",data:completed,color:"var(--ok)"}]}/></div></div>
            <div className="card"><div className="card-head"><h3>Santé globale</h3></div><div className="card-body"><div className="health-center"><HealthGauge value={Number(metrics.health || 0)}/></div><div className="list-main"><div className="list-item"><span>Respect des délais</span><strong>{display(metrics.onTime)}%</strong></div><div className="list-item"><span>Projets achevés</span><strong>{completedProjects.length} / {projects.length}</strong></div><div className="list-item"><span>Productivité</span><strong>{display(metrics.productivity)}%</strong></div></div></div></div>
          </div>
          <div className="grid cols-2-1 stack-gap" style={{marginTop:"1.5rem"}}>
            <div className="card"><div className="card-head"><h3>Activités récentes</h3></div><div className="card-body flush"><div className="feed"><ul>{data.activity.slice(0,5).map((item,index)=><li key={item.id||index}><span className="tone-ico tone-info"><Icon name="activity" size={16}/></span><div className="list-main"><p>{display(item.message||item.title)}</p><small>{display(item.author||item.user)}</small></div></li>)}</ul></div></div></div>
            <div className="card"><div className="card-head"><h3>Alertes récentes</h3></div><div className="card-body flush"><div className="list-main">{data.alerts.slice(0,5).map(alert=><div className="list-item" key={alert.id}><span className={`tone-ico tone-${alert.level === "urgent" ? "danger" : alert.level === "warning" ? "warn" : "info"}`}><Icon name={alert.level === "urgent" ? "zap" : alert.level === "warning" ? "alert" : "info"} size={18}/></span><div className="list-main"><strong>{display(alert.title)}</strong><small>{display(alert.message)}</small></div></div>)}</div><div className="card-foot" style={{textAlign:"center"}}><a className="link" href="/alertes">Voir toutes les alertes</a></div></div></div>
          </div>
          <div className="card" style={{marginTop:"1.5rem"}}><div className="card-head"><h3>Risques de retard</h3></div><div className="table-wrap"><table className="table responsive"><thead><tr><th>Projet</th><th>Client</th><th>Chef</th><th>Échéance</th><th>Retard</th><th>Risque</th><th>Progression</th></tr></thead><tbody>{projects.filter(project=>String(project.status||"").toLowerCase().includes("retard")).slice(0,5).map(project=><tr key={project.id}><td className="cell-main"><strong>{display(project.name)}</strong><div><span className={statusClass(project.status)}>{display(project.status)}</span></div></td><td>{display(project.clientName||project.client)}</td><td>{display(project.chefName||project.chef)}</td><td>{project.endDate ? formatDate(project.endDate) : "-"}</td><td>{display(project.delayDays)} j</td><td><span className={project.risk === "élevé" ? "badge badge-danger" : project.risk === "moyen" ? "badge badge-warn" : "badge badge-ok"}>{display(project.risk||"-")}</span></td><td><div className="prog-cell"><div className="progress"><i style={{"--v":`${Number(project.progress||0)}%`}}/></div><span>{display(project.progress)}%</span></div></td></tr>)}</tbody></table></div></div>
        </div>}
      </div>
    </>}
  </>;
}

function Kpi({icon,label,value,color,detail}) {
  return <div className="card kpi"><div className="kpi-top"><div className="kpi-ico" style={{color}}><Icon name={icon} size={24}/></div><div>{label}</div></div><div className="kpi-value">{value}</div><div className="kpi-foot"><div className="trend flat">{detail || "—"}</div><Sparkline data={[0,0,0]} color={color} labels={[" "]} name={label}/></div></div>;
}
