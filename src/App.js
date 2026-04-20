import { useState, useRef, useEffect } from "react";

const C = {
  bg: "#0A0A0F", surface: "#13131A", surface2: "#1C1C28", border: "#2A2A3A",
  lime: "#C8FF47", purple: "#9B6FFF", violet: "#6B3FE7", green: "#2ECC8A",
  red: "#FF5C5C", amber: "#FFB547", text: "#F0F0F8", muted: "#7A7A9A",
};

const gs = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: ${C.bg}; color: ${C.text}; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .fade-up { animation: fadeUp 0.3s ease forwards; }
  .fade-up-1 { animation: fadeUp 0.3s ease 0.05s forwards; opacity:0; }
  .fade-up-2 { animation: fadeUp 0.3s ease 0.10s forwards; opacity:0; }
  .fade-up-3 { animation: fadeUp 0.3s ease 0.15s forwards; opacity:0; }
  .fade-up-4 { animation: fadeUp 0.3s ease 0.20s forwards; opacity:0; }
  .fade-up-5 { animation: fadeUp 0.3s ease 0.25s forwards; opacity:0; }
  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
`;

// ─── SHARED UI ───────────────────────────────────────────────────────────────

const Badge = ({ type, children }) => {
  const s = {
    pass: { background: "rgba(46,204,138,0.15)", color: C.green },
    warn: { background: "rgba(255,181,71,0.15)", color: C.amber },
    fail: { background: "rgba(255,92,92,0.15)", color: C.red },
    info: { background: "rgba(155,111,255,0.15)", color: C.purple },
    neutral: { background: "rgba(240,240,248,0.08)", color: C.muted },
  };
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:600, ...s[type] }}>{children}</span>;
};

const inputBase = { background: C.surface2, border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 12px", color:C.text, fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none", width:"100%" };

// Combo: free-text input with optional suggestion list
const Combo = ({ label, value, onChange, suggestions = [], placeholder = "" }) => {
  const id = `dl-${label.replace(/\s/g,"-")}`;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5, flex:"1 1 calc(50% - 8px)", minWidth:0 }}>
      <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{label}</label>
      <input list={id} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputBase} />
      {suggestions.length > 0 && (
        <datalist id={id}>{suggestions.map(s=><option key={s} value={s}/>)}</datalist>
      )}
    </div>
  );
};

const Field = ({ label, value, onChange, type="text", placeholder="", fullWidth=false }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5, flex: fullWidth ? "1 1 100%" : "1 1 calc(50% - 8px)", minWidth:0 }}>
    <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{label}</label>
    {type==="checkbox"
      ? <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:6 }}><input type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)} style={{ width:16, height:16, accentColor:C.lime, cursor:"pointer" }}/><span style={{ fontSize:12, color:C.muted }}>Enabled</span></div>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputBase}/>}
  </div>
);

const Textarea = ({ label, value, onChange, placeholder="", rows=3, fullWidth=true }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5, flex: fullWidth ? "1 1 100%" : "1 1 calc(50% - 8px)", minWidth:0 }}>
    <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{label}</label>
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputBase, resize:"vertical" }}/>
  </div>
);

const MultiCheck = ({ label, options, value=[], onChange }) => (
  <div style={{ flex:"1 1 100%", display:"flex", flexDirection:"column", gap:6 }}>
    <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{label}</label>
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {options.map(o=>{
        const checked = value.includes(o);
        return (
          <label key={o} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color: checked ? C.text : C.muted, cursor:"pointer", background: checked ? "rgba(200,255,71,0.08)" : C.surface2, border:`1px solid ${checked ? C.lime : C.border}`, borderRadius:8, padding:"5px 10px", transition:"all 0.15s" }}>
            <input type="checkbox" checked={checked} onChange={()=>{ onChange(checked ? value.filter(x=>x!==o) : [...value, o]); }} style={{ width:13, height:13, accentColor:C.lime, cursor:"pointer" }}/>{o}
          </label>
        );
      })}
    </div>
  </div>
);

const CollapsibleSection = ({ title, defaultOpen=false, badge=null, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden", marginBottom:10 }}>
      <button onClick={()=>setOpen(!open)} style={{ width:"100%", background:C.surface2, border:"none", padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", color:C.text, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontWeight:600, fontSize:13 }}>{title}</span>
          {badge && <Badge type="info">{badge}</Badge>}
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ width:16, height:16, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && <div style={{ padding:"16px 18px", background:C.surface, display:"flex", flexWrap:"wrap", gap:12 }}>{children}</div>}
    </div>
  );
};

// Inline flags row
const FlagRow = ({ flags, spec, onChange }) => (
  <div style={{ flex:"1 1 100%", display:"flex", gap:20, flexWrap:"wrap" }}>
    {flags.map(([key, label])=>(
      <label key={key} style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, cursor:"pointer", color: spec[key] ? C.lime : C.muted }}>
        <input type="checkbox" checked={!!spec[key]} onChange={e=>onChange({...spec,[key]:e.target.checked})} style={{ width:15, height:15, accentColor:C.lime, cursor:"pointer" }}/>{label}
      </label>
    ))}
  </div>
);

// Grid of small inputs
const SmallGrid = ({ cols=3, items, spec, onChange }) => (
  <div style={{ flex:"1 1 100%", display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:8 }}>
    {items.map(([key, label, ph=""])=>(
      <div key={key} style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <label style={{ fontSize:9, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{label}</label>
        <input value={spec[key]||""} onChange={e=>onChange({...spec,[key]:e.target.value})} placeholder={ph} style={{ ...inputBase, padding:"7px 10px", borderRadius:8, fontSize:12 }}/>
      </div>
    ))}
  </div>
);

// ─── IMPORT FROM PROFILE MODAL ────────────────────────────────────────────────

const IMPORTABLE_SECTIONS = [
  { key:"stepLayout", label:"Step Layout", fields:["staggerType","staggerDirection","staggerInches","staggerPercent","gapAcross","gapAround","horizWebTrim"] },
  { key:"microdots", label:"Microdots (Lane & Blanket)", fields:["laneMicrodotType","laneMicrodotSize","laneMicrodotShape","laneMicrodotKnockout","blanketMicrodotType","blanketMicrodotSize","blanketMicrodotShape","blanketMicrodotKnockout"] },
  { key:"eyespot", label:"Eyespot & Eyeline", fields:["eyespotHorizRef","eyespotHorizDist","eyespotPrimaryColor","eyespotSecondaryColor","eyespot2ndPullback","eyelineColor","eyelineWidth","eyelineHorizRef","eyelineHorizDist"] },
  { key:"pressMarks", label:"Press Mark Notes", fields:["pressMarkNotes"] },
  { key:"barcodes", label:"Barcode Specs", fields:["barcodeType","barcodeSepType","barcodeMagMin","barcodeMagPref","barcodeBWA","barcodeNarrowBar","barcodeQuietZone","barcodeTruncation"] },
  { key:"angles", label:"Screen Angles", fields:["cyanAngle","magentaAngle","yellowAngle","blackAngle","orangeAngle","greenAngle","blueAngle","violetAngle","whiteSpotAngle"] },
  { key:"traps", label:"Traps, Bleeds & Pullbacks", fields:["trapScreen","trapLine","pullbackWhite1","pullbackWhite2","bleed","safeZone"] },
];

const ImportModal = ({ presses, onImport, onClose }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const allProfiles = presses.flatMap(p=>p.profiles.map(pr=>({...pr, pressName:p.name})));

  const toggle = (key) => setSelectedSections(prev=>prev.includes(key)?prev.filter(k=>k!==key):[...prev,key]);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, width:520, maxHeight:"80vh", overflowY:"auto" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, marginBottom:6 }}>Import from Existing Profile</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:20 }}>Choose a profile and select which sections to copy in.</div>

        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
          <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>Source Profile</label>
          {allProfiles.map(pr=>(
            <label key={pr.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:10, border:`1px solid ${selectedProfile?.id===pr.id?C.lime:C.border}`, background: selectedProfile?.id===pr.id?"rgba(200,255,71,0.06)":C.surface2, cursor:"pointer" }}>
              <input type="radio" name="profile" checked={selectedProfile?.id===pr.id} onChange={()=>setSelectedProfile(pr)} style={{ accentColor:C.lime }}/>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{pr.profileCode} — {pr.pressName}</div>
                <div style={{ fontSize:11, color:C.muted }}>{pr.profileName}</div>
              </div>
            </label>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:24 }}>
          <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>Sections to Import</label>
          {IMPORTABLE_SECTIONS.map(sec=>(
            <label key={sec.key} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", borderRadius:10, border:`1px solid ${selectedSections.includes(sec.key)?C.lime:C.border}`, background: selectedSections.includes(sec.key)?"rgba(200,255,71,0.06)":C.surface2, cursor:"pointer" }}>
              <input type="checkbox" checked={selectedSections.includes(sec.key)} onChange={()=>toggle(sec.key)} style={{ accentColor:C.lime }}/>
              <span style={{ fontSize:13, fontWeight:500 }}>{sec.label}</span>
            </label>
          ))}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"8px 16px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancel</button>
          <button disabled={!selectedProfile||!selectedSections.length} onClick={()=>{
            const patches = {};
            selectedSections.forEach(key=>{
              const sec = IMPORTABLE_SECTIONS.find(s=>s.key===key);
              sec.fields.forEach(f=>{ patches[f]=selectedProfile[f]||""; });
            });
            onImport(patches);
            onClose();
          }} style={{ background: (!selectedProfile||!selectedSections.length)?"#333":C.lime, color: (!selectedProfile||!selectedSections.length)?C.muted:"#0A0A0F", border:"none", padding:"8px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor: (!selectedProfile||!selectedSections.length)?"not-allowed":"pointer" }}>Import Selected</button>
        </div>
      </div>
    </div>
  );
};

// ─── SPEC FORM ────────────────────────────────────────────────────────────────

const emptySpec = {
  profileCode:"", profileName:"", gmgProfileName:"", softProofProfileName:"", dateCreated:"", active:true,
  customer:"", printer:"", press:"", pressSpeed:"", pressSpeedUnits:"FPM",
  orientation:"", lineScreen:"", technology:"", thickness:"", exposureType:"",
  plateMaterial:"", pPlus:false, hd:false, bellissima:false, quartz:false,
  primaryPlateCurve:"", secondaryPlateCurve:"", inkDensityFilter:"", matteFinish:false, extendedGamut:false,
  inkType:"", inkSupplier:"", inkSequence:"", cellPattern:"", inkViscosityCup:"", inkViscositySeconds:"",
  objectBasedScreening:"", gmgSpotColorCurve:"", proofDotShape:"", minDotGMG:"", proofingWorkflow:"",
  substrate:"", laminate:"", backing:"", primaryStructure:"", process:"",
  cyanAngle:"", magentaAngle:"", yellowAngle:"", blackAngle:"", orangeAngle:"", greenAngle:"", blueAngle:"", violetAngle:"", whiteSpotAngle:"",
  lineWeightPositive:"", lineWeightReverse:"",
  barcodeType:"", barcodeSepType:"", barcodeMagMin:"", barcodeMagPref:"", barcodeBWA:"", barcodeNarrowBar:"", barcodeQuietZone:"", barcodeTruncation:"",
  eyespotHorizRef:"", eyespotHorizDist:"", eyespotPrimaryColor:"", eyespotSecondaryColor:"", eyespot2ndPullback:"",
  eyelineColor:"", eyelineWidth:"", eyelineHorizRef:"", eyelineHorizDist:"",
  trapScreen:"", trapLine:"", pullbackWhite1:"", pullbackWhite2:"", bleed:"", safeZone:"",
  dotsLPI:"", dotsMinPct:"", dotsMaxPct:"", dotsShape:"", dotsSepType:"", dotsNonFT:"",
  staggerType:"", staggerDirection:"", staggerInches:"", staggerPercent:"", gapAcross:"", gapAround:"", horizWebTrim:"",
  laneMicrodotType:"", laneMicrodotSize:"", laneMicrodotShape:"", laneMicrodotKnockout:"",
  blanketMicrodotType:"", blanketMicrodotSize:"", blanketMicrodotShape:"", blanketMicrodotKnockout:"",
  charC:{ density:"", l:"", a:"", b:"", tvi2:"", tvi25:"", tvi50:"", tvi75:"", aniloxLPI:"", aniloxBCM:"" },
  charM:{ density:"", l:"", a:"", b:"", tvi2:"", tvi25:"", tvi50:"", tvi75:"", aniloxLPI:"", aniloxBCM:"" },
  charY:{ density:"", l:"", a:"", b:"", tvi2:"", tvi25:"", tvi50:"", tvi75:"", aniloxLPI:"", aniloxBCM:"" },
  charK:{ density:"", l:"", a:"", b:"", tvi2:"", tvi25:"", tvi50:"", tvi75:"", aniloxLPI:"", aniloxBCM:"" },
  inkNotes:"", pressMarkNotes:"",
};

const SpecForm = ({ spec, onChange, onCancel, onSave, allPresses }) => {
  const [showImport, setShowImport] = useState(false);
  const upd = f => v => onChange({...spec,[f]:v});
  const updCh = (ch,f) => v => onChange({...spec,[ch]:{...spec[ch],[f]:v}});
  const chColors = { charC:"#00AAEE", charM:"#FF69B4", charY:"#CCCC00", charK:"#AAAAAA" };
  const chLabels = { charC:"Cyan (C)", charM:"Magenta (M)", charY:"Yellow (Y)", charK:"Black (K)" };

  return (
    <>
      {showImport && <ImportModal presses={allPresses} onImport={patches=>onChange({...spec,...patches})} onClose={()=>setShowImport(false)}/>}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>{spec.profileCode||"New Press Profile"}</div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setShowImport(true)} style={{ background:"transparent", border:`1px solid ${C.lime}`, color:C.lime, padding:"7px 14px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>↙ Import from Profile</button>
            <button onClick={onCancel} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"7px 14px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancel</button>
            <button onClick={onSave} style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"7px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Save Profile</button>
          </div>
        </div>

        {/* CORE */}
        <CollapsibleSection title="Core — Profile & Press Setup" defaultOpen>
          <Combo label="Profile Code" value={spec.profileCode} onChange={upd("profileCode")} placeholder="e.g. APF505"/>
          <Field label="Profile Name" value={spec.profileName} onChange={upd("profileName")} placeholder="e.g. APF505_150S_WIC_LSH_XPS_HDPP_0523"/>
          <Field label="GMG Profile Name" value={spec.gmgProfileName} onChange={upd("gmgProfileName")}/>
          <Field label="Soft Proof Profile Name" value={spec.softProofProfileName} onChange={upd("softProofProfileName")}/>
          <Field label="Customer / Brand" value={spec.customer} onChange={upd("customer")} placeholder="e.g. Tootsie Roll, Kellogg's"/>
          <Field label="Printer / Converter" value={spec.printer} onChange={upd("printer")} placeholder="e.g. ProAmpac — Cary, IL"/>
          <Field label="Press" value={spec.press} onChange={upd("press")} placeholder="e.g. PCMC Infinity (P2)"/>
          <Field label="Press Speed" value={spec.pressSpeed} onChange={upd("pressSpeed")} placeholder="e.g. 800"/>
          <Combo label="Speed Units" value={spec.pressSpeedUnits} onChange={upd("pressSpeedUnits")} suggestions={["FPM","MPM"]}/>
          <Combo label="Orientation" value={spec.orientation} onChange={upd("orientation")} suggestions={["Surface","Reverse","Reverse — White Ink / Clear","Surface — White Ink / Clear"]}/>
          <Field label="Line Screen (LPI)" value={spec.lineScreen} onChange={upd("lineScreen")} placeholder="e.g. 150"/>
          <Field label="Date Created" value={spec.dateCreated} onChange={upd("dateCreated")} type="date"/>
          <Field label="Active" value={spec.active} onChange={upd("active")} type="checkbox"/>
        </CollapsibleSection>

        {/* PLATE */}
        <CollapsibleSection title="Plate">
          <Combo label="Technology" value={spec.technology} onChange={upd("technology")} suggestions={["Digital","Analog","Hybrid"]}/>
          <Field label="Thickness (in)" value={spec.thickness} onChange={upd("thickness")} placeholder="e.g. 0.067"/>
          <Field label="Plate Material" value={spec.plateMaterial} onChange={upd("plateMaterial")} placeholder="e.g. LSH, DFH, DFX, ESF…"/>
          <Field label="Exposure Type" value={spec.exposureType} onChange={upd("exposureType")} placeholder="e.g. XPS, Conventional, LED, UV…"/>
          <Field label="Primary Plate Curve" value={spec.primaryPlateCurve} onChange={upd("primaryPlateCurve")} placeholder="e.g. ProAmpac_SAGE_LSH_067_XPS_Crystal.icpro"/>
          <Field label="Secondary Plate Curve" value={spec.secondaryPlateCurve} onChange={upd("secondaryPlateCurve")}/>
          <FlagRow flags={[["pPlus","P+"],["hd","HD"],["bellissima","Bellissima"],["quartz","Quartz"]]} spec={spec} onChange={onChange}/>
        </CollapsibleSection>

        {/* INK */}
        <CollapsibleSection title="Ink">
          <Combo label="Ink Type" value={spec.inkType} onChange={upd("inkType")} suggestions={["Solvent","Water-based","UV","UV-LED","EB"]}/>
          <Field label="Ink Supplier" value={spec.inkSupplier} onChange={upd("inkSupplier")} placeholder="e.g. Sun Chemical"/>
          <Field label="Ink Sequence" value={spec.inkSequence} onChange={upd("inkSequence")} placeholder="e.g. KCMY (2,3,6,7)"/>
          <Field label="Metering / Cell Pattern" value={spec.cellPattern} onChange={upd("cellPattern")} placeholder="e.g. Steel / 1000 LPI 2.2 BCM"/>
          <Field label="Viscosity Cup" value={spec.inkViscosityCup} onChange={upd("inkViscosityCup")} placeholder="e.g. #2"/>
          <Field label="Viscosity (sec)" value={spec.inkViscositySeconds} onChange={upd("inkViscositySeconds")} placeholder="e.g. 30"/>
          <Field label="GMG Spot Color Curve" value={spec.gmgSpotColorCurve} onChange={upd("gmgSpotColorCurve")}/>
          <Field label="Object Based Screening" value={spec.objectBasedScreening} onChange={upd("objectBasedScreening")} placeholder="e.g. CRS05 Crystal C22"/>
          <Combo label="Ink Density Filter" value={spec.inkDensityFilter} onChange={upd("inkDensityFilter")} suggestions={["Status T","Status E","Status I"]}/>
          <Field label="Proof Dot Shape" value={spec.proofDotShape} onChange={upd("proofDotShape")}/>
          <Field label="Min Dot GMG" value={spec.minDotGMG} onChange={upd("minDotGMG")}/>
          <Field label="Proofing Workflow" value={spec.proofingWorkflow} onChange={upd("proofingWorkflow")}/>
          <FlagRow flags={[["matteFinish","Matte Finish"],["extendedGamut","Extended Gamut"]]} spec={spec} onChange={onChange}/>
          <Textarea label="Ink / Screening Comments" value={spec.inkNotes} onChange={upd("inkNotes")} placeholder="Process colors, spot conditions, screen sleeve notes…" rows={4}/>
        </CollapsibleSection>

        {/* SUBSTRATE */}
        <CollapsibleSection title="Substrate & Structure">
          <Field label="Substrate Type" value={spec.substrate} onChange={upd("substrate")} placeholder="e.g. White Ink / Clear, OPP/CPP, PET/PE"/>
          <Field label="Laminate" value={spec.laminate} onChange={upd("laminate")} placeholder="e.g. LAM, None"/>
          <Field label="Backing" value={spec.backing} onChange={upd("backing")} placeholder="e.g. Metal, Paper"/>
          <Field label="Primary Structure" value={spec.primaryStructure} onChange={upd("primaryStructure")}/>
          <Field label="Process Type" value={spec.process} onChange={upd("process")} placeholder="e.g. Conventional HDFT P+"/>
        </CollapsibleSection>

        {/* PREPRESS RULES */}
        <CollapsibleSection title="Prepress Rules — Fonts, Line Weight, Angles">
          <SmallGrid cols={3} spec={spec} onChange={onChange} items={[
            ["cyanAngle","Cyan °","7.5"],["magentaAngle","Magenta °","67.5"],["yellowAngle","Yellow °","82.5"],
            ["blackAngle","Black °","37.5"],["orangeAngle","Orange °",""],["greenAngle","Green °",""],
            ["blueAngle","Blue °",""],["violetAngle","Violet °",""],["whiteSpotAngle","White / Spot °","0"],
          ]}/>
          <Field label="Line Weight Positive (pt)" value={spec.lineWeightPositive} onChange={upd("lineWeightPositive")} placeholder="e.g. 0.5"/>
          <Field label="Line Weight Reverse (pt)" value={spec.lineWeightReverse} onChange={upd("lineWeightReverse")} placeholder="e.g. 0.75"/>
        </CollapsibleSection>

        {/* BARCODES */}
        <CollapsibleSection title="Barcodes">
          <SmallGrid cols={3} spec={spec} onChange={onChange} items={[
            ["barcodeType","Barcode Type","e.g. UPC-A"],["barcodeSepType","Sep. Type","e.g. Line, Process"],
            ["barcodeMagMin","Mag. Min %","e.g. 85"],["barcodeMagPref","Mag. Preferred %","e.g. 100"],
            ["barcodeBWA","BWA","e.g. 0.002"],["barcodeNarrowBar","Narrow Bar","e.g. 0.014"],
            ["barcodeQuietZone","Quiet Zone","e.g. 0.125"],["barcodeTruncation","Max Truncation %","e.g. 25"],
          ]}/>
        </CollapsibleSection>

        {/* EYESPOT & EYELINE */}
        <CollapsibleSection title="Eyespot & Eyeline">
          <Combo label="Eyespot Horiz. Ref." value={spec.eyespotHorizRef} onChange={upd("eyespotHorizRef")} suggestions={["Web Edge","Center","Other"]}/>
          <Field label="Horiz. Dist. from Web Edge" value={spec.eyespotHorizDist} onChange={upd("eyespotHorizDist")} placeholder="e.g. 0.0625"/>
          <Field label="Primary Color" value={spec.eyespotPrimaryColor} onChange={upd("eyespotPrimaryColor")} placeholder="e.g. Darkest Color"/>
          <Field label="Secondary Color" value={spec.eyespotSecondaryColor} onChange={upd("eyespotSecondaryColor")} placeholder="e.g. White"/>
          <Field label="2nd Pullback Amt" value={spec.eyespot2ndPullback} onChange={upd("eyespot2ndPullback")} placeholder="e.g. 0.02"/>
          <Field label="Eyeline Color" value={spec.eyelineColor} onChange={upd("eyelineColor")} placeholder="e.g. Darkest Color"/>
          <Field label="Eyeline Width" value={spec.eyelineWidth} onChange={upd("eyelineWidth")} placeholder="e.g. 0.125"/>
          <Field label="Eyeline Horiz. Ref." value={spec.eyelineHorizRef} onChange={upd("eyelineHorizRef")}/>
          <Field label="Eyeline Horiz. Dist." value={spec.eyelineHorizDist} onChange={upd("eyelineHorizDist")}/>
        </CollapsibleSection>

        {/* TRAPS */}
        <CollapsibleSection title="Traps, Bleeds & Pullbacks">
          <SmallGrid cols={3} spec={spec} onChange={onChange} items={[
            ["trapScreen","Trap Screen (in)","e.g. 0.015"],["trapLine","Trap Line (in)","e.g. 0.02"],
            ["pullbackWhite1","Pullback White 1","e.g. 0.02"],["pullbackWhite2","Pullback White 2","e.g. 0.04"],
            ["bleed","Bleed","e.g. 0.125 in"],["safeZone","Safe Zone","e.g. 0.125 in"],
          ]}/>
        </CollapsibleSection>

        {/* DOTS */}
        <CollapsibleSection title="Dots">
          <SmallGrid cols={3} spec={spec} onChange={onChange} items={[
            ["dotsLPI","LPI","e.g. 150"],["dotsMinPct","Min %","e.g. 2"],["dotsMaxPct","Max %","e.g. 97"],
            ["dotsShape","Dot Shape","e.g. Crystal C22"],["dotsSepType","Sep. Type","e.g. All, Screen"],["dotsNonFT","Non-FT Plate %","e.g. 80"],
          ]}/>
        </CollapsibleSection>

        {/* STEP LAYOUT */}
        <CollapsibleSection title="Step Layout">
          <Combo label="Stagger Type" value={spec.staggerType} onChange={upd("staggerType")} suggestions={["Continuous","Butt","Gap"]}/>
          <Combo label="Stagger Direction" value={spec.staggerDirection} onChange={upd("staggerDirection")} suggestions={["Down","Up","Left","Right"]}/>
          <Field label="Stagger Inches" value={spec.staggerInches} onChange={upd("staggerInches")} placeholder="e.g. 0.5"/>
          <Field label="Stagger Percent" value={spec.staggerPercent} onChange={upd("staggerPercent")} placeholder="e.g. 50"/>
          <Field label="Gap Across Amount" value={spec.gapAcross} onChange={upd("gapAcross")} placeholder="e.g. 0.125"/>
          <Field label="Gap Around Amount" value={spec.gapAround} onChange={upd("gapAround")} placeholder="e.g. 0.0625"/>
          <Field label="Horiz. Web Trim" value={spec.horizWebTrim} onChange={upd("horizWebTrim")} placeholder="e.g. 0.25"/>
        </CollapsibleSection>

        {/* MICRODOTS */}
        <CollapsibleSection title="Microdots — Lane & Blanket">
          <div style={{ flex:"1 1 100%", fontWeight:600, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:1 }}>Lane</div>
          <Field label="Type" value={spec.laneMicrodotType} onChange={upd("laneMicrodotType")}/>
          <Field label="Size" value={spec.laneMicrodotSize} onChange={upd("laneMicrodotSize")}/>
          <Field label="Shape" value={spec.laneMicrodotShape} onChange={upd("laneMicrodotShape")}/>
          <Field label="Knockout Size" value={spec.laneMicrodotKnockout} onChange={upd("laneMicrodotKnockout")}/>
          <div style={{ flex:"1 1 100%", fontWeight:600, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginTop:4 }}>Blanket</div>
          <Field label="Type" value={spec.blanketMicrodotType} onChange={upd("blanketMicrodotType")}/>
          <Field label="Size" value={spec.blanketMicrodotSize} onChange={upd("blanketMicrodotSize")}/>
          <Field label="Shape" value={spec.blanketMicrodotShape} onChange={upd("blanketMicrodotShape")}/>
          <Field label="Knockout Size" value={spec.blanketMicrodotKnockout} onChange={upd("blanketMicrodotKnockout")}/>
        </CollapsibleSection>

        {/* CHARACTERIZATION */}
        <CollapsibleSection title="Press Characterization — Density, Lab & TVI">
          {Object.keys(chLabels).map(ch=>(
            <div key={ch} style={{ flex:"1 1 100%", marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:chColors[ch], marginBottom:8, borderBottom:`1px solid ${C.border}`, paddingBottom:5 }}>{chLabels[ch]}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:7 }}>
                {[["density","Density"],["l","L*"],["a","a*"],["b","b*"],["aniloxLPI","Anilox LPI"],["aniloxBCM","Anilox BCM"],["tvi2","TVI 2%"],["tvi25","TVI 25%"],["tvi50","TVI 50%"],["tvi75","TVI 75%"]].map(([f,lbl])=>(
                  <div key={f} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                    <label style={{ fontSize:9, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{lbl}</label>
                    <input value={spec[ch][f]} onChange={e=>updCh(ch,f)(e.target.value)} placeholder="—" style={{ ...inputBase, padding:"7px 9px", borderRadius:8, fontSize:12 }}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CollapsibleSection>

        {/* PRESS MARKS NOTES */}
        <CollapsibleSection title="Press Mark Notes & Special Instructions">
          <Textarea label="Notes" value={spec.pressMarkNotes} onChange={upd("pressMarkNotes")} placeholder="Dead area, trim marks, slur marks, guideline specs, lane numbers, legacy notes…" rows={5}/>
        </CollapsibleSection>
      </div>
    </>
  );
};

// ─── PRESS SPECS ──────────────────────────────────────────────────────────────

const PressSpecs = () => {
  const [presses, setPresses] = useState([]);
  const [expanded, setExpanded] = useState(1);
  const [editing, setEditing] = useState(null);
  const [editingPressId, setEditingPressId] = useState(null);
  const [addingPress, setAddingPress] = useState(false);
  const [newPress, setNewPress] = useState({ name:"", manufacturer:"", type:"" });

  const startNew = pressId => { setEditingPressId(pressId); setEditing({...emptySpec, id:Date.now()}); };
  const startEdit = (pressId, profile) => { setEditingPressId(pressId); setEditing({...emptySpec,...profile}); };
  const save = () => {
    setPresses(prev=>prev.map(p=>{ if(p.id!==editingPressId) return p; const ex=p.profiles.find(pr=>pr.id===editing.id); return {...p, profiles: ex ? p.profiles.map(pr=>pr.id===editing.id?editing:pr) : [...p.profiles,editing]}; }));
    setEditing(null); setEditingPressId(null);
  };
  const addPress = () => {
    if(!newPress.name) return;
    setPresses(prev=>[...prev,{id:Date.now(),...newPress,profiles:[]}]);
    setNewPress({name:"",manufacturer:"",type:""}); setAddingPress(false);
  };

  if(editing) return <SpecForm spec={editing} onChange={setEditing} onCancel={()=>{setEditing(null);setEditingPressId(null);}} onSave={save} allPresses={presses}/>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:-0.5 }}>Press Specs</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Press → Profile hierarchy · Profiles stored per press</div>
        </div>
        <button onClick={()=>setAddingPress(true)} style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"8px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ Add Press</button>
      </div>

      {addingPress && (
        <div style={{ background:C.surface, border:`1px solid ${C.lime}`, borderRadius:14, padding:20, marginBottom:16, display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end" }}>
          {[["name","Converter / Location","e.g. ProAmpac — Cary, IL"],["manufacturer","Press Manufacturer","e.g. PCMC"],["type","Press Model","e.g. Infinity (P2)"]].map(([k,lbl,ph])=>(
            <div key={k} style={{ flex:"1 1 180px", display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{lbl}</label>
              <input value={newPress[k]} onChange={e=>setNewPress(p=>({...p,[k]:e.target.value}))} placeholder={ph} style={inputBase}/>
            </div>
          ))}
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setAddingPress(false)} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"9px 14px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancel</button>
            <button onClick={addPress} style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"9px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Add Press</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {presses.map(press=>(
          <div key={press.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
            <div onClick={()=>setExpanded(expanded===press.id?null:press.id)} style={{ padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", background: expanded===press.id?C.surface2:"transparent" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:"rgba(200,255,71,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{press.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{press.manufacturer} {press.type} · {press.profiles.length} profile{press.profiles.length!==1?"s":""}</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <button onClick={e=>{e.stopPropagation();startNew(press.id);}} style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"6px 14px", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>+ Profile</button>
                <svg viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ width:16, height:16, transform: expanded===press.id?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
            {expanded===press.id && (
              <div>
                {press.profiles.length===0 && <div style={{ padding:"24px 20px", textAlign:"center", color:C.muted, fontSize:13 }}>No profiles yet — click "+ Profile" to add one.</div>}
                {press.profiles.map(profile=>(
                  <div key={profile.id} onClick={()=>startEdit(press.id,profile)} style={{ padding:"14px 20px 14px 74px", display:"flex", alignItems:"center", gap:14, borderTop:`1px solid ${C.border}`, cursor:"pointer" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{profile.profileCode}</div>
                        <Badge type={profile.active?"pass":"neutral"}>{profile.active?"Active":"Inactive"}</Badge>
                        {profile.customer && <Badge type="info">{profile.customer}</Badge>}
                      </div>
                      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{profile.profileName}</div>
                      <div style={{ display:"flex", gap:8, marginTop:7, flexWrap:"wrap" }}>
                        {[profile.orientation,profile.substrate,profile.lineScreen&&`${profile.lineScreen} LPI`].filter(Boolean).map(tag=>(
                          <div key={tag} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:600, color:C.muted, letterSpacing:"0.5px", textTransform:"uppercase" }}>{tag}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:10 }}>
                      {[["C","#00AAEE",profile.charC?.density],["M","#FF69B4",profile.charM?.density],["Y","#CCCC00",profile.charY?.density],["K","#AAAAAA",profile.charK?.density]].map(([ch,color,val])=>val?(
                        <div key={ch} style={{ textAlign:"center" }}>
                          <div style={{ fontSize:9, fontWeight:700, color, letterSpacing:1 }}>{ch}</div>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color }}>{val}</div>
                        </div>
                      ):null)}
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" style={{ width:14, height:14, flexShrink:0 }}><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── DIGITAL PRESS CHECK ──────────────────────────────────────────────────────

const getDensitySuggestions = (ch, val, target) => {
  if(!val||!target) return null;
  const diff = parseFloat(val) - parseFloat(target);
  if(Math.abs(diff) < 0.02) return null;
  const dir = diff < 0 ? "low" : "high";
  const abs = Math.abs(diff).toFixed(2);
  const chName = {C:"Cyan",M:"Magenta",Y:"Yellow",K:"Black"}[ch];
  if(dir==="low") return [
    `Increase impression pressure slightly on the ${chName} deck`,
    `Check ink viscosity — may be running thin; add fresh ink`,
    `Verify anilox volume — consider a higher BCM anilox if issue persists`,
    `Reduce press speed by ~${Math.round(abs*200)} FPM to allow more ink transfer`,
  ];
  return [
    `Back off impression pressure on the ${chName} deck`,
    `Check ink viscosity — may be running heavy; adjust to target`,
    `Increase press speed slightly to reduce ink transfer`,
    `Check anilox for plugging — consider a cleanout or lower BCM anilox`,
  ];
};

const DigitalPressCheck = () => {
  const channels = [
    { ch:"C", val:"1.42", target:"1.45", color:"#00AAEE" },
    { ch:"M", val:"1.51", target:"1.50", color:"#FF69B4" },
    { ch:"Y", val:"1.38", target:"1.40", color:"#CCCC00" },
    { ch:"K", val:"1.67", target:"1.65", color:"#AAAAAA" },
  ];
  const [readings, setReadings] = useState(channels.reduce((a,c)=>({...a,[c.ch]:c.val}),{}));
  const [showSuggestions, setShowSuggestions] = useState({});

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:-0.5 }}>Digital Press Check</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Upload a press sheet photo and GMG proof to begin</div>
        </div>
        <Badge type="warn">On Press</Badge>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
        {[{ label:"Running Sheet Photo", sub:"Press operator upload", border:C.border, iconColor:C.muted },{ label:"GMG Proof Reference", sub:"Approved contract proof", border:C.lime, iconColor:C.lime }].map((item,i)=>(
          <div key={i} style={{ background: i===1?"rgba(200,255,71,0.04)":C.surface, border:`1px solid ${item.border}`, borderRadius:18, padding:24, textAlign:"center", minHeight:140, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{item.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>{item.sub}</div>
            <button style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"6px 14px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>Upload</button>
          </div>
        ))}
      </div>

      <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.muted, marginBottom:12 }}>Live Density Readings</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {channels.map(d=>{
          const reading = readings[d.ch];
          const diff = reading && d.target ? parseFloat(reading)-parseFloat(d.target) : 0;
          const status = Math.abs(diff)<0.02 ? "pass" : diff<0 ? "low" : "high";
          const suggestions = getDensitySuggestions(d.ch, reading, d.target);
          const open = showSuggestions[d.ch];
          return (
            <div key={d.ch} style={{ background:C.surface, border:`1px solid ${status==="pass"?C.border:status==="low"?C.amber:C.red}`, borderRadius:14, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", textAlign:"center" }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:d.color, marginBottom:6 }}>{d.ch}</div>
                <input value={reading} onChange={e=>setReadings(r=>({...r,[d.ch]:e.target.value}))} style={{ background:"transparent", border:"none", textAlign:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:d.color, width:"100%", outline:"none" }}/>
                <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>Target: {d.target}</div>
                {status!=="pass" && <div style={{ fontSize:10, color: status==="low"?C.amber:C.red, marginTop:4, fontWeight:600 }}>{status==="low"?"▼ Below target":"▲ Above target"} ({Math.abs(diff).toFixed(2)})</div>}
              </div>
              {suggestions && (
                <div style={{ borderTop:`1px solid ${C.border}` }}>
                  <button onClick={()=>setShowSuggestions(s=>({...s,[d.ch]:!open}))} style={{ width:"100%", background:"transparent", border:"none", padding:"8px 12px", fontSize:11, fontWeight:600, color: status==="low"?C.amber:C.red, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width:12, height:12 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {open?"Hide":"View"} suggestions
                  </button>
                  {open && (
                    <div style={{ padding:"10px 14px 12px", background: status==="low"?"rgba(255,181,71,0.06)":"rgba(255,92,92,0.06)" }}>
                      {suggestions.map((s,i)=>(
                        <div key={i} style={{ fontSize:11, color:C.text, marginBottom:6, display:"flex", gap:8, lineHeight:1.5 }}>
                          <span style={{ color: status==="low"?C.amber:C.red, flexShrink:0 }}>{i+1}.</span>{s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
        <div style={{ padding:"18px 22px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>AI Assessment — Round 1</div>
          <Badge type="warn">Correction Needed</Badge>
        </div>
        {[
          { type:"pass", name:"Overall Color Balance", detail:"Visually acceptable against GMG proof", badge:"On Target" },
          { type:"warn", name:"Cyan Channel", detail:"Reading 1.42 vs target 1.45 — minor pull needed", badge:"Adjust" },
          { type:"warn", name:"Yellow Channel", detail:"Reading 1.38 vs target 1.40 — minor pull needed", badge:"Adjust" },
          { type:"pass", name:"Fleshtones / Neutrals", detail:"Gray balance acceptable — no visible cast", badge:"On Target" },
        ].map((r,i)=>(
          <div key={i} style={{ padding:"14px 22px", display:"flex", alignItems:"center", gap:14, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background: r.type==="pass"?"rgba(46,204,138,0.12)":"rgba(255,181,71,0.12)", flexShrink:0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={r.type==="pass"?C.green:C.amber} strokeWidth="2.5" strokeLinecap="round" style={{ width:16, height:16 }}>{r.type==="pass"?<polyline points="20 6 9 17 4 12"/>:<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>}</svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{r.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{r.detail}</div>
            </div>
            <Badge type={r.type}>{r.badge}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── BRAND MANAGEMENT ─────────────────────────────────────────────────────────

const emptyBrand = {
  // Section 0 — Project Snapshot
  brandName:"", primaryContact:"", email:"", phone:"", decisionMakers:"", projectOverview:"",
  skuCount:"", launchDate:"", salesChannels:[], targetRegions:[], budget:"",
  // Section 1 — Brand Foundations
  brandPositioning:"", targetAudience:"", brandPersonality:[], elevatorPitch:"", competitors:"",
  mustHavePhrases:"", wordsToAvoid:"", websiteSocial:"",
  // Section 2 — Logo
  clearSpaceRule:"", minSizePrint:"", minSizeDigital:"", approvedColorways:[], logoPlacement:"", logoMisuse:"",
  // Section 3 — Colors
  primaryColors:[{ name:"", pantone:"", cmyk:"", rgb:"" }],
  secondaryColors:[{ name:"", pantone:"", cmyk:"", rgb:"" }],
  printNotes:"", colorFidelity:[], deltaE:"",
  // Section 4 — Typography
  headlineFont:"", subheadFont:"", bodyFont:"", caseRules:"", minPointSizes:"", trackingLeading:"", fallbackFonts:"", fontLicensed:"",
  // Section 5 — Imagery
  photoStyle:[], illustrationStyle:"", iconStyle:"", imageryDos:"",
  // Section 6 — Packaging Program
  packagingFormats:[], sizesWeights:"", specialFeatures:[], preferredFinish:[], mockupNeeds:[],
  // Section 7 — Front Panel
  mandatedElements:[], hierarchyOrder:"", netQuantityFormat:"", readabilityConstraints:"", spaceForLegal:"",
  // Section 8 — Variants
  variantCount:"", differentiationMethod:[], variantRules:"", variantNaming:"",
  // Section 9 — Billboarding
  billboardStrategy:"", edgeToEdge:"", avoidedPatterns:"",
  // Section 10 — Technical
  printerInfo:"", printingMethods:[], maxColorStations:"", lineScreen:"", whiteInkRules:"", minLineWeight:"", overprint:"", trapping:"", plateCurve:"", bleeds:"", seamClearances:"", tearNotch:"", materialStructure:"", rollDirection:"", proofingReqs:[],
  // Section 11 — Barcodes
  barcodeTypes:[], gs1Prefix:"", quietZoneRules:"", barcodePlacement:"", qrUsage:"", serialization:"",
  // Section 12 — Regulatory
  regulatoryFrameworks:[], mandatoryInfoPlacement:[], legalCopy:"", languages:"",
  // Meta
  status:"active", lastUpdated:"",
};

const ColorRow = ({ color, onChange, onRemove }) => (
  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap:8, alignItems:"flex-end", marginBottom:8 }}>
    {[["name","Color Name","e.g. Brand Red"],["pantone","Pantone / PMS","e.g. 485 C"],["cmyk","CMYK","e.g. 0/98/100/0"],["rgb","RGB / HEX","e.g. #FF0000"]].map(([k,lbl,ph])=>(
      <div key={k} style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <label style={{ fontSize:9, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted }}>{lbl}</label>
        <input value={color[k]} onChange={e=>onChange({...color,[k]:e.target.value})} placeholder={ph} style={{ ...inputBase, padding:"7px 10px", borderRadius:8, fontSize:12 }}/>
      </div>
    ))}
    <button onClick={onRemove} style={{ background:"rgba(255,92,92,0.1)", border:"none", color:C.red, borderRadius:8, padding:"7px 10px", cursor:"pointer", fontSize:14 }}>✕</button>
  </div>
);

const BrandForm = ({ brand, onChange, onCancel, onSave }) => {
  const upd = f => v => onChange({...brand,[f]:v});
  const addColor = list => onChange({...brand,[list]:[...brand[list],{name:"",pantone:"",cmyk:"",rgb:""}]});
  const updateColor = (list,i,val) => onChange({...brand,[list]:brand[list].map((c,j)=>j===i?val:c)});
  const removeColor = (list,i) => onChange({...brand,[list]:brand[list].filter((_,j)=>j!==i)});

  return (
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>{brand.brandName||"New Brand Profile"}</div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"7px 14px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancel</button>
          <button onClick={onSave} style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"7px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>Save Brand</button>
        </div>
      </div>

      <CollapsibleSection title="Project Snapshot" defaultOpen>
        <Field label="Brand / Company Name" value={brand.brandName} onChange={upd("brandName")} placeholder="e.g. Tootsie Roll Industries"/>
        <Field label="Primary Contact Name & Title" value={brand.primaryContact} onChange={upd("primaryContact")}/>
        <Field label="Email" value={brand.email} onChange={upd("email")} type="email"/>
        <Field label="Phone" value={brand.phone} onChange={upd("phone")}/>
        <Field label="Decision Maker(s) for Final Approval" value={brand.decisionMakers} onChange={upd("decisionMakers")}/>
        <Textarea label="Project Overview" value={brand.projectOverview} onChange={upd("projectOverview")} placeholder="What are we creating or updating?"/>
        <Field label="Number of SKUs / Variants" value={brand.skuCount} onChange={upd("skuCount")} type="number"/>
        <Field label="Target Launch / Print Date" value={brand.launchDate} onChange={upd("launchDate")} type="date"/>
        <Field label="Budget Range (optional)" value={brand.budget} onChange={upd("budget")}/>
        <MultiCheck label="Sales Channels" options={["Grocery","Club","E-comm","DTC","Specialty","Foodservice","Other"]} value={brand.salesChannels} onChange={upd("salesChannels")}/>
        <MultiCheck label="Target Regions / Markets" options={["US","EU","UK","CA","AU/NZ","Middle East","Asia","Latin America","Other"]} value={brand.targetRegions} onChange={upd("targetRegions")}/>
      </CollapsibleSection>

      <CollapsibleSection title="Brand Foundations">
        <Textarea label="Brand Positioning" value={brand.brandPositioning} onChange={upd("brandPositioning")} placeholder="Mission, value proposition, key differentiators…"/>
        <Textarea label="Target Audience(s)" value={brand.targetAudience} onChange={upd("targetAudience")}/>
        <MultiCheck label="Brand Personality" options={["Premium","Friendly","Clinical","Playful","Minimal","Bold","Natural","Tech-forward","Other"]} value={brand.brandPersonality} onChange={upd("brandPersonality")}/>
        <Textarea label="Elevator Pitch (1–2 sentences)" value={brand.elevatorPitch} onChange={upd("elevatorPitch")} rows={2}/>
        <Field label="Competitor / Comparator Set (URLs or names)" value={brand.competitors} onChange={upd("competitors")} fullWidth/>
        <Field label="Must-Have Phrases / Claims" value={brand.mustHavePhrases} onChange={upd("mustHavePhrases")} fullWidth/>
        <Field label="Words / Tones to Avoid" value={brand.wordsToAvoid} onChange={upd("wordsToAvoid")} fullWidth/>
        <Field label="Website & Social Handles" value={brand.websiteSocial} onChange={upd("websiteSocial")} fullWidth/>
      </CollapsibleSection>

      <CollapsibleSection title="Logo Usage & Hierarchy">
        <Field label="Clear Space Rule" value={brand.clearSpaceRule} onChange={upd("clearSpaceRule")} placeholder='e.g. "X-height equals clear space"'/>
        <Field label="Minimum Size — Print (mm)" value={brand.minSizePrint} onChange={upd("minSizePrint")} placeholder="e.g. 25mm"/>
        <Field label="Minimum Size — Digital (px)" value={brand.minSizeDigital} onChange={upd("minSizeDigital")} placeholder="e.g. 80px"/>
        <MultiCheck label="Approved Colorways" options={["Full color","1-color","Reverse / knockout","Metallic ink","Grayscale","Black"]} value={brand.approvedColorways} onChange={upd("approvedColorways")}/>
        <Textarea label="Placement Preference by Format" value={brand.logoPlacement} onChange={upd("logoPlacement")} placeholder="Front-center, top-left, gusset placement, roll direction notes…"/>
        <Textarea label="Logo Misuse Rules" value={brand.logoMisuse} onChange={upd("logoMisuse")} placeholder="No stretching, no drop shadows, no color alterations…"/>
      </CollapsibleSection>

      <CollapsibleSection title="Color Palette">
        <div style={{ flex:"1 1 100%" }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Primary Colors</div>
          {brand.primaryColors.map((c,i)=><ColorRow key={i} color={c} onChange={v=>updateColor("primaryColors",i,v)} onRemove={()=>removeColor("primaryColors",i)}/>)}
          <button onClick={()=>addColor("primaryColors")} style={{ background:"transparent", border:`1px dashed ${C.border}`, color:C.muted, padding:"6px 14px", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer" }}>+ Add Primary Color</button>
        </div>
        <div style={{ flex:"1 1 100%", marginTop:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Secondary / Accent Colors</div>
          {brand.secondaryColors.map((c,i)=><ColorRow key={i} color={c} onChange={v=>updateColor("secondaryColors",i,v)} onRemove={()=>removeColor("secondaryColors",i)}/>)}
          <button onClick={()=>addColor("secondaryColors")} style={{ background:"transparent", border:`1px dashed ${C.border}`, color:C.muted, padding:"6px 14px", borderRadius:8, fontFamily:"'DM Sans',sans-serif", fontSize:12, cursor:"pointer" }}>+ Add Secondary Color</button>
        </div>
        <Textarea label="Print Notes" value={brand.printNotes} onChange={upd("printNotes")} placeholder="Spot vs process strategy, max color count, overprint/knockout preferences…"/>
        <MultiCheck label="Color Fidelity Priorities" options={["Match PMS precisely","Prioritize shelf impact","Minimize metamerism","Maintain contrast accessibility"]} value={brand.colorFidelity} onChange={upd("colorFidelity")}/>
        <Field label="Delta E Tolerance (optional)" value={brand.deltaE} onChange={upd("deltaE")} placeholder="e.g. ≤ 2.0"/>
      </CollapsibleSection>

      <CollapsibleSection title="Typography">
        <Field label="Headline Font" value={brand.headlineFont} onChange={upd("headlineFont")} placeholder="e.g. Futura Bold"/>
        <Field label="Subhead Font" value={brand.subheadFont} onChange={upd("subheadFont")}/>
        <Field label="Body Copy Font" value={brand.bodyFont} onChange={upd("bodyFont")}/>
        <Field label="Uppercase / Lowercase Rules" value={brand.caseRules} onChange={upd("caseRules")}/>
        <Field label="Min Point Sizes (Front / Back)" value={brand.minPointSizes} onChange={upd("minPointSizes")} placeholder="e.g. Front 8pt / Back 6pt"/>
        <Field label="Tracking / Leading Standards" value={brand.trackingLeading} onChange={upd("trackingLeading")}/>
        <Field label="Fallback System Fonts" value={brand.fallbackFonts} onChange={upd("fallbackFonts")}/>
        <Combo label="Font Licensing Confirmed?" value={brand.fontLicensed} onChange={upd("fontLicensed")} suggestions={["Yes","No","Pending"]}/>
      </CollapsibleSection>

      <CollapsibleSection title="Imagery, Illustration & Iconography">
        <MultiCheck label="Photography Style" options={["Ingredient-forward","Lifestyle","Studio","Macro","Candid","High contrast","Natural light","Moody","Bright"]} value={brand.photoStyle} onChange={upd("photoStyle")}/>
        <Field label="Illustration Style" value={brand.illustrationStyle} onChange={upd("illustrationStyle")} placeholder="e.g. Hand-drawn, vector, flat"/>
        <Field label="Icon Style" value={brand.iconStyle} onChange={upd("iconStyle")} placeholder="e.g. Line, filled, duotone, custom set"/>
        <Textarea label="Imagery Dos and Don'ts" value={brand.imageryDos} onChange={upd("imageryDos")}/>
      </CollapsibleSection>

      <CollapsibleSection title="Packaging Program">
        <MultiCheck label="Flexible Packaging Formats" options={["Stand-up pouch","Flat pouch","Quad-seal","Side-gusset","Roll stock","Flow wrap","Film for VFFS/HFFS","Sachet","Stick pack","Other"]} value={brand.packagingFormats} onChange={upd("packagingFormats")}/>
        <Textarea label="Sizes / Fill Weights / Dimensions per SKU" value={brand.sizesWeights} onChange={upd("sizesWeights")}/>
        <MultiCheck label="Special Features" options={["Zipper","Spout","Valve","Window","Hang hole","Tear notch","Laser score","Perforation","Matte/gloss mix","Metallic substrate","Cold seal"]} value={brand.specialFeatures} onChange={upd("specialFeatures")}/>
        <MultiCheck label="Preferred Finish" options={["Matte","Gloss","Soft-touch","Spot varnish","Metallic / foil","Holographic","Paper-touch"]} value={brand.preferredFinish} onChange={upd("preferredFinish")}/>
        <MultiCheck label="Mockup Needs" options={["Flat art","3D pouch renders","Group billboard renders","In-shelf visuals"]} value={brand.mockupNeeds} onChange={upd("mockupNeeds")}/>
      </CollapsibleSection>

      <CollapsibleSection title="Front Panel Focus">
        <MultiCheck label="Mandated Elements" options={["Logo","Product name","Variant/flavor","Net quantity","Callouts/claims","Certifications","QR code"]} value={brand.mandatedElements} onChange={upd("mandatedElements")}/>
        <Textarea label="Hierarchy Order (rank 1–5)" value={brand.hierarchyOrder} onChange={upd("hierarchyOrder")} placeholder="1. Logo  2. Product name  3. Flavor…"/>
        <Field label="Net Quantity Formatting" value={brand.netQuantityFormat} onChange={upd("netQuantityFormat")} placeholder="e.g. Bold, bottom-right, 8pt min"/>
        <Field label="Readability Constraints" value={brand.readabilityConstraints} onChange={upd("readabilityConstraints")} placeholder="Min type sizes, contrast requirements…"/>
        <Field label="Space for Legal / Claims Icons on Front?" value={brand.spaceForLegal} onChange={upd("spaceForLegal")} placeholder="Yes / No + position"/>
      </CollapsibleSection>

      <CollapsibleSection title="Variant Differentiation">
        <Field label="Variant Count" value={brand.variantCount} onChange={upd("variantCount")} type="number"/>
        <MultiCheck label="Differentiation Method" options={["Color coding","Ingredient imagery","Numeric code","Pattern/texture overlay","Band/stripe color bar"]} value={brand.differentiationMethod} onChange={upd("differentiationMethod")}/>
        <Textarea label="Rules for Consistency" value={brand.variantRules} onChange={upd("variantRules")} placeholder="Location of variant name, color mapping, imagery style per variant…"/>
        <Field label="Variant Naming Conventions" value={brand.variantNaming} onChange={upd("variantNaming")} fullWidth/>
      </CollapsibleSection>

      <CollapsibleSection title="Billboarding Strategy">
        <Textarea label="How should SKUs align on shelf?" value={brand.billboardStrategy} onChange={upd("billboardStrategy")} placeholder="Shared horizon line, logo alignment, color gradient by flavor…"/>
        <Field label="Edge-to-edge patterns across SKUs?" value={brand.edgeToEdge} onChange={upd("edgeToEdge")} placeholder="Yes / No + notes"/>
        <Field label="Patterns to Avoid (moiré risk etc.)" value={brand.avoidedPatterns} onChange={upd("avoidedPatterns")} fullWidth/>
      </CollapsibleSection>

      <CollapsibleSection title="Technical & Production Guidelines">
        <Field label="Printer / Converter Info" value={brand.printerInfo} onChange={upd("printerInfo")} placeholder="Company, contact, email"/>
        <MultiCheck label="Printing Methods" options={["Flexo","Rotogravure","Digital","Hybrid"]} value={brand.printingMethods} onChange={upd("printingMethods")}/>
        <Field label="Max Color Stations / Plates" value={brand.maxColorStations} onChange={upd("maxColorStations")} placeholder="e.g. 8 colors max"/>
        <Field label="Line Screen / Resolution" value={brand.lineScreen} onChange={upd("lineScreen")} placeholder="e.g. 150 LPI / 4000 ppi"/>
        <Field label="White Ink / Opacity Rules" value={brand.whiteInkRules} onChange={upd("whiteInkRules")}/>
        <Field label="Min Line Weight / Knockout Rules" value={brand.minLineWeight} onChange={upd("minLineWeight")} placeholder="e.g. 0.5pt positive / 0.75pt reverse"/>
        <Field label="Overprint vs Knockout" value={brand.overprint} onChange={upd("overprint")}/>
        <Field label="Trapping Requirements" value={brand.trapping} onChange={upd("trapping")} placeholder="e.g. 0.015 screen / 0.02 line"/>
        <Field label="Plate Curve / Gain Notes" value={brand.plateCurve} onChange={upd("plateCurve")}/>
        <Field label="Bleeds & Safe Zones" value={brand.bleeds} onChange={upd("bleeds")} placeholder="e.g. 0.125 in bleed / 0.125 in safe"/>
        <Field label="Seam, Gusset & Zipper Clearances" value={brand.seamClearances} onChange={upd("seamClearances")}/>
        <Field label="Material Structure" value={brand.materialStructure} onChange={upd("materialStructure")} placeholder="e.g. PET/PE, OPP/CPP, mono-material"/>
        <Field label="Roll Direction & Web Orientation" value={brand.rollDirection} onChange={upd("rollDirection")}/>
        <MultiCheck label="Proofing Requirements" options={["Digital proof","Press proof","Drawdown","Lab dip","On-press approval"]} value={brand.proofingReqs} onChange={upd("proofingReqs")}/>
      </CollapsibleSection>

      <CollapsibleSection title="Barcodes, QR & Track-and-Trace">
        <MultiCheck label="Barcode Types" options={["UPC-A","EAN-13","ITF-14","GS1 DataBar","QR","DataMatrix"]} value={brand.barcodeTypes} onChange={upd("barcodeTypes")}/>
        <Field label="GS1 Company Prefix" value={brand.gs1Prefix} onChange={upd("gs1Prefix")}/>
        <Field label="Quiet Zone & Min Size Rules" value={brand.quietZoneRules} onChange={upd("quietZoneRules")} placeholder="e.g. 10× narrow bar; 80–100% magnification"/>
        <Field label="Barcode Placement Preference" value={brand.barcodePlacement} onChange={upd("barcodePlacement")} placeholder="e.g. Back panel bottom-right, away from seams"/>
        <Field label="QR Code Usage" value={brand.qrUsage} onChange={upd("qrUsage")} placeholder="Destination URL, UTM tracking, copy near code"/>
        <Field label="Serialization / LOT / Best By Requirements" value={brand.serialization} onChange={upd("serialization")} fullWidth/>
      </CollapsibleSection>

      <CollapsibleSection title="Regulatory & Compliance">
        <MultiCheck label="Regulatory Frameworks" options={["FDA (US)","FIC 1169/2011 (EU)","UK FSA","Health Canada","FSANZ","GCC","Other"]} value={brand.regulatoryFrameworks} onChange={upd("regulatoryFrameworks")}/>
        <MultiCheck label="Mandatory Info Placement" options={["Nutrition panel","Ingredients","Allergen statement","Manufacturer/importer address","Country of origin","Recycling/disposal","Certifications"]} value={brand.mandatoryInfoPlacement} onChange={upd("mandatoryInfoPlacement")}/>
        <Textarea label="Legal Copy Requirements" value={brand.legalCopy} onChange={upd("legalCopy")} placeholder="Min font sizes, contrast, order, icons…" rows={4}/>
        <Field label="Languages & Translation Responsibility" value={brand.languages} onChange={upd("languages")} fullWidth/>
      </CollapsibleSection>
    </div>
  );
};

const BrandManagement = () => {
  const [brands, setBrands] = useState([

  ]);
  const [editing, setEditing] = useState(null);
  const statusMap = { active:"pass", review:"warn", pending:"info" };
  const statusLabel = { active:"Active", review:"Review", pending:"Pending" };

  const save = () => {
    setBrands(prev=>{ const ex=prev.find(b=>b.id===editing.id); return ex ? prev.map(b=>b.id===editing.id?editing:b) : [...prev,editing]; });
    setEditing(null);
  };

  if(editing) return <BrandForm brand={editing} onChange={setEditing} onCancel={()=>setEditing(null)} onSave={save}/>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:-0.5 }}>Brand Management</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Stored brand guidelines and compliance records</div>
        </div>
        <button onClick={()=>setEditing({...emptyBrand,id:Date.now()})} style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"8px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ New Brand</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {brands.map(brand=>(
          <div key={brand.id} onClick={()=>setEditing({...emptyBrand,...brand})} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", cursor:"pointer" }}>
            <div style={{ padding:"18px 20px 14px", display:"flex", alignItems:"center", gap:12, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`rgba(200,255,71,0.12)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:C.lime }}>
                {brand.brandName.charAt(0)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:2 }}>{brand.brandName}</div>
                <div style={{ fontSize:11, color:C.muted }}>{brand.primaryContact} · Updated {brand.lastUpdated}</div>
              </div>
              <Badge type={statusMap[brand.status]}>{statusLabel[brand.status]}</Badge>
            </div>
            <div style={{ padding:"14px 20px" }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Primary Colors</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {brand.primaryColors.filter(c=>c.name).map((c,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"4px 10px" }}>
                    {c.rgb && <div style={{ width:12, height:12, borderRadius:3, background:c.rgb, border:"1px solid rgba(255,255,255,0.1)" }}/>}
                    <span style={{ fontSize:11, fontWeight:600 }}>{c.name}</span>
                    {c.pantone && <span style={{ fontSize:10, color:C.muted }}>{c.pantone}</span>}
                  </div>
                ))}
                {!brand.primaryColors.filter(c=>c.name).length && <span style={{ fontSize:12, color:C.muted }}>No colors entered yet</span>}
              </div>
              <div style={{ marginTop:10, fontSize:11, color:C.muted }}>Click to open full brand guideline form →</div>
            </div>
          </div>
        ))}
        <div onClick={()=>setEditing({...emptyBrand,id:Date.now()})} style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", minHeight:160 }}>
          <div style={{ textAlign:"center", color:C.muted }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ margin:"0 auto 10px", display:"block" }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <div style={{ fontSize:13, fontWeight:600 }}>Add Brand Profile</div>
            <div style={{ fontSize:11, marginTop:4 }}>Full 12-section intake form</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const JobRow = ({ color, name, client, badge, badgeType, date }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{ padding:"14px 20px", display:"flex", alignItems:"center", gap:14, borderBottom:`1px solid ${C.border}`, cursor:"pointer", background: hovered?C.surface2:"transparent", transition:"background 0.15s" }}>
      <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{name}</div>
        <div style={{ fontSize:11, color:C.muted }}>{client}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
        <Badge type={badgeType}>{badge}</Badge>
        <div style={{ fontSize:11, color:C.muted }}>{date}</div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, meta, accent, valueColor, children, style }) => (
  <div style={{ background: accent||C.surface, border:`1px solid ${accent||C.border}`, borderRadius:18, padding:20, ...style }}>
    <div style={{ fontSize:11, fontWeight:600, letterSpacing:1, textTransform:"uppercase", color: accent?"#0A0A0F":C.muted, marginBottom:10 }}>{label}</div>
    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:36, letterSpacing:-1, lineHeight:1, marginBottom:6, color: valueColor||(accent?"#0A0A0F":C.text) }}>{value}</div>
    <div style={{ fontSize:12, color: accent?"rgba(0,0,0,0.6)":C.muted }}>{meta}</div>
    {children}
  </div>
);

