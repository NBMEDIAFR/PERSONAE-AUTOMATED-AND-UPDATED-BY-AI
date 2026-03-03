import { useState } from "react";

const PERSONAS_BASE = {
  eloigne: {
    name: "Yannick",
    age: "48 ans — Cannes",
    job: "Opticien · BTS · CSP moyenne · Séparé, 1 enfant",
    emoji: "🎧",
    type: "eloigne",
    typeLabel: "Les Éloignés",
    color: "#e8401c",
    medias: ["Facebook", "Skyrock", "Nova", "Le Mouv'", "TRACE Urban", "Youtube", "Netflix", "MyCanal"],
    interests: ["Culture hip-hop (rap, danse, streetwear)", "BD", "Collection CD & sneakers"],
    frustrations: ["N'apprécie plus tous les artistes TRACE Urban", "Se sent vieux malgré ses efforts", "Déteste l'autotune, regrette l'engagement"],
    hooks: ["Nostalgie (goldies)", "Grandes figures du rap", "Playlist Rewind"],
    triggers: ["Documentaire grandes figures", "Légendes", "Playlist Rewind", "TRACE+"],
    bio: "Yannick a grandi avec le hip-hop. Il regardait TRACE TV sur Canalsat tous les jours il y a 20 ans. Il continue à regarder TRACE Urban occasionnellement, mais commence à se détacher des artistes les plus jeunes. Il déteste l'autotune, regrette l'engagement des années 90-2000.",
    lastUpdate: null,
    signals: []
  },
  curieux: {
    name: "Théo",
    age: "19 ans — Dijon",
    job: "Étudiant · 1ère année école d'ingé · CSP moyenne",
    emoji: "🎮",
    type: "curieux",
    typeLabel: "Les Curieux",
    color: "#c9a84c",
    medias: ["TikTok", "Instagram", "Twitch", "Spotify", "Youtube"],
    interests: ["Jeux vidéos", "Mangas & Animés", "Formule 1", "NBA"],
    frustrations: ["Monde incertain (écologie, économie)", "Événements hip-hop inaccessibles en province", "TV linéaire dépassée"],
    hooks: ["Réseaux sociaux (Insta, TikTok, Twitch)", "Contenu exclusif", "Interactivité"],
    triggers: ["Playlist Spotify", "Événement en province", "Jeu-concours voyage Paris"],
    bio: "Théo a découvert TRACE dans un kebab. Ses parents écoutent les variétés françaises, mais c'est le hip-hop que lui et ses amis écoutent. Il ne pense pas à regarder TRACE Urban à la télé. Il veut devenir développeur et développer sa chaîne Twitch.",
    lastUpdate: null,
    signals: []
  },
  fidele: {
    name: "Djibril",
    age: "28 ans — Montfermeil",
    job: "Manutentionnaire · Chauffeur Uber · CSP- · Origine algérienne",
    emoji: "🏋️",
    type: "fidele",
    typeLabel: "Les Fidèles",
    color: "#1a6b3a",
    medias: ["Instagram", "Skyrock", "TRACE Urban", "TPMP", "Spotify", "Youtube"],
    interests: ["MMA & football (paris sportifs)", "Crypto-monnaies", "Hip-hop & artistes algériens", "Voyager (Algérie, Malaisie, Dubaï)"],
    frustrations: ["TRACE diffuse du mainstream ou de l'Afrobeat", "Les pubs impossibles à skipper", "Image 'ringard' car il regarde la TV linéaire"],
    hooks: ["Salle de sport", "Football", "Communauté"],
    triggers: ["Playlist workout Spotify", "DJ set Basic Fit", "Trace party Arabia", "Soirée Ramadan TRACE Urban"],
    bio: "TRACE Urban c'est SA chaîne de référence — la seule qui diffuse autant de hip-hop. Il aime la regarder avec ses potes. Levé à 6h, déjeune avec Instagram, travaille 7h30-15h30, puis salle de sport. Le soir : TPMP avec Twitter, chicha ou dépannage Uber, boîte le samedi.",
    lastUpdate: null,
    signals: []
  }
};

