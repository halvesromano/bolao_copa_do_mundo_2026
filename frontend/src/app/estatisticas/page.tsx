"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Snowflake, Globe, Users, PieChart } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface EstatisticaUser {
  usuario_id: number;
  username: string;
  quantidade: number;
}

interface Grupo {
  id: number;
  nome: string;
}

export default function EstatisticasPage() {
  const [topExatos, setTopExatos] = useState<EstatisticaUser[]>([]);
  const [topZerados, setTopZerados] = useState<EstatisticaUser[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(null);
  const [aba, setAba] = useState<"global" | "grupo">("global");
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      api.get("/grupos/").then((res) => {
        setGrupos(res.data);
        if (res.data.length > 0) {
          setGrupoSelecionado(res.data[0]);
        }
      }).catch(console.error);
    }
  }, [token]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let url = "/estatisticas/";
        if (aba === "grupo") {
          if (grupoSelecionado) {
            url += `?grupo_id=${grupoSelecionado.id}`;
          } else {
            setLoading(false);
            return;
          }
        }
        
        const res = await api.get(url);
        setTopExatos(res.data.top_exatos || []);
        setTopZerados(res.data.top_zerados || []);
      } catch (err) {
        console.error("Erro ao carregar estatísticas", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [aba, grupoSelecionado]);

  const getPositionStyle = (index: number, type: "exato" | "zerado") => {
    if (index === 0) {
      return type === "exato" 
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
        : "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]";
    }
    return "bg-white/5 text-slate-400 border-white/10";
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="relative pt-10 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wc-blue/60 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center p-3 bg-wc-cyan/20 rounded-full mb-4 border border-wc-cyan/30 backdrop-blur-sm"
            >
              <PieChart className="text-wc-cyan w-8 h-8" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-wc-cyan to-wc-blue tracking-tight"
            >
              Estatísticas
            </motion.h1>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 max-w-5xl">
        {/* Seletor de Aba: Global / Grupo */}
        <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6 max-w-3xl mx-auto">
          <button
            onClick={() => setAba("global")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              aba === "global" ? "bg-wc-blue text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-4 h-4" /> Global
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

        {/* Seletor de Grupo */}
        {aba === "grupo" && grupos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4 max-w-3xl mx-auto">
            {grupos.map((g) => (
              <button
                key={g.id}
                onClick={() => setGrupoSelecionado(g)}
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
          <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-white/10 mb-6 max-w-3xl mx-auto">
            Você não participa de nenhum grupo ainda.{" "}
            <Link href="/grupos" className="text-wc-cyan hover:underline">Criar ou entrar em um grupo.</Link>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-20">Carregando estatísticas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Coluna Placar Exato */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-200 mb-4 bg-black/40 p-4 rounded-xl border border-yellow-500/20 shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-400" /> Reis do Placar Exato 🎯
              </h2>
              <div className="flex flex-col gap-3">
                {topExatos.length > 0 ? (
                  topExatos.map((jogador, index) => {
                    const isCurrentUser = user && user.username === jogador.username;
                    return (
                      <motion.div
                        key={jogador.usuario_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all ${getPositionStyle(index, "exato")} ${isCurrentUser ? 'ring-2 ring-wc-cyan' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-bold text-lg opacity-80 w-6 text-center">
                            {index + 1}º
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                              {jogador.username}
                              {isCurrentUser && <span className="text-xs bg-wc-cyan text-black px-2 py-0.5 rounded-full">Você</span>}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-yellow-400">{jogador.quantidade}</div>
                          <div className="text-[10px] uppercase tracking-widest opacity-70 font-semibold">Cravadas</div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-white/10">
                    Ninguém acertou um placar em cheio ainda.
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Zerados */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-200 mb-4 bg-black/40 p-4 rounded-xl border border-blue-500/20 shadow-lg">
                <Snowflake className="w-6 h-6 text-blue-400" /> Mais Zerados 🥶
              </h2>
              <div className="flex flex-col gap-3">
                {topZerados.length > 0 ? (
                  topZerados.map((jogador, index) => {
                    const isCurrentUser = user && user.username === jogador.username;
                    return (
                      <motion.div
                        key={jogador.usuario_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`flex items-center justify-between p-4 rounded-2xl border backdrop-blur-sm transition-all ${getPositionStyle(index, "zerado")} ${isCurrentUser ? 'ring-2 ring-rose-400' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-bold text-lg opacity-80 w-6 text-center">
                            {index + 1}º
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                              {jogador.username}
                              {isCurrentUser && <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">Você</span>}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-blue-400">{jogador.quantidade}</div>
                          <div className="text-[10px] uppercase tracking-widest opacity-70 font-semibold">Zeros</div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-white/10">
                    Sem registros de quem não pontuou.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
