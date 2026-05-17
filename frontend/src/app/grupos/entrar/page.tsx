"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Trophy } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EntrarGrupoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [codigo, setCodigo] = useState(searchParams.get("codigo") || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push(`/login?redirect=/grupos/entrar?codigo=${codigo}`);
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await api.post("/grupos/entrar/", { codigo: codigo.trim().toUpperCase() });
      setSuccessMsg("Você entrou no grupo! Redirecionando...");
      setTimeout(() => router.push("/grupos"), 2000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Código inválido. Verifique e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-wc-blue/40 to-black z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <Link href="/">
            <div className="p-3 bg-wc-blue/40 rounded-full border border-wc-cyan/30 backdrop-blur-sm hover:bg-wc-blue/60 transition-colors">
              <Trophy className="text-wc-cyan w-10 h-10" />
            </div>
          </Link>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">Entrar em um Grupo</CardTitle>
            <CardDescription className="text-slate-400">
              Cole o código de convite que você recebeu para entrar na disputa!
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-wc-darkred/50 border border-wc-red text-white text-sm text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-wc-green/50 border border-emerald-400 text-white text-sm text-center">
                {successMsg}
              </div>
            )}
            <form onSubmit={handleEntrar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-slate-300">Código de Convite</Label>
                <Input
                  id="codigo"
                  placeholder="Ex: ABC12345"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-white focus:border-wc-cyan h-12 text-center font-mono text-xl tracking-[0.3em]"
                  maxLength={8}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || codigo.length < 8}
                className="w-full h-12 bg-wc-red hover:bg-wc-darkred text-white font-bold rounded-xl transition-all"
              >
                {loading ? "Entrando..." : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" /> Entrar no Grupo
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
