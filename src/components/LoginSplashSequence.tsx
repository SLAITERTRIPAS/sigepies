import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle2, ShieldCheck, User, Building, Briefcase, Compass } from "lucide-react";
import { isSuperBossUser } from "../lib/auth";

interface LoginSplashSequenceProps {
  user: any;
  instituicao?: any;
  onComplete: () => void;
}

export const LoginSplashSequence: React.FC<LoginSplashSequenceProps> = ({
  user,
  instituicao,
  onComplete,
}) => {
  // Passos: 1 = Ano Atual, 2 = Logótipo Institucional, 3 = Bem-vindo com Dados do Utilizador
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [progress, setProgress] = useState(0);

  // Ano atual dinâmico (ex: 2026)
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Identificação do utilizador
  const isSuperAdmin = useMemo(() => {
    return isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema";
  }, [user]);

  const realUserName = useMemo(() => {
    return (
      user?.nomeReal ||
      user?.nomeCompleto ||
      user?.nome ||
      user?.name ||
      user?.displayName ||
      (isSuperAdmin ? "Slaiter Tripas" : "Utilizador Autorizado")
    );
  }, [user, isSuperAdmin]);

  const realUserCargo = useMemo(() => {
    return (
      user?.cargoChefia ||
      user?.cargo ||
      user?.funcao ||
      user?.title ||
      user?.categoria ||
      (isSuperAdmin ? "Programador e Desenvolvedor do SIGEP" : "Colaborador Institucional")
    );
  }, [user, isSuperAdmin]);

  const realUserDirecao = useMemo(() => {
    return (
      user?.direcao ||
      user?.unidadeOrganica ||
      user?.orgao ||
      user?.departamento ||
      user?.unidade ||
      user?.areaDeAfetacao ||
      (isSuperAdmin ? "Proprietário / Administração Geral" : "Direção Institucional")
    );
  }, [user, isSuperAdmin]);

  // Identificação da Instituição
  const instSigla = useMemo(() => {
    if (isSuperAdmin) return "";
    return instituicao?.sigla || instituicao?.abreviatura || user?.instituicaoSigla || "ISPS";
  }, [isSuperAdmin, instituicao, user]);

  const instNome = useMemo(() => {
    if (isSuperAdmin) return "SIGEP";
    return (
      instituicao?.nome ||
      user?.instituicaoNome ||
      "Instituto Superior Politécnico de Songo"
    );
  }, [isSuperAdmin, instituicao, user]);

  // Logótipo a exibir no Passo 2
  const instLogoUrl = useMemo(() => {
    if (isSuperAdmin) {
      return localStorage.getItem("systemLogo") || "/sigep-logo.svg";
    }
    const candidate =
      instituicao?.logo ||
      instituicao?.logotipo ||
      user?.instituicaoLogo ||
      user?.instituicaoLogotipo;

    if (candidate && !candidate.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad")) {
      return candidate;
    }

    if (instSigla.toUpperCase().includes("ISPS") || instNome.toLowerCase().includes("songo")) {
      return "/isps-logo.svg";
    }

    return "/sigep-logo.svg";
  }, [isSuperAdmin, instituicao, user, instSigla, instNome]);

  // Temporizador total de 5.2 segundos (distribuído entre os 3 passos)
  useEffect(() => {
    const totalDuration = 5200; // 5.2s
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentPct = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setProgress(currentPct);

      // Transição entre passos
      if (elapsed < 1600) {
        setStep(1);
      } else if (elapsed < 3200) {
        setStep(2);
      } else {
        setStep(3);
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 200);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999999] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex flex-col items-center justify-center p-4 sm:p-8 select-none overflow-hidden font-sans">
      {/* Botão discreto para avançar de imediato se o utilizador desejar */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer backdrop-blur-sm border border-slate-200/50"
        title="Pular apresentação e entrar de imediato"
      >
        <span>Avançar</span>
        <ArrowRight size={13} />
      </button>

      {/* Container de Animação com troca fluida de passos */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[500px] relative">
        <AnimatePresence mode="wait">
          {/* ======================================================== */}
          {/* PÁGINA 1: ANO ATUAL (Ex: 2026) + CÍRCULO COLORIDO       */}
          {/* ======================================================== */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              {/* Grande número do ano atual em azul real elegante (conforme Imagem 1) */}
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-[#1A3673] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] select-none">
                {currentYear}
              </h1>

              {/* Anel de carregamento colorido giratório (conforme Imagem 1) */}
              <div className="my-8 relative w-12 h-12 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full animate-spin"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #3b82f6, #ef4444, #f59e0b, #10b981, #3b82f6)",
                    maskImage: "radial-gradient(circle, transparent 60%, black 63%)",
                    WebkitMaskImage: "radial-gradient(circle, transparent 60%, black 63%)",
                  }}
                />
              </div>

              {/* Texto espaçado "P R O C E S S A N D O . . ." */}
              <p className="text-xs sm:text-sm font-black tracking-[0.55em] text-[#3B82F6] uppercase opacity-90 pl-2">
                P R O C E S S A N D O . . .
              </p>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 2: LOGÓTIPO DA INSTITUIÇÃO EMOLDURADO + NOME       */}
          {/* ======================================================== */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.03, y: -15 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center w-full px-4"
            >
              {/* Card emoldurado em azul com o logótipo (conforme Imagem 2) */}
              <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-3xl bg-white border-[2.5px] border-[#1A3673] shadow-[0_12px_36px_rgba(26,54,115,0.14)] p-6 flex items-center justify-center relative overflow-hidden transition-all">
                <img
                  src={instLogoUrl}
                  alt={instNome}
                  className="w-full h-full object-contain filter drop-shadow-md select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/sigep-logo.svg";
                  }}
                />
              </div>

              {/* Nome oficial da instituição em letras azuis fortes */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1A3673] tracking-wide uppercase mt-8 max-w-2xl leading-tight drop-shadow-sm">
                {instNome}
              </h2>

              {/* Traço de destaque horizontal laranja (conforme Imagem 2) */}
              <div className="w-24 sm:w-28 h-1.5 bg-[#FF6600] rounded-full mx-auto mt-4 shadow-sm" />
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* PÁGINA 3: BEM-VINDO A SIGEP-(SIGLA) + DADOS DO UTILIZADOR */}
          {/* ======================================================== */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="flex flex-col items-center justify-center text-center w-full max-w-3xl px-4"
            >
              {/* Título Principal (conforme Imagem 3) */}
              <div className="flex flex-col items-center">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-[#1A3673] tracking-tight uppercase drop-shadow-sm leading-none">
                  BEM-VINDO A
                </h1>

                {/* SIGEP-ISPS em laranja 3D vibrante com relevo (conforme Imagem 3) */}
                <div className="relative mt-2">
                  <h2
                    className="text-5xl sm:text-7xl md:text-8xl font-black text-[#FF5500] tracking-tight uppercase leading-none select-none"
                    style={{
                      textShadow:
                        "2px 2px 0px #C2410C, 4px 4px 0px #9A3412, 6px 6px 12px rgba(194,65,12,0.35)",
                    }}
                  >
                    {isSuperAdmin
                      ? "SIGEP"
                      : instSigla
                      ? `SIGEP-${instSigla.toUpperCase()}`
                      : "SIGEP"}
                  </h2>
                </div>

                {/* Subtítulo espaçado em letras maiúsculas (conforme Imagem 3) */}
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-500 tracking-[0.35em] sm:tracking-[0.45em] uppercase text-center mt-3 max-w-2xl pl-2">
                  {isSuperAdmin
                    ? "SISTEMA INTELIGENTE DE GESTÃO DE PROCESSOS"
                    : `SISTEMA INTEGRADO DE GESTÃO DE PROCESSOS ${instSigla ? instSigla.toUpperCase() : ""}`}
                </p>
              </div>

              {/* Informações detalhadas do utilizador logado (especificação explícita do utilizador) */}
              <div className="w-full mt-7 bg-white/95 rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-left backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome do Utilizador */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="p-2 rounded-lg bg-blue-100 text-[#1A3673] shrink-0 mt-0.5">
                      <User size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Nome do Utilizador
                      </span>
                      <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {realUserName}
                      </p>
                    </div>
                  </div>

                  {/* Cargo */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="p-2 rounded-lg bg-orange-100 text-[#FF5500] shrink-0 mt-0.5">
                      <Briefcase size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Cargo
                      </span>
                      <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {realUserCargo}
                      </p>
                    </div>
                  </div>

                  {/* Direção */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                      <Compass size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Direção
                      </span>
                      <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {realUserDirecao}
                      </p>
                    </div>
                  </div>

                  {/* Instituição */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                      <Building size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Instituição
                      </span>
                      <p className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {instNome}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado do carregamento com barra multicolor e percentagem até 100% */}
              <div className="w-full mt-6 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 mb-2 px-1">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-ping" />
                    Estado: A carregar o ambiente de trabalho...
                  </span>
                  <span className="font-mono text-sm font-black text-[#1A3673]">
                    {progress}%
                  </span>
                </div>

                {/* Barra de progresso vibrante (conforme Imagem 3) */}
                <div className="w-full h-2.5 sm:h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 25%, #ef4444 50%, #f97316 75%, #10b981 100%)",
                    }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicadores inferiores dos 3 passos (Página 1, 2, 3) */}
      <div className="absolute bottom-6 flex items-center gap-2.5">
        {[1, 2, 3].map((stepIdx) => (
          <div
            key={stepIdx}
            className={`h-2 rounded-full transition-all duration-300 ${
              step === stepIdx
                ? "w-8 bg-[#1A3673]"
                : step > stepIdx
                ? "w-2.5 bg-emerald-500"
                : "w-2.5 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginSplashSequence;
