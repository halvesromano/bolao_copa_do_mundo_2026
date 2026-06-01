"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TableProperties } from "lucide-react";
import api from "@/lib/api";
import { useDragScroll } from "@/hooks/useDragScroll";

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

export default function TabelaPage() {
  const [grupoSelecionado, setGrupoSelecionado] = useState("A");
  const [times, setTimes] = useState<TimeTabela[]>([]);
  const [loading, setLoading] = useState(true);
  const dragScroll = useDragScroll();

  useEffect(() => {
    const fetchTabela = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/tabela/?grupo=${grupoSelecionado}`);
        setTimes(res.data.times || []);
      } catch (err) {
        console.error("Erro ao carregar tabela", err);
        setTimes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTabela();
  }, [grupoSelecionado]);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="relative pt-10 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-emerald-500/20 rounded-full mb-4 border border-emerald-500/30 backdrop-blur-sm"
          >
            <TableProperties className="text-emerald-400 w-8 h-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-300 to-emerald-600 tracking-tight"
          >
            Tabela de Grupos
          </motion.h1>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm">
            Classificação atualizada automaticamente conforme os jogos são encerrados.
          </p>
        </div>
      </header>

      <section className="container mx-auto px-4 max-w-4xl">
        {/* Seletor de Grupo */}
        <div
          ref={dragScroll.ref}
          onMouseDown={dragScroll.onMouseDown}
          onMouseLeave={dragScroll.onMouseLeave}
          onMouseUp={dragScroll.onMouseUp}
          onMouseMove={dragScroll.onMouseMove}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 mb-8 cursor-grab select-none"
        >
          {GRUPOS.map((g) => (
            <button
              key={g}
              onClick={() => setGrupoSelecionado(g)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
                grupoSelecionado === g
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              Grupo {g}
            </button>
          ))}
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-6 text-xs text-slate-500 mb-3 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Classificados
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" /> 3º Lugar (repescagem)
          </span>
        </div>

        {/* Tabela */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400"
            >
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p>Carregando tabela...</p>
            </motion.div>
          ) : times.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-slate-500 bg-white/5 rounded-2xl border border-white/10"
            >
              Nenhum time encontrado para o Grupo {grupoSelecionado}. Os jogos desse grupo ainda não foram cadastrados.
            </motion.div>
          ) : (
            <motion.div
              key={grupoSelecionado}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl"
            >
              {/* Header da tabela */}
              <div className="bg-black/60 px-6 py-4 border-b border-white/10">
                <h2 className="text-base font-extrabold text-white tracking-wide uppercase">
                  Grupo {grupoSelecionado}
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
                    {times.map((time, idx) => (
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
                    ))}
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
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
