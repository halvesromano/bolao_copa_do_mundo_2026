"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Users, Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { MatchCard } from "@/components/MatchCard";

interface Grupo {
  id: number;
  nome: string;
}

interface UsuarioRanking {
  usuario_id: number;
  username: string;
}

interface Jogo {
  id: number;
  time_casa: any;
  time_fora: any;
  data_hora: string;
  fase: any;
  encerrado: boolean;
  gol_casa: number;
  gol_fora: number;
}

export default function PalpitesGaleraPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(null);
  
  const [modo, setModo] = useState<"usuario" | "jogo" | "bonus">("usuario");
  
  const [usuarios, setUsuarios] = useState<UsuarioRanking[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<number | null>(null);
  
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [jogoSelecionado, setJogoSelecionado] = useState<number | null>(null);
  
  const [palpites, setPalpites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { token, user } = useAuthStore();

  // 1. Carregar grupos
  useEffect(() => {
    if (token) {
      api.get("/grupos/").then((res) => {
        setGrupos(res.data);
        if (res.data.length > 0) {
          setGrupoSelecionado(res.data[0]);
        } else {
          setLoading(false);
        }
      }).catch(console.error);
    }
  }, [token]);

  // 2. Carregar membros do grupo e jogos encerrados
  useEffect(() => {
    if (grupoSelecionado) {
      // Membros do grupo (usando o endpoint de ranking)
      api.get(`/grupos/${grupoSelecionado.id}/ranking/`).then((res) => {
        setUsuarios(res.data);
        if (res.data.length > 0) {
          setUsuarioSelecionado(res.data[0].usuario_id);
        }
      });
      
      // Jogos cujos prazos de palpites já expiraram (1 minuto antes do jogo) ou encerrados
      api.get(`/jogos/`).then((res) => {
        const agora = Date.now();
        const expiradosOuEncerrados = res.data.filter((j: Jogo) => {
          const limite = new Date(j.data_hora).getTime() - 60000;
          return j.encerrado || agora > limite;
        });
        setJogos(expiradosOuEncerrados);
        if (expiradosOuEncerrados.length > 0) {
          setJogoSelecionado(expiradosOuEncerrados[0].id);
        }
      });
    }
  }, [grupoSelecionado]);

  // 3. Buscar os palpites dependendo do modo
  useEffect(() => {
    const fetchPalpites = async () => {
      if (!grupoSelecionado) return;
      
      setLoading(true);
      try {
        let url = "";
        if (modo === "usuario" && usuarioSelecionado) {
          url = `/grupos/${grupoSelecionado.id}/palpites_galera/?usuario_id=${usuarioSelecionado}`;
        } else if (modo === "jogo" && jogoSelecionado) {
          url = `/grupos/${grupoSelecionado.id}/palpites_galera/?jogo_id=${jogoSelecionado}`;
        } else if (modo === "bonus") {
          url = `/grupos/${grupoSelecionado.id}/palpites_bonus/`;
        } else {
          setLoading(false);
          return; // Faltando parâmetros
        }
        
        const res = await api.get(url);
        setPalpites(res.data);
      } catch (err) {
        console.error("Erro ao buscar palpites da galera", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPalpites();
  }, [grupoSelecionado, modo, usuarioSelecionado, jogoSelecionado]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="relative pt-10 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-full mb-4 border border-purple-500/30 backdrop-blur-sm"
          >
            <Eye className="text-purple-400 w-8 h-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-300 to-purple-600 tracking-tight"
          >
            Palpites da Galera
          </motion.h1>
          <p className="text-slate-400 mt-2 max-w-lg mx-auto text-sm">
            Descubra os palpites dos participantes assim que o prazo de apostas do jogo se encerra.
          </p>
        </div>
      </header>

      <section className="container mx-auto px-4 max-w-5xl mt-6">
        {grupos.length === 0 && !loading ? (
          <div className="text-center py-10 text-slate-500 bg-white/5 rounded-2xl border border-white/10 mb-6">
            Você não participa de nenhum grupo.{" "}
            <Link href="/grupos" className="text-purple-400 hover:underline">Entre ou crie um grupo.</Link>
          </div>
        ) : (
          <>
            {/* Seletor de Grupo */}
            {grupos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4 justify-center">
                {grupos.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGrupoSelecionado(g)}
                    className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                      grupoSelecionado?.id === g.id
                        ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {g.nome}
                  </button>
                ))}
              </div>
            )}

            {/* Alternador de Modo (Usuário / Jogo / Bônus) */}
            <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6 max-w-2xl mx-auto">
              <button
                onClick={() => setModo("usuario")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  modo === "usuario" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" /> Por Usuário
              </button>
              <button
                onClick={() => setModo("jogo")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  modo === "jogo" ? "bg-wc-cyan text-black shadow-lg" : "text-slate-400 hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4" /> Por Jogo
              </button>
              <button
                onClick={() => setModo("bonus")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  modo === "bonus" ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                }`}
              >
                <Trophy className="w-4 h-4" /> Palpite Bônus
              </button>
            </div>

            {/* Filtro Secundário (Dropdown de Usuário ou Jogo) */}
            {modo !== "bonus" && (
              <div className="mb-8 flex justify-center">
                {modo === "usuario" && usuarios.length > 0 && (
                  <div className="relative w-full max-w-xs">
                    <select
                      className="w-full appearance-none bg-black/50 border border-white/20 text-white py-3 px-4 rounded-xl font-semibold outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      value={usuarioSelecionado || ""}
                      onChange={(e) => setUsuarioSelecionado(Number(e.target.value))}
                    >
                      {usuarios.map(u => (
                        <option key={u.usuario_id} value={u.usuario_id}>
                          {u.username} {user?.id === u.usuario_id && "(Você)"}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                )}

                {modo === "jogo" && jogos.length > 0 && (
                  <div className="relative w-full max-w-sm">
                    <select
                      className="w-full appearance-none bg-black/50 border border-white/20 text-white py-3 px-4 rounded-xl font-semibold outline-none focus:border-wc-cyan focus:ring-1 focus:ring-wc-cyan transition-all"
                      value={jogoSelecionado || ""}
                      onChange={(e) => setJogoSelecionado(Number(e.target.value))}
                    >
                      {jogos.map(j => (
                        <option key={j.id} value={j.id}>
                          {j.time_casa.sigla} x {j.time_fora.sigla} ({j.fase.nome})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                )}
                
                {modo === "jogo" && jogos.length === 0 && (
                  <p className="text-slate-400">Nenhum jogo teve o prazo de palpites encerrado ainda.</p>
                )}
              </div>
            )}

            {/* Listagem de Palpites */}
            {loading ? (
              <div className="text-center text-slate-400 py-20 flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Buscando palpites...</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/40 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        {modo === "usuario" && (
                          <>
                            <th className="px-6 py-4">Jogo</th>
                            <th className="px-6 py-4">Data / Fase</th>
                            <th className="px-6 py-4 text-center">Palpite</th>
                            <th className="px-6 py-4 text-center">Palpitado em</th>
                            <th className="px-6 py-4 text-center">Placar Real</th>
                            <th className="px-6 py-4 text-center">Pontos</th>
                          </>
                        )}
                        {modo === "jogo" && (
                          <>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4 text-center">Palpite</th>
                            <th className="px-6 py-4 text-center">Palpitado em</th>
                            <th className="px-6 py-4 text-center">Placar Real</th>
                            <th className="px-6 py-4 text-center">Pontos</th>
                          </>
                        )}
                        {modo === "bonus" && (
                          <>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Time Campeão</th>
                            <th className="px-6 py-4 text-center">Pontos Bônus</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {palpites.length > 0 ? (
                        palpites.map((palpite) => (
                          <tr key={modo === "bonus" ? palpite.usuario_id : palpite.id} className="hover:bg-white/5 transition-colors">
                            {modo === "usuario" && (
                              <>
                                <td className="px-6 py-4 font-bold text-white">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      <div dangerouslySetInnerHTML={{ __html: palpite.jogo.time_casa.bandeira_svg }} className="w-6 h-4 flex items-center justify-center rounded overflow-hidden shadow-sm" />
                                      <span>{palpite.jogo.time_casa.sigla}</span>
                                    </div>
                                    <span className="text-slate-500 text-[10px] px-1">X</span>
                                    <div className="flex items-center gap-2">
                                      <div dangerouslySetInnerHTML={{ __html: palpite.jogo.time_fora.bandeira_svg }} className="w-6 h-4 flex items-center justify-center rounded overflow-hidden shadow-sm" />
                                      <span>{palpite.jogo.time_fora.sigla}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                  <div className="font-bold text-[10px] text-wc-cyan uppercase tracking-wider">{palpite.jogo.fase.nome}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {new Date(palpite.jogo.data_hora).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-block bg-black/40 px-4 py-2 rounded-xl border border-white/10 font-black text-white text-lg tracking-widest shadow-inner">
                                    {palpite.gol_casa} - {palpite.gol_fora}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-slate-400">
                                  {new Date(palpite.atualizado_em).toLocaleString("pt-BR", {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-block bg-black/40 px-4 py-2 rounded-xl border border-white/5 font-black text-wc-cyan text-lg tracking-widest opacity-80">
                                    {palpite.jogo.encerrado ? `${palpite.jogo.gol_casa} - ${palpite.jogo.gol_fora}` : "—"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center font-black">
                                  {palpite.jogo.encerrado ? (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs shadow-sm ${
                                      palpite.pontos >= 7 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : 
                                      palpite.pontos > 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                                      "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    }`}>
                                      +{palpite.pontos} pts
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium text-xs">Aguardando</span>
                                  )}
                                </td>
                              </>
                            )}

                            {modo === "jogo" && (
                              <>
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-sm">
                                    {palpite.usuario.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-base">{palpite.usuario.username}</span>
                                  {user?.id === palpite.usuario.id && <span className="ml-2 text-[10px] bg-wc-cyan/20 text-wc-cyan border border-wc-cyan/30 px-2 py-0.5 rounded-full font-bold">VOCÊ</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-block bg-black/40 px-4 py-2 rounded-xl border border-white/10 font-black text-white text-lg tracking-widest shadow-inner">
                                    {palpite.gol_casa} - {palpite.gol_fora}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center text-xs text-slate-400">
                                  {new Date(palpite.atualizado_em).toLocaleString("pt-BR", {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="inline-block bg-black/40 px-4 py-2 rounded-xl border border-white/5 font-black text-wc-cyan text-lg tracking-widest opacity-80">
                                    {palpite.jogo.encerrado ? `${palpite.jogo.gol_casa} - ${palpite.jogo.gol_fora}` : "—"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center font-black">
                                  {palpite.jogo.encerrado ? (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs shadow-sm ${
                                      palpite.pontos >= 7 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" : 
                                      palpite.pontos > 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                                      "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    }`}>
                                      +{palpite.pontos} pts
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium text-xs">Aguardando</span>
                                  )}
                                </td>
                              </>
                            )}

                            {modo === "bonus" && (
                              <>
                                <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30 shadow-sm">
                                    {palpite.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-base">{palpite.username}</span>
                                  {user?.id === palpite.usuario_id && <span className="ml-2 text-[10px] bg-wc-cyan/20 text-wc-cyan border border-wc-cyan/30 px-2 py-0.5 rounded-full font-bold">VOCÊ</span>}
                                </td>
                                <td className="px-6 py-4 text-slate-300">
                                  {palpite.time ? (
                                    <div className="flex items-center gap-3">
                                      <div dangerouslySetInnerHTML={{ __html: palpite.time.bandeira_svg }} className="w-6 h-4 flex items-center justify-center rounded overflow-hidden shadow-sm" />
                                      <span className="font-semibold text-white">{palpite.time.nome} ({palpite.time.sigla})</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-500 italic">Sem palpite bônus</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center font-black">
                                  {palpite.time ? (
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs shadow-sm ${
                                      palpite.pontos_bonus > 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold" : 
                                      "bg-white/5 text-slate-400 border border-white/10"
                                    }`}>
                                      +{palpite.pontos_bonus} pts
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium text-xs">—</span>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={modo === "usuario" ? 6 : modo === "jogo" ? 5 : 3} className="px-6 py-12 text-center text-slate-500 bg-white/5">
                            Nenhum palpite encontrado para esse filtro.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
