"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchCard } from "@/components/MatchCard";
import { Trophy, Calendar, Layers, Save, CheckCircle, XCircle } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

type GolChange = { golCasa: number | ""; golFora: number | "" };
type Toast = { type: "success" | "error"; message: string };

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [viewAll, setViewAll] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [palpites, setPalpites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<number, GolChange>>({});
  const [toast, setToast] = useState<Toast | null>(null);
  const { token } = useAuthStore();

  const showToast = (type: Toast["type"], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resJogos = await api.get(`/jogos/?t=${new Date().getTime()}`);
        setMatches(resJogos.data);

        if (token) {
          const resPalpites = await api.get("/palpites/");
          setPalpites(resPalpites.data);
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Jogos exibidos conforme o modo (grupo único ou todos)
  const displayedMatches = viewAll
    ? matches
    : matches.filter((m) => m.fase?.nome === `Grupo ${selectedGroup}`);

  const handlePalpite = async (matchId: number, golCasa: number, golFora: number) => {
    if (!token) {
      showToast("error", "Você precisa estar logado para palpitar!");
      return;
    }
    try {
      const palpiteExistente = palpites.find((p) => p.jogo.id === matchId);
      if (palpiteExistente) {
        await api.put(`/palpites/${palpiteExistente.id}/`, {
          jogo_id: matchId,
          gol_casa: golCasa,
          gol_fora: golFora,
        });
      } else {
        await api.post("/palpites/", {
          jogo_id: matchId,
          gol_casa: golCasa,
          gol_fora: golFora,
        });
      }
      const resPalpites = await api.get("/palpites/");
      setPalpites(resPalpites.data);
      showToast("success", "Palpite salvo com sucesso!");
    } catch {
      showToast("error", "Erro ao salvar palpite.");
    }
  };

  // Coleta mudanças dos inputs para o Salvar Todos
  const handleGolChange = useCallback(
    (matchId: number, golCasa: number | "", golFora: number | "") => {
      setPendingChanges((prev) => ({ ...prev, [matchId]: { golCasa, golFora } }));
    },
    []
  );

  // Salvar todos os palpites pendentes de uma vez
  const handleSalvarTodos = async () => {
    if (!token) {
      showToast("error", "Você precisa estar logado para palpitar!");
      return;
    }

    const validos = Object.entries(pendingChanges).filter(
      ([, v]) => v.golCasa !== "" && v.golFora !== ""
    );

    if (validos.length === 0) {
      showToast("error", "Preencha ao menos um placar antes de salvar.");
      return;
    }

    setSavingAll(true);
    let salvos = 0;
    let erros = 0;

    await Promise.allSettled(
      validos.map(async ([matchIdStr, { golCasa, golFora }]) => {
        const matchId = Number(matchIdStr);
        try {
          const palpiteExistente = palpites.find((p) => p.jogo.id === matchId);
          if (palpiteExistente) {
            await api.put(`/palpites/${palpiteExistente.id}/`, {
              jogo_id: matchId,
              gol_casa: golCasa,
              gol_fora: golFora,
            });
          } else {
            await api.post("/palpites/", {
              jogo_id: matchId,
              gol_casa: golCasa,
              gol_fora: golFora,
            });
          }
          salvos++;
        } catch {
          erros++;
        }
      })
    );

    // Recarrega palpites após salvar tudo
    const resPalpites = await api.get("/palpites/");
    setPalpites(resPalpites.data);
    setPendingChanges({});
    setSavingAll(false);

    if (erros === 0) {
      showToast("success", `${salvos} palpite${salvos !== 1 ? "s" : ""} salvo${salvos !== 1 ? "s" : ""} com sucesso!`);
    } else {
      showToast("error", `${salvos} salvo${salvos !== 1 ? "s" : ""}, ${erros} com erro. Tente novamente.`);
    }
  };

  const pendingCount = Object.values(pendingChanges).filter(
    (v) => v.golCasa !== "" && v.golFora !== ""
  ).length;

  return (
    <div className="min-h-screen pb-32">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm ${
              toast.type === "success"
                ? "bg-emerald-500/90 text-white border border-emerald-400/50"
                : "bg-rose-600/90 text-white border border-rose-400/50"
            } backdrop-blur-md`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Hero */}
      <header className="relative pt-10 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wc-blue/60 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-yellow-500/20 rounded-full mb-4 border border-yellow-500/40 backdrop-blur-sm shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          >
            <Trophy className="text-yellow-400 w-8 h-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 tracking-tight drop-shadow-sm"
          >
            Bolão da Copa do Mundo 2026
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 mt-4 max-w-lg mx-auto"
          >
            Faça seus palpites até 1 hora antes de cada jogo e compita pelo topo do ranking global.
          </motion.p>
        </div>
      </header>

      {/* Navegação de Grupos + Toggle "Todos" */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex items-center md:justify-center gap-2 md:gap-3 overflow-x-auto md:flex-wrap pb-4 scrollbar-hide snap-x">
          {/* Botão Todos os Grupos */}
          <button
            onClick={() => setViewAll((v) => !v)}
            className={`snap-start whitespace-nowrap flex items-center gap-1.5 px-5 md:px-6 py-2 rounded-full font-bold transition-all duration-300 border ${
              viewAll
                ? "bg-gradient-to-r from-wc-cyan to-wc-blue text-black border-transparent shadow-[0_0_15px_rgba(0,188,212,0.5)]"
                : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Todos os Grupos
          </button>

          {/* Separador */}
          <span className="text-white/20 font-bold text-lg select-none">|</span>

          {!viewAll &&
            GRUPOS.map((grupo) => {
              const isSelected = selectedGroup === grupo;
              return (
                <button
                  key={grupo}
                  onClick={() => setSelectedGroup(grupo)}
                  className={`snap-start whitespace-nowrap px-5 md:px-6 py-2 rounded-full font-bold transition-all duration-300 border ${
                    isSelected
                      ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black border-transparent shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  Grupo {grupo}
                </button>
              );
            })}

          {viewAll && (
            <span className="text-slate-500 text-sm italic whitespace-nowrap">
              Exibindo todos os {matches.length} jogos
            </span>
          )}
        </div>
      </section>

      {/* Lista de Jogos */}
      <section className="container mx-auto px-4 mt-8 mb-16">
        <div className="flex items-center gap-2 mb-6 text-slate-300">
          <Calendar className="w-5 h-5 text-wc-cyan" />
          <h2 className="text-xl font-bold">
            {viewAll ? "Todos os Jogos da Fase de Grupos" : `Jogos do Grupo ${selectedGroup}`}
          </h2>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-wc-cyan border-t-transparent rounded-full animate-spin"></div>
            <p>Carregando jogos da Copa...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedMatches.length > 0 ? (
                displayedMatches.map((match, index) => {
                  const palpiteFeito = palpites.find((p) => p.jogo.id === match.id);
                  // Extrai a letra do grupo a partir de "Grupo X"
                  const grupoLetra = match.fase?.nome?.replace("Grupo ", "");
                  return (
                    <motion.div
                      key={match.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                    >
                      <MatchCard
                        id={match.id}
                        timeCasa={match.time_casa}
                        timeFora={match.time_fora}
                        dataHora={match.data_hora}
                        fase={match.fase.nome}
                        grupoLabel={viewAll && grupoLetra ? `Gr. ${grupoLetra}` : undefined}
                        golCasa={palpiteFeito ? palpiteFeito.gol_casa : null}
                        golFora={palpiteFeito ? palpiteFeito.gol_fora : null}
                        onPalpiteSubmit={handlePalpite}
                        onGolChange={handleGolChange}
                      />
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-20 text-slate-500 bg-white/5 rounded-2xl border border-white/10"
                >
                  <p>Nenhum jogo encontrado para este grupo.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Barra flutuante "Salvar Todos" */}
      <AnimatePresence>
        {token && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-3 flex justify-center"
            style={{
              background:
                "linear-gradient(to top, rgba(2,6,23,0.95) 60%, transparent)",
            }}
          >
            <button
              onClick={handleSalvarTodos}
              disabled={savingAll || pendingCount === 0}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-base shadow-2xl transition-all duration-300 border ${
                pendingCount > 0 && !savingAll
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-400/30 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95"
                  : "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed"
              }`}
            >
              {savingAll ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Todos
                  {pendingCount > 0 && (
                    <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
