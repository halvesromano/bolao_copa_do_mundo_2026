"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await api.post("/token/", { username, password });
      setAuth(response.data.access, response.data.refresh, { username });
      router.push("/");
    } catch (err: any) {
      setErrorMsg("Credenciais inválidas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-wc-blue/40 to-black z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-wc-blue/40 rounded-full border border-wc-cyan/30 backdrop-blur-sm">
            <Trophy className="text-wc-cyan w-10 h-10" />
          </div>
        </div>
        
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-slate-400">
              Entre para fazer seus palpites e subir no ranking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-wc-darkred/50 border border-wc-red text-white text-sm text-center">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Usuário</Label>
                <Input 
                  id="username" 
                  placeholder="Seu usuário" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-12"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-300">Senha</Label>
                  <Link href="#" className="text-sm font-medium text-wc-cyan hover:text-wc-cyan/80 transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-wc-red hover:bg-wc-darkred text-white font-bold rounded-xl mt-6 transition-all"
                disabled={loading}
              >
                {loading ? "Entrando..." : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" /> Entrar
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/10 pt-6">
            <p className="text-sm text-slate-400">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="text-wc-cyan hover:text-wc-cyan/80 font-medium transition-colors">
                Cadastre-se aqui
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
