"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Users, Globe, Info, Star } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface RankingUser {
  posicao: number;
  usuario_id: number;
  username: string;
  pontos: number;
  is_criador?: boolean;
}

interface Grupo {
  id: number;
  nome: string;
  total_membros: number;
}

export default function RankingPage() {
  const [rankingGlobal, setRankingGlobal] = useState<RankingUser[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [rankingGrupo, setRankingGrupo] = useState<RankingUser[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(null);
  const [aba, setAba] = useState<"global" | "grupo">("global");
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const globalRes = await api.get("/ranking/");
        setRankingGlobal(globalRes.data);

        if (token) {
          const gruposRes = await api.get("/grupos/");
          setGrupos(gruposRes.data);
          if (gruposRes.data.length > 0) {
            const primeiroGrupo = gruposRes.data[0];
            setGrupoSelecionado(primeiroGrupo);
            const rankingRes = await api.get(`/grupos/${primeiroGrupo.id}/ranking/`);
            setRankingGrupo(rankingRes.data);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar ranking", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleSelecionarGrupo = async (grupo: Grupo) => {
    setGrupoSelecionado(grupo);
    try {
      const rankingRes = await api.get(`/grupos/${grupo.id}/ranking/`);
      setRankingGrupo(rankingRes.data);
    } catch (err) {
      console.error("Erro ao carregar ranking do grupo", err);
    }
  };

  const rankingExibido = aba === "global" ? rankingGlobal : rankingGrupo;

  const getPositionStyle = (posicao: number) => {
    if (posicao === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
    if (posicao === 2) return "bg-slate-300/20 text-slate-300 border-slate-300/50 shadow-[0_0_15px_rgba(203,213,225,0.2)]";
    if (posicao === 3) return "bg-amber-700/20 text-amber-500 border-amber-700/50 shadow-[0_0_15px_rgba(180,83,9,0.2)]";
    return "bg-white/5 text-slate-400 border-white/10";
  };

  const getMedalIcon = (posicao: number) => {
    if (posicao === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (posicao === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (posicao === 3) return <Medal className="w-5 h-5 text-amber-500" />;
    return <span className="font-bold text-sm">{posicao}º</span>;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="relative pt-10 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wc-darkred/60 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center p-3 bg-wc-red/20 rounded-full mb-4 border border-wc-red/30 backdrop-blur-sm"
            >
              <Trophy className="text-wc-red w-8 h-8" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-wc-cyan to-wc-blue tracking-tight"
            >
              Ranking
            </motion.h1>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 max-w-3xl">
        {/* Regras de Pontuação */}
        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5">
          <h2 className="flex items-center gap-2 font-bold text-slate-200 mb-3">
            <Info className="w-5 h-5 text-wc-cyan" /> Regras de Pontuação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <h3 className="text-white font-bold mb-2">Fase de Grupos</h3>
              <ul className="space-y-2">
                <li className="flex justify-between"><span>Placar Exato 🎯</span><span className="text-wc-cyan font-bold">+7 pts</span></li>
                <li className="flex justify-between"><span>Acertar Vencedor/Empate ✅</span><span className="text-wc-cyan font-bold">+2 pts</span></li>
                <li className="flex justify-between"><span>Acertar Gols de 1 Time ⚽</span><span className="text-wc-cyan font-bold">+1 pt</span></li>
              </ul>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-white/5">
              <h3 className="text-white font-bold mb-2">Mata-mata</h3>
              <ul className="space-y-2">
                <li className="flex justify-between"><span>Placar Exato 🎯</span><span className="text-wc-cyan font-bold">+10 pts</span></li>
                <li className="flex justify-between"><span>Acertar Vencedor/Empate ✅</span><span className="text-wc-cyan font-bold">+3 pts</span></li>
                <li className="flex justify-between"><span>Acertar Gols de 1 Time ⚽</span><span className="text-wc-cyan font-bold">+1 pt</span></li>
              </ul>
            </div>
          </div>
          {/* Palpite Bônus */}
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center justify-between text-sm">
            <span className="text-slate-300 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
              Palpite Bônus — Acertar o Campeão da Copa
            </span>
            <span className="text-yellow-400 font-black ml-3 whitespace-nowrap">+25 pts</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">
            * Os pontos por vencedor e gols não são cumulativos se o placar exato for acertado.
          </p>
        </div>

        {/* Seletor de Aba: Global / Grupo */}
        <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
          <button
            onClick={() => setAba("global")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              aba === "global" ? "bg-wc-blue text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" /> Ranking Global
          </button>
          <button
            onClick={() => setAba("grupo")}
            disabled={grupos.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              aba === "grupo" ? "bg-wc-red text-white shadow-lg" : "text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <Users className="w-4 h-4" /> Meu Grupo
          </button>
        </div>

        {/* Seletor de Grupo (quando aba = grupo) */}
        {aba === "grupo" && grupos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
            {grupos.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSelecionarGrupo(g)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  grupoSelecionado?.id === g.id
                    ? "bg-wc-red text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {g.nome}
              </button>
            ))}
          </div>
        )}

        {aba === "grupo" && grupos.length === 0 && (
          <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-white/10 mb-6">
            Você não participa de nenhum grupo ainda.{" "}
            <Link href="/grupos" className="text-wc-cyan hover:underline">Criar ou entrar em um grupo.</Link>
          </div>
        )}

        {/* Lista do Ranking */}
        {loading ? (
          <div className="text-center text-slate-400 py-20">Carregando classificação...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {aba === "grupo" && grupoSelecionado && (
              <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-wc-cyan" />
                Ranking do grupo <span className="text-white font-bold">{grupoSelecionado.nome}</span>
              </p>
            )}
            {rankingExibido.map((jogador, index) => {
              const isCurrentUser = user && user.username === jogador.username;
              return (
                <motion.div
                  key={jogador.usuario_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all ${getPositionStyle(jogador.posicao)} ${isCurrentUser ? 'ring-2 ring-wc-cyan' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 border border-white/5">
                      {getMedalIcon(jogador.posicao)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        {jogador.username}
                        {isCurrentUser && <span className="text-xs bg-wc-cyan text-black px-2 py-0.5 rounded-full">Você</span>}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{jogador.pontos}</div>
                    <div className="text-xs uppercase tracking-widest opacity-70 font-semibold">Pontos</div>
                  </div>
                </motion.div>
              );
            })}
            {rankingExibido.length === 0 && (
              <div className="text-center py-16 text-slate-500 bg-white/5 rounded-2xl border border-white/10">
                Nenhum ponto registrado ainda.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
