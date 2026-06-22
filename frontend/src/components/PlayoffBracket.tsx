"use client";

import React from "react";

// ─── Layout constants ────────────────────────────────────────────────────────
const CARD_W = 160; // width of each game card (px)
const CARD_H = 72; // height of each game card (px)
const SLOT_UNIT = 80; // vertical slot per game in the outermost round (px)
const CONN_W = 32; // horizontal connector column width (px)
const HALF_GAMES = 8; // games per bracket half (in the 16 avos round)

// Total height of each bracket half
const BRACKET_H = HALF_GAMES * SLOT_UNIT; // 640 px

// Left-half column left-edges (16avos → semi, reading L→R)
const LX: number[] = [0, 192, 384, 576]; // r=0..3

// Centre and right-half columns
const FINAL_X = LX[3] + CARD_W + CONN_W; // 768
const RX_SEMI = FINAL_X + CARD_W + CONN_W; // 960 (semi-R)
// Right-half columns: index 0 = semi-R, 1 = quartas-R, 2 = oitavas-R, 3 = 16avos-R
const RX: number[] = [
  RX_SEMI,
  RX_SEMI + CARD_W + CONN_W,
  RX_SEMI + 2 * (CARD_W + CONN_W),
  RX_SEMI + 3 * (CARD_W + CONN_W),
];

const TOTAL_W = RX[3] + CARD_W; // 1696

// Y-centre of a game at bracket-round r (0=16avos, 3=semi), position p in half
const cy = (r: number, p: number) => SLOT_UNIT * Math.pow(2, r) * (p + 0.5);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Team {
  id: number;
  nome: string;
  sigla: string;
  bandeira_svg?: string;
}

export interface GameData {
  id: number;
  time_casa: Team | null;
  time_fora: Team | null;
  gol_casa: number | null;
  gol_fora: number | null;
  encerrado: boolean;
  data_hora: string;
}

export interface PhaseData {
  id: number;
  nome: string;
  ordem: number;
  total_esperado: number;
  jogos: GameData[];
}

