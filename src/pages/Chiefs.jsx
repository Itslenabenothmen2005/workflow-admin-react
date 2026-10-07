import {useEffect,useMemo,useState} from "react";
import {Icon} from "../components/Icon";
import {getUsers} from "../services/workflowApi";
import {avatarStyle,initials,statusClass} from "../utils";

function Avatar({name}) { return <span className="avatar" style={{"--size":"36px",...avatarStyle(name)}}>{initials(name)}</span>; }

export default function Chiefs() {
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("all");
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(() => {
    let active=true;
    getUsers("CHEF").then(result => active && setUsers(result)).catch(error => active && setError(error.message)).finally(() => active && setLoading(false));
    return () => {active=false};
  }, []);

  const list=useMemo(()=>users.filter(user=>(!q||`${user.name||""} ${user.email||""}`.toLowerCase().includes(q.toLowerCase()))&&(status==="all"||String(user.status||"").toLowerCase()===status)),[q,status,users]);
  const active=users.filter(user=>String(user.status||"").toLowerCase()==="active"||String(user.status||"").toLowerCase()==="actif").length;

  let rows;
  if (loading) {
    rows = <tr><td colSpan="5">Chargement des chefs…</td></tr>;
  } else if (error) {
    rows = <tr><td colSpan="5">{error}</td></tr>;
  } else if (!list.length) {
    rows = <tr><td colSpan="5">Aucun chef trouvé.</td></tr>;
  } else {
    rows = list.map(user => (
      <tr key={user.id || user.email}>
        <td className="cell-main"><div className="person"><Avatar name={user.name || user.email}/><div><strong>{user.name || user.email}</strong><small>{user.email}</small></div></div></td>
        <td>{user.teamName || user.team || "—"}</td>
        <td>{user.projectCount ?? 0}</td>
        <td>{user.phone || "—"}</td>
        <td><span className={statusClass(user.status)}>{user.status || "Inconnu"}</span></td>
      </tr>
    ));
  }

  return <>
    <div className="stat-pills"><button className={`stat-pill ${status==="all"?"active":""}`} onClick={()=>setStatus("all")}><strong>{users.length}</strong> chefs</button><button className={`stat-pill ${status==="active"?"active":""}`} onClick={()=>setStatus("active")}><strong>{active}</strong> actifs</button></div>
    <div className="toolbar"><div className="filters"><div className="field"><div className="input-icon"><Icon name="search"/><input className="input search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un chef..."/></div></div></div></div>
    <div className="card card-body flush"><div className="table-wrap"><table className="table responsive"><thead><tr><th>Nom</th><th>Équipe</th><th>Projets</th><th>Téléphone</th><th>Statut</th></tr></thead><tbody>{rows}</tbody></table></div></div>
  </>;
}
