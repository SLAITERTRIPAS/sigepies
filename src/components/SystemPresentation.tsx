import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Database,
  Lock,
  Cpu,
  LogIn,
  Globe,
  FolderArchive,
} from "lucide-react";
import SigepLogo from "./SigepLogo";
import { getSystemLogo } from "../lib/logoService";
import { firestoreService } from "../lib/firestoreService";

interface SystemPresentationProps {
  onContinue: () => void;
}

export default function SystemPresentation({ onContinue }: SystemPresentationProps) {
  const [time, setTime] = useState<Date>(new Date());
  const [systemLogo, setSystemLogo] = useState<string | null>(() => getSystemLogo());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      setSystemLogo(e?.detail?.logo !== undefined ? e.detail.logo : getSystemLogo());
    };
    window.addEventListener("sigep_system_logo_updated", handleLogoUpdate);

    let unsub: (() => void) | undefined;
    try {
      unsub = firestoreService.config.subscribe("main_config", (data) => {
        if (data && data.systemLogo !== undefined) {
          setSystemLogo(data.systemLogo || null);
        }
      });
    } catch (e) {
      // Ignorar falha silenciosamente
    }

    return () => {
      window.removeEventListener("sigep_system_logo_updated", handleLogoUpdate);
      if (unsub) unsub();
    };
  }, []);

  // Formatação de data em Português
  const dayOfWeek = time.toLocaleDateString("pt-PT", { weekday: "long" });
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  const timeString = time.toLocaleTimeString("pt-PT", { hour12: false });
  const dateString = time.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      id="sigep-cover-fixed"
      className="min-h-full h-full w-full bg-[#04092b] text-white flex flex-col justify-between font-serif relative overflow-x-hidden cursor-default select-none"
    >
      {/* Background patterns & Imagem Tecnológica do SIGEP */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="https://media.gettyimages.com/id/2155090853/pt/foto/datalake-big-data-warehouse-data-lake-platform-analytics-technology.jpg?s=612x612&w=0&k=20&c=862Mekqm-P_C-whyov3D9oTQ_IWw7fYXvA4zkL3MtR4="
          alt="SIGEP Big Data Background"
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04092b] via-[#04092b]/85 to-[#04092b]/70"></div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      </div>

      {/* Barra de Topo */}
      <div className="relative z-20 w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b border-white/10 bg-[#030722]/60 backdrop-blur-sm">
        {/* Lado Esquerdo: Mini Logo SIGEP transparente sem moldura rígida */}
        <div className="flex flex-col items-start justify-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-transparent overflow-hidden">
            {systemLogo ? (
              <img
                src={systemLogo}
                alt="Logotipo SIGEP"
                className="w-full h-full object-contain filter drop-shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <SigepLogo size="sm" showText={false} animated={true} />
            )}
          </div>
          <span className="text-[9px] text-slate-300 font-sans tracking-wide leading-none mt-1">
            Gestão de Processos
          </span>
        </div>

        {/* Centro: Relógio Digital com Borda Dourada */}
        <div className="border border-amber-400/60 rounded-xl px-5 sm:px-7 py-1.5 bg-[#040826]/90 backdrop-blur-md text-center shadow-lg">
          <div className="text-[11px] font-bold text-amber-400 tracking-wider">
            {capitalizedDay}
          </div>
          <div className="text-base sm:text-lg font-black tracking-widest text-white font-mono leading-tight">
            {timeString}
          </div>
          <div className="text-[10px] text-slate-300 tracking-wide font-sans">
            {dateString}
          </div>
        </div>

        {/* Lado Direito: Status do Sistema */}
        <div className="flex items-center gap-2 bg-[#040826]/80 border border-white/15 rounded-full px-3.5 py-1.5 shadow">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-sans font-bold text-slate-200">
            Sistema
          </span>
        </div>
      </div>

      {/* Conteúdo Central Limpo */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto w-full text-center">
        {/* Logotipo Central Completo do SIGEP em destaque */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 flex items-center justify-center overflow-hidden">
            {systemLogo ? (
              <img
                src={systemLogo}
                alt="Logotipo SIGEP"
                className="w-full h-full object-contain filter drop-shadow-2xl rounded-3xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <SigepLogo size="xl" isDark={true} animated={true} />
            )}
          </div>
        </motion.div>

        {/* 3 Cartões de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mb-8">
          <div className="bg-[#07113a]/60 backdrop-blur-md border border-blue-900/40 p-5 sm:p-6 rounded-2xl text-left shadow-lg">
            <div className="w-9 h-9 bg-amber-400 text-[#050b38] rounded-lg flex items-center justify-center mb-3">
              <Cpu size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 font-sans">
              Inteligência Integrada
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
              Processamento de dados institucionais com arquitetura de 9 blocos operacionais.
            </p>
          </div>

          <div className="bg-[#07113a]/60 backdrop-blur-md border border-blue-900/40 p-5 sm:p-6 rounded-2xl text-left shadow-lg">
            <div className="w-9 h-9 bg-amber-400 text-[#050b38] rounded-lg flex items-center justify-center mb-3">
              <Database size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 font-sans">
              Dados Centralizados
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
              Fonte única de verdade para RH, Património, Finanças e Académico.
            </p>
          </div>

          <div className="bg-[#07113a]/60 backdrop-blur-md border border-blue-900/40 p-5 sm:p-6 rounded-2xl text-left shadow-lg">
            <div className="w-9 h-9 bg-amber-400 text-[#050b38] rounded-lg flex items-center justify-center mb-3">
              <Lock size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5 font-sans">
              Segurança Máxima
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
              Autenticação multi-papel e conformidade normativa rigorosa.
            </p>
          </div>
        </div>

        {/* Botão Dourado de Entrada no Sistema */}
        <div className="flex flex-col items-center gap-4">
          <button
            id="btn-entrar-sistema"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
            className="px-8 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#050b38] rounded-full font-bold text-sm tracking-wide shadow-xl flex items-center gap-2.5 transition-all cursor-pointer"
          >
            <LogIn size={18} strokeWidth={2.5} />
            <span>Entrar no Sistema</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          {/* Rodapé Limpo: SIGEP - MOÇAMBIQUE • V1.1.2.0 */}
          <div className="flex items-center justify-center gap-6 text-[11px] font-sans text-slate-400 tracking-wider uppercase mt-3">
            <span className="flex items-center gap-1.5">
              <Globe size={13} />
              SIGEP - MOÇAMBIQUE
            </span>
            <span className="flex items-center gap-1.5">
              <FolderArchive size={13} />
              V1.1.2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