// ─── Game card ────────────────────────────────────────────────────────────────
function BracketCard({ game }: { game: GameData | null }) {
  if (!game) {
    return (
      <div
        className="border border-dashed border-white/15 rounded-lg flex items-center justify-center"
        style={{ width: CARD_W, height: CARD_H }}
      >
        <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
          A definir
        </span>
      </div>
    );
  }

  const { time_casa, time_fora, gol_casa, gol_fora, encerrado } = game;

  const winner =
    encerrado && gol_casa !== null && gol_fora !== null
      ? gol_casa > gol_fora
        ? "casa"
        : gol_fora > gol_casa
        ? "fora"
        : "draw"
      : null;

  const rowBase = "flex items-center justify-between px-2.5 py-1.5";
  const rowH = CARD_H / 2; // 36px each row

  return (
    <div
      className={`rounded-lg overflow-hidden border backdrop-blur-sm ${
        encerrado
          ? "border-white/25 shadow-[0_0_12px_rgba(0,0,0,0.6)]"
          : "border-white/10"
      }`}
      style={{
        width: CARD_W,
        height: CARD_H,
        background: encerrado
          ? "rgba(0,0,0,0.75)"
          : "rgba(15,23,42,0.85)",
      }}
    >
      {/* Time casa */}
      <div
        className={`${rowBase} border-b border-white/5 ${
          winner === "casa" ? "bg-emerald-900/30" : ""
        }`}
        style={{ height: rowH }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          {time_casa?.bandeira_svg ? (
            <div
              className="w-5 h-3.5 flex-shrink-0 rounded-[2px] overflow-hidden"
              dangerouslySetInnerHTML={{ __html: time_casa.bandeira_svg }}
            />
          ) : (
            <div className="w-5 h-3.5 flex-shrink-0 rounded-[2px] bg-slate-700" />
          )}
          <span
            className={`text-[11px] font-bold truncate ${
              winner === "casa" ? "text-white" : "text-slate-300"
            }`}
          >
            {time_casa?.sigla ?? "?"}
          </span>
        </div>
        <span
          className={`text-sm font-black ml-2 tabular-nums ${
            winner === "casa" ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          {encerrado ? (gol_casa ?? "–") : "–"}
        </span>
      </div>

      {/* Time fora */}
      <div
        className={`${rowBase} ${winner === "fora" ? "bg-emerald-900/30" : ""}`}
        style={{ height: rowH }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
          {time_fora?.bandeira_svg ? (
            <div
              className="w-5 h-3.5 flex-shrink-0 rounded-[2px] overflow-hidden"
              dangerouslySetInnerHTML={{ __html: time_fora.bandeira_svg }}
            />
          ) : (
            <div className="w-5 h-3.5 flex-shrink-0 rounded-[2px] bg-slate-700" />
          )}
          <span
            className={`text-[11px] font-bold truncate ${
              winner === "fora" ? "text-white" : "text-slate-300"
            }`}
          >
            {time_fora?.sigla ?? "?"}
          </span>
        </div>
        <span
          className={`text-sm font-black ml-2 tabular-nums ${
            winner === "fora" ? "text-emerald-400" : "text-slate-500"
          }`}
        >
          {encerrado ? (gol_fora ?? "–") : "–"}
        </span>
      </div>
    </div>
  );
}

// ─── SVG connector lines ──────────────────────────────────────────────────────
const LINE_COLOR = "#1e3a5f"; // deep blue, visible on dark bg
const LINE_W = 1.5;

/**
 * For round fromR (left half), generate SVG paths connecting each pair of
 * child-games to their parent in toR = fromR + 1.
 */
function makeLeftConnectors(): JSX.Element[] {
  const els: JSX.Element[] = [];

  for (let fromR = 0; fromR <= 2; fromR++) {
    const toR = fromR + 1;
    const pairsCount = HALF_GAMES >> (fromR + 1); // 4, 2, 1

    const childRightX = LX[fromR] + CARD_W;
    const parentLeftX = LX[toR];
    const midX = (childRightX + parentLeftX) / 2;

    for (let i = 0; i < pairsCount; i++) {
      const c1 = cy(fromR, i * 2);
      const c2 = cy(fromR, i * 2 + 1);
      const cp = cy(toR, i);

      els.push(
        <path
          key={`lc-${fromR}-${i}`}
          d={`
            M ${childRightX} ${c1} H ${midX}
            M ${midX} ${c1} V ${c2}
            M ${childRightX} ${c2} H ${midX}
            M ${midX} ${cp} H ${parentLeftX}
          `}
          stroke={LINE_COLOR}
          strokeWidth={LINE_W}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
  }

  // Semi-L → Final
  const semiRightX = LX[3] + CARD_W;
  const midToFinal = (semiRightX + FINAL_X) / 2;
  const semiCy = cy(3, 0);
  els.push(
    <path
      key="semi-L-final"
      d={`M ${semiRightX} ${semiCy} H ${midToFinal} M ${midToFinal} ${semiCy} H ${FINAL_X}`}
      stroke={LINE_COLOR}
      strokeWidth={LINE_W}
      fill="none"
      strokeLinecap="round"
    />
  );

  return els;
}

function makeRightConnectors(): JSX.Element[] {
  const els: JSX.Element[] = [];

  // RX[0]=semi-R, RX[1]=quartas-R, RX[2]=oitavas-R, RX[3]=16avos-R
  // Connects from 16avos-R inward: step 0 = 16avos→oitavas (fromRound=0 for y calc)
  for (let step = 0; step <= 2; step++) {
    // fromIdx is the outer (16avos side), toIdx is the inner (semi side)
    const fromIdx = 3 - step;
    const toIdx = fromIdx - 1;
    const r = step; // y formula uses the same r as left half
    const pairsCount = HALF_GAMES >> (step + 1); // 4, 2, 1

    const childLeftX = RX[fromIdx];
    const parentRightX = RX[toIdx] + CARD_W;
    const midX = (childLeftX + parentRightX) / 2;

    for (let i = 0; i < pairsCount; i++) {
      const c1 = cy(r, i * 2);
      const c2 = cy(r, i * 2 + 1);
      const cp = cy(r + 1, i);

      els.push(
        <path
          key={`rc-${step}-${i}`}
          d={`
            M ${childLeftX} ${c1} H ${midX}
            M ${midX} ${c1} V ${c2}
            M ${childLeftX} ${c2} H ${midX}
            M ${midX} ${cp} H ${parentRightX}
          `}
          stroke={LINE_COLOR}
          strokeWidth={LINE_W}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
  }

  // Semi-R → Final (from right)
  const semiLeftX = RX[0]; // 960
  const finalRightX = FINAL_X + CARD_W; // 928
  const midToFinal = (semiLeftX + finalRightX) / 2;
  const semiCy = cy(3, 0);
  els.push(
    <path
      key="semi-R-final"
      d={`M ${semiLeftX} ${semiCy} H ${midToFinal} M ${midToFinal} ${semiCy} H ${finalRightX}`}
      stroke={LINE_COLOR}
      strokeWidth={LINE_W}
      fill="none"
      strokeLinecap="round"
    />
  );

  return els;
}

// ─── Phase label helper ───────────────────────────────────────────────────────
const LABEL_H = 28; // height of the label row above the bracket

function PhaseLabel({
  label,
  x,
  short,
}: {
  label: string;
  x: number;
  short?: string;
}) {
  return (
    <div
      className="absolute text-center"
      style={{ left: x, width: CARD_W, top: 0 }}
    >
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
        {short ?? label}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlayoffBracket({ phases }: { phases: PhaseData[] }) {
  const getGames = (nome: string): GameData[] =>
    phases.find((p) => p.nome === nome)?.jogos ?? [];

  const getGame = (nome: string, idx: number): GameData | null =>
    getGames(nome)[idx] ?? null;

  // Absolute card renderer
  const card = (
    game: GameData | null,
    x: number,
    centerY: number,
    key: string
  ) => (
    <div
      key={key}
      className="absolute"
      style={{ left: x, top: centerY - CARD_H / 2 }}
    >
      <BracketCard game={game} />
    </div>
  );

  // ─ Left half cards
  const leftCards = [
    // 16 avos (slots 0-7)
    ...Array.from({ length: 8 }, (_, p) =>
      card(getGame("16 avos de final", p), LX[0], cy(0, p), `16L-${p}`)
    ),
    // Oitavas (slots 0-3)
    ...Array.from({ length: 4 }, (_, p) =>
      card(getGame("Oitavas de final", p), LX[1], cy(1, p), `OitL-${p}`)
    ),
    // Quartas (slots 0-1)
    ...Array.from({ length: 2 }, (_, p) =>
      card(getGame("Quartas de final", p), LX[2], cy(2, p), `QrtL-${p}`)
    ),
    // Semi (slot 0)
    card(getGame("Semifinal", 0), LX[3], cy(3, 0), "SemiL"),
  ];

  // ─ Right half cards (16avos slots 8-15, oitavas 4-7, quartas 2-3, semi 1)
  const rightCards = [
    ...Array.from({ length: 8 }, (_, p) =>
      card(getGame("16 avos de final", 8 + p), RX[3], cy(0, p), `16R-${p}`)
    ),
    ...Array.from({ length: 4 }, (_, p) =>
      card(getGame("Oitavas de final", 4 + p), RX[2], cy(1, p), `OitR-${p}`)
    ),
    ...Array.from({ length: 2 }, (_, p) =>
      card(getGame("Quartas de final", 2 + p), RX[1], cy(2, p), `QrtR-${p}`)
    ),
    card(getGame("Semifinal", 1), RX[0], cy(3, 0), "SemiR"),
  ];

  // ─ Centre column (Final + 3rd place)
  const finalCy = cy(3, 0); // 320
  const thirdCy = finalCy + CARD_H + 28; // 420

  const leftConnectors = makeLeftConnectors();
  const rightConnectors = makeRightConnectors();

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <div className="relative" style={{ width: TOTAL_W, paddingTop: LABEL_H }}>
        {/* ── Phase labels ── */}
        <PhaseLabel label="16 Avos" x={LX[0]} />
        <PhaseLabel label="Oitavas" x={LX[1]} />
        <PhaseLabel label="Quartas" x={LX[2]} />
        <PhaseLabel label="Semi" x={LX[3]} />
        <PhaseLabel label="Final" x={FINAL_X} />
        <PhaseLabel label="Semi" x={RX[0]} />
        <PhaseLabel label="Quartas" x={RX[1]} />
        <PhaseLabel label="Oitavas" x={RX[2]} />
        <PhaseLabel label="16 Avos" x={RX[3]} />

        {/* ── Bracket area ── */}
        <div
          className="relative"
          style={{ height: BRACKET_H + 40 }}
        >
          {/* SVG connector lines */}
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            width={TOTAL_W}
            height={BRACKET_H + 40}
          >
            {leftConnectors}
            {rightConnectors}
          </svg>

          {/* Left half game cards */}
          {leftCards}

          {/* Right half game cards */}
          {rightCards}

          {/* ── Final ── */}
          <div
            className="absolute"
            style={{ left: FINAL_X, top: finalCy - CARD_H / 2 }}
          >
            {/* Trophy indicator */}
            <div className="text-center mb-1">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                🏆 Final
              </span>
            </div>
            <BracketCard game={getGame("Final", 0)} />
          </div>

          {/* ── 3rd Place ── */}
          {thirdCy + CARD_H / 2 <= BRACKET_H + 40 && (
            <div
              className="absolute"
              style={{ left: FINAL_X, top: thirdCy - CARD_H / 2 + 16 }}
            >
              <div className="text-center mb-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  🥉 3º Lugar
                </span>
              </div>
              <BracketCard game={getGame("Terceiro Lugar", 0)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
