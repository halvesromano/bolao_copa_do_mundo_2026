"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, ArrowLeft, Crown, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface RankingUser {
  posicao: number;
  usuario_id: number;
  username: string;
  pontos: number;
  is_criador: boolean;
}

interface Grupo {
  id: number;
  nome: string;
  codigo: string;
  criador: string;
  total_membros: number;
  is_criador: boolean;
}

export default function RankingGrupoPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    const fetchData = async () => {
      try {
        const [grupoRes, rankingRes] = await Promise.all([
          api.get(`/grupos/${params.id}/`),
          api.get(`/grupos/${params.id}/ranking/`)
        ]);
        setGrupo(grupoRes.data);
        setRanking(rankingRes.data);
      } catch (err) {
        console.error("Erro ao carregar dados do grupo", err);
        router.push("/grupos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, params.id]);

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
      <header className="relative pt-8 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/40 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/grupos" className="inline-flex items-center gap-2 text-wc-cyan hover:text-white transition-colors mb-6 font-medium">
            <ArrowLeft className="w-4 h-4" /> Meus Grupos
          </Link>
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center p-3 bg-yellow-500/20 rounded-full mb-4 border border-yellow-500/30 backdrop-blur-sm"
            >
              <Trophy className="text-yellow-400 w-8 h-8" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold text-white tracking-tight"
            >
              {loading ? "..." : grupo?.nome}
            </motion.h1>
            {grupo && (
              <p className="text-slate-400 mt-2 flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> {grupo.total_membros} membros
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 mt-4 max-w-3xl">
        {loading ? (
          <div className="text-center text-slate-400 py-20">Carregando...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {ranking.map((jogador, index) => {
              const isCurrentUser = user && user.username === jogador.username;
              return (
                <motion.div
                  key={jogador.usuario_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${getPositionStyle(jogador.posicao)} ${isCurrentUser ? 'ring-2 ring-wc-cyan' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 border border-white/5">
                      {getMedalIcon(jogador.posicao)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        {jogador.username}
                        {jogador.is_criador && <Crown className="w-4 h-4 text-yellow-400" title="Criador do grupo" />}
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
            {ranking.length === 0 && (
              <div className="text-center py-20 text-slate-500 bg-white/5 rounded-2xl border border-white/10">
                Nenhum ponto registrado neste grupo ainda.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
