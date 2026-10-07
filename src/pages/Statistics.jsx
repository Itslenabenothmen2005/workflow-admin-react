import {useEffect,useState} from "react";
import {BarChart,DonutChart,LineChart,SimpleBars} from "../components/Charts";
import {Icon} from "../components/Icon";
import {getStatistics} from "../services/workflowApi";

function valueOf(data, keys, fallback=0) {
  for (const key of keys) if (data?.[key] !== undefined && data?.[key] !== null) return Number(data[key]);
  return fallback;
}

export default function Statistics() {
  const [data,setData]=useState({});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(() => {
    let active=true;
    getStatistics().then(result => active && setData(result)).catch(error => active && setError(error.message)).finally(() => active && setLoading(false));
    return () => {active=false};
  }, []);

  const projects=Array.isArray(data.projects) ? data.projects : [];
  const monthly=Array.isArray(data.monthly) ? data.monthly : [];
  const teams=Array.isArray(data.teams) ? data.teams : [];
  const labels=monthly.map(item=>item.label||item.month||"");
  const totals=monthly.map(item=>Number(item.total||item.value||0));
  const completed=monthly.map(item=>Number(item.completed||item.done||0));
  const delayed=monthly.map(item=>Number(item.delayed||item.late||0));
  const active=monthly.map(item=>Number(item.active||0));
  const productivity=monthly.map(item=>Number(item.productivity||0));
  const punctuality=monthly.map(item=>Number(item.punctuality||0));
  const statusCounts=projects.reduce((counts,project)=>{const status=String(project.status||"").toLowerCase(); counts[status] = (counts[status]||0)+1; return counts;},{});
  const donut=[{label:"En cours",value:statusCounts["en cours"]||0,color:"#3b82f6"},{label:"Terminé",value:statusCounts["termin"]||0,color:"#22c55e"},{label:"En retard",value:statusCounts["retard"]||0,color:"#ef4444"}];

  if (loading) return <div className="card card-pad">Chargement des statistiques…</div>;
  if (error) return <div className="card card-pad"><strong>Impossible de charger les statistiques.</strong><p className="muted-p">{error}</p></div>;

  return <>
    <div className="grid grid-kpi">{[
      ["check-circle",`${valueOf(data,["punctuality","onTime"],0)}%`,"Taux de ponctualité","tone-ok"],
      ["trend-up",`${valueOf(data,["productivity"],0)}%`,"Productivité","tone-accent"],
      ["folder",projects.length,"Projets suivis","tone-warn"],
      ["shield",`${valueOf(data,["health"],0)}%`,"Santé globale","tone-info"]
    ].map(([icon,value,label,tone])=><div className="card card-pad kpi" key={label}><div className="kpi-top"><div className={`kpi-ico ${tone}`}><Icon name={icon}/></div></div><div className="kpi-value">{value}</div><div className="kpi-foot">{label}</div></div>)}</div>
    <h3 className="section-title">Évolution des projets</h3>
    <div className="grid cols-2"><div className="card card-pad"><div className="chart-container"><LineChart labels={labels} series={[{name:"Total",data:totals,color:"var(--accent)"},{name:"Terminés",data:completed,color:"var(--ok)"},{name:"En retard",data:delayed,color:"var(--danger)"}]}/></div></div><div className="card card-pad"><div className="chart-container"><BarChart labels={labels} series={[{name:"Actifs",data:active,color:"var(--info)"},{name:"Retards",data:delayed,color:"var(--danger)"}]}/></div></div></div>
    <h3 className="section-title">Productivité et respect des délais</h3>
    <div className="grid cols-2"><div className="card card-pad"><div className="chart-container"><LineChart labels={labels} series={[{name:"Productivité",data:productivity,color:"var(--accent)"}]} unit="%"/></div></div><div className="card card-pad"><div className="chart-container"><LineChart labels={labels} series={[{name:"Ponctualité",data:punctuality,color:"var(--warn)"}]} unit="%"/></div></div></div>
    <h3 className="section-title">Activité par équipe</h3>
    <div className="grid cols-2-1"><div className="card card-pad"><h4>Avancement moyen des projets (%)</h4><div style={{marginTop:16}}><SimpleBars items={teams.map(team=>({label:team.name,value:Number(team.averageProgress||team.progress||0),color:team.color}))}/></div></div><div className="card card-pad"><DonutChart items={donut} centerLabel="Projets" size={160}/></div></div>
  </>;
}
