import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Icon} from "../components/Icon";
import {login as authenticate} from "../services/authService";

const ROLE_ROUTES = {
  CEO: "/dashboard",
  CHEF: "/chef",
  EMPLOYEE: "/employee",
  STAGIAIRE: "/stagiaire",
  FREELANCE: "/freelance"
};

export default function Login() {
  const navigate=useNavigate();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [show,setShow]=useState(false);
  const [errors,setErrors]=useState({});
  const [submitting,setSubmitting]=useState(false);
  const [submitError,setSubmitError]=useState("");

  const submit=async e=>{
    e.preventDefault();
    const next={};
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email="Entrez une adresse e-mail valide.";
    if(!password) next.password="Le mot de passe est requis.";
    if(Object.keys(next).length) {setErrors(next);return;}

    setSubmitting(true);
    setSubmitError("");
    try {
      const user = await authenticate(email.trim(), password);
      const route = ROLE_ROUTES[user.role];
      if (!route) {
        throw new Error("Le rôle de votre compte n'est pas autorisé.");
      }
      navigate(route, {replace:true});
    } catch (error) {
      setSubmitError(error.message || "Impossible de vous connecter au serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  return <div className="auth-page">
    <aside className="auth-side" aria-hidden="true">
      <div className="auth-rings"><i/><i/><i/></div>
      <div className="auth-side-top"><span className="brand-mark"><Icon name="target" size={24}/></span><strong>Cadran</strong></div>
      <div className="auth-side-mid"><h2>Toute votre entreprise, en un seul écran.</h2>
        <p>Projets, équipes et performance : pilotez Atlas Numérique avec une vue claire sur ce qui compte vraiment aujourd'hui.</p>
      </div>
      <div className="auth-stats"><div><strong>14</strong><span>Projets suivis</span></div><div><strong>28</strong><span>Collaborateurs</span></div><div><strong>96%</strong><span>Taux de livraison</span></div></div>
    </aside>
    <main className="auth-main"><div className="auth-card">
      <div className="auth-brand-mobile"><span className="brand-mark"><Icon name="target" size={22}/></span><strong>Cadran</strong></div>
      <h1>Bon retour</h1><p>Connectez-vous à votre espace.</p>
      <form onSubmit={submit} noValidate>
        <div className={`field ${errors.email?"has-error":""}`}><label>Adresse e-mail ou nom d'utilisateur</label><div className="input-icon"><Icon name="mail" size={18}/><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@entreprise.tn" autoComplete="username"/></div>{errors.email&&<p className="field-error">{errors.email}</p>}</div>
        <div className={`field ${errors.password?"has-error":""}`}><label>Mot de passe</label><div className="input-icon"><Icon name="lock" size={18}/><input className="input" type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password"/><button type="button" className="btn-icon eye" onClick={()=>setShow(v=>!v)} aria-label={show?"Masquer":"Afficher"}><Icon name={show?"eye-off":"eye"} size={18}/></button></div>{errors.password&&<p className="field-error">{errors.password}</p>}</div>
        <div className="auth-row"><label className="check"><input type="checkbox" defaultChecked/><span>Se souvenir de moi</span></label><button type="button" className="link" onClick={()=>setSubmitError("La restauration du mot de passe est gérée par le backend.")}>Mot de passe oublié ?</button></div>
        {submitError&&<p className="field-error">{submitError}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>{submitting?"Connexion en cours…":"Se connecter"}</button>
      </form>
      <p className="auth-foot">© 2026 Atlas Numérique — Sécurité JWT</p>
    </div></main>
  </div>
}
