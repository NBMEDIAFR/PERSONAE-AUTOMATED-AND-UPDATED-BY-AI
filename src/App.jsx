import { useState, useRef } from "react";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const DEFAULT_SECTIONS = [
  { key: "medias", label: "Médias & Plateformes" },
  { key: "interests", label: "Centres d'intérêt" },
  { key: "hooks", label: "Points d'accroche" },
  { key: "triggers", label: "Déclencheurs" },
  { key: "frustrations", label: "Frustrations" },
];

const PERSONAS_BASE = {
  eloigne: {
    name: "Yannick", age: "48 ans — Cannes", job: "Opticien · BTS · CSP moyenne · Séparé, 1 enfant",
    emoji: "🎧", photo: null, type: "eloigne", typeLabel: "Les Éloignés", color: "#e8401c",
    medias: ["Facebook", "Skyrock", "Nova", "Le Mouv'", "TRACE Urban", "Youtube", "Netflix"],
    interests: ["Culture hip-hop", "BD", "Collection CD & sneakers"],
    frustrations: ["N'apprécie plus tous les artistes TRACE Urban", "Se sent vieux malgré ses efforts", "Déteste l'autotune"],
    hooks: ["Nostalgie (goldies)", "Grandes figures du rap", "Playlist Rewind"],
    triggers: ["Documentaire grandes figures", "Légendes", "Playlist Rewind", "TRACE+"],
    bio: "Yannick a grandi avec le hip-hop. Il regardait TRACE TV tous les jours il y a 20 ans. Il continue occasionnellement mais se détache des jeunes artistes. Il déteste l'autotune et regrette l'engagement des années 90-2000.",
    documents: [], customSections: [], lastUpdate: null, signals: []
  },
  curieux: {
    name: "Théo", age: "19 ans — Dijon", job: "Étudiant · 1ère année école d'ingé · CSP moyenne",
    emoji: "🎮", photo: null, type: "curieux", typeLabel: "Les Curieux", color: "#c9a84c",
    medias: ["TikTok", "Instagram", "Twitch", "Spotify", "Youtube"],
    interests: ["Jeux vidéos", "Mangas & Animés", "Formule 1", "NBA"],
    frustrations: ["Monde incertain", "Événements hip-hop inaccessibles en province", "TV linéaire dépassée"],
    hooks: ["Réseaux sociaux", "Contenu exclusif", "Interactivité"],
    triggers: ["Playlist Spotify", "Événement en province", "Jeu-concours voyage Paris"],
    bio: "Théo a découvert TRACE dans un kebab. C'est le hip-hop que lui et ses amis écoutent. Il ne pense pas à regarder TRACE Urban à la télé. Il veut devenir développeur.",
    documents: [], customSections: [], lastUpdate: null, signals: []
  },
  fidele: {
    name: "Djibril", age: "28 ans — Montfermeil", job: "Manutentionnaire · Chauffeur Uber · CSP- · Origine algérienne",
    emoji: "🏋️", photo: null, type: "fidele", typeLabel: "Les Fidèles", color: "#1a6b3a",
    medias: ["Instagram", "Skyrock", "TRACE Urban", "TPMP", "Spotify", "Youtube"],
    interests: ["MMA & football", "Crypto-monnaies", "Hip-hop & artistes algériens", "Voyager"],
    frustrations: ["TRACE diffuse du mainstream ou de l'Afrobeat", "Les pubs impossibles à skipper", "Image ringard"],
    hooks: ["Salle de sport", "Football", "Communauté"],
    triggers: ["Playlist workout Spotify", "DJ set Basic Fit", "Trace party Arabia", "Soirée Ramadan TRACE Urban"],
    bio: "TRACE Urban c'est SA chaîne de référence. Il aime la regarder avec ses potes. Levé à 6h, travaille 7h30-15h30, salle de sport. Le soir TPMP, chicha ou Uber.",
    documents: [], customSections: [], lastUpdate: null, signals: []
  }
};

const EXAMPLES = {
  doc: `"LÉGENDES" — Documentaire série, 6x52 min\nChaque épisode retrace le parcours d'un pionnier du rap français des années 90. Interviews inédites, archives rares.\nDiffusion : TRACE Urban & TRACE+`,
  podcast: `"INFO DIRECTE" — Podcast quotidien\nChaque matin, 15 minutes pour comprendre l'actualité. Un journaliste, trois sujets, zéro jargon.`,
  serie: `"NEW WAVE" — Série documentaire, 8x26 min\nNEW WAVE donne la parole à la nouvelle génération du rap français : artistes 18-25 ans, beatmakers.\nDiffusion : Youtube & TRACE Urban`
};

