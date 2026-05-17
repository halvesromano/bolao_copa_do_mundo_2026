"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ContaPage() {
  const { token, logout } = useAuthStore();
  const router = useRouter();
  const [showSenhas, setShowSenhas] = useState(false);
  const [form, setForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!token) {
    router.push("/login");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (form.novaSenha !== form.confirmarSenha) {
      setErrorMsg("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (form.novaSenha.length < 6) {
      setErrorMsg("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/conta/alterar-senha/", {
        senha_atual: form.senhaAtual,
        nova_senha: form.novaSenha,
      });
      setSuccessMsg("Senha alterada com sucesso! Faça login novamente.");
      setForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
      // Desloga e redireciona para login após 2 segundos
      setTimeout(() => {
        logout();
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error || "Erro ao alterar senha. Verifique sua senha atual."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-wc-blue/40 rounded-full border border-wc-cyan/30">
                <KeyRound className="text-wc-cyan w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Alterar Senha</CardTitle>
            <CardDescription className="text-slate-400">
              Escolha uma senha forte com pelo menos 6 caracteres.
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual" className="text-slate-300">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={showSenhas ? "text" : "password"}
                    required
                    value={form.senhaAtual}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white focus:border-wc-cyan h-11 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenhas(!showSenhas)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showSenhas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha" className="text-slate-300">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={showSenhas ? "text" : "password"}
                      required
                      value={form.novaSenha}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white focus:border-wc-cyan h-11 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenhas(!showSenhas)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showSenhas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha" className="text-slate-300">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showSenhas ? "text" : "password"}
                      required
                      value={form.confirmarSenha}
                      onChange={handleChange}
                      className={`bg-white/5 border-white/10 text-white focus:border-wc-cyan h-11 pr-10 ${
                        form.confirmarSenha && form.novaSenha !== form.confirmarSenha
                          ? "border-rose-500"
                          : form.confirmarSenha && form.novaSenha === form.confirmarSenha
                          ? "border-emerald-500"
                          : ""
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenhas(!showSenhas)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showSenhas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmarSenha && form.novaSenha !== form.confirmarSenha && (
                    <p className="text-xs text-rose-400">As senhas não coincidem</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !form.senhaAtual || !form.novaSenha || !form.confirmarSenha}
                className="w-full h-11 bg-wc-red hover:bg-wc-darkred text-white font-bold rounded-xl transition-all mt-2"
              >
                {loading ? "Salvando..." : "Alterar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
