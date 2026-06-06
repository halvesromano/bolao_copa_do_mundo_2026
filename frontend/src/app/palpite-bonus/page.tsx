"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Lock, CheckCircle, Trophy } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

interface Time {
  id: number;
  nome: string;
  sigla: string;
  bandeira_svg: string;
}

function Countdown({ deadline }: { deadline: Date }) {
  const [diff, setDiff] = useState(deadline.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setDiff(deadline.getTime() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (diff <= 0) return null;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-3 text-center mt-4">
      {[{ v: d, l: "dias" }, { v: h, l: "horas" }, { v: m, l: "min" }, { v: s, l: "seg" }].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center bg-black/40 border border-white/10 rounded-xl px-4 py-3 min-w-[64px]">
          <span className="text-2xl font-black text-yellow-400 tabular-nums">{pad(v)}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function PalpiteBonusPage() {
  const { token, user } = useAuthStore();
  const [times, setTimes] = useState<Time[]>([]);
  const [timeSelecionado, setTimeSelecionado] = useState<number | null>(null);
  const [palpiteAtual, setPalpiteAtual] = useState<{ time: Time; pontos_bonus: number } | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [campeaoDefinido, setCampeaoDefinido] = useState<{ time: Time } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const isExpired = deadline ? Date.now() > deadline.getTime() : false;

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [resTimes, resDeadline, resResultado] = await Promise.all([
          api.get("/times/"),
          api.get("/palpite-campeao/deadline/"),
          api.get("/palpite-campeao/resultado/"),
        ]);
        setTimes(resTimes.data);
        if (resDeadline.data.deadline) setDeadline(new Date(resDeadline.data.deadline));
        if (resResultado.data.definido) setCampeaoDefinido({ time: resResultado.data.time_campeao });

        if (token) {
          const resPalpite = await api.get("/palpite-campeao/");
          if (resPalpite.data.palpite) {
            setPalpiteAtual(resPalpite.data.palpite);
            setTimeSelecionado(resPalpite.data.palpite.time.id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSalvar = async () => {
    if (!timeSelecionado) return;
    setSaving(true);
    try {
      const res = await api.post("/palpite-campeao/", { time_id: timeSelecionado });
      setPalpiteAtual(res.data.palpite);
      showToast("success", "Palpite bônus salvo! 🎉");
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Erro ao salvar palpite.";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  };

  const timeAtual = times.find((t) => t.id === timeSelecionado);

  return (
    <div className="min-h-screen pb-24">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 ${
              toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative pt-10 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/60 via-amber-900/30 to-transparent z-0" />
        {/* Estrelinhas decorativas */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60"
            style={{ top: `${10 + Math.random() * 60}%`, left: `${5 + (i * 8)}%` }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-yellow-500/20 rounded-full mb-4 border border-yellow-500/40 backdrop-blur-sm shadow-[0_0_30px_rgba(234,179,8,0.3)]"
          >
            <Star className="text-yellow-400 w-9 h-9 fill-yellow-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-600 tracking-tight"
          >
            Palpite Bônus
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 mt-2 max-w-lg mx-auto text-sm"
          >
            Quem será o <span className="text-yellow-400 font-bold">Campeão da Copa do Mundo 2026</span>?
            Acerte e ganhe <span className="text-yellow-400 font-bold">25 pontos bônus</span>!
          </motion.p>

          {/* Countdown */}
          {deadline && !isExpired && (
            <div className="mt-4">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Prazo para palpitar</p>
              <Countdown deadline={deadline} />
            </div>
          )}

          {isExpired && (
            <div className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500/20 border border-rose-500/30 rounded-full text-rose-400 font-bold text-sm">
              <Lock className="w-4 h-4" /> Palpites Encerrados
            </div>
          )}
        </div>
      </header>

      <section className="container mx-auto px-4 max-w-4xl">
        {!token ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <Star className="w-10 h-10 text-yellow-400 mx-auto mb-3 fill-yellow-400/30" />
            <p className="text-slate-300 font-semibold">Faça login para registrar seu palpite bônus.</p>
            <Link href="/login" className="mt-4 inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-full transition-all">
              Entrar
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-24 gap-3 text-slate-400">
            <div className="w-7 h-7 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <>
            {/* Campeão já definido */}
            {campeaoDefinido && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-gradient-to-r from-yellow-900/40 to-amber-900/30 border border-yellow-500/30 rounded-2xl p-6 flex items-center gap-6"
              >
                <Trophy className="w-10 h-10 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest mb-1">🏆 Campeão Definido</p>
                  <p className="text-2xl font-black text-white">{campeaoDefinido.time.nome}</p>
                  {palpiteAtual?.time.id === campeaoDefinido.time.id ? (
                    <p className="text-emerald-400 font-bold text-sm mt-1">🎉 Você acertou! +25 pontos bônus</p>
                  ) : palpiteAtual ? (
                    <p className="text-rose-400 text-sm mt-1">Você palpitou em {palpiteAtual.time.nome}</p>
                  ) : (
                    <p className="text-slate-400 text-sm mt-1">Você não registrou palpite bônus</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Palpite atual em destaque */}
            {palpiteAtual && !campeaoDefinido && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex items-center gap-4"
              >
                <CheckCircle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-yellow-500 uppercase tracking-widest font-bold">Seu palpite atual</p>
                  <p className="text-white font-bold text-lg">{palpiteAtual.time.nome}</p>
                  {!isExpired && <p className="text-slate-400 text-xs mt-0.5">Você pode alterar até o prazo encerrar.</p>}
                </div>
              </motion.div>
            )}

            {/* Grid de Times */}
            {!isExpired && !campeaoDefinido && (
              <>
                <h2 className="text-base font-bold text-slate-300 mb-4">
                  {palpiteAtual ? "Alterar palpite — escolha o campeão:" : "Escolha o campeão:"}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                  {times.map((time) => {
                    const selected = timeSelecionado === time.id;
                    return (
                      <motion.button
                        key={time.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setTimeSelecionado(time.id)}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                          selected
                            ? "bg-yellow-500/20 border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.25)]"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {selected && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-black" />
                          </div>
                        )}
                        {time.bandeira_svg ? (
                          <div
                            className="w-14 h-9 rounded overflow-hidden bg-slate-800 shadow-sm flex-shrink-0"
                            style={{ lineHeight: 0 }}
                            dangerouslySetInnerHTML={{
                              __html: time.bandeira_svg.replace(
                                /<svg /,
                                '<svg width="100%" height="100%" style="display:block;" '
                              ),
                            }}
                          />
                        ) : (
                          <div className="w-14 h-9 rounded bg-slate-700 flex-shrink-0" />
                        )}
                        <span className={`font-bold text-sm text-center leading-tight ${selected ? "text-yellow-300" : "text-slate-200"}`}>
                          {time.nome}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{time.sigla}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Botão salvar */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSalvar}
                    disabled={!timeSelecionado || saving}
                    className="px-10 py-3.5 rounded-full font-black text-black bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:shadow-[0_0_30px_rgba(234,179,8,0.6)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Star className="w-5 h-5 fill-black" />
                    )}
                    {palpiteAtual ? "Atualizar Palpite Bônus" : "Confirmar Palpite Bônus"}
                  </motion.button>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