const EMOJIS = ["🎧","🎮","🏋️","👩","🎨","📱","🎵","🎙️","📺","🏃","💼","🎓","👨","🧑","💡","🎯"];
const TYPE_OPTIONS = [
  { value: "eloigne", label: "Les Éloignés", color: "#e8401c" },
  { value: "curieux", label: "Les Curieux", color: "#c9a84c" },
  { value: "fidele", label: "Les Fidèles", color: "#1a6b3a" },
];

const callClaude = async (system, userMessage, maxTokens = 1000) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: maxTokens, ...(system ? { system } : {}), messages: [{ role: "user", content: userMessage }] })
  });
  if (!res.ok) { const err = await res.json(); throw new Error(err.error?.message || `Erreur API: ${res.status}`); }
  return (await res.json()).content.map(i => i.text || "").join("");
};

// Extraction texte depuis fichier
const extractText = async (file) => {
  // TXT
  if (file.type === "text/plain") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // PDF via PDF.js CDN
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    // Charge PDF.js dynamiquement
    if (!window.pdfjsLib) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(" ") + "\n";
    }
    return fullText.trim() || `[PDF sans texte extractible : ${file.name}]`;
  }

  // DOCX — extrait le texte XML interne
  if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
    const arrayBuffer = await file.arrayBuffer();
    // Cherche le contenu word/document.xml dans le zip
    const uint8 = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const raw = decoder.decode(uint8);
    // Extrait le texte entre balises <w:t>
    const matches = raw.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const text = matches.map(m => m.replace(/<[^>]+>/g, "")).join(" ").trim();
    return text.length > 50 ? text : `[Fichier Word : ${file.name} — texte partiellement lisible]\n${text}`;
  }

  return `[Format non supporté : ${file.name}]`;
};

const TagList = ({ items, onChange }) => {
  const [newItem, setNewItem] = useState("");
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0ece4", border: "1px solid #e0d8cc", borderRadius: 20, padding: "2px 8px", fontSize: 12 }}>
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem(""); }}}
          placeholder="Ajouter... (Entrée)" style={{ flex: 1, border: "1px solid #e0d8cc", borderRadius: 3, padding: "4px 8px", fontSize: 12, fontFamily: "inherit", outline: "none" }} />
        <button onClick={() => { if (newItem.trim()) { onChange([...items, newItem.trim()]); setNewItem(""); }}}
          style={{ background: "#0d0d0d", color: "white", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>+</button>
      </div>
    </div>
  );
};

const Avatar = ({ p, size = 50 }) => (
  p.photo
    ? <img src={p.photo} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)" }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.44, flexShrink: 0 }}>{p.emoji}</div>
);

