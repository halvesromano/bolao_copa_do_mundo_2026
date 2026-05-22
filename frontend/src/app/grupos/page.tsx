"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Copy, Check, LogIn, ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Grupo {
  id: number;
  nome: string;
  codigo: string;
  criador: string;
  total_membros: number;
  is_criador: boolean;
  criado_em: string;
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [codigoEntrar, setCodigoEntrar] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEntrar, setLoadingEntrar] = useState(false);
  const [copiado, setCopiado] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchGrupos();
  }, [token]);

  const fetchGrupos = async () => {
    try {
      const res = await api.get("/grupos/");
      setGrupos(res.data);
    } catch (err) {
      console.error("Erro ao carregar grupos", err);
    }
  };

  const handleCriarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeGrupo.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await api.post("/grupos/", { nome: nomeGrupo });
      setNomeGrupo("");
      setSuccessMsg("Grupo criado com sucesso!");
      fetchGrupos();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Erro ao criar grupo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEntrarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoEntrar.trim()) return;
    setLoadingEntrar(true);
    setErrorMsg("");
    try {
      await api.post("/grupos/entrar/", { codigo: codigoEntrar.trim().toUpperCase() });
      setCodigoEntrar("");
      setSuccessMsg("Você entrou no grupo!");
      fetchGrupos();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Código inválido. Tente novamente.");
    } finally {
      setLoadingEntrar(false);
    }
  };

  const handleCopiarLink = (grupo: Grupo) => {
    const link = `${window.location.origin}/grupos/entrar?codigo=${grupo.codigo}`;
    navigator.clipboard.writeText(link);
    setCopiado(grupo.id);
    setTimeout(() => setCopiado(null), 2000);
  };

  const handleSair = async (grupoId: number) => {
    if (!confirm("Tem certeza que deseja sair deste grupo?")) return;
    try {
      await api.post(`/grupos/${grupoId}/sair/`);
      fetchGrupos();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Erro ao sair do grupo.");
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="relative pt-10 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-wc-blue/50 to-transparent z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center p-3 bg-wc-blue/40 rounded-full mb-4 border border-wc-cyan/30 backdrop-blur-sm"
            >
              <Users className="text-wc-cyan w-8 h-8" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-wc-cyan to-wc-blue tracking-tight"
            >
              Meus Grupos
            </motion.h1>
            <p className="text-slate-400 mt-3">Crie um grupo ou entre com um código de convite.</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Mensagens */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-wc-darkred/50 border border-wc-red text-white text-sm text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-wc-green/50 border border-emerald-400 text-white text-sm text-center">
            {successMsg}
          </div>
        )}

        {/* Formulários de Criar / Entrar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Criar Grupo */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-wc-cyan" /> Criar Novo Grupo
              </CardTitle>
              <CardDescription className="text-slate-400">
                Crie um grupo e compartilhe o link com seus amigos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCriarGrupo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeGrupo" className="text-slate-300">Nome do Grupo</Label>
                  <Input
                    id="nomeGrupo"
                    placeholder="Ex: Família Silva"
                    value={nomeGrupo}
                    onChange={(e) => setNomeGrupo(e.target.value)}
                    className="bg-white/5 border-white/10 text-white focus:border-wc-cyan h-11"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !nomeGrupo.trim()}
                  className="w-full bg-wc-blue hover:bg-wc-blue/80 text-white font-bold rounded-xl h-11 transition-all"
                >
                  {loading ? "Criando..." : "Criar Grupo"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Entrar em Grupo */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-wc-cyan" /> Entrar com Código
              </CardTitle>
              <CardDescription className="text-slate-400">
                Recebeu um código ou link de convite? Entre aqui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEntrarGrupo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigoEntrar" className="text-slate-300">Código de Convite</Label>
                  <Input
                    id="codigoEntrar"
                    placeholder="Ex: ABC12345"
                    value={codigoEntrar}
                    onChange={(e) => setCodigoEntrar(e.target.value.toUpperCase())}
                    className="bg-white/5 border-white/10 text-white focus:border-wc-cyan h-11 font-mono tracking-widest"
                    maxLength={8}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loadingEntrar || codigoEntrar.length < 8}
                  className="w-full bg-wc-red hover:bg-wc-darkred text-white font-bold rounded-xl h-11 transition-all"
                >
                  {loadingEntrar ? "Entrando..." : "Entrar no Grupo"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Grupos */}
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-wc-cyan" /> Grupos que Participo ({grupos.length})
        </h2>

        {grupos.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white/5 rounded-2xl border border-white/10">
            Você ainda não participa de nenhum grupo. Crie um ou entre com um código!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grupos.map((grupo, index) => (
              <motion.div
                key={grupo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-wc-cyan/30 transition-all duration-300 shadow-xl rounded-2xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                          {grupo.nome}
                          {grupo.is_criador && <span title="Você é o criador"><Crown className="w-4 h-4 text-yellow-400" /></span>}
                        </h3>
                        <p className="text-slate-400 text-sm">{grupo.total_membros} membro{grupo.total_membros !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="bg-black/40 px-3 py-1.5 rounded-lg font-mono text-wc-cyan text-sm font-bold tracking-widest border border-wc-cyan/20">
                        {grupo.codigo}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleCopiarLink(grupo)}
                        size="sm"
                        className="flex-1 bg-wc-blue/40 hover:bg-wc-blue/60 text-white border border-wc-blue/30 rounded-xl text-xs font-bold transition-all"
                      >
                        {copiado === grupo.id ? (
                          <><Check className="w-3 h-3 mr-1" /> Copiado!</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copiar Link</>
                        )}
                      </Button>
                      <Link href={`/grupos/${grupo.id}`} className="flex-1">
                        <Button
                          size="sm"
                          className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold transition-all"
                        >
                          Ver Ranking
                        </Button>
                      </Link>
                      {!grupo.is_criador && (
                        <Button
                          onClick={() => handleSair(grupo.id)}
                          size="sm"
                          className="bg-wc-darkred/40 hover:bg-wc-red/40 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all px-3"
                        >
                          Sair
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
