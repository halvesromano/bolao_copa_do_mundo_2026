"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    username: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      setErrorMsg("As senhas não coincidem!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.post("/users/", {
        username: formData.username,
        email: formData.email,
        first_name: formData.nome,
        last_name: formData.sobrenome,
        password: formData.senha
      });
      setSuccessMsg("Cadastro realizado! Aguardando aprovação do administrador.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setErrorMsg("Erro ao realizar cadastro. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-wc-blue/40 to-black z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg z-10"
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
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Crie sua conta
            </CardTitle>
            <CardDescription className="text-slate-400">
              Junte-se ao Bolão da Copa 2026
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
            <form onSubmit={handleCadastro} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-300">Nome</Label>
                  <Input 
                    id="nome" 
                    placeholder="João" 
                    required 
                    value={formData.nome}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sobrenome" className="text-slate-300">Sobrenome</Label>
                  <Input 
                    id="sobrenome" 
                    placeholder="Silva" 
                    required 
                    value={formData.sobrenome}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Usuário</Label>
                <Input 
                  id="username" 
                  placeholder="joaosilva123" 
                  required 
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="joao@exemplo.com" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senha" className="text-slate-300">Senha</Label>
                  <Input 
                    id="senha" 
                    type="password" 
                    required 
                    value={formData.senha}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha" className="text-slate-300">Confirmar Senha</Label>
                  <Input 
                    id="confirmarSenha" 
                    type="password" 
                    required 
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white focus:border-wc-cyan transition-colors h-11"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-wc-red hover:bg-wc-darkred text-white font-bold rounded-xl mt-6 transition-all"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Criar Conta
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-white/10 pt-6">
            <p className="text-sm text-slate-400">
              Já possui uma conta?{" "}
              <Link href="/login" className="text-wc-cyan hover:text-wc-cyan/80 font-medium transition-colors">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
