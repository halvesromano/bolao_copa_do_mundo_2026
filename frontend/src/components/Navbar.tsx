"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Medal, Users, UserCircle, LogOut,
  KeyRound, ChevronDown, Menu, X
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function Navbar() {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "Jogos", icon: <Trophy className="w-4 h-4" /> },
    { href: "/ranking", label: "Ranking", icon: <Medal className="w-4 h-4" /> },
    ...(token ? [{ href: "/grupos", label: "Grupos", icon: <Users className="w-4 h-4" /> }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-white">
          <div className="p-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600 drop-shadow-sm">
            Bolão Copa 2026
          </span>
        </Link>

        {/* Links Centrais — Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-wc-blue/60 text-wc-cyan border border-wc-cyan/30"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>

        {/* Área do Usuário — Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all text-sm font-medium"
              >
                <UserCircle className="w-5 h-5 text-wc-cyan" />
                <span className="max-w-[100px] truncate">{user?.username?.split(" ")[0]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                  >
                    <Link
                      href="/conta"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                      <KeyRound className="w-4 h-4 text-wc-cyan" /> Alterar Senha
                    </Link>
                    <div className="border-t border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-bold text-wc-cyan hover:text-white border border-wc-cyan/30 hover:border-wc-cyan/60 transition-all"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="px-4 py-2 rounded-full text-sm font-bold bg-wc-red hover:bg-wc-darkred text-white transition-all"
              >
                Cadastre-se
              </Link>
            </div>
          )}
        </div>

        {/* Botão Hambúrguer — Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-wc-blue/40 text-wc-cyan"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.icon} {link.label}
                  </Link>
                );
              })}

              <div className="border-t border-white/10 my-2" />

              {token ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-slate-400 text-sm">
                    <UserCircle className="w-5 h-5 text-wc-cyan" />
                    <span className="font-medium text-white truncate">{user?.username?.split(" ")[0]}</span>
                  </div>
                  <Link
                    href="/conta"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <KeyRound className="w-4 h-4 text-wc-cyan" /> Alterar Senha
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="text-center px-4 py-2.5 rounded-xl text-sm font-bold text-wc-cyan border border-wc-cyan/30 hover:bg-wc-cyan/10 transition-all"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    onClick={() => setMenuOpen(false)}
                    className="text-center px-4 py-2.5 rounded-xl text-sm font-bold bg-wc-red hover:bg-wc-darkred text-white transition-all"
                  >
                    Cadastre-se
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