// ── PANNEAU ADMIN ──
const AdminPanel = ({ personas, onSave, onClose }) => {
  const [edited, setEdited] = useState(() => {
    // Deep copy qui preserve les photos (base64)
    const copy = {};
    for (const [k, v] of Object.entries(personas)) {
      copy[k] = { ...v, documents: [...(v.documents || [])], customSections: [...(v.customSections || [])], signals: [...(v.signals || [])], medias: [...(v.medias || [])], interests: [...(v.interests || [])], frustrations: [...(v.frustrations || [])], hooks: [...(v.hooks || [])], triggers: [...(v.triggers || [])] };
    }
    return copy;
  });
  const [activeKey, setActiveKey] = useState(Object.keys(personas)[0]);
  const [newPersonaMode, setNewPersonaMode] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [addingSectionMode, setAddingSectionMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const photoRef = useRef();
  const docRef = useRef();

  const p = edited[activeKey];
  const update = (field, value) => setEdited(prev => ({ ...prev, [activeKey]: { ...prev[activeKey], [field]: value } }));
  const allSections = [...DEFAULT_SECTIONS, ...(p.customSections || [])];

  const addPersona = () => {
    if (Object.keys(edited).length >= 10) { alert("Maximum 10 personas atteint."); return; }
    const key = (newKey.trim().toLowerCase().replace(/\s+/g, "_")) || `persona_${Date.now()}`;
    const t = TYPE_OPTIONS[0];
    setEdited(prev => ({ ...prev, [key]: { name: "Nouveau Persona", age: "— ans — Ville", job: "Profession · Diplôme · CSP", emoji: "🎯", photo: null, type: t.value, typeLabel: t.label, color: t.color, medias: [], interests: [], frustrations: [], hooks: [], triggers: [], bio: "Biographie du persona.", documents: [], customSections: [], lastUpdate: null, signals: [] } }));
    setActiveKey(key); setNewPersonaMode(false); setNewKey("");
  };

  const deletePersona = (key) => {
    const keys = Object.keys(edited).filter(k => k !== key);
    if (keys.length === 0) return;
    const n = { ...edited }; delete n[key]; setEdited(n); setActiveKey(keys[0]);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => update("photo", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDoc = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const text = await extractText(file);
      const docs = [...(p.documents || []), { name: file.name, text, addedAt: new Date().toLocaleDateString("fr-FR") }];
      update("documents", docs);
    } catch(err) { alert("Erreur lecture fichier: " + err.message); }
    e.target.value = "";
  };

  const generateFromDoc = async () => {
    const docs = p.documents || [];
    if (docs.length === 0) { alert("Ajoutez dabord un document !"); return; }
    setGenerating(true);
    try {
      const docTexts = docs.map(d => "--- " + d.name + " ---\n" + d.text.slice(0, 2000)).join("\n\n");
      const prompt = "Tu es expert en creation de personas marketing. Analyse ce document et genere un persona complet.\n\nDOCUMENT(S):\n" + docTexts + "\n\nReponds UNIQUEMENT en JSON valide sans backticks:\n{\"name\":\"<prenom>\",\"age\":\"<XX ans Ville>\",\"job\":\"<Profession Diplome CSP>\",\"emoji\":\"<1 emoji>\",\"bio\":\"<3-4 phrases>\",\"type\":\"<eloigne|curieux|fidele>\",\"typeLabel\":\"<Les Elloignes|Les Curieux|Les Fideles>\",\"color\":\"<#e8401c|#c9a84c|#1a6b3a>\",\"medias\":[\"<5-7 medias>\"],\"interests\":[\"<4-6 interets>\"],\"frustrations\":[\"<3-5 frustrations>\"],\"hooks\":[\"<3-4 accroches>\"],\"triggers\":[\"<3-5 declencheurs>\"]}";
      const text = await callClaude(null, prompt, 1500);
      const generated = JSON.parse(text.replace(/```json|```/g, "").trim());
      setEdited(prev => ({ ...prev, [activeKey]: { ...prev[activeKey], ...generated, photo: prev[activeKey].photo, documents: prev[activeKey].documents, customSections: prev[activeKey].customSections || [], lastUpdate: null, signals: [] } }));
    } catch(e) { alert("Erreur generation : " + e.message); }
    finally { setGenerating(false); }
  };

  const addSection = () => {
    if (!newSectionLabel.trim()) return;
    const key = newSectionLabel.trim().toLowerCase().replace(/\s+/g, "_");
    update("customSections", [...(p.customSections || []), { key, label: newSectionLabel.trim() }]);
    update(key, []);
    setNewSectionLabel(""); setAddingSectionMode(false);
  };

  const deleteSection = (sectionKey) => {
    update("customSections", (p.customSections || []).filter(s => s.key !== sectionKey));
  };

  const fi = {
    label: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#8a8070", marginBottom: 4, display: "block" },
    input: { width: "100%", border: "1px solid #e0d8cc", borderRadius: 3, padding: "7px 10px", fontFamily: "inherit", fontSize: 13, outline: "none", background: "white", color: "#0d0d0d" }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 8, width: "100%", maxWidth: 920, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "16px 24px", borderBottom: "2px solid #0d0d0d", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0d0d", color: "white" }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700 }}>⚙️ Administration des Personas</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: 3, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>✕ Fermer</button>
        </div>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* SIDEBAR */}
          <div style={{ width: 190, borderRight: "1px solid #e0d8cc", background: "#fafaf8", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: 12, borderBottom: "1px solid #e0d8cc", flex: 1, overflow: "auto" }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a8070", marginBottom: 8 }}>Personas</div>
              {Object.entries(edited).map(([key, pe]) => (
                <div key={key} onClick={() => setActiveKey(key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 4, cursor: "pointer", marginBottom: 2, background: activeKey === key ? "#0d0d0d" : "transparent", color: activeKey === key ? "white" : "#0d0d0d" }}>
                  {pe.photo ? <img src={pe.photo} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /> : <span style={{ fontSize: 16 }}>{pe.emoji}</span>}
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pe.name}</span>
                  {Object.keys(edited).length > 1 && <button onClick={e => { e.stopPropagation(); deletePersona(key); }} style={{ background: "none", border: "none", color: activeKey === key ? "rgba(255,255,255,0.5)" : "#ccc", cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>}
                </div>
              ))}
            </div>
            <div style={{ padding: 12 }}>
              {newPersonaMode ? (
                <div>
                  <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Nom (ex: sarah)" style={{ ...fi.input, marginBottom: 6, fontSize: 12 }} autoFocus />
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={addPersona} style={{ flex: 1, background: "#1a6b3a", color: "white", border: "none", borderRadius: 3, padding: "6px", fontSize: 11, cursor: "pointer" }}>✓</button>
                    <button onClick={() => setNewPersonaMode(false)} style={{ flex: 1, background: "#e0d8cc", border: "none", borderRadius: 3, padding: "6px", fontSize: 11, cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setNewPersonaMode(true)} style={{ width: "100%", background: "white", border: "1.5px dashed #e0d8cc", borderRadius: 4, padding: "8px", fontSize: 12, cursor: "pointer", color: "#8a8070", fontFamily: "inherit" }}>+ Nouveau persona</button>
              )}
            </div>
          </div>

          {/* FORM */}
          <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
            {/* PHOTO + EMOJI */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "flex-start" }}>
              <div>
                <label style={fi.label}>Photo</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div onClick={() => photoRef.current.click()} style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px dashed #e0d8cc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafaf8", flexShrink: 0 }}>
                    {p.photo ? <img src={p.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 24 }}>{p.emoji}</div><div style={{ fontSize: 9, color: "#8a8070", marginTop: 2 }}>Cliquer</div></div>}
                  </div>
                  <div>
                    <button onClick={() => photoRef.current.click()} style={{ display: "block", background: "#0d0d0d", color: "white", border: "none", borderRadius: 3, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginBottom: 6 }}>📷 Uploader photo</button>
                    {p.photo && <button onClick={() => update("photo", null)} style={{ display: "block", background: "white", border: "1px solid #e0d8cc", borderRadius: 3, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: "#e8401c" }}>✕ Supprimer</button>}
                  </div>
                  <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={fi.label}>Emoji (si pas de photo)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {EMOJIS.map(em => <span key={em} onClick={() => update("emoji", em)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, cursor: "pointer", fontSize: 18, background: p.emoji === em ? "#f0ece4" : "transparent", border: p.emoji === em ? "2px solid #0d0d0d" : "2px solid transparent" }}>{em}</span>)}
                </div>
              </div>
            </div>

            {/* INFOS BASE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div><label style={fi.label}>Prénom</label><input style={fi.input} value={p.name} onChange={e => update("name", e.target.value)} /></div>
              <div><label style={fi.label}>Âge & Ville</label><input style={fi.input} value={p.age} onChange={e => update("age", e.target.value)} /></div>
              <div><label style={fi.label}>Profession & profil</label><input style={fi.input} value={p.job} onChange={e => update("job", e.target.value)} /></div>
              <div>
                <label style={fi.label}>Type de public</label>
                <select style={fi.input} value={p.type} onChange={e => { const t = TYPE_OPTIONS.find(o => o.value === e.target.value); setEdited(prev => ({ ...prev, [activeKey]: { ...prev[activeKey], type: t.value, typeLabel: t.label, color: t.color } })); }}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}><label style={fi.label}>Biographie</label><textarea style={{ ...fi.input, resize: "vertical", minHeight: 80 }} value={p.bio} onChange={e => update("bio", e.target.value)} /></div>

            {/* DOCUMENTS DU PERSONA */}
            <div style={{ marginBottom: 20, background: "#f0f4ff", border: "1.5px solid #c8d4f0", borderRadius: 4, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
                <label style={{ ...fi.label, marginBottom: 0, color: "#4466cc" }}>📄 Documents de référence</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => docRef.current.click()} style={{ background: "#4466cc", color: "white", border: "none", borderRadius: 3, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>+ Ajouter un document</button>
                  {(p.documents || []).length > 0 && (
                    <button onClick={generateFromDoc} disabled={generating} style={{ background: generating ? "#888" : "linear-gradient(135deg, #e8401c, #c9a84c)", color: "white", border: "none", borderRadius: 3, padding: "5px 14px", fontSize: 11, cursor: generating ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                      {generating ? "⏳ Génération..." : "✨ Générer le persona"}
                    </button>
                  )}
                </div>
                <input ref={docRef} type="file" accept=".txt,.pdf,.docx,.doc" onChange={handleDoc} style={{ display: "none" }} />
              </div>
              {(p.documents || []).length === 0
                ? <div style={{ fontSize: 12, color: "#8a9acc", fontStyle: "italic" }}>Aucun document — ajoutez des études, rapports ou notes de terrain pour enrichir ce persona.</div>
                : (p.documents || []).map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "white", border: "1px solid #c8d4f0", borderRadius: 3, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{doc.name}</div>
                      <div style={{ fontSize: 11, color: "#8a9acc" }}>Ajouté le {doc.addedAt} · {doc.text.length} caractères</div>
                    </div>
                    <button onClick={() => update("documents", (p.documents || []).filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e8401c", fontSize: 13 }}>🗑</button>
                  </div>
                ))
              }
            </div>

            {/* SECTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {allSections.map(({ key, label }) => {
                const isCustom = (p.customSections || []).some(s => s.key === key);
                return (
                  <div key={key} style={{ background: "#fafaf8", border: `1px solid ${isCustom ? "#c9a84c" : "#e0d8cc"}`, borderRadius: 4, padding: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <label style={{ ...fi.label, marginBottom: 0, color: isCustom ? "#c9a84c" : "#8a8070" }}>{label}{isCustom ? " ✦" : ""}</label>
                      {isCustom && <button onClick={() => deleteSection(key)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e8401c", fontSize: 11, padding: 0 }}>🗑 Supprimer</button>}
                    </div>
                    <TagList items={p[key] || []} onChange={val => update(key, val)} />
                  </div>
                );
              })}
              <div style={{ border: "1.5px dashed #e0d8cc", borderRadius: 4, padding: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {addingSectionMode ? (
                  <div style={{ width: "100%" }}>
                    <div style={{ fontSize: 11, color: "#8a8070", marginBottom: 6 }}>Nom de la rubrique :</div>
                    <input value={newSectionLabel} onChange={e => setNewSectionLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addSection()} placeholder="Ex: Valeurs, Aspirations..." style={{ ...fi.input, marginBottom: 8 }} autoFocus />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={addSection} style={{ flex: 1, background: "#c9a84c", color: "#0d0d0d", border: "none", borderRadius: 3, padding: "6px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✓ Ajouter</button>
                      <button onClick={() => { setAddingSectionMode(false); setNewSectionLabel(""); }} style={{ flex: 1, background: "#e0d8cc", border: "none", borderRadius: 3, padding: "6px", fontSize: 12, cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingSectionMode(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8070", fontSize: 13, fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 24 }}>+</span><span>Nouvelle rubrique</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #e0d8cc", background: "#fafaf8", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: "white", border: "1.5px solid #e0d8cc", borderRadius: 3, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Annuler</button>
          <button onClick={() => onSave(edited)} style={{ padding: "9px 24px", background: "#0d0d0d", color: "white", border: "none", borderRadius: 3, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>✓ Sauvegarder</button>
        </div>
      </div>
    </div>
  );
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
      <div style={{ flex: 1, height: 6, background: "#e8e2d8", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", background: c, borderRadius: 3 }} /></div>
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
  const [updatePanel, setUpdatePanel] = useState(null);
  const [error, setError] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const contentDocRef = useRef();

  const p = personas[current] || personas[Object.keys(personas)[0]];
  const scoreColor = result ? (result.score >= 70 ? "#1a6b3a" : result.score >= 40 ? "#c9a84c" : "#e8401c") : "#333";
  const allSections = [...DEFAULT_SECTIONS, ...(p.customSections || [])];

  const selectPersona = (key) => { setCurrent(key); setResult(null); setUpdatePanel(null); setError(null); };
  const savePersonas = (np) => { setPersonas(np); if (!np[current]) setCurrent(Object.keys(np)[0]); setShowAdmin(false); };

  // Upload document dans la zone de test
  const handleContentDoc = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingDoc(true);
    try {
      const text = await extractText(file);
      setContent(text);
    } catch(err) { setError("Erreur lecture fichier: " + err.message); }
    finally { setUploadingDoc(false); e.target.value = ""; }
  };

  const analyze = async () => {
    if (!content.trim()) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const docsContext = (p.documents || []).length > 0
        ? "\n\nDOCUMENTS DE RÉFÉRENCE:\n" + p.documents.map(d => `--- ${d.name} ---\n${d.text.slice(0, 800)}`).join("\n\n")
        : "";
      const sectionContext = allSections.map(s => `${s.label}: ${(p[s.key] || []).join(", ")}`).join("\n");
      const sys = `Tu es ${p.name}, ${p.age}. Tu fais partie des "${p.typeLabel}". Bio: ${p.bio}\n${sectionContext}${docsContext}\nRéponds UNIQUEMENT en JSON valide sans backticks: {"score":<0-100>,"verdict":"<max 8 mots>","reaction":"<1ère personne 2-3 phrases>","dimensions":{"pertinence":<0-100>,"format":<0-100>,"ton":<0-100>,"engagement":<0-100>},"recommandations":["<1>","<2>","<3>"]}`;
      const text = await callClaude(sys, `Analyse ce contenu:\n\n${content}`);
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (e) { setError("Erreur analyse: " + e.message); }
    finally { setLoading(false); }
  };

  const autoUpdate = async () => {
    setUpdating(true); setUpdatePanel(null); setError(null);
    try {
      const prompt = `Expert études d'audience média France 2025-2026. Mise à jour pour: ${p.name}, ${p.age}, ${p.typeLabel}. Médias: ${p.medias.join(", ")}. Intérêts: ${p.interests.join(", ")}. Frustrations: ${p.frustrations.join(", ")}. Réponds UNIQUEMENT en JSON valide sans backticks: {"signals":[{"emoji":"<e>","title":"<titre>","detail":"<1 phrase>","source":"<contexte>"}],"proposed":{"medias":["<liste>"],"interests":["<liste>"],"frustrations":["<liste>"],"triggers":["<liste>"],"bio":"<2-3 phrases>","changes":["<1>","<2>","<3>"]}} Exactement 4 signaux et 3 changements.`;
      const text = await callClaude(null, prompt, 1500);
      setUpdatePanel(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch (e) { setError("Erreur actualisation: " + e.message); }
    finally { setUpdating(false); }
  };

  const applyUpdate = () => {
    const now = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    setPersonas(prev => ({ ...prev, [current]: { ...prev[current], ...updatePanel.proposed, lastUpdate: now, signals: updatePanel.signals } }));
    setUpdatePanel(null);
  };

  const getBadge = (type) => ({ display: "inline-block", padding: "2px 9px", borderRadius: 20, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500, marginTop: 5, background: type === "eloigne" ? "#e8401c" : type === "curieux" ? "#c9a84c" : "#1a6b3a", color: type === "curieux" ? "#0d0d0d" : "white" });

  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: "#f5f0e8", minHeight: "100vh", color: "#0d0d0d" }}>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:.4}40%{transform:scale(1);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.85;transform:scale(1.02)}}
        .update-btn:hover{background:#1a1a1a !important; transform:translateY(-1px);}
      `}</style>
      {showAdmin && <AdminPanel personas={personas} onSave={savePersonas} onClose={() => setShowAdmin(false)} />}

      <header style={{ borderBottom: "2px solid #0d0d0d", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f0e8" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 19, fontWeight: 900 }}>Persona<span style={{ color: "#e8401c" }}>Lab</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 10, color: "#8a8070", letterSpacing: 2, textTransform: "uppercase" }}>Test & Actualisation · TRACE</div>
          <button onClick={() => setShowAdmin(true)} style={{ background: "#0d0d0d", color: "white", border: "none", borderRadius: 3, padding: "7px 14px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>⚙️ Admin</button>
        </div>
      </header>

      {error && <div style={{ background: "#fff0ee", border: "1px solid #e8401c", color: "#e8401c", padding: "12px 28px", fontSize: 13, margin: "16px 28px", borderRadius: 4 }}>⚠️ {error}</div>}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
        {/* TABS PERSONA */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginRight: 4 }}>Persona :</span>
          {Object.entries(personas).map(([key, pe]) => (
            <button key={key} onClick={() => selectPersona(key)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px", border: `1.5px solid ${current === key ? "#0d0d0d" : "#e0d8cc"}`, background: current === key ? "#0d0d0d" : "white", color: current === key ? "white" : "#0d0d0d", borderRadius: 40, cursor: "pointer", fontSize: 12, fontFamily: "inherit", transition: "all 0.15s" }}>
              {pe.photo ? <img src={pe.photo} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} /> : <span>{pe.emoji}</span>}
              {pe.name} — {pe.typeLabel}
              {pe.lastUpdate && <span style={{ fontSize: 10, background: "#1a6b3a", color: "white", padding: "1px 6px", borderRadius: 10 }}>↻</span>}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
          {/* FICHE PERSONA */}
          <div style={{ background: "#0d0d0d", color: "white", borderRadius: 4, overflow: "hidden", position: "sticky", top: 20 }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 12 }}>
              {p.photo
                ? <img src={p.photo} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,255,0.2)" }} />
                : <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, flexShrink: 0 }}>{p.emoji}</div>
              }
              <div>
                <div style={{ fontFamily: "Georgia,serif", fontSize: 18, fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2, lineHeight: 1.6 }}>{p.age}<br />{p.job}</div>
                <span style={getBadge(p.type)}>{p.typeLabel}</span>
                {p.lastUpdate && <div style={{ fontSize: 10, color: "#c9a84c", marginTop: 4 }}>↻ Mis à jour le {p.lastUpdate}</div>}
              </div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>Biographie</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{p.bio}</div>
              </div>
              {allSections.map(({ key, label }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>{label}</div>
                  {key === "frustrations"
                    ? <div style={{ fontSize: 12, color: "rgba(255,100,80,0.85)", lineHeight: 1.6 }}>{(p[key] || []).join(" · ")}</div>
                    : (p[key] || []).length > 0
                      ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{(p[key] || []).map((t, j) => <span key={j} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 3, padding: "1px 6px", fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{t}</span>)}</div>
                      : <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>—</div>
                  }
                </div>
              ))}
              {(p.documents || []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 4 }}>Documents</div>
                  {p.documents.map((doc, i) => <div key={i} style={{ fontSize: 11, color: "rgba(100,160,255,0.8)", marginBottom: 2 }}>📄 {doc.name}</div>)}
                </div>
              )}
            </div>

            {/* BOUTON ACTUALISER — mis en valeur */}
            <button onClick={autoUpdate} disabled={updating} className="update-btn" style={{
              width: "100%", padding: "14px 0",
              background: updating ? "#1a3a2a" : "linear-gradient(135deg, #1a6b3a 0%, #0d4a26 100%)",
              border: "none", borderTop: "1px solid rgba(255,255,255,0.1)",
              color: updating ? "#6abf8a" : "white",
              fontSize: 13, fontWeight: 600, cursor: updating ? "not-allowed" : "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              animation: !updating ? "pulse 3s ease-in-out infinite" : "none",
              letterSpacing: 0.5
            }}>
              <span style={{ fontSize: 18, display: "inline-block", animation: updating ? "spin 1s linear infinite" : "none" }}>↻</span>
              {updating ? "Recherche des signaux en cours..." : "✦ Actualiser automatiquement"}
            </button>
          </div>

          {/* PANNEAU DROIT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 700 }}>Tester un contenu</div>
              <div style={{ fontSize: 13, color: "#8a8070", marginTop: 2 }}>Collez votre synopsis ou uploadez un document — {p.name} réagit en temps réel</div>
            </div>

            <div style={{ background: "white", border: "1.5px solid #e0d8cc", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 0" }}>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Collez ici votre article, script, titre, synopsis..." style={{ width: "100%", minHeight: 120, border: "1px solid #e0d8cc", borderRadius: 3, padding: 11, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", background: "#fafaf8", lineHeight: 1.6, color: "#0d0d0d" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#8a8070", marginBottom: 5 }}>Exemples rapides :</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[["doc","🎵 Documentaire rap 90s"],["podcast","🎙️ Podcast actualité"],["serie","📺 Série jeunes"]].map(([k, l]) => (
                        <span key={k} onClick={() => setContent(EXAMPLES[k])} style={{ padding: "3px 11px", background: "#f0ece4", border: "1px solid #e0d8cc", borderRadius: 20, fontSize: 11, cursor: "pointer" }}>{l}</span>
                      ))}
                    </div>
                  </div>

                  {/* BOUTON UPLOAD DOCUMENT */}
                  <div style={{ textAlign: "right" }}>
                    <button onClick={() => contentDocRef.current.click()} disabled={uploadingDoc} style={{ background: "#f0f4ff", border: "1.5px solid #c8d4f0", color: "#4466cc", borderRadius: 3, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      {uploadingDoc ? "⏳ Lecture..." : "📎 Uploader un document"}
                    </button>
                    <div style={{ fontSize: 10, color: "#8a8070", marginTop: 3 }}>PDF, Word, TXT</div>
                    <input ref={contentDocRef} type="file" accept=".txt,.pdf,.docx,.doc" onChange={handleContentDoc} style={{ display: "none" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #e0d8cc", background: "#fafaf8" }}>
                <span style={{ fontSize: 11, color: "#8a8070" }}>{content.length} car.</span>
                <button onClick={analyze} disabled={loading || !content.trim()} style={{ background: loading || !content.trim() ? "#ccc" : "#0d0d0d", color: "white", border: "none", padding: "9px 22px", fontSize: 12, fontWeight: 500, cursor: loading || !content.trim() ? "not-allowed" : "pointer", borderRadius: 3, fontFamily: "inherit" }}>
                  {loading ? "Analyse..." : `Analyser avec ${p.name} →`}
                </button>
              </div>
            </div>

            {loading && <div style={{ textAlign: "center", padding: 24 }}>{[0,1,2].map(i => <span key={i} style={{ display: "inline-block", width: 8, height: 8, background: "#0d0d0d", borderRadius: "50%", margin: "0 3px", animation: `bounce 1.2s ${i*0.2}s ease-in-out infinite` }} />)}<div style={{ fontSize: 12, color: "#8a8070", marginTop: 10, fontStyle: "italic" }}>{p.name} lit votre contenu...</div></div>}

            {updatePanel && (
              <div style={{ background: "white", border: "1.5px solid #c9a84c", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ background: "#fffbf0", padding: "14px 18px", borderBottom: "1px solid #e8e0c8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>↻ Signaux détectés pour {p.name}</div><div style={{ fontSize: 11, color: "#8a8070", marginTop: 2 }}>3 évolutions proposées</div></div>
                  <span style={{ fontSize: 10, background: "#c9a84c", color: "#0d0d0d", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>EN ATTENTE</span>
                </div>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8e0c8" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 }}>Signaux captés</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {updatePanel.signals.map((s, i) => <div key={i} style={{ background: "#fafaf8", border: "1px solid #e8e0c8", borderRadius: 3, padding: "10px 12px" }}><div style={{ fontSize: 16, marginBottom: 4 }}>{s.emoji}</div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{s.title}</div><div style={{ fontSize: 11, color: "#666", lineHeight: 1.4 }}>{s.detail}</div><div style={{ fontSize: 10, color: "#c9a84c", marginTop: 4 }}>{s.source}</div></div>)}
                  </div>
                </div>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #e8e0c8" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 }}>Évolutions proposées</div>
                  {updatePanel.proposed.changes.map((c, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}><span style={{ width: 18, height: 18, background: "#c9a84c", color: "#0d0d0d", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i+1}</span><div style={{ fontSize: 13, lineHeight: 1.5 }}>{c}</div></div>)}
                </div>
                <div style={{ padding: "12px 18px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => setUpdatePanel(null)} style={{ padding: "8px 18px", background: "white", border: "1.5px solid #e0d8cc", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>✕ Rejeter</button>
                  <button onClick={applyUpdate} style={{ padding: "8px 18px", background: "#1a6b3a", color: "white", border: "none", borderRadius: 3, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>✓ Valider & Appliquer</button>
                </div>
              </div>
            )}

            {result && (
              <div style={{ background: "white", border: "1.5px solid #e0d8cc", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #e0d8cc", display: "flex", alignItems: "center", gap: 10 }}>
                  {p.photo ? <img src={p.photo} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{p.emoji}</div>}
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name} réagit <span style={{ color: "#8a8070", fontWeight: 400 }}>· {p.typeLabel}</span></div>
                </div>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #e0d8cc", display: "flex", alignItems: "center", gap: 24 }}>
                  <ScoreCircle score={result.score} color={scoreColor} />
                  <div>
                    <div style={{ fontSize: 24 }}>{result.score >= 70 ? "🟢" : result.score >= 40 ? "🟡" : "🔴"}</div>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700, margin: "3px 0" }}>{result.verdict}</div>
                    <div style={{ fontSize: 11, color: "#8a8070" }}>Score de résonance avec {p.name}</div>
                  </div>
                </div>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #e0d8cc" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 }}>La réaction de {p.name}</div>
                  <div style={{ background: "#f5f0e8", borderLeft: "3px solid #e8401c", padding: "12px 14px", borderRadius: "0 4px 4px 0", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>"{result.reaction}"</div>
                </div>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #e0d8cc" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 }}>Analyse détaillée</div>
                  {Object.entries(result.dimensions).map(([k, v]) => <DimBar key={k} label={k} value={v} />)}
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#8a8070", marginBottom: 10 }}>Pour mieux toucher {p.name}</div>
                  {result.recommandations.map((r, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}><span style={{ width: 20, height: 20, background: "#0d0d0d", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, marginTop: 1 }}>{i+1}</span><div style={{ fontSize: 13, lineHeight: 1.5 }}>{r}</div></div>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