const EXAMPLES = {
  doc: `"LÉGENDES" — Documentaire série, 6x52 min\n\nChaque épisode retrace le parcours d'un pionnier du rap français des années 90. Interviews inédites, archives rares, témoignages de proches.\n\nDiffusion : TRACE Urban & TRACE+\nPublic cible : 35-55 ans, fans de la première heure`,
  podcast: `"INFO DIRECTE" — Podcast quotidien\n\nChaque matin, 15 minutes pour comprendre l'essentiel de l'actualité. Un journaliste, trois sujets, zéro jargon. Dès 6h30 sur toutes les plateformes.`,
  serie: `"NEW WAVE" — Série documentaire, 8x26 min\n\nNEW WAVE donne la parole à la nouvelle génération du rap français : artistes 18-25 ans, créateurs de contenu, beatmakers. Comment font-ils carrière à l'ère du streaming ?\n\nDiffusion : Youtube & TRACE Urban`
};

const ScoreCircle = ({ score, color }) => {
  const r = 36, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e0d8cc" strokeWidth="7" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: "#999", letterSpacing: 1 }}>/100</div>
      </div>
    </div>
  );
};

const DimBar = ({ label, value }) => {
  const c = value >= 70 ? "#1a6b3a" : value >= 40 ? "#c9a84c" : "#e8401c";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ fontSize: 12, width: 90, flexShrink: 0 }}>{label.charAt(0).toUpperCase() + label.slice(1)}</div>
      <div style={{ flex: 1, height: 6, background: "#e8e2d8", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: c, borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, width: 28, textAlign: "right", color: c }}>{value}</div>
    </div>
  );
};

