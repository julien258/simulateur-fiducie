import { useState } from "react";
const SECTORS = [
  { label: "SaaS / Tech", margin: 28, minM: 10, maxM: 15 },
  { label: "Services B2B", margin: 20, minM: 7, maxM: 10 },
  { label: "Industrie / Manufacture", margin: 14, minM: 5, maxM: 8 },
  { label: "Distribution / Commerce", margin: 8, minM: 4, maxM: 6 },
  { label: "Santé / Medtech", margin: 25, minM: 9, maxM: 13 },
  { label: "Hôtellerie / Tourisme", margin: 20, minM: 6, maxM: 9 },
  { label: "Construction / BTP", margin: 11, minM: 4, maxM: 7 },
  { label: "Énergie / Utilities", margin: 30, minM: 8, maxM: 12 },
];
const PRODUCTS = [
  { id: "diamond", name: "Elite Diamond Series IV", sub: "180 jours · renouvelable", annualRate: 32, color: "#0369A1", colorLight: "#EFF6FF", colorBorder: "#BFDBFE", cgwCoupons: [{ m: 4, pct: 0.08 }, { m: 6, pct: 0.08 }], note: "~32% annualisé si reconduit", minUSD: 100000 },
  { id: "sixsenses", name: "SixSenses Private Credit", sub: "360 jours · ISIN réglementé MAS", annualRate: 16.75, color: "#7C3AED", colorLight: "#F5F3FF", colorBorder: "#DDD6FE", cgwCoupons: [{ m: 6, pct: 0.10 }, { m: 9, pct: 0.03 }, { m: 12, pct: 0.0375 }], note: "16,75% garanti sur 360 jours", minUSD: 100000 },
  { id: "blacklabel", name: "Black Label Series I", sub: "360 jours · Signature · Sur invitation", annualRate: 46.5, color: "#B45309", colorLight: "#FFFBEB", colorBorder: "#FDE68A", cgwCoupons: [{ m: 3, pct: 0.07 }, { m: 6, pct: 0.10 }, { m: 9, pct: 0.135 }, { m: 12, pct: 0.16 }], note: "46,5% cumulé — 4 coupons trimestriels", minUSD: 200000 },
];
const FREQS = [
  { id: "a", label: "Annuel", n: 1, periods: ["M+12"], obligMonths: [12], rank: 1, rankLabel: "Optimal réinvestissement", rankColor: "#059669", rankBg: "#D1FAE5", rankBorder: "#A7F3D0", explain: "Aucune sortie de trésorerie avant M+12. Tous les coupons CGW reçus en cours d'année sont libres de réinvestissement." },
  { id: "s", label: "Semestriel", n: 2, periods: ["S1 · M+6", "S2 · M+12"], obligMonths: [6, 12], rank: 2, rankLabel: "Intermédiaire", rankColor: "#B45309", rankBg: "#FFFBEB", rankBorder: "#FDE68A", explain: "Une sortie à M+6 réduit les coupons CGW disponibles pour réinvestissement à cette échéance." },
  { id: "q", label: "Trimestriel", n: 4, periods: ["T1 · M+3", "T2 · M+6", "T3 · M+9", "T4 · M+12"], obligMonths: [3, 6, 9, 12], rank: 3, rankLabel: "Moins favorable", rankColor: "#DC2626", rankBg: "#FEE2E2", rankBorder: "#FECACA", explain: "Sorties de trésorerie tous les 3 mois. Les coupons CGW coïncidant avec une échéance obligataire sont partiellement absorbés." },
];
const fmtE = (n) => { const abs = Math.abs(n); if (abs >= 1e6) return (n/1e6).toFixed(abs>=10e6?1:2)+" M€"; if (abs >= 1e3) return Math.round(n/1e3)+" K€"; return Math.round(n)+" €"; };
function calcReinvestGain(totalPl, annSvc, freq, prod, reinvestPct) {
  const r = reinvestPct/100, rate = prod.annualRate/100, obligPerPeriod = annSvc/freq.n;
  let totalGain = 0; const detail = [];
  prod.cgwCoupons.forEach(({m, pct}) => {
    const cgwAmt = totalPl*pct, obligDue = freq.obligMonths.includes(m)?obligPerPeriod:0;
    const netAvail = Math.max(0, cgwAmt-obligDue), netReinv = netAvail*r;
    const rem = 12-m, gain = rem>0?netReinv*rate*(rem/12):0;
    totalGain += gain; detail.push({month:m, cgwAmt, obligDue, netAvail, netReinv, rem, gain});
  });
  return {totalGain, detail};
}
function Slider({value, min, max, step, onChange, color}) {
  const pct = ((value-min)/(max-min))*100;
  return (
    <div style={{position:"relative",height:24,display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",width:"100%",height:6,background:"#E2E8F0",borderRadius:3,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:3}}/>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)}
        style={{position:"absolute",width:"100%",opacity:0,height:24,cursor:"pointer",margin:0}}/>
      <div style={{position:"absolute",left:`calc(${pct}% - 10px)`,width:20,height:20,borderRadius:"50%",background:"#fff",border:`2.5px solid ${color}`,boxShadow:"0 1px 4px rgba(0,0,0,.2)",pointerEvents:"none"}}/>
    </div>
  );
}
function Row({k,v,vc,divider,big}) {
  return (<>{divider&&<div style={{height:1,background:"#E2E8F0",margin:"8px 0"}}/>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:big?13:12,padding:"4px 0"}}><span style={{color:"#64748B"}}>{k}</span><span style={{color:vc||"#334155",fontWeight:big?800:700,fontFamily:"'DM Mono',monospace"}}>{v}</span></div></>);
}
function Card({children,accent,style={}}) {
  return <div style={{background:"#FFFFFF",borderRadius:16,padding:24,border:`1px solid ${accent?accent+"30":"#E2E8F0"}`,boxShadow:"0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)",...style}}>{children}</div>;
}
function KpiCard({label,value,color,sub}) {
  return <div style={{background:"#F8FAFC",borderRadius:12,padding:"14px 12px",textAlign:"center",border:"1px solid #E2E8F0"}}><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{label}</div><div style={{fontSize:17,fontWeight:800,color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:9,color:"#94A3B8",marginTop:4}}>{sub}</div>}</div>;
}
export default function App() {
  const [si,setSi]=useState(1),[rev,setRev]=useState(10),[mp,setMp]=useState(50);
  const [lr,setLr]=useState(8),[fi,setFi]=useState("a"),[pi,setPi]=useState("diamond");
  const [placePct,setPlacePct]=useState(50),[reinvestPct,setReinvestPct]=useState(50);
  const sec=SECTORS[si],prod=PRODUCTS.find(p=>p.id===pi),freq=FREQS.find(f=>f.id===fi);
  const ebitda=rev*1e6*sec.margin/100,mult=sec.minM+(sec.maxM-sec.minM)*mp/100,val=ebitda*mult,loan=val*0.5;
  const annSvc=loan*lr/100,coupon=annSvc/freq.n,totalPl=loan*placePct/100,freeCash=loan-totalPl;
  const cgwRevBase=totalPl*prod.annualRate/100;
  const {totalGain:reinvestGain,detail:reinvestDetail}=calcReinvestGain(totalPl,annSvc,freq,prod,reinvestPct);
  const cgwRevTotal=cgwRevBase+reinvestGain,net=cgwRevTotal-annSvc,cov=cgwRevTotal/annSvc;
  const reinvestByFreq=FREQS.map(f=>({...f,gain:calcReinvestGain(totalPl,annSvc,f,prod,reinvestPct).totalGain}));
  const minPlBase=annSvc/(prod.annualRate/100),minPct=(minPlBase/loan)*100;
  return (
    <div style={{background:"#F1F5F9",minHeight:"100vh",color:"#1E293B",fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",padding:"28px 20px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;600&display=swap');*{box-sizing:border-box;margin:0;padding:0;}select,button{outline:none;}`}</style>
      <div style={{maxWidth:1400,margin:"0 auto 24px"}}>
        <div style={{background:"#fff",borderRadius:16,padding:"22px 30px",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #E2E8F0",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              {["LIVING","ALOE Private Equity","Winston Rose","CGW"].map((name,i,arr)=>(
                <span key={name} style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#94A3B8",letterSpacing:".12em",textTransform:"uppercase"}}>{name}</span>
                  {i<arr.length-1&&<span style={{color:"#E2E8F0",fontSize:16}}>×</span>}
                </span>
              ))}
            </div>
            <h1 style={{fontSize:28,fontWeight:800,color:"#0F172A",letterSpacing:"-.03em"}}>Simulateur Fiducie-Liquidité</h1>
            <p style={{fontSize:11,color:"#94A3B8",marginTop:6,letterSpacing:".07em",textTransform:"uppercase"}}>Protection fiduciaire · Prêt obligataire in fine · Création de liquidités sans dilution</p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{label:"Fiduciaire",value:"AMF agréé",color:"#0369A1",bg:"#EFF6FF"},{label:"Obligations",value:"In fine · 12 mois",color:"#7C3AED",bg:"#F5F3FF"},{label:"LTV",value:"50–100%",color:"#059669",bg:"#ECFDF5"},{label:"Réinvest. optimal",value:"Fréq. annuelle",color:"#B45309",bg:"#FFFBEB"}].map(b=>(
              <div key={b.label} style={{background:b.bg,border:`1px solid ${b.color}30`,borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
                <div style={{fontSize:9,color:b.color,textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:2}}>{b.label}</div>
                <div style={{fontSize:12,fontWeight:800,color:b.color}}>{b.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1400,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
          <Card accent="#0369A1">
            <div style={{fontSize:11,fontWeight:700,color:"#0369A1",letterSpacing:".1em",textTransform:"uppercase",marginBottom:18,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:16,borderRadius:2,background:"#0369A1"}}/>📊 Valorisation</div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Secteur</div>
            <select value={si} onChange={e=>{setSi(+e.target.value);setMp(50);}} style={{width:"100%",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,padding:"9px 10px",color:"#1E293B",fontSize:13,marginBottom:18,cursor:"pointer"}}>
              {SECTORS.map((s,i)=><option key={i} value={i}>{s.label}</option>)}
            </select>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>CA annuel</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:10}}><span style={{fontSize:40,fontWeight:800,color:"#0F172A",fontFamily:"'DM Mono',monospace"}}>{rev}</span><span style={{fontSize:18,fontWeight:700,color:"#64748B"}}>M€</span></div>
            <Slider value={rev} min={2} max={50} step={0.5} onChange={setRev} color="#0369A1"/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94A3B8",marginTop:4,marginBottom:18}}><span>2 M€</span><span>50 M€</span></div>
            <div style={{background:"#F8FAFC",borderRadius:10,padding:14,marginBottom:18,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,border:"1px solid #E2E8F0"}}>
              {[["Marge EBITDA",`${sec.margin}%`],["EBITDA",fmtE(ebitda)],["Multiple",`${sec.minM}×–${sec.maxM}×`],["Retenu",`${mult.toFixed(1)}×`]].map(([k,v])=>(
                <div key={k}><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>{k}</div><div style={{fontSize:14,fontWeight:700,color:"#334155",fontFamily:"'DM Mono',monospace"}}>{v}</div></div>
              ))}
            </div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Positionnement fourchette</div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94A3B8",marginBottom:6}}><span>Bas {sec.minM}×</span><span style={{color:"#0369A1",fontWeight:700}}>{mult.toFixed(1)}×</span><span>Haut {sec.maxM}×</span></div>
            <Slider value={mp} min={0} max={100} step={5} onChange={setMp} color="#0369A1"/>
            <div style={{marginTop:4,marginBottom:20}}/>
            <div style={{border:"1.5px solid #BFDBFE",borderRadius:12,padding:16,background:"#EFF6FF",marginTop:16}}>
              <div style={{fontSize:9,color:"#0369A1",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4,fontWeight:700}}>Valorisation estimée</div>
              <div style={{fontSize:34,fontWeight:800,color:"#0369A1",fontFamily:"'DM Mono',monospace"}}>{fmtE(val)}</div>
              <div style={{height:1,background:"#BFDBFE",margin:"12px 0"}}/>
              <div style={{fontSize:9,color:"#0369A1",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4,fontWeight:700}}>Prêt (LTV 50%)</div>
              <div style={{fontSize:28,fontWeight:800,color:"#059669",fontFamily:"'DM Mono',monospace"}}>{fmtE(loan)}</div>
              <div style={{fontSize:10,color:"#64748B",marginTop:6}}>Titres en fiducie-sûreté · ALOE Private Equity</div>
            </div>
          </Card>
          <Card accent="#7C3AED">
            <div style={{fontSize:11,fontWeight:700,color:"#7C3AED",letterSpacing:".1em",textTransform:"uppercase",marginBottom:18,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:16,borderRadius:2,background:"#7C3AED"}}/>🏛️ Structure obligataire</div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Taux annuel</div>
            <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}><span style={{fontSize:44,fontWeight:800,color:"#7C3AED",fontFamily:"'DM Mono',monospace"}}>{lr}%</span><span style={{fontSize:12,color:"#94A3B8"}}>/an · in fine</span></div>
            <Slider value={lr} min={5} max={15} step={0.5} onChange={setLr} color="#7C3AED"/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94A3B8",marginTop:4,marginBottom:20}}><span>5%</span><span>15%</span></div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:4}}>Fréquence des coupons</div>
            <div style={{fontSize:9,color:"#B0C0D0",marginBottom:8,fontStyle:"italic"}}>Plus la fréquence est faible, plus le réinvestissement est optimal</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {FREQS.map(f=>(
                <button key={f.id} onClick={()=>setFi(f.id)} style={{padding:"10px 14px",borderRadius:10,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .15s",border:fi===f.id?`1.5px solid ${f.rankColor}`:"1px solid #E2E8F0",background:fi===f.id?f.rankBg:"#F8FAFC",boxShadow:fi===f.id?`0 0 0 3px ${f.rankColor}15`:"none"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:fi===f.id?700:500,color:fi===f.id?f.rankColor:"#334155"}}>{f.label}</div>
                    <div style={{fontSize:10,color:"#94A3B8",marginTop:1}}>{f.n} coupon{f.n>1?"s":""}/an · {fmtE(coupon)}/échéance</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:6,background:f.rankBg,border:`1px solid ${f.rankBorder}`,color:f.rankColor}}>{f.rankLabel}</div>
                    {reinvestByFreq.find(x=>x.id===f.id)?.gain>0&&<div style={{fontSize:9,color:"#059669",marginTop:3,fontFamily:"'DM Mono',monospace",fontWeight:700}}>↺ +{fmtE(reinvestByFreq.find(x=>x.id===f.id)?.gain)}</div>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{background:freq.rankBg,border:`1px solid ${freq.rankBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:11,color:freq.rankColor,lineHeight:1.6}}>{freq.explain}</div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Échéancier</div>
            <div style={{background:"#F8FAFC",borderRadius:10,padding:12,marginBottom:16,border:"1px solid #E2E8F0"}}>
              {freq.periods.map((p,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,padding:"7px 0",borderBottom:i<freq.periods.length-1?"1px solid #E2E8F0":"none"}}>
                  <span style={{color:"#64748B",fontSize:12}}>{p}</span>
                  <span style={{color:"#DC2626",fontWeight:700,fontFamily:"'DM Mono',monospace"}}>−{fmtE(coupon)}</span>
                </div>
              ))}
            </div>
            <div style={{border:"1.5px solid #DDD6FE",borderRadius:12,padding:16,background:"#F5F3FF",marginTop:16}}>
              <Row k="Coupon/échéance" v={`−${fmtE(coupon)}`} vc="#DC2626"/>
              <Row k="Service dette/an" v={`−${fmtE(annSvc)}`} vc="#DC2626" divider big/>
              <Row k="Capital M+12" v={fmtE(loan)} vc="#94A3B8" divider/>
              <div style={{height:1,background:"#DDD6FE",margin:"10px 0"}}/>
              <div style={{padding:"10px 12px",background:"#EDE9FE40",borderRadius:8,border:"1px solid #DDD6FE"}}>
                <div style={{fontSize:9,color:"#7C3AED",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4,fontWeight:700}}>Total décaissé 12 mois</div>
                <div style={{fontSize:22,fontWeight:800,color:"#DC2626",fontFamily:"'DM Mono',monospace"}}>−{fmtE(annSvc+loan)}</div>
              </div>
            </div>
          </Card>
          <Card accent="#059669">
            <div style={{fontSize:11,fontWeight:700,color:"#059669",letterSpacing:".1em",textTransform:"uppercase",marginBottom:18,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:16,borderRadius:2,background:"#059669"}}/>💎 Allocation CGW</div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Produit CGW</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {PRODUCTS.map(p=>(
                <button key={p.id} onClick={()=>setPi(p.id)} style={{padding:"11px 14px",borderRadius:10,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all .15s",border:pi===p.id?`1.5px solid ${p.color}`:"1px solid #E2E8F0",background:pi===p.id?p.colorLight:"#F8FAFC",boxShadow:pi===p.id?`0 0 0 3px ${p.color}15`:"none"}}>
                  <div><div style={{fontSize:12,fontWeight:pi===p.id?700:500,color:pi===p.id?p.color:"#64748B"}}>{p.name}</div><div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>{p.sub}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:800,color:p.color,fontFamily:"'DM Mono',monospace"}}>{p.annualRate}%</div><div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".07em"}}>annualisé</div></div>
                </button>
              ))}
            </div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:2}}>Part du prêt placée chez CGW</div>
            <div style={{fontSize:9,color:"#B0C0D0",marginBottom:8,fontStyle:"italic"}}>50% = minimum recommandé · 100% = maximiser</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}><span style={{fontSize:34,fontWeight:800,color:"#059669",fontFamily:"'DM Mono',monospace"}}>{placePct}%</span><span style={{fontSize:12,color:"#64748B"}}>= {fmtE(totalPl)}</span></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#64748B"}}>Cash libre</div><div style={{fontSize:14,fontWeight:700,color:"#B45309",fontFamily:"'DM Mono',monospace"}}>{fmtE(freeCash)}</div></div>
            </div>
            <Slider value={placePct} min={50} max={100} step={5} onChange={setPlacePct} color="#059669"/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94A3B8",marginTop:4,marginBottom:10}}><span>50% min.</span><span>100% max.</span></div>
            <div style={{display:"flex",height:7,borderRadius:4,overflow:"hidden",marginBottom:18,border:"1px solid #E2E8F0"}}>
              <div style={{width:`${placePct}%`,background:"#059669",transition:"width .15s"}}/>
              <div style={{flex:1,background:"#FDE68A"}}/>
            </div>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:2}}>Réinvestissement des coupons CGW</div>
            <div style={{fontSize:9,color:"#B0C0D0",marginBottom:8,fontStyle:"italic"}}>% des coupons CGW nets replacés sur nouvelle ligne</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}><span style={{fontSize:30,fontWeight:800,color:"#B45309",fontFamily:"'DM Mono',monospace"}}>{reinvestPct}%</span><span style={{fontSize:11,color:"#64748B"}}>replacés</span></div>
            <Slider value={reinvestPct} min={0} max={100} step={10} onChange={setReinvestPct} color="#B45309"/>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94A3B8",marginTop:4,marginBottom:14}}><span>0% encaisser</span><span>100% réinvestir</span></div>
            {reinvestGain>0?(
              <div style={{background:"#FFFBEB",borderRadius:10,padding:10,border:"1px solid #FDE68A",marginBottom:14}}>
                <div style={{fontSize:9,color:"#92400E",textTransform:"uppercase",letterSpacing:".07em",fontWeight:700,marginBottom:8}}>Gain réinvestissement</div>
                {reinvestDetail.map((d,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,padding:"5px 0",borderBottom:i<reinvestDetail.length-1?"1px solid #FDE68A":"none"}}>
                    <div><span style={{color:"#64748B"}}>M+{d.month}</span>{d.obligDue>0&&<span style={{fontSize:9,color:"#DC2626",marginLeft:6,background:"#FEE2E2",borderRadius:4,padding:"1px 5px"}}>−{fmtE(d.obligDue)}</span>}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {d.rem>0&&d.netReinv>0&&<span style={{fontSize:9,color:"#B45309",background:"#FEF3C7",borderRadius:4,padding:"1px 6px"}}>{d.rem}m</span>}
                      <span style={{fontWeight:700,fontFamily:"'DM Mono',monospace",color:d.gain>0?"#059669":"#94A3B8"}}>{d.gain>0?`+${fmtE(d.gain)}`:"—"}</span>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #FDE68A",display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:800}}>
                  <span style={{color:"#B45309"}}>Total gain</span>
                  <span style={{color:"#059669",fontFamily:"'DM Mono',monospace"}}>+{fmtE(reinvestGain)}</span>
                </div>
              </div>
            ):(
              <div style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:11,color:"#94A3B8",fontStyle:"italic"}}>{reinvestPct===0?"Réinvestissement désactivé.":"Aucun coupon net disponible avec cette configuration."}</div>
            )}
            <div style={{border:"1.5px solid #A7F3D0",borderRadius:12,padding:16,background:"#ECFDF5",marginTop:16}}>
              <Row k="Revenu CGW base" v={`+${fmtE(cgwRevBase)}`} vc="#059669"/>
              {reinvestGain>0&&<Row k="Gain réinvestissement" v={`+${fmtE(reinvestGain)}`} vc="#059669"/>}
              <Row k="Revenu CGW total" v={`+${fmtE(cgwRevTotal)}`} vc="#059669" divider big/>
              <Row k="Service de la dette" v={`−${fmtE(annSvc)}`} vc="#DC2626" divider/>
              <div style={{height:1,background:"#A7F3D0",margin:"10px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,fontWeight:700,color:"#1E293B"}}>Solde net / an</span>
                <span style={{fontSize:28,fontWeight:800,color:net>=0?"#059669":"#DC2626",fontFamily:"'DM Mono',monospace"}}>{net>=0?"+":""}{fmtE(net)}</span>
              </div>
              <div style={{textAlign:"center",marginTop:10,fontSize:11,fontWeight:700,padding:"7px 0",borderRadius:8,color:cov>=1?"#059669":"#DC2626",background:cov>=1?"#D1FAE5":"#FEE2E2",border:`1px solid ${cov>=1?"#A7F3D0":"#FECACA"}`}}>
                Couverture : {(cov*100).toFixed(0)}% {cov>=2?"✓✓ Excellent":cov>=1.2?"✓ Bien couvert":cov>=1?"✓ Couvert":"⚠️ Insuffisant"}
              </div>
            </div>
          </Card>
        </div>
        <Card style={{border:"1px solid #E2E8F0"}}>
          <h3 style={{fontSize:12,fontWeight:700,color:"#0F172A",marginBottom:18,letterSpacing:".1em",textTransform:"uppercase",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:3,height:16,borderRadius:2,background:"linear-gradient(180deg,#0369A1,#7C3AED,#059669)"}}/>
            Synthèse — Vision fondateur sur 12 mois
          </h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:16}}>
            <KpiCard label="Valorisation" value={fmtE(val)} color="#0369A1"/>
            <KpiCard label="Prêt levé" value={fmtE(loan)} color="#7C3AED" sub="LTV 50%"/>
            <KpiCard label={`CGW ${placePct}%`} value={fmtE(totalPl)} color="#059669"/>
            <KpiCard label="Cash libre" value={fmtE(freeCash)} color="#B45309"/>
            <KpiCard label="Revenu CGW" value={`+${fmtE(cgwRevBase)}`} color="#059669"/>
            <KpiCard label="Gain réinvest." value={reinvestGain>0?`+${fmtE(reinvestGain)}`:"—"} color="#B45309" sub={freq.label}/>
            <KpiCard label="Solde net" value={`${net>=0?"+":""}${fmtE(net)}`} color={net>=0?"#059669":"#DC2626"}/>
          </div>
          <div style={{background:"#F8FAFC",borderRadius:12,padding:16,marginBottom:14,border:"1px solid #E2E8F0"}}>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12,fontWeight:700}}>Comparatif fréquences (mêmes paramètres)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {reinvestByFreq.map(f=>{
                const isActive=f.id===fi,netF=cgwRevBase+f.gain-annSvc;
                return (
                  <div key={f.id} onClick={()=>setFi(f.id)} style={{padding:"14px 16px",borderRadius:10,cursor:"pointer",border:isActive?`2px solid ${f.rankColor}`:"1px solid #E2E8F0",background:isActive?f.rankBg:"#fff",transition:"all .15s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div><div style={{fontSize:13,fontWeight:700,color:isActive?f.rankColor:"#334155"}}>{f.label}</div><div style={{fontSize:10,fontWeight:700,marginTop:2,color:f.rankColor}}>{f.rankLabel}</div></div>
                      {isActive&&<div style={{fontSize:10,background:f.rankColor,color:"#fff",borderRadius:6,padding:"2px 8px",fontWeight:700}}>Actif</div>}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                      <div><div style={{fontSize:9,color:"#94A3B8",marginBottom:2}}>Gain réinvest.</div><div style={{fontSize:14,fontWeight:800,color:f.gain>0?"#059669":"#94A3B8",fontFamily:"'DM Mono',monospace"}}>{f.gain>0?`+${fmtE(f.gain)}`:"—"}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"#94A3B8",marginBottom:2}}>Solde net</div><div style={{fontSize:14,fontWeight:800,color:netF>=0?"#059669":"#DC2626",fontFamily:"'DM Mono',monospace"}}>{netF>=0?"+":""}{fmtE(netF)}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{background:"#F8FAFC",borderRadius:12,padding:16,border:"1px solid #E2E8F0"}}>
            <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".08em",marginBottom:12,fontWeight:700}}>Flux annuels fondateur</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:10}}>
              {[
                {label:"Capital reçu",value:`+${fmtE(loan)}`,color:"#0369A1",sub:"J+0 · titres en fiducie"},
                {label:"Coupons obligataires",value:`−${fmtE(annSvc)}`,color:"#DC2626",sub:`${freq.n}× ${fmtE(coupon)} · ${freq.label.toLowerCase()}`},
                {label:"Revenu CGW base",value:`+${fmtE(cgwRevBase)}`,color:"#059669",sub:prod.name},
                {label:"Gain réinvestissement",value:reinvestGain>0?`+${fmtE(reinvestGain)}`:"—",color:"#B45309",sub:reinvestGain>0?`${reinvestPct}% replacés`:"Non actif"},
                {label:"Solde net / an",value:`${net>=0?"+":""}${fmtE(net)}`,color:net>=0?"#059669":"#DC2626",sub:"CGW total − service dette"},
              ].map(item=>(
                <div key={item.label} style={{padding:"12px 14px",background:"#FFFFFF",borderRadius:10,border:"1px solid #E2E8F0",borderLeft:`3px solid ${item.color}`}}>
                  <div style={{fontSize:9,color:"#94A3B8",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{item.label}</div>
                  <div style={{fontSize:18,fontWeight:800,color:item.color,fontFamily:"'DM Mono',monospace",marginBottom:3}}>{item.value}</div>
                  <div style={{fontSize:10,color:"#94A3B8"}}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginTop:14,fontSize:9,color:"#CBD5E1",textAlign:"center",letterSpacing:".04em",lineHeight:1.8,borderTop:"1px solid #F1F5F9",paddingTop:12}}>
            SIMULATION INDICATIVE · RÉSERVÉ AUX INVESTISSEURS QUALIFIÉS · RENDEMENTS CGW NON GARANTIS DANS LE FUTUR<br/>LIVING × ALOE PRIVATE EQUITY × WINSTON ROSE × CGW
          </div>
        </Card>
      </div>
    </div>
  );
}
