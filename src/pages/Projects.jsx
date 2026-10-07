import {useEffect,useMemo,useState} from "react";
import {Icon} from "../components/Icon";
import {getProjects} from "../services/workflowApi";
import {formatDate,statusClass} from "../utils";

export default function Projects() {
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("Tous");
  const [projects,setProjects]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(() => {
    let active=true;
    getProjects().then(result => active && setProjects(result)).catch(error => active && setError(error.message)).finally(() => active && setLoading(false));
    return () => {active=false};
  }, []);

  const list=useMemo(()=>projects.filter(project=>(!q||`${project.name||""} ${project.clientName||project.client||""}`.toLowerCase().includes(q.toLowerCase()))&&(status==="Tous"||String(project.status||"").toLowerCase()===status.toLowerCase())),[q,status,projects]);

  let rows;
  if (loading) {
    rows = <tr><td colSpan="8">Chargement des projets…</td></tr>;
  } else if (error) {
    rows = <tr><td colSpan="8">{error}</td></tr>;
  } else if (!list.length) {
    rows = <tr><td colSpan="8">Aucun projet trouvé.</td></tr>;
  } else {
    rows = list.map(project => (
      <tr key={project.id}>
        <td className="cell-main"><strong>{project.name || "Projet sans nom"}</strong></td>
        <td>{project.clientName || project.client || "—"}</td>
        <td>{project.chefName || project.chef || "—"}</td>
        <td>{project.teamName || project.team || "—"}</td>
        <td>{project.endDate ? formatDate(project.endDate) : "—"}</td>
        <td><span className={statusClass(project.status)}>{project.status || "Inconnu"}</span></td>
        <td><span className={project.risk === "élevé" ? "badge badge-danger" : project.risk === "moyen" ? "badge badge-warn" : "badge badge-ok"}>{project.risk || "—"}</span></td>
        <td><div className="prog-cell"><div className="progress"><i style={{"--v":`${Number(project.progress || 0)}%`}}/></div><span>{project.progress || 0}%</span></div></td>
      </tr>
    ));
  }

  return <>
    <div className="toolbar"><div className="stat-pills">{["Tous","En cours","Terminé","En retard"].map(item=><button key={item} className={`stat-pill ${status===item?"active":""}`} onClick={()=>setStatus(item)}>{item} ({item==="Tous"?projects.length:projects.filter(project=>String(project.status||"").toLowerCase().includes(item.toLowerCase())).length})</button>)}</div><div className="filters"><div className="field"><div className="input-icon"><Icon name="search"/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher..."/></div></div></div></div>
    <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Projet</th><th>Client</th><th>Chef</th><th>Équipe</th><th>Échéance</th><th>Statut</th><th>Risque</th><th>Progression</th></tr></thead><tbody>{rows}</tbody></table></div></div>
  </>;
}