export default function PersonaLab() {
  const [personas, setPersonas] = useState(PERSONAS_BASE);
  const [current, setCurrent] = useState("fidele");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState(null);
  const [updatePanel, setUpdatePanel] = useState(null); // proposed changes
  const [showSignals, setShowSignals] = useState(false);

  const p = personas[current];
  const scoreColor = result ? (result.score >= 70 ? "#1a6b3a" : result.score >= 40 ? "#c9a84c" : "#e8401c") : "#333";

  const selectPersona = (key) => { setCurrent(key); setResult(null); setUpdatePanel(null); setShowSignals(false); };

  // ── ANALYSE CONTENU ──
  const analyze = async () => {
    if (!content.trim()) return;
    setLoading(true); setResult(null);
    const sys = `Tu es ${p.name}, ${p.age}, ${p.job}. Tu fais partie des "${p.typeLabel}".
Biographie : ${p.bio}
Médias : ${p.medias.join(", ")}. Intérêts : ${p.interests.join(", ")}.
Accroche : ${p.hooks.join(", ")}. Frustrations : ${p.frustrations.join(", ")}.
Déclencheurs : ${p.triggers.join(", ")}.
Réponds UNIQUEMENT en JSON valide sans backticks :
{"score":<0-100>,"verdict":"<max 8 mots>","reaction":"<1ère personne 2-3 phrases>","dimensions":{"pertinence":<0-100>,"format":<0-100>,"ton":<0-100>,"engagement":<0-100>},"recommandations":["<1>","<2>","<3>"]}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1000, system: sys, messages: [{ role: "user", content: `Analyse :\n\n${content}` }] })
      });
      const data = await res.json();
      const text = data.content.map(i => i.text || "").join("");
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── MISE À JOUR AUTOMATIQUE ──
  const autoUpdate = async () => {
    setUpdating(true); setUpdatePanel(null); setShowSignals(false);

    const searchPrompt = `Tu es un expert en études d'audience et culture média. 
En te basant sur tes connaissances actuelles (tendances culturelles, réseaux sociaux, musique, médias), génère une mise à jour réaliste pour ce persona :

Persona : ${p.name}, ${p.age}, ${p.job}
Type : ${p.typeLabel}
Profil actuel :
- Médias : ${p.medias.join(", ")}
- Intérêts : ${p.interests.join(", ")}
- Frustrations : ${p.frustrations.join(", ")}
- Déclencheurs : ${p.triggers.join(", ")}
- Bio : ${p.bio}

Génère des évolutions plausibles basées sur les tendances actuelles de la culture hip-hop, des médias numériques et des comportements d'audience en France en 2025-2026.

Réponds UNIQUEMENT en JSON valide sans backticks :
{
  "signals": [
    {"emoji":"<emoji>","title":"<signal court>","detail":"<1 phrase explication>","source":"<plateforme ou contexte>"}
  ],
  "proposed": {
    "medias": ["<liste mise à jour>"],
    "interests": ["<liste mise à jour>"],
    "frustrations": ["<liste mise à jour>"],
    "triggers": ["<liste mise à jour>"],
    "bio": "<bio mise à jour 2-3 phrases>",
    "changes": ["<changement 1 expliqué>","<changement 2 expliqué>","<changement 3 expliqué>"]
  }
}
Inclus exactement 4 signaux et 3 changements. Les signaux doivent être concrets et actuels.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 1500, messages: [{ role: "user", content: searchPrompt }] })
      });
      const data = await res.json();
      const text = data.content.map(i => i.text || "").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setUpdatePanel(parsed);
      setShowSignals(true);
    } catch (e) { console.error(e); }
    finally { setUpdating(false); }
  };

  // ── VALIDER LES CHANGEMENTS ──
  const applyUpdate = () => {
    if (!updatePanel) return;
    const now = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    setPersonas(prev => ({
      ...prev,
      [current]: {
        ...prev[current],
        medias: updatePanel.proposed.medias,
        interests: updatePanel.proposed.interests,
        frustrations: updatePanel.proposed.frustrations,
        triggers: updatePanel.proposed.triggers,
        bio: updatePanel.proposed.bio,
        lastUpdate: now,
        signals: updatePanel.signals
      }
    }));
    setUpdatePanel(null);
    setShowSignals(false);
  };

  const rejectUpdate = () => { setUpdatePanel(null); setShowSignals(false); };

  // ── STYLES ──
  const S = {
    wrap: { fontFamily: "system-ui, sans-serif", background: "#f5f0e8", minHeight: "100vh", color: "#0d0d0d" },
    header: { borderBottom: "2px solid #0d0d0d", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f0e8" },
    container: { maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" },
    grid: { display: "grid", gridTemplateColumns: "310px 1fr", gap: 20, alignItems: "start" },
    card: { background: "#0d0d0d", color: "white", borderRadius: 4, overflow: "hidden", position: "sticky", top: 20 },
    cardHead: { padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 12, alignItems: "flex-start" },
    avatar: { width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 },
    cardBody: { padding: "14px 18px" },
    itTitle: { fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 4 },
    itContent: { fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 },
    tagList: { display: "flex", flexWrap: "wrap", gap: 4, marginTop: 3 },
    tag: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, padding: "1px 6px", fontSize: 11, color: "rgba(255,255,255,0.65)" },
    updateBtn: { width: "100%", padding: "10px 0", background: "transparent", border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
    updateBtnActive: { color: "#c9a84c" },
    right: { display: "flex", flexDirection: "column", gap: 16 },
    inputCard: { background: "white", border: "1.5px solid #e0d8cc", borderRadius: 4, overflow: "hidden" },
    footer: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #e0d8cc", background: "#fafaf8" },
    btn: (disabled) => ({ background: disabled ? "#ccc" : "#0d0d0d", color: "white", border: "none", padding: "9px 22px", fontSize: 12, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", borderRadius: 3, fontFamily: "inherit" }),
    resultCard: { background: "white", border: "1.5px solid #e0d8cc", borderRadius: 4, overflow: "hidden" },
    sec: (last) => ({ padding: "18px 20px", borderBottom: last ? "none" : "1px solid #e0d8cc" }),
    secTitle: { fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 },
    bubble: { background: "#f5f0e8", borderLeft: "3px solid #e8401c", padding: "12px 14px", borderRadius: "0 4px 4px 0", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" },
    signalCard: { background: "white", border: "1.5px solid #c9a84c", borderRadius: 4, overflow: "hidden" },
    signalHeader: { background: "#fffbf0", padding: "14px 18px", borderBottom: "1px solid #e8e0c8", display: "flex", alignItems: "center", justifyContent: "space-between" },
  };

  const getBadge = (type) => ({
    display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 10,
    letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500, marginTop: 5,
    background: type === "eloigne" ? "#e8401c" : type === "curieux" ? "#c9a84c" : "#1a6b3a",
    color: type === "curieux" ? "#0d0d0d" : "white"
  });

  const dotColor = { eloigne: "#e8401c", curieux: "#c9a84c", fidele: "#1a6b3a" };

  return (
    <div style={S.wrap}>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:.4}40%{transform:scale(1);opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <header style={S.header}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 19, fontWeight: 900 }}>
          Persona<span style={{ color: "#e8401c" }}>Lab</span>
        </div>
        <div style={{ fontSize: 10, color: "#8a8070", letterSpacing: 2, textTransform: "uppercase" }}>Test & Actualisation · TRACE</div>
      </header>

      <div style={S.container}>
        {/* SELECTOR */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginRight: 4 }}>Persona :</span>
          {Object.entries(personas).map(([key, pe]) => (
            <button key={key} onClick={() => selectPersona(key)} style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 14px",
              border: `1.5px solid ${current === key ? "#0d0d0d" : "#e0d8cc"}`,
              background: current === key ? "#0d0d0d" : "white",
              color: current === key ? "white" : "#0d0d0d",
              borderRadius: 40, cursor: "pointer", fontSize: 12, fontFamily: "inherit"
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor[key], display: "inline-block" }} />
              {pe.name} — {pe.typeLabel}
              {pe.lastUpdate && <span style={{ fontSize: 10, background: "#1a6b3a", color: "white", padding: "1px 6px", borderRadius: 10, marginLeft: 2 }}>↻</span>}
            </button>
          ))}
        </div>

        <div style={S.grid}>
          {/* PERSONA CARD */}
          <div style={S.card}>
            <div style={S.cardHead}>
              <div style={S.avatar}>{p.emoji}</div>
              <div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 19, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, lineHeight: 1.6 }}>{p.age}<br />{p.job}</div>
                <span style={getBadge(p.type)}>{p.typeLabel}</span>
                {p.lastUpdate && <div style={{ fontSize: 10, color: "#c9a84c", marginTop: 5 }}>↻ Mis à jour le {p.lastUpdate}</div>}
              </div>
            </div>
            <div style={S.cardBody}>
              {[
                { t: "Biographie", c: p.bio },
                { t: "Médias & plateformes", tags: p.medias },
                { t: "Points d'accroche", tags: p.hooks },
                { t: "Déclencheurs", c: p.triggers.join(" · ") },
                { t: "Frustrations", c: p.frustrations.join(" · "), red: true },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={S.itTitle}>{item.t}</div>
                  {item.tags
                    ? <div style={S.tagList}>{item.tags.map((t, j) => <span key={j} style={S.tag}>{t}</span>)}</div>
                    : <div style={{ ...S.itContent, color: item.red ? "rgba(255,100,80,0.85)" : "rgba(255,255,255,0.8)" }}>{item.c}</div>
                  }
                </div>
              ))}
            </div>

            {/* AUTO-UPDATE BUTTON */}
            <button
              style={{ ...S.updateBtn, ...(updating ? S.updateBtnActive : {}) }}
              onClick={autoUpdate}
              disabled={updating}
            >
              {updating
                ? <><span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>↻</span> Recherche des signaux...</>
                : <>↻ Actualiser automatiquement</>
              }
            </button>
          </div>

          {/* RIGHT PANEL */}
          <div style={S.right}>
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 700 }}>Tester un contenu</div>
              <div style={{ fontSize: 13, color: "#8a8070", marginTop: 2 }}>Collez votre synopsis — {p.name} réagit en temps réel</div>
            </div>

            {/* INPUT */}
            <div style={S.inputCard}>
              <div style={{ padding: "14px 16px 0" }}>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Collez ici votre article, script, titre, synopsis..."
                  style={{ width: "100%", minHeight: 120, border: "1px solid #e0d8cc", borderRadius: 3, padding: 11, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", background: "#fafaf8", lineHeight: 1.6, color: "#0d0d0d" }}
                />
                <div style={{ marginTop: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#8a8070", marginBottom: 5 }}>Exemples :</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {[["doc", "🎵 Documentaire rap 90s"], ["podcast", "🎙️ Podcast actualité"], ["serie", "📺 Série jeunes"]].map(([k, l]) => (
                      <span key={k} onClick={() => setContent(EXAMPLES[k])}
                        style={{ padding: "3px 11px", background: "#f0ece4", border: "1px solid #e0d8cc", borderRadius: 20, fontSize: 11, cursor: "pointer" }}>{l}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={S.footer}>
                <span style={{ fontSize: 11, color: "#8a8070" }}>{content.length} car.</span>
                <button style={S.btn(loading || !content.trim())} disabled={loading || !content.trim()} onClick={analyze}>
                  {loading ? "Analyse..." : `Analyser avec ${p.name} →`}
                </button>
              </div>
            </div>

            {/* LOADING */}
            {loading && (
              <div style={{ textAlign: "center", padding: 24 }}>
                {[0,1,2].map(i => <span key={i} style={{ display: "inline-block", width: 8, height: 8, background: "#0d0d0d", borderRadius: "50%", margin: "0 3px", animation: `bounce 1.2s ${i*0.2}s ease-in-out infinite` }} />)}
                <div style={{ fontSize: 12, color: "#8a8070", marginTop: 10, fontStyle: "italic" }}>{p.name} lit votre contenu...</div>
              </div>
            )}

            {/* SIGNALS / UPDATE PANEL */}
            {showSignals && updatePanel && (
              <div style={S.signalCard}>
                <div style={S.signalHeader}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>↻ Signaux détectés pour {p.name}</div>
                    <div style={{ fontSize: 11, color: "#8a8070", marginTop: 2 }}>3 évolutions proposées — validez avant application</div>
                  </div>
                  <span style={{ fontSize: 10, background: "#c9a84c", color: "#0d0d0d", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>EN ATTENTE</span>
                </div>

                {/* Signals */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8e0c8" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 }}>Signaux captés</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {updatePanel.signals.map((s, i) => (
                      <div key={i} style={{ background: "#fafaf8", border: "1px solid #e8e0c8", borderRadius: 3, padding: "10px 12px" }}>
                        <div style={{ fontSize: 16, marginBottom: 4 }}>{s.emoji}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{s.title}</div>
                        <div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>{s.detail}</div>
                        <div style={{ fontSize: 10, color: "#c9a84c", marginTop: 4 }}>{s.source}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed changes */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8e0c8" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 }}>Évolutions proposées</div>
                  {updatePanel.proposed.changes.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ width: 18, height: 18, background: "#c9a84c", color: "#0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i+1}</span>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{c}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ padding: "12px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={rejectUpdate} style={{ padding: "8px 18px", background: "white", border: "1.5px solid #e0d8cc", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕ Rejeter
                  </button>
                  <button onClick={applyUpdate} style={{ padding: "8px 18px", background: "#1a6b3a", color: "white", border: "none", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                    ✓ Valider & Appliquer
                  </button>
                </div>
              </div>
            )}

            {/* RESULT */}
            {result && (
              <div style={S.resultCard}>
                <div style={{ ...S.sec(false), display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{p.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name} réagit <span style={{ color: "#8a8070", fontWeight: 400 }}>· {p.typeLabel}</span></div>
                </div>
                <div style={{ ...S.sec(false), display: "flex", alignItems: "center", gap: 24 }}>
                  <ScoreCircle score={result.score} color={scoreColor} />
                  <div>
                    <div style={{ fontSize: 24 }}>{result.score >= 70 ? "🟢" : result.score >= 40 ? "🟡" : "🔴"}</div>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, margin: "3px 0" }}>{result.verdict}</div>
                    <div style={{ fontSize: 11, color: "#8a8070" }}>Score de résonance avec {p.name}</div>
                  </div>
                </div>
                <div style={S.sec(false)}>
                  <div style={S.secTitle}>La réaction de {p.name}</div>
                  <div style={S.bubble}>"{result.reaction}"</div>
                </div>
                <div style={S.sec(false)}>
                  <div style={S.secTitle}>Analyse détaillée</div>
                  {Object.entries(result.dimensions).map(([k, v]) => <DimBar key={k} label={k} value={v} />)}
                </div>
                <div style={S.sec(true)}>
                  <div style={S.secTitle}>Pour mieux toucher {p.name}</div>
                  {result.recommandations.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                      <span style={{ width: 20, height: 20, background: "#0d0d0d", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, marginTop: 1 }}>{i+1}</span>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{r}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
