"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchCard } from "@/components/MatchCard";
import { Trophy, Calendar } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const GRUPOS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [matches, setMatches] = useState<any[]>([]);
  const [palpites, setPalpites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugError, setDebugError] = useState<string | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Usa timestamp para burlar o cache agressivo do navegador
        const resJogos = await api.get(`/jogos/?t=${new Date().getTime()}`);
        console.log("Jogos da API:", resJogos.data);
        setMatches(resJogos.data);

        if (token) {
          const resPalpites = await api.get("/palpites/");
          setPalpites(resPalpites.data);
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados", err);
        setDebugError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Filtra os jogos pelo grupo selecionado
  const filteredMatches = matches.filter((m) => m.fase?.nome === `Grupo ${selectedGroup}`);

  const handlePalpite = async (matchId: number, golCasa: number, golFora: number) => {
    if (!token) {
      alert("Você precisa estar logado para palpitar!");
      return;
    }
    try {
      // Verifica se já existe palpite para atualizar
      const palpiteExistente = palpites.find(p => p.jogo.id === matchId);
      if (palpiteExistente) {
        await api.put(`/palpites/${palpiteExistente.id}/`, {
          jogo_id: matchId,
          gol_casa: golCasa,
          gol_fora: golFora
        });
      } else {
        await api.post("/palpites/", {
          jogo_id: matchId,
          gol_casa: golCasa,
          gol_fora: golFora
        });
      }
      // Recarrega os palpites
      const resPalpites = await api.get("/palpites/");
      setPalpites(resPalpites.data);
      alert("Palpite salvo com sucesso!");
    } catch (err) {
      alert("Erro ao salvar palpite.");
    }
  };

  return (
    <div className="min-h-screen pb-20">
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

      {/* Navegação de Grupos (A até L) */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex items-center md:justify-center gap-2 md:gap-3 overflow-x-auto md:flex-wrap pb-4 scrollbar-hide snap-x">
          {GRUPOS.map((grupo) => {
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
        </div>
      </section>

      {/* Lista de Jogos */}
      <section className="container mx-auto px-4 mt-8 mb-16">
        <div className="flex items-center gap-2 mb-6 text-slate-300">
          <Calendar className="w-5 h-5 text-wc-cyan" />
          <h2 className="text-xl font-bold">Jogos do Grupo {selectedGroup}</h2>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-wc-cyan border-t-transparent rounded-full animate-spin"></div>
            <p>Carregando jogos da Copa...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredMatches.length > 0 ? (
              filteredMatches.map((match, index) => {
                const palpiteFeito = palpites.find(p => p.jogo.id === match.id);
                return (
                  <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <MatchCard
                      id={match.id}
                      timeCasa={match.time_casa}
                      timeFora={match.time_fora}
                      dataHora={match.data_hora}
                      fase={match.fase.nome}
                      golCasa={palpiteFeito ? palpiteFeito.gol_casa : null}
                      golFora={palpiteFeito ? palpiteFeito.gol_fora : null}
                      onPalpiteSubmit={handlePalpite}
                    />
                  </motion.div>
                );
              })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-20 text-slate-500 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-4"
                >
                  <p>Nenhum jogo encontrado para este grupo.</p>
                  <div className="bg-black/50 p-4 rounded text-left text-xs overflow-auto max-h-40">
                    <strong>DEBUG INFO:</strong><br/>
                    Total matches na API: {matches.length}<br/>
                    {debugError && <div className="text-red-400 mt-2">Error: {debugError}</div>}
                    {matches.length > 0 && (
                      <>Primeiro jogo fase: {JSON.stringify(matches[0].fase)}</>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
