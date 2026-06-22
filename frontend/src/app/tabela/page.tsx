"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TableProperties, Layers, Trophy } from "lucide-react";
import api from "@/lib/api";
import PlayoffBracket, { type PhaseData } from "@/components/PlayoffBracket";

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

interface TimeTabela {
  id: number;
  nome: string;
  sigla: string;
  bandeira_svg: string;
  pos: number;
  pj: number;
  v: number;
  e: number;
  d: number;
  gm: number;
  gs: number;
  sg: number;
  pts: number;
}

interface DadosGrupo {
  grupo: string;
  times: TimeTabela[];
}

const posColor = (pos: number) => {
  if (pos === 1 || pos === 2) return "border-l-4 border-emerald-500";
  if (pos === 3) return "border-l-4 border-yellow-500";
  return "border-l-4 border-transparent";
};

const posBadge = (pos: number) => {
  if (pos === 1 || pos === 2)
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  if (pos === 3)
    return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  return "bg-white/5 text-slate-400 border border-white/10";
};

function TabelaGrupo({ dados }: { dados: DadosGrupo }) {
  return (
    <motion.div
      key={dados.grupo}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl"
    >
      {/* Header da tabela */}
      <div className="bg-black/60 px-6 py-4 border-b border-white/10">
        <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
          Grupo {dados.grupo}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-black/40 text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-8">#</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-center" title="Jogos">PJ</th>
              <th className="px-4 py-3 text-center" title="Vitórias">V</th>
              <th className="px-4 py-3 text-center" title="Empates">E</th>
              <th className="px-4 py-3 text-center" title="Derrotas">D</th>
              <th className="px-4 py-3 text-center" title="Gols Marcados">GM</th>
              <th className="px-4 py-3 text-center" title="Gols Sofridos">GS</th>
              <th className="px-4 py-3 text-center" title="Saldo de Gols">SG</th>
              <th className="px-4 py-3 text-center font-bold text-white" title="Pontos">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dados.times.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-slate-500 text-xs">
                  Nenhum jogo cadastrado para este grupo ainda.
                </td>
              </tr>
            ) : (
              dados.times.map((time, idx) => (
                <motion.tr
                  key={time.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`hover:bg-white/5 transition-colors ${posColor(time.pos)}`}
                >
                  {/* Posição */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black ${posBadge(time.pos)}`}>
                      {time.pos}
                    </span>
                  </td>

                  {/* Time */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {time.bandeira_svg ? (
                        <div
                          className="w-8 h-5 rounded overflow-hidden shadow-sm bg-slate-800 flex-shrink-0"
                          dangerouslySetInnerHTML={{ __html: time.bandeira_svg }}
                        />
                      ) : (
                        <div className="w-8 h-5 rounded bg-slate-700 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-white text-sm leading-tight">{time.nome}</p>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider">{time.sigla}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center text-slate-300">{time.pj}</td>
                  <td className="px-4 py-4 text-center text-emerald-400 font-semibold">{time.v}</td>
                  <td className="px-4 py-4 text-center text-slate-300">{time.e}</td>
                  <td className="px-4 py-4 text-center text-rose-400 font-semibold">{time.d}</td>
                  <td className="px-4 py-4 text-center text-slate-300">{time.gm}</td>
                  <td className="px-4 py-4 text-center text-slate-300">{time.gs}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-bold ${time.sg > 0 ? "text-emerald-400" : time.sg < 0 ? "text-rose-400" : "text-slate-400"}`}>
                      {time.sg > 0 ? `+${time.sg}` : time.sg}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-black text-white text-base">{time.pts}</span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legenda de critérios */}
      <div className="bg-black/30 border-t border-white/5 px-6 py-3">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Desempate: 1º Pontos · 2º Saldo de Gols · 3º Gols Marcados · 4º Confronto Direto
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
type ViewMode = "grupo" | "todos" | "playoffs";

export default function TabelaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grupo");
  const [grupoSelecionado, setGrupoSelecionado] = useState("A");
  const [cache, setCache] = useState<Record<string, DadosGrupo>>({});
  const [loading, setLoading] = useState(true);

  // Playoff data
  const [playoffPhases, setPlayoffPhases] = useState<PhaseData[]>([]);
  const [playoffLoading, setPlayoffLoading] = useState(false);

  const fetchGrupo = async (grupo: string): Promise<DadosGrupo | null> => {
    if (cache[grupo]) return cache[grupo];
    try {
      const res = await api.get(`/tabela/?grupo=${grupo}`);
      const dados: DadosGrupo = res.data;
      setCache((prev) => ({ ...prev, [grupo]: dados }));
      return dados;
    } catch {
      return null;
    }
  };

  // Load single group
  useEffect(() => {
    if (viewMode !== "grupo") return;
    setLoading(true);
    fetchGrupo(grupoSelecionado).finally(() => setLoading(false));
  }, [grupoSelecionado, viewMode]);

  // Load all groups
  useEffect(() => {
    if (viewMode !== "todos") return;
    setLoading(true);
    Promise.all(GRUPOS.map(fetchGrupo)).finally(() => setLoading(false));
  }, [viewMode]);

  // Load playoffs
  useEffect(() => {
    if (viewMode !== "playoffs") return;
    if (playoffPhases.length > 0) return; // already loaded
    setPlayoffLoading(true);
    api
      .get("/playoffs/")
      .then((res) => setPlayoffPhases(res.data))
      .catch(console.error)
      .finally(() => setPlayoffLoading(false));
  }, [viewMode]);

  const gruposExibidos =
    viewMode === "todos" ? GRUPOS : viewMode === "grupo" ? [grupoSelecionado] : [];
  const todosCarregados = gruposExibidos.every((g) => !!cache[g]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="relative pt-10 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center justify-center p-3 rounded-full mb-4 border backdrop-blur-sm transition-colors duration-300 ${
              viewMode === "playoffs"
                ? "bg-yellow-500/20 border-yellow-500/30"
                : "bg-emerald-500/20 border-emerald-500/30"
            }`}
          >
            {viewMode === "playoffs" ? (
              <Trophy className="text-yellow-400 w-8 h-8" />
            ) : (
              <TableProperties className="text-emerald-400 w-8 h-8" />
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-300 to-emerald-600 tracking-tight"
          >
            {viewMode === "playoffs" ? "Playoffs" : "Tabela de Grupos"}
          </motion.h1>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm">
            {viewMode === "playoffs"
              ? "Chaveamento do mata-mata — atualizado conforme os resultados chegam."
              : "Classificação atualizada automaticamente conforme os jogos são encerrados."}
          </p>
        </div>
      </header>

      <section className="container mx-auto px-4 max-w-5xl">
        {/* ── Navigation bar ── */}
        <div className="flex items-center md:justify-center gap-2 md:gap-3 overflow-x-auto md:flex-wrap pb-4 mb-6 scrollbar-hide snap-x">
          {/* Playoffs button */}
          <button
            onClick={() => setViewMode("playoffs")}
            className={`snap-start whitespace-nowrap flex items-center gap-1.5 px-5 md:px-6 py-2 rounded-full font-bold transition-all duration-300 border ${
              viewMode === "playoffs"
                ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-transparent shadow-[0_0_16px_rgba(234,179,8,0.45)]"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Playoffs
          </button>

          {/* Separator */}
          <span className="text-white/20 font-bold text-lg select-none">|</span>

          {/* All groups button */}
          <button
            onClick={() =>
              setViewMode((v) => (v === "todos" ? "grupo" : "todos"))
            }
            className={`snap-start whitespace-nowrap flex items-center gap-1.5 px-5 md:px-6 py-2 rounded-full font-bold transition-all duration-300 border ${
              viewMode === "todos"
                ? "bg-gradient-to-r from-wc-cyan to-wc-blue text-black border-transparent shadow-[0_0_15px_rgba(0,188,212,0.5)]"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Todos os Grupos
          </button>

          {/* Separator */}
          <span className="text-white/20 font-bold text-lg select-none">|</span>

          {/* Individual group buttons — hidden in playoffs mode */}
          {viewMode !== "playoffs" && viewMode !== "todos" &&
            GRUPOS.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setViewMode("grupo");
                  setGrupoSelecionado(g);
                }}
                className={`snap-start whitespace-nowrap px-5 md:px-6 py-2 rounded-full font-bold transition-all duration-300 border ${
                  viewMode === "grupo" && grupoSelecionado === g
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                Grupo {g}
              </button>
            ))}

          {viewMode === "todos" && (
            <span className="text-slate-500 text-sm italic whitespace-nowrap">
              Exibindo todos os 12 grupos
            </span>
          )}

          {viewMode === "playoffs" && (
            <span className="text-slate-500 text-sm italic whitespace-nowrap">
              Chaveamento completo
            </span>
          )}
        </div>

        {/* ── Legend (only for group modes) ── */}
        {viewMode !== "playoffs" && (
          <div className="flex items-center gap-6 text-xs text-slate-500 mb-4 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Classificados (1º e 2º)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> 3º Lugar (repescagem)
            </span>
          </div>
        )}

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {viewMode === "playoffs" ? (
            <motion.div
              key="playoffs"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {playoffLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                  <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  <p>Carregando chaveamento...</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl p-4 md:p-6">
                  <PlayoffBracket phases={playoffPhases} />
                </div>
              )}
            </motion.div>
          ) : loading && !todosCarregados ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400"
            >
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p>Carregando tabela{viewMode === "todos" ? "s" : ""}...</p>
            </motion.div>
          ) : (
            <motion.div
              key="groups"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={viewMode === "todos" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-6"}
            >
              {gruposExibidos.map((g) =>
                cache[g] ? (
                  <TabelaGrupo key={g} dados={cache[g]} />
                ) : (
                  <div key={g} className="bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center py-16">
                    <div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
