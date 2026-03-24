import { useState, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────
const LEAD_TIERS = [
  { min: 10000000, pct: 7 },
  { min: 5000000, pct: 6.5 },
  { min: 3000000, pct: 6 },
  { min: 1000000, pct: 5.5 },
  { min: 500000, pct: 5 },
];
const MASTER_TIERS = [
  { min: 25000000, pct: 10 },
  { min: 10000000, pct: 9 },
  { min: 5000000, pct: 8 },
  { min: 3000000, pct: 7.5 },
  { min: 1000000, pct: 7 },
];

const MAX_INPUT = 100000000;

const fmt = (n) => "₱" + Math.ceil(Math.max(0, n)).toLocaleString("en-PH");
const fmtNum = (n) => Math.ceil(Math.max(0, n)).toLocaleString("en-PH");

function getTier(tiers, vol) {
  for (const t of tiers) if (vol >= t.min) return t;
  return null;
}
function getNextTier(tiers, vol) {
  let next = null;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (vol < tiers[i].min) next = tiers[i];
    else break;
  }
  return next;
}

// ─── INFO MODAL ───────────────────────────────────────
function InfoBtn({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ml-1.5 flex-shrink-0" style={{ background: "#E8EEF2", color: "#5B7A91" }}>i</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-5 mx-0 sm:mx-6 w-full sm:max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded mx-auto mb-4 sm:hidden" />
            <p className="text-sm leading-relaxed" style={{ color: "#3D4F5F" }}>{text}</p>
            <button onClick={() => setOpen(false)} className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#1B4F72" }}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── INPUT COMPONENT ──────────────────────────────────
function PesoInput({ label, info, value, onChange, max = MAX_INPUT, isPercent, isCurrency = true }) {
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState("");
  const brandColor = "#1B4F72";

  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = raw === "" ? 0 : parseInt(raw, 10);
    if (num < 0) { onChange(0); return; }
    if (num > max) { setError(isPercent ? "Maximum 100%" : "Maximum ₱100,000,000"); onChange(max); return; }
    setError("");
    onChange(num);
  };

  const displayVal = value === 0 && !focused ? "" : fmtNum(value);

  return (
    <div className="mb-3">
      <div className="flex items-center mb-1.5">
        <span className="text-xs font-medium" style={{ color: "#5B7A91" }}>{label}</span>
        {info && <InfoBtn text={info} />}
      </div>
      <div className="relative">
        {!isPercent && isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#9AACBA" }}>₱</span>}
        <input
          type="text" inputMode="numeric"
          value={displayVal}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isPercent ? "0" : isCurrency ? "0" : "0"}
          className="w-full h-12 rounded-xl text-sm font-medium outline-none transition-all"
          style={{
            background: "#F7F8FA",
            border: `1.5px solid ${focused ? brandColor : "#E0E3E8"}`,
            paddingLeft: !isPercent && isCurrency ? "28px" : "14px",
            paddingRight: isPercent ? "28px" : "14px",
            color: "#1A2B3C",
          }}
        />
        {isPercent && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#9AACBA" }}>%</span>}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: "#E74C3C" }}>{error}</p>}
    </div>
  );
}

function NumInput({ label, info, value, onChange }) {
  return <PesoInput label={label} info={info} value={value} onChange={onChange} isCurrency={false} max={MAX_INPUT} />;
}

// ─── RESULT ROW ───────────────────────────────────────
function ResultRow({ label, amount, info, alt }) {
  return (
    <div className="flex items-center justify-between py-3 px-4" style={{ background: alt ? "#F9FAFB" : "white", borderBottom: "1px solid #F0F0F0" }}>
      <div className="flex items-center flex-1 mr-3">
        <span className="text-xs" style={{ color: "#5B7A91" }}>{label}</span>
        {info && <InfoBtn text={info} />}
      </div>
      <span className="text-sm font-bold flex-shrink-0" style={{ color: "#1A2B3C" }}>{fmt(amount)}</span>
    </div>
  );
}

// ─── TOTAL CARD ───────────────────────────────────────
function TotalCard({ total, color, showAnnual, setShowAnnual }) {
  return (
    <div className="rounded-2xl p-5 mt-4" style={{ background: color }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Total Monthly Earnings</p>
      <p className="text-3xl font-extrabold text-white mt-1">{fmt(total)}</p>
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
        <span className="text-xs text-white" style={{ opacity: 0.8 }}>Show Annual Projection</span>
        <button onClick={() => setShowAnnual(!showAnnual)} className="w-11 h-6 rounded-full relative transition-all" style={{ background: showAnnual ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)" }}>
          <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow" style={{ left: showAnnual ? "22px" : "2px" }} />
        </button>
      </div>
      {showAnnual && <p className="text-lg font-bold text-white mt-2" style={{ opacity: 0.9 }}>Estimated Annual: {fmt(total * 12)}</p>}
    </div>
  );
}

// ─── TIER TABLE ───────────────────────────────────────
function TierTable({ tiers, currentVol, color }) {
  const cur = getTier(tiers, currentVol);
  return (
    <div className="rounded-xl overflow-hidden mt-2" style={{ border: "1px solid #E0E3E8" }}>
      {tiers.slice().reverse().map((t, i) => {
        const active = cur && cur.min === t.min;
        return (
          <div key={i} className="flex items-center justify-between px-4 py-2 text-xs" style={{
            background: active ? (color === "#7D6608" ? "#FEF9E7" : "#EBF5FB") : i % 2 ? "#F9FAFB" : "white",
            borderBottom: i < tiers.length - 1 ? "1px solid #F0F0F0" : "none",
            fontWeight: active ? "700" : "400",
            color: active ? color : "#5B7A91"
          }}>
            <span>{fmt(t.min)}</span>
            <span>{t.pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── NEXT TIER NUDGE ──────────────────────────────────
function NextTierNudge({ tiers, currentVol, color, maxMsg }) {
  const cur = getTier(tiers, currentVol);
  const next = getNextTier(tiers, currentVol);
  if (!next && cur) return (
    <div className="rounded-xl p-4 mt-3" style={{ background: color + "0D" }}>
      <div className="flex items-start gap-2">
        <span className="text-lg">🏆</span>
        <p className="text-xs" style={{ color }}><strong>You're at the highest tier!</strong> {maxMsg}</p>
      </div>
    </div>
  );
  if (!next) return null;
  const curPct = cur ? cur.pct : 0;
  const extra = Math.ceil(currentVol * (next.pct - curPct) / 100);
  const gap = next.min - currentVol;
  return (
    <div className="rounded-xl p-4 mt-3" style={{ background: color + "0D" }}>
      <div className="flex items-start gap-2">
        <span className="text-lg">📈</span>
        <div>
          <p className="text-xs font-semibold" style={{ color }}>
            {cur ? `You're at the ${fmt(cur.min)} tier (${cur.pct}%).` : "You haven't reached a tier yet."}
          </p>
          <p className="text-xs mt-1" style={{ color: "#5B7A91" }}>
            Reach {fmt(next.min)} credited volume to unlock {next.pct}% — that's an extra {fmt(extra)}/month! ({fmt(gap)} more needed)
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── COLLAPSIBLE ──────────────────────────────────────
function Collapsible({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden mt-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-4 py-3.5 text-left">
        <span className="text-sm font-semibold" style={{ color: "#1A2B3C" }}>{icon} {title}</span>
        <span className="text-xs transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", color: "#9AACBA" }}>▼</span>
      </button>
      <div className="overflow-hidden transition-all" style={{ maxHeight: open ? "800px" : "0", opacity: open ? 1 : 0, transition: "max-height 0.3s ease, opacity 0.2s ease" }}>
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

// ─── GOAL CALCULATOR ──────────────────────────────────
function GoalCalc({ options, calcFn, color }) {
  const [goal, setGoal] = useState(0);
  const [solveFor, setSolveFor] = useState(options[0].value);
  const result = calcFn(goal, solveFor);

  return (
    <Collapsible title="Set My Goal" icon="🎯">
      <PesoInput label="I want to earn per month" info="Enter your target monthly earnings and select what variable to solve for." value={goal} onChange={setGoal} />
      <div className="mb-3">
        <span className="text-xs font-medium block mb-1.5" style={{ color: "#5B7A91" }}>Solve for:</span>
        <select value={solveFor} onChange={e => setSolveFor(e.target.value)} className="w-full h-12 rounded-xl text-sm outline-none px-3" style={{ background: "#F7F8FA", border: "1.5px solid #E0E3E8", color: "#1A2B3C" }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {goal > 0 && (
        <div className="rounded-xl p-4 mt-2" style={{ background: color + "0D" }}>
          <p className="text-xs" style={{ color: result.possible ? "#1A2B3C" : "#E74C3C" }}>
            {result.text}
          </p>
        </div>
      )}
    </Collapsible>
  );
}

// ─── SAVE IMAGE ───────────────────────────────────────
function SaveBtn({ targetRef, color }) {
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      const el = targetRef.current;
      if (!el) return;
      const { default: html2canvas } = await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.js").catch(() => {
        // Fallback: use canvas API manually
        return { default: null };
      });

      if (html2canvas) {
        const canvas = await html2canvas(el, { backgroundColor: "#F5F6FA", scale: 2 });
        const link = document.createElement("a");
        link.download = "commission-summary.png";
        link.href = canvas.toDataURL();
        link.click();
      } else {
        // Simple text copy fallback
        const text = el.innerText;
        await navigator.clipboard.writeText(text);
        alert("Summary copied to clipboard!");
      }
    } catch (e) {
      // text fallback
      try {
        const text = targetRef.current?.innerText || "";
        await navigator.clipboard.writeText(text);
        alert("Summary copied to clipboard!");
      } catch (_) {
        alert("Could not save. Try taking a screenshot.");
      }
    }
    setSaving(false);
  };

  return (
    <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 mt-3 transition-opacity" style={{ background: color, opacity: saving ? 0.7 : 1 }}>
      📸 {saving ? "Saving..." : "Save Summary"}
    </button>
  );
}

// ─── DIRECT CALC LOGIC ────────────────────────────────
function useDirectCalc() {
  const [s, setS] = useState({ newPlayers: 0, avgCashIn: 0, lossRate: 40, retPlayers: 0, avgRetLoss: 0 });
  const set = (k, v) => setS(p => ({ ...p, [k]: v }));
  const reset = () => setS({ newPlayers: 0, avgCashIn: 0, lossRate: 40, retPlayers: 0, avgRetLoss: 0 });

  const totalNewCashIn = s.newPlayers * s.avgCashIn;
  const cashInBonus = totalNewCashIn * 0.05;
  const newLossBonus = totalNewCashIn * (s.lossRate / 100) * 0.10;
  const retBonus = s.retPlayers * s.avgRetLoss * 0.05;
  const totalDirect = cashInBonus + newLossBonus + retBonus;
  const personalVol = totalNewCashIn + (s.retPlayers * s.avgRetLoss);

  return { s, set, reset, cashInBonus, newLossBonus, retBonus, totalDirect, personalVol };
}

// ─── CARD WRAPPER ─────────────────────────────────────
function Card({ children, title }) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden mt-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {title && <div className="px-4 pt-4 pb-2"><p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9AACBA", letterSpacing: "0.5px" }}>{title}</p></div>}
      <div className="px-4 pb-4">{children}</div>
    </div>
  );
}

// ─── QUALIFICATION BANNER ─────────────────────────────
function QualBanner({ title, items, color }) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden mt-3" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
      <div className="px-4 py-3.5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🛡️</span>
          <span className="text-sm font-bold" style={{ color }}>{title}</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 ml-1 mb-1">
            <span className="text-xs" style={{ color: "#27AE60" }}>✓</span>
            <span className="text-xs" style={{ color: "#5B7A91" }}>{item}</span>
          </div>
        ))}
        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#E8F8F0", color: "#27AE60" }}>One-time qualification</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 0: HOME
// ═══════════════════════════════════════════════════════
function HomeTab({ setTab }) {
  const cards = [
    { tab: 1, title: "Direct Agent", desc: "Earn from your personal players", detail: "5% cash-in bonus + 10% first deposit losses + 5% recurring losses", qual: null, color: "#1B4F72", icon: "👤" },
    { tab: 2, title: "Lead Agent", desc: "Earn from your players + your agent network", detail: "Everything in Direct, plus 5–7% volume kicker", qual: "₱500K monthly volume + manual approval", color: "#1B4F72", icon: "👥" },
    { tab: 3, title: "Master Agent", desc: "Earn from your players + agents + sub-agents", detail: "Everything in Direct, plus 7–10% volume kicker", qual: "₱5M lifetime + 10 Lead Agents + more", color: "#7D6608", icon: "👑" },
  ];

  return (
    <div className="px-4 pb-8">
      <div className="text-center mt-6 mb-6">
        <h1 className="text-2xl font-extrabold" style={{ color: "#1A2B3C", fontFamily: "'DM Sans', system-ui, sans-serif" }}>Commission Calculator</h1>
        <p className="text-sm mt-2" style={{ color: "#7A8B9A" }}>See exactly how much you can earn at every level.</p>
      </div>

      <div className="rounded-2xl bg-white p-4 mb-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <p className="text-xs leading-relaxed" style={{ color: "#5B7A91" }}>
          This calculator helps you estimate your monthly earnings based on your player activity and agent network. Select your current or target rank to see a full breakdown of your commissions.
        </p>
      </div>

      {cards.map(c => (
        <button key={c.tab} onClick={() => setTab(c.tab)} className="w-full rounded-2xl bg-white p-4 mb-3 text-left transition-transform active:scale-[0.98]" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{c.icon}</span>
                <span className="text-base font-bold" style={{ color: c.color }}>{c.title}</span>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#5B7A91" }}>{c.desc}</p>
              <p className="text-xs mt-1" style={{ color: "#9AACBA" }}>{c.detail}</p>
              {c.qual && <p className="text-xs mt-1.5 font-medium" style={{ color: c.color }}>Qualification: {c.qual}</p>}
            </div>
            <span className="text-lg ml-3" style={{ color: c.color }}>→</span>
          </div>
        </button>
      ))}

      <p className="text-xs text-center mt-4" style={{ color: "#B0BEC5" }}>
        All commissions are estimated. Actual payouts are manually approved and subject to monthly verification.
      </p>
    </div>
  );
}

// ─── PLAYER INPUTS (shared) ───────────────────────────
function PlayerInputs({ s, set }) {
  return (
    <Card title="Your Players">
      <NumInput label="Number of New Players" info="Players you personally recruited this month who made their first deposit." value={s.newPlayers} onChange={v => set("newPlayers", v)} />
      <PesoInput label="Average Cash-In per New Player" info="The average amount each new player deposits when they first join." value={s.avgCashIn} onChange={v => set("avgCashIn", v)} />
      <PesoInput label="Average Loss Rate" info="The estimated percentage of total cash-in that becomes player losses. Industry average is around 40%." value={s.lossRate} onChange={v => set("lossRate", v)} isPercent max={100} />
      <NumInput label="Number of Returning Players" info="Players you previously recruited who are still active. You earn 5% of their losses every month — perpetually, for as long as they play." value={s.retPlayers} onChange={v => set("retPlayers", v)} />
      <PesoInput label="Avg Monthly Loss per Returning Player" info="The average monthly net loss per returning player." value={s.avgRetLoss} onChange={v => set("avgRetLoss", v)} />
    </Card>
  );
}

// ─── RESULT ITEMS (shared) ────────────────────────────
function DirectResults({ cashInBonus, newLossBonus, retBonus }) {
  return (
    <>
      <ResultRow label="New Player Cash-In Bonus (5%)" amount={cashInBonus} info="5% of every first-time deposit from your personally recruited players. Paid instantly." alt={false} />
      <ResultRow label="New Player Loss Bonus (10%)" amount={newLossBonus} info="10% of net monthly losses from first-time deposit players. Paid instantly." alt={true} />
      <ResultRow label="Returning Player Loss Bonus (5%)" amount={retBonus} info="5% of net monthly losses from all returning players. Perpetual — you earn every month as long as they play." alt={false} />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 1: DIRECT
// ═══════════════════════════════════════════════════════
function DirectTab() {
  const d = useDirectCalc();
  const [showAnnual, setShowAnnual] = useState(false);
  const resultsRef = useRef(null);
  const color = "#1B4F72";

  const goalCalcFn = useCallback((goal, solveFor) => {
    if (goal <= 0) return { text: "", possible: true };
    const remaining = goal;
    if (solveFor === "newPlayers") {
      const perPlayer = d.s.avgCashIn * 0.05 + d.s.avgCashIn * (d.s.lossRate / 100) * 0.10;
      if (perPlayer <= 0) return { text: "Set an average cash-in amount first.", possible: false };
      const existingRet = d.s.retPlayers * d.s.avgRetLoss * 0.05;
      const needed = Math.ceil(Math.max(0, (remaining - existingRet) / perPlayer));
      return { text: `You need approximately ${needed.toLocaleString()} new players to reach ${fmt(goal)}/month.`, possible: true };
    }
    if (solveFor === "retPlayers") {
      const perPlayer = d.s.avgRetLoss * 0.05;
      if (perPlayer <= 0) return { text: "Set an average monthly loss per returning player first.", possible: false };
      const existingNew = d.cashInBonus + d.newLossBonus;
      const needed = Math.ceil(Math.max(0, (remaining - existingNew) / perPlayer));
      return { text: `You need approximately ${needed.toLocaleString()} returning players to reach ${fmt(goal)}/month.`, possible: true };
    }
    return { text: "", possible: true };
  }, [d]);

  return (
    <div className="px-4 pb-8">
      <PlayerInputs s={d.s} set={d.set} />
      <div ref={resultsRef}>
        <Card title="Your Earnings Breakdown">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
            <DirectResults {...d} />
          </div>
          <TotalCard total={d.totalDirect} color={color} showAnnual={showAnnual} setShowAnnual={setShowAnnual} />
        </Card>
        <div className="rounded-xl p-4 mt-3" style={{ background: "#EBF5FB" }}>
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <p className="text-xs" style={{ color: "#1B4F72" }}>
              <strong>Want to earn more?</strong> Recruit agents and level up to Lead Agent. Your agents' volume earns you additional bonuses.
            </p>
          </div>
        </div>
      </div>
      <GoalCalc color={color} options={[
        { value: "newPlayers", label: "Number of new players needed" },
        { value: "retPlayers", label: "Number of returning players needed" },
      ]} calcFn={goalCalcFn} />
      <SaveBtn targetRef={resultsRef} color={color} />
      <button onClick={d.reset} className="w-full h-11 rounded-xl text-sm font-semibold mt-3 transition-colors" style={{ border: "1.5px solid #E74C3C", color: "#E74C3C", background: "transparent" }}>Reset Calculator</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 2: LEAD AGENT
// ═══════════════════════════════════════════════════════
function LeadTab() {
  const d = useDirectCalc();
  const [agents, setAgents] = useState(0);
  const [agentVol, setAgentVol] = useState(0);
  const [showAnnual, setShowAnnual] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const resultsRef = useRef(null);
  const color = "#1B4F72";

  const agentCredit = agentVol * 0.15;
  const creditedVol = d.personalVol + agentCredit;
  const tier = getTier(LEAD_TIERS, creditedVol);
  const kickerPct = tier ? tier.pct : 0;
  const kickerBonus = creditedVol * kickerPct / 100;
  const total = d.totalDirect + kickerBonus;

  const resetAll = () => { d.reset(); setAgents(0); setAgentVol(0); };

  const loadExample = () => {
    d.set("newPlayers", 50); d.set("avgCashIn", 5000); d.set("lossRate", 40);
    d.set("retPlayers", 100); d.set("avgRetLoss", 3000);
    setAgents(10); setAgentVol(5000000);
  };

  const goalCalcFn = useCallback((goal, solveFor) => {
    if (goal <= 0) return { text: "", possible: true };
    if (solveFor === "newPlayers") {
      const perPlayer = d.s.avgCashIn * 0.05 + d.s.avgCashIn * (d.s.lossRate / 100) * 0.10;
      if (perPlayer <= 0) return { text: "Set an average cash-in amount first.", possible: false };
      const otherEarnings = d.retBonus + kickerBonus;
      const needed = Math.ceil(Math.max(0, (goal - otherEarnings) / perPlayer));
      return { text: `You need approximately ${needed.toLocaleString()} new players to reach ${fmt(goal)}/month.`, possible: true };
    }
    if (solveFor === "retPlayers") {
      const perPlayer = d.s.avgRetLoss * 0.05;
      if (perPlayer <= 0) return { text: "Set an average monthly loss first.", possible: false };
      const otherEarnings = d.cashInBonus + d.newLossBonus + kickerBonus;
      const needed = Math.ceil(Math.max(0, (goal - otherEarnings) / perPlayer));
      return { text: `You need approximately ${needed.toLocaleString()} returning players to reach ${fmt(goal)}/month.`, possible: true };
    }
    if (solveFor === "agentVol") {
      // Reverse: find agent volume needed such that total >= goal
      const directPart = d.totalDirect;
      const neededFromKicker = goal - directPart;
      if (neededFromKicker <= 0) return { text: `Your direct earnings already exceed ${fmt(goal)}! No additional agent volume needed.`, possible: true };
      // Iterate tiers to find
      let found = null;
      for (const t of LEAD_TIERS) {
        const reqCredited = neededFromKicker / (t.pct / 100);
        if (reqCredited >= t.min) {
          const reqAgentVol = Math.ceil((reqCredited - d.personalVol) / 0.15);
          if (reqAgentVol >= 0) { found = { vol: reqAgentVol, pct: t.pct }; break; }
        }
      }
      if (!found) {
        // Try lowest tier
        const t = LEAD_TIERS[LEAD_TIERS.length - 1];
        const reqCredited = neededFromKicker / (t.pct / 100);
        const reqAgentVol = Math.ceil((reqCredited - d.personalVol) / 0.15);
        found = { vol: Math.max(0, reqAgentVol), pct: t.pct };
      }
      return { text: `You need approximately ${fmt(found.vol)} in total agent volume to reach ${fmt(goal)}/month (at ${found.pct}% tier).`, possible: true };
    }
    return { text: "", possible: true };
  }, [d, kickerBonus]);

  return (
    <div className="px-4 pb-8">
      <QualBanner title="How to Qualify as a Lead Agent" color={color} items={[
        "Achieve ₱500,000 in monthly personal volume",
        "Receive manual approval from operations",
      ]} />
      <PlayerInputs s={d.s} set={d.set} />
      <Card title="Your Agent Network">
        <NumInput label="Number of Direct Agents" info="Agents you personally recruited under your network. As a Lead Agent, you can recruit sub-agents up to 1 level deep." value={agents} onChange={setAgents} />
        <PesoInput label="Total Monthly Volume from All Agents" info="The combined total cash-in volume generated by all your direct agents and their players this month." value={agentVol} onChange={setAgentVol} />
      </Card>
      <div ref={resultsRef}>
        <Card title="Credited Volume Breakdown">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
            <ResultRow label="Personal Volume (100%)" amount={d.personalVol} info="100% of your personal player volume counts toward credited volume." alt={false} />
            <ResultRow label="Agent Volume Credit (15%)" amount={agentCredit} info="15% of your agents' total monthly volume is credited to your volume for kicker calculation." alt={true} />
            <div className="flex items-center justify-between py-3 px-4 font-bold" style={{ background: "#EBF5FB", color: "#1B4F72" }}>
              <span className="text-xs font-bold">Total Credited Volume</span>
              <span className="text-sm font-extrabold">{fmt(creditedVol)}</span>
            </div>
          </div>
          <TierTable tiers={LEAD_TIERS} currentVol={creditedVol} color={color} />
        </Card>
        <Card title="Your Earnings Breakdown">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
            <DirectResults {...d} />
            <ResultRow label={`Volume Kicker Bonus (${kickerPct}%)`} amount={kickerBonus} info="Based on your total credited volume. Milestone-based — highest tier reached applies. Resets monthly. Manually approved." alt={true} />
          </div>
          <TotalCard total={total} color={color} showAnnual={showAnnual} setShowAnnual={setShowAnnual} />
          <NextTierNudge tiers={LEAD_TIERS} currentVol={creditedVol} color={color} maxMsg="Consider growing to Master Agent for 7–10% kickers." />
        </Card>
      </div>
      <Collapsible title="Example: See how a Lead Agent earns" icon="📊">
        <p className="text-xs mb-3" style={{ color: "#5B7A91" }}>50 new players at ₱5,000 avg cash-in, 40% loss rate, 100 returning players at ₱3,000 avg loss, 10 agents doing ₱5,000,000 total volume.</p>
        <div className="rounded-xl overflow-hidden mb-3" style={{ border: "1px solid #F0F0F0" }}>
          <ResultRow label="New Player Cash-In (5%)" amount={12500} alt={false} />
          <ResultRow label="New Player Loss (10%)" amount={10000} alt={true} />
          <ResultRow label="Returning Player Loss (5%)" amount={15000} alt={false} />
          <ResultRow label="Credited Vol: ₱550K + ₱750K = ₱1.3M" amount={0} alt={true} />
          <ResultRow label="Volume Kicker (5.5% of ₱1.3M)" amount={71500} alt={false} />
          <div className="flex items-center justify-between py-3 px-4 font-bold" style={{ background: "#EBF5FB", color: "#1B4F72" }}>
            <span className="text-xs font-bold">Example Total</span>
            <span className="text-sm font-extrabold">{fmt(109000)}</span>
          </div>
        </div>
        <button onClick={loadExample} className="w-full py-2.5 rounded-xl text-xs font-semibold text-white" style={{ background: color }}>Load these values into calculator</button>
      </Collapsible>
      <GoalCalc color={color} options={[
        { value: "newPlayers", label: "Number of new players needed" },
        { value: "retPlayers", label: "Number of returning players needed" },
        { value: "agentVol", label: "Total agent volume needed" },
      ]} calcFn={goalCalcFn} />
      <SaveBtn targetRef={resultsRef} color={color} />
      <button onClick={resetAll} className="w-full h-11 rounded-xl text-sm font-semibold mt-3" style={{ border: "1.5px solid #E74C3C", color: "#E74C3C", background: "transparent" }}>Reset Calculator</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TAB 3: MASTER AGENT
// ═══════════════════════════════════════════════════════
function MasterTab() {
  const d = useDirectCalc();
  const [agents, setAgents] = useState(0);
  const [agentVol, setAgentVol] = useState(0);
  const [subVol, setSubVol] = useState(0);
  const [showAnnual, setShowAnnual] = useState(false);
  const resultsRef = useRef(null);
  const color = "#7D6608";

  const agentCredit = agentVol * 0.20;
  const subCredit = subVol * 0.05;
  const creditedVol = d.personalVol + agentCredit + subCredit;
  const tier = getTier(MASTER_TIERS, creditedVol);
  const kickerPct = tier ? tier.pct : 0;
  const kickerBonus = creditedVol * kickerPct / 100;
  const total = d.totalDirect + kickerBonus;

  const resetAll = () => { d.reset(); setAgents(0); setAgentVol(0); setSubVol(0); };

  const goalCalcFn = useCallback((goal, solveFor) => {
    if (goal <= 0) return { text: "", possible: true };
    if (solveFor === "newPlayers") {
      const perPlayer = d.s.avgCashIn * 0.05 + d.s.avgCashIn * (d.s.lossRate / 100) * 0.10;
      if (perPlayer <= 0) return { text: "Set an average cash-in amount first.", possible: false };
      const otherEarnings = d.retBonus + kickerBonus;
      const needed = Math.ceil(Math.max(0, (goal - otherEarnings) / perPlayer));
      return { text: `You need approximately ${needed.toLocaleString()} new players to reach ${fmt(goal)}/month.`, possible: true };
    }
    if (solveFor === "retPlayers") {
      const perPlayer = d.s.avgRetLoss * 0.05;
      if (perPlayer <= 0) return { text: "Set an average monthly loss first.", possible: false };
      const otherEarnings = d.cashInBonus + d.newLossBonus + kickerBonus;
      const needed = Math.ceil(Math.max(0, (goal - otherEarnings) / perPlayer));
      return { text: `You need approximately ${needed.toLocaleString()} returning players to reach ${fmt(goal)}/month.`, possible: true };
    }
    if (solveFor === "agentVol") {
      const directPart = d.totalDirect;
      const neededFromKicker = goal - directPart;
      if (neededFromKicker <= 0) return { text: `Your direct earnings already exceed ${fmt(goal)}!`, possible: true };
      let found = null;
      for (const t of MASTER_TIERS) {
        const reqCredited = neededFromKicker / (t.pct / 100);
        if (reqCredited >= t.min) {
          const reqAgentVol = Math.ceil((reqCredited - d.personalVol - subCredit) / 0.20);
          if (reqAgentVol >= 0) { found = { vol: reqAgentVol, pct: t.pct }; break; }
        }
      }
      if (!found) {
        const t = MASTER_TIERS[MASTER_TIERS.length - 1];
        const reqCredited = neededFromKicker / (t.pct / 100);
        const reqAgentVol = Math.ceil((reqCredited - d.personalVol - subCredit) / 0.20);
        found = { vol: Math.max(0, reqAgentVol), pct: t.pct };
      }
      return { text: `You need approximately ${fmt(found.vol)} in agent volume to reach ${fmt(goal)}/month (at ${found.pct}% tier).`, possible: true };
    }
    if (solveFor === "subVol") {
      const directPart = d.totalDirect;
      const neededFromKicker = goal - directPart;
      if (neededFromKicker <= 0) return { text: `Your direct earnings already exceed ${fmt(goal)}!`, possible: true };
      let found = null;
      for (const t of MASTER_TIERS) {
        const reqCredited = neededFromKicker / (t.pct / 100);
        if (reqCredited >= t.min) {
          const reqSubVol = Math.ceil((reqCredited - d.personalVol - agentCredit) / 0.05);
          if (reqSubVol >= 0) { found = { vol: reqSubVol, pct: t.pct }; break; }
        }
      }
      if (!found) {
        const t = MASTER_TIERS[MASTER_TIERS.length - 1];
        const reqCredited = neededFromKicker / (t.pct / 100);
        const reqSubVol = Math.ceil((reqCredited - d.personalVol - agentCredit) / 0.05);
        found = { vol: Math.max(0, reqSubVol), pct: t.pct };
      }
      return { text: `You need approximately ${fmt(found.vol)} in sub-agent volume to reach ${fmt(goal)}/month (at ${found.pct}% tier).`, possible: true };
    }
    return { text: "", possible: true };
  }, [d, kickerBonus, agentCredit, subCredit]);

  return (
    <div className="px-4 pb-8">
      <QualBanner title="How to Qualify as Master Agent" color={color} items={[
        "Must be an active Lead Agent",
        "₱5M cumulative lifetime volume",
        "10 active Lead Agents in your network",
        "₱5M monthly network volume for 3 consecutive months",
      ]} />
      <PlayerInputs s={d.s} set={d.set} />
      <Card title="Your Agent Network">
        <NumInput label="Number of Direct Agents" info="Agents directly in your network." value={agents} onChange={setAgents} />
        <PesoInput label="Total Monthly Volume from All Agents" info="Combined total volume from all your direct agents this month." value={agentVol} onChange={setAgentVol} />
        <PesoInput label="Total Monthly Sub-Agent Volume" info="Combined total volume from all sub-agents (1 level below your direct agents). Only Master Agents earn credit from this second level." value={subVol} onChange={setSubVol} />
      </Card>
      <div ref={resultsRef}>
        <Card title="Credited Volume Breakdown">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
            <ResultRow label="Personal Volume (100%)" amount={d.personalVol} info="100% of personal player volume." alt={false} />
            <ResultRow label="Agent Volume Credit (20%)" amount={agentCredit} info="20% of direct agent volume — higher than Lead Agent's 15%. A Master Agent exclusive." alt={true} />
            <ResultRow label="Sub-Agent Volume Credit (5%)" amount={subCredit} info="5% of sub-agent volume. Only Master Agents earn from this second level." alt={false} />
            <div className="flex items-center justify-between py-3 px-4 font-bold" style={{ background: "#FEF9E7", color: "#7D6608" }}>
              <span className="text-xs font-bold">Total Credited Volume</span>
              <span className="text-sm font-extrabold">{fmt(creditedVol)}</span>
            </div>
          </div>
          <TierTable tiers={MASTER_TIERS} currentVol={creditedVol} color={color} />
        </Card>
        <Card title="Your Earnings Breakdown">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
            <DirectResults {...d} />
            <ResultRow label={`Volume Kicker Bonus (${kickerPct}%)`} amount={kickerBonus} info="Master Agent kicker ranges 7–10%, higher than Lead Agent's 5–7%. Milestone-based, highest tier applies, resets monthly." alt={true} />
          </div>
          <TotalCard total={total} color={color} showAnnual={showAnnual} setShowAnnual={setShowAnnual} />
          <NextTierNudge tiers={MASTER_TIERS} currentVol={creditedVol} color={color} maxMsg="Keep growing your network." />
        </Card>
      </div>
      <GoalCalc color={color} options={[
        { value: "newPlayers", label: "Number of new players needed" },
        { value: "retPlayers", label: "Number of returning players needed" },
        { value: "agentVol", label: "Total agent volume needed" },
        { value: "subVol", label: "Total sub-agent volume needed" },
      ]} calcFn={goalCalcFn} />
      <SaveBtn targetRef={resultsRef} color={color} />
      <button onClick={resetAll} className="w-full h-11 rounded-xl text-sm font-semibold mt-3" style={{ border: "1.5px solid #E74C3C", color: "#E74C3C", background: "transparent" }}>Reset Calculator</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { id: 0, label: "Home", color: "#1A2B3C" },
    { id: 1, label: "Direct", color: "#1B4F72" },
    { id: 2, label: "Lead", color: "#1B4F72" },
    { id: 3, label: "Master", color: "#7D6608" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F5F6FA", fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif" }}>
      {/* Tab Bar */}
      <div className="sticky top-0 z-40 bg-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div className="flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-3.5 text-xs font-semibold text-center relative transition-colors" style={{ color: tab === t.id ? t.color : "#B0BEC5" }}>
              {t.label}
              {tab === t.id && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: t.color }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto">
        {tab === 0 && <HomeTab setTab={setTab} />}
        {tab === 1 && <DirectTab />}
        {tab === 2 && <LeadTab />}
        {tab === 3 && <MasterTab />}
      </div>
    </div>
  );
}