const CheckRow = ({ type, name, detail, badge }) => {
  const [hovered, setHovered] = useState(false);
  const iconColors = { pass:C.green, warn:C.amber, fail:C.red };
  const iconBg = { pass:"rgba(46,204,138,0.12)", warn:"rgba(255,181,71,0.12)", fail:"rgba(255,92,92,0.12)" };
  const icons = { pass:<polyline points="20 6 9 17 4 12"/>, warn:<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>, fail:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> };
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{ padding:"14px 22px", display:"flex", alignItems:"center", gap:14, borderBottom:`1px solid ${C.border}`, cursor:"pointer", background: hovered?C.surface2:"transparent", transition:"background 0.15s" }}>
      <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:iconBg[type], flexShrink:0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={iconColors[type]} strokeWidth="2.5" strokeLinecap="round" style={{ width:16, height:16 }}>{icons[type]}</svg>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{name}</div>
        <div style={{ fontSize:11, color:C.muted }}>{detail}</div>
      </div>
      <Badge type={type}>{badge}</Badge>
    </div>
  );
};

const Dashboard = () => (
  <div>
    <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:-0.5 }}>Welcome to Press Pal 👋</div>
        <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Your prepress quality control workspace</div>
      </div>
      <span style={{ fontSize:13, color:C.purple, cursor:"pointer", fontWeight:500 }}>View all jobs →</span>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(12,1fr)", gap:14 }}>
      <div className="fade-up" style={{ gridColumn:"span 3" }}><StatCard label="Active Jobs" value="0" meta="No jobs yet" accent={C.lime}/></div>
      <div className="fade-up-1" style={{ gridColumn:"span 3" }}><StatCard label="Checks Run" value="0" meta="This month"/></div>
      <div className="fade-up-2" style={{ gridColumn:"span 3" }}><StatCard label="Pending Approval" value="0" meta="Brand reviews needed" style={{ background:C.violet, borderColor:C.violet }} valueColor="white"/></div>
      <div className="fade-up-3" style={{ gridColumn:"span 3" }}><StatCard label="Pass Rate" value="—" meta="No checks run yet" valueColor={C.green}/></div>
      <div className="fade-up-4" style={{ gridColumn:"span 7", background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
        <div style={{ padding:"18px 20px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>Active Jobs</div>
        </div>
        <div style={{ padding:"32px 20px", textAlign:"center", color:C.muted, fontSize:13 }}>No active jobs yet — click "+ New Job" to get started.</div>
      </div>
      <div className="fade-up-5" style={{ gridColumn:"span 5", background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, padding:20 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:16 }}>Check Results</div>
        <div style={{ padding:"32px 20px", textAlign:"center", color:C.muted, fontSize:13 }}>No checks run yet.</div>
      </div>
    </div>
  </div>
);

// ─── ARTWORK CHECKER ──────────────────────────────────────────────────────────

const ArtworkChecker = () => (
  <div>
    <div style={{ marginBottom:20 }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:-0.5 }}>Artwork Checker</div>
      <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Upload artwork and run an AI-powered spec check</div>
    </div>
    <div style={{ display:"flex", gap:12, marginBottom:16 }}>
      {["Press Spec Profile","Brand Profile","Job Number"].map((label,i)=>(
        <div key={i} style={{ flex:1 }}>
          <label style={{ display:"block", fontSize:11, fontWeight:600, letterSpacing:"0.8px", textTransform:"uppercase", color:C.muted, marginBottom:6 }}>{label}</label>
          <select style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"10px 14px", color:C.text, fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>
            <option>{["Select a press spec profile","Select a brand profile","Select a job number"][i]}</option>
          </select>
        </div>
      ))}
    </div>
    <div style={{ background:C.surface, border:`2px dashed ${C.border}`, borderRadius:18, padding:40, textAlign:"center", cursor:"pointer", marginBottom:20 }}>
      <div style={{ width:52, height:52, background:C.surface2, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.lime} strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>Drop your artwork PDF here</div>
      <div style={{ fontSize:13, color:C.muted }}>or click to browse · PDF, AI, EPS supported · Max 200MB</div>
    </div>
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
      <div style={{ padding:"18px 22px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>Check Results</div>
      </div>
      <div style={{ padding:"32px 20px", textAlign:"center", color:C.muted, fontSize:13 }}>No checks run yet — upload an artwork file above to get started.</div>
    </div>
  </div>
);

// ─── FILE COMPARATOR ──────────────────────────────────────────────────────────

const FileComparator = () => (
  <div>
    <div style={{ marginBottom:20 }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:26, letterSpacing:-0.5 }}>File Comparator</div>
      <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>Upload two versions and detect what changed</div>
    </div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
      {[{label:"Original File",sub:"v1 — Design PDF",border:C.border,iconColor:C.muted},{label:"Revised File",sub:"v2 — Final Production PDF",border:C.lime,iconColor:C.lime}].map((item,i)=>(
        <div key={i} style={{ background:C.surface, border:`1px solid ${item.border}`, borderRadius:18, padding:24, textAlign:"center", minHeight:160, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={item.iconColor} strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{item.label}</div>
          <div style={{ fontSize:11, color:C.muted }}>{item.sub}</div>
          <button style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"6px 14px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer" }}>Upload</button>
        </div>
      ))}
    </div>
    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
      <div style={{ padding:"18px 22px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>Comparison Results</div>
      </div>
      <div style={{ padding:"32px 20px", textAlign:"center", color:C.muted, fontSize:13 }}>Upload two files above to compare them.</div>
    </div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const tabs = [
  {id:"dashboard",label:"Overview"},{id:"artwork",label:"Artwork"},{id:"comparator",label:"Compare"},
  {id:"brand",label:"Brand"},{id:"presscheck",label:"Press Check"},{id:"specs",label:"Specs"},
];

const navIcons = {
  dashboard:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  artwork:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  comparator:<><rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></>,
  brand:<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
  presscheck:<><rect x="2" y="3" width="20" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  specs:<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
};

const tabPanels = { dashboard:<Dashboard/>, artwork:<ArtworkChecker/>, comparator:<FileComparator/>, brand:<BrandManagement/>, presscheck:<DigitalPressCheck/>, specs:<PressSpecs/> };

export default function PressPal() {
  const [activeTab, setActiveTab] = useState("dashboard");
  return (
    <>
      <style>{gs}</style>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'DM Sans',sans-serif", background:C.bg, color:C.text }}>
        <nav style={{ width:72, background:C.surface, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0", gap:6, flexShrink:0 }}>
          <div onClick={()=>setActiveTab("dashboard")} style={{ width:40, height:40, background:C.lime, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20, cursor:"pointer" }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width:22, height:22 }}><circle cx="12" cy="12" r="4" fill="#0A0A0F"/><circle cx="12" cy="12" r="8" stroke="#0A0A0F" strokeWidth="2.5"/><circle cx="12" cy="5" r="1.5" fill="#0A0A0F"/></svg>
          </div>
          <div style={{ width:32, height:1, background:C.border, margin:"2px 0" }}/>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ width:48, height:48, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", border:"none", background: activeTab===tab.id?C.lime:"transparent", color: activeTab===tab.id?"#0A0A0F":C.muted, transition:"all 0.2s" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width:20, height:20 }}>{navIcons[tab.id]}</svg>
            </button>
          ))}
          <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:"white", marginTop:"auto", cursor:"pointer" }}>PP</div>
        </nav>
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 28px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:-0.3 }}>Press<span style={{ color:C.lime }}>Pal</span></div>
              <div style={{ display:"flex", gap:4, background:C.surface, padding:4, borderRadius:12, border:`1px solid ${C.border}` }}>
                {tabs.map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:"6px 14px", borderRadius:9, fontSize:13, fontWeight: activeTab===tab.id?600:500, cursor:"pointer", border:"none", background: activeTab===tab.id?C.lime:"transparent", color: activeTab===tab.id?"#0A0A0F":C.muted, transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif" }}>{tab.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:20, padding:"6px 14px", fontSize:12, fontWeight:500, color:C.muted, display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.lime }}/>
                No active job
              </div>
              <button style={{ background:C.lime, color:"#0A0A0F", border:"none", padding:"8px 18px", borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ New Job</button>
            </div>
          </div>
          <div key={activeTab} style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
            {tabPanels[activeTab]}
          </div>
        </div>
      </div>
    </>
  );
}
