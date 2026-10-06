import React, { useState, useEffect } from "react";
import {
  User,
  Maximize2,
  Minimize2,
  Minus,
  Power,
  LogOut,
  ArrowLeft,
  Bell,
  ChevronRight,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Mail,
  MessageSquare,
  AlertCircle,
  Settings,
  Database,
  X,
  RefreshCcw,
  Cpu,
  Sparkles,
  FileText,
  Building,
  Building2,
  ChevronDown,
  Globe,
  UserCog,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NotificationCenter from "../bloco5_sistema/NotificationCenter";
import ChangePasswordModal from "./ChangePasswordModal";
import ShareProcessoModal from "../../components/modals/ShareProcessoModal";
import { toTitleCase as tc, confirmWorkspaceExit } from "../../lib/utils";
import { getRoles, isSuperBossUser, isInstitutionalAdminAccount } from "../../lib/auth";
import { firestoreService } from "../../lib/firestoreService";
import SigepLogo from "../../components/SigepLogo";
import { getActiveInstituicao, getActiveInstituicaoId, setActiveInstituicaoId } from "../../lib/instituicaoEstruturaService";
import { getSystemLogo } from "../../lib/logoService";
import GlobalSearch from "../../components/GlobalSearch";

interface MainHeaderProps {
  user?: any;
  colaboradores?: any[];
  processos?: any[];
  matrixActivities?: any[];
  instituicoes?: any[];
  onBack?: () => void;
  onLogout?: () => void;
  showBack?: boolean;
  title?: string;
  actions?: React.ReactNode;
  breadcrumb?: string[];
  onBreadcrumbClick?: (index: number, crumbText: string) => void;
  unreadMessagesCount?: number;
  onOpenMessages?: () => void;
  onOpenBackup?: () => void;
  onOpenQuantumAI?: () => void;
  onMinimize?: () => void;
  onSync?: () => void;
  onOpenRoleSelector?: () => void;
}

const textShadowStyle = {
  textShadow: `
    1px 1px 0px #000,
    2px 2px 0px #000,
    3px 3px 0px #000,
    4px 4px 0px #000
  `,
};

const textShadowLight = {
  textShadow: "1px 1px 0px #000, 2px 2px 0px #000",
};

const LogoutDoorIcon: React.FC<{ className?: string }> = ({ className = "h-[17px] sm:h-[20px] md:h-[22px]" }) => (
  <svg
    viewBox="0 0 165 70"
    className={`${className} w-auto`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Open Door (Angled Polygon in perspective) */}
    <polygon points="10,0 42,11 42,59 10,70" fill="#EF4444" />
    
    {/* Handle Slot */}
    <rect x="31" y="29" width="4" height="12" rx="1" fill="#FFFFFF" />

    {/* Door Frame Outline */}
    <path
      d="M 42,11 L 57,11 L 57,59 L 42,59"
      stroke="#EF4444"
      strokeWidth="4.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      fill="none"
    />

    {/* Arrow pointing into door */}
    <path
      d="M 43 35 L 59 23 L 59 30 L 71 30 L 71 40 L 59 40 L 59 47 Z"
      fill="#EF4444"
    />

    {/* Logout Text */}
    <text
      x="75"
      y="43"
      fill="#EF4444"
      fontSize="23"
      fontWeight="900"
      fontFamily="Arial, sans-serif"
      letterSpacing="0.5"
    >
      Sair
    </text>
  </svg>
);

export default function MainHeader({
  user,
  activeInst,
  colaboradores = [],
  processos = [],
  matrixActivities = [],
  instituicoes = [],
  onBack,
  onLogout,
  showBack = true,
  title,
  actions,
  breadcrumb,
  onBreadcrumbClick,
  unreadMessagesCount = 0,
  onOpenMessages,
  onOpenBackup,
  onOpenQuantumAI,
  onMinimize,
  onSync,
  onOpenRoleSelector,
}: MainHeaderProps & { activeInst?: any }) {
  const [now, setNow] = useState(new Date());
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rawDayOfWeek = now.toLocaleDateString("pt-PT", { weekday: "long" });
  const dayOfWeek = tc(rawDayOfWeek);
  const dateStr = now.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const userTitle =
    user?.title || user?.cargoChefia || user?.cargo || user?.role || "";
  const roles = getRoles(userTitle);
  const isAllowedForNotifications =
    isSuperBossUser(user) || roles.isDG || roles.isDC || roles.isCD;

  const [isOnline, setIsOnline] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Cores dinâmicas derivadas do logótipo da instituição
  const primaryBg = activeInst?.primaryColor || "#050b38";
  const secondaryBg = activeInst?.secondaryColor || "#070e2d";
  const accentColor = activeInst?.accentColor || "#FFB800";

  // Estados dinâmicos sincronizados com o logotipo e nome aplicados ao sistema
  const [systemLogo, setSystemLogo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("systemLogo") || null;
    }
    return null;
  });

  const [systemOwnerName, setSystemOwnerName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("proprietarioName") || "SLAITER TRIPAS";
    }
    return "SLAITER TRIPAS";
  });

  const [systemOwnerCargo, setSystemOwnerCargo] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("proprietarioCargo") ||
        "Tecnico em Hardware, Software, programacao e designe grafico"
      );
    }
    return "Tecnico em Hardware, Software, programacao e designe grafico";
  });

  const [systemOwnerPhoto, setSystemOwnerPhoto] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("proprietarioPhoto") || null;
    }
    return null;
  });

  useEffect(() => {
    const handleLogoUpdate = (e: any) => {
      if (e.detail?.logo !== undefined) {
        setSystemLogo(e.detail.logo);
      } else {
        setSystemLogo(localStorage.getItem("systemLogo"));
      }
    };
    const handleConfigUpdate = (e: any) => {
      if (e.detail?.name) setSystemOwnerName(e.detail.name);
      if (e.detail?.cargo) setSystemOwnerCargo(e.detail.cargo);
      if (e.detail?.photo) setSystemOwnerPhoto(e.detail.photo);
    };

    window.addEventListener("sigep_system_logo_updated", handleLogoUpdate);
    window.addEventListener("sigep_system_config_updated", handleConfigUpdate);

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = firestoreService.config.subscribe("main_config", (data) => {
        if (data) {
          if (data.systemLogo !== undefined) {
            setSystemLogo(data.systemLogo || null);
            if (data.systemLogo) {
              localStorage.setItem("systemLogo", data.systemLogo);
            } else {
              localStorage.removeItem("systemLogo");
            }
          }
          if (data.proprietarioName) {
            setSystemOwnerName(data.proprietarioName);
            localStorage.setItem("proprietarioName", data.proprietarioName);
          }
          if (data.proprietarioCargo) {
            setSystemOwnerCargo(data.proprietarioCargo);
            localStorage.setItem("proprietarioCargo", data.proprietarioCargo);
          }
          if (data.proprietarioPhoto) {
            setSystemOwnerPhoto(data.proprietarioPhoto);
            localStorage.setItem("proprietarioPhoto", data.proprietarioPhoto);
          }
        }
      });
    } catch (err) {
      console.warn("Aviso ao subscrever main_config no MainHeader:", err);
    }

    return () => {
      window.removeEventListener("sigep_system_logo_updated", handleLogoUpdate);
      window.removeEventListener("sigep_system_config_updated", handleConfigUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Instituições registradas para seleção pelo Administrador Geral
  const [instituicoesList, setInstituicoesList] = useState<any[]>([]);
  const [activeInstData, setActiveInstData] = useState<any>(() => activeInst || getActiveInstituicao());

  useEffect(() => {
    const handleInstChange = () => {
      setActiveInstData(getActiveInstituicao());
    };
    window.addEventListener("instituicao_changed", handleInstChange);
    window.addEventListener("sigep_estrutura_updated", handleInstChange);

    const unsubInst = firestoreService.instituicoes.subscribe((list: any[]) => {
      if (list && list.length > 0) {
        setInstituicoesList(list);
      }
    });

    return () => {
      window.removeEventListener("instituicao_changed", handleInstChange);
      window.removeEventListener("sigep_estrutura_updated", handleInstChange);
      unsubInst();
    };
  }, []);

  // O logotipo do sistema SIGEP pertence ao SISTEMA e nunca se confunde com o da instituição
  const effectiveSystemLogo = systemLogo || getSystemLogo() || "/sigep-logo.svg";

  // Dados da Instituição Ativa (separados do sistema)
  const currentInst = activeInstData || activeInst || getActiveInstituicao();
  const instLogo = currentInst?.logo && !currentInst.logo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad") ? currentInst.logo : null;
  const instName = currentInst?.nome || user?.instituicaoNome || "Instituição";
  const instAbreviatura = currentInst?.abreviatura || currentInst?.sigla || instName;
  const instSigla = currentInst?.sigla || currentInst?.abreviatura || "";

  const isSuperAdmin = isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema" || user?.role === "admin";
  const isInstAdmin = isInstitutionalAdminAccount(user);

  const getDisplayName = (u: any) => {
    const colab = colaboradores.find(
      (c) =>
        (u?.nuit && c.nuit && String(c.nuit).trim() === String(u.nuit).trim()) ||
        (u?.email && c.email && c.email.toLowerCase().trim() === u.email.toLowerCase().trim()) ||
        (u?.id && c.id && String(c.id).trim() === String(u.id).trim()) ||
        (u?.name && c.nome && c.nome.toLowerCase().trim() === u.name.toLowerCase().trim())
    );
    const rawName = colab?.nome || colab?.name || u?.name || u?.displayName;
    if (rawName) {
      const parts = rawName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
      return rawName;
    }
    return u?.id || u?.nuit || "Utilizador";
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = () => {
    try {
      const isAppMaxed = document.body.classList.contains('app-maximized-fullscreen');
      if (!isAppMaxed && (!document.fullscreenElement && !(document as any).webkitFullscreenElement)) {
        const docEl = document.documentElement;
        const requestMethod =
          docEl.requestFullscreen ||
          (docEl as any).mozRequestFullScreen ||
          (docEl as any).webkitRequestFullScreen ||
          (docEl as any).msRequestFullscreen;
        if (requestMethod) {
          const res = requestMethod.call(docEl);
          if (res && typeof res.catch === "function") {
            res.catch((err: any) => {
              // Fallback to app-level fullscreen if iframe restricts it
              document.body.classList.add('app-maximized-fullscreen');
              setIsFullscreen(true);
            });
          } else {
            setIsFullscreen(true);
          }
        } else {
          document.body.classList.add('app-maximized-fullscreen');
          setIsFullscreen(true);
        }
      } else {
        document.body.classList.remove('app-maximized-fullscreen');
        const exitMethod =
          document.exitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).msExitFullscreen;
        if (exitMethod) {
          const res = exitMethod.call(document);
          if (res && typeof res.catch === "function") {
            res.catch((err: any) => {
              setIsFullscreen(false);
            });
          } else {
            setIsFullscreen(false);
          }
        } else {
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      document.body.classList.toggle('app-maximized-fullscreen');
      setIsFullscreen(prev => !prev);
    }
  };

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(localStorage.getItem("sigep_last_sync"));

  useEffect(() => {
    const handleSyncStart = () => setIsSyncing(true);
    const handleSyncEnd = () => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }));
    };
    window.addEventListener("firestore-sync-start", handleSyncStart);
    window.addEventListener("firestore-sync-end", handleSyncEnd);
    return () => {
      window.removeEventListener("firestore-sync-start", handleSyncStart);
      window.removeEventListener("firestore-sync-end", handleSyncEnd);
    };
  }, []);

  return (
    <>
      {showPasswordModal && (
        <ChangePasswordModal
          user={user}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
      <ShareProcessoModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        userName={user?.name}
      />
      <header
        className="w-full flex flex-col flex-none z-50 shadow-2xl relative border-b border-white/20 transition-colors duration-500"
        style={{ 
          backgroundColor: primaryBg,
          fontFamily: '"Bookman Old Style", serif' 
        }}
      >
        <div className="w-full flex justify-between items-center px-2 sm:px-4 md:px-6 py-1.5 md:py-2 gap-2 md:gap-4">
          {/* Left - Separação Soberana: SISTEMA (SIGEP) vs. INSTITUIÇÃO ATIVA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* 1. Logotipo e Identidade do SISTEMA (SIGEP) - Visível apenas para Administrador Geral ou Proprietário */}
            {(isSuperAdmin) ? (
              <>
                <div 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("open_view", { detail: { view: "dashboard" } }));
                  }}
                  title="SISTEMA SIGEP - Ir para a Visão Geral do Sistema"
                  className="flex flex-col items-center justify-center shrink-0 cursor-pointer hover:opacity-95 active:scale-95 transition-all group"
                >
                  <div className="flex items-center justify-center bg-transparent overflow-hidden w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 shrink-0 group-hover:scale-105 transition-all">
                    {effectiveSystemLogo ? (
                      <img
                        src={effectiveSystemLogo}
                        alt="Logotipo do Sistema SIGEP"
                        className="w-full h-full object-contain filter drop-shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <SigepLogo size="sm" className="!w-full !h-full max-w-full max-h-full" showText={false} animated={true} />
                      </div>
                    )}
                  </div>
                  <h2
                    className="text-[6.5px] sm:text-[7.5px] md:text-[8.5px] font-black tracking-[0.18em] text-white/90 uppercase mt-0.5 select-none whitespace-nowrap"
                    style={textShadowLight}
                  >
                    SIGEP &bull; SISTEMA
                  </h2>
                </div>
                {/* Separador Visual entre o Sistema e a Instituição */}
                <div className="hidden sm:block h-8 sm:h-10 w-px bg-white/20 shrink-0" />
              </>
            ) : null}

            {/* 2. Logotipo e Identidade da INSTITUIÇÃO ATIVA */}
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl bg-transparent flex items-center justify-center shrink-0">
                {instLogo ? (
                  <img
                    src={instLogo}
                    alt={`Logotipo da ${instName}`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center p-0.5 text-center">
                    <Building2 size={15} className="text-amber-400" />
                    <span className="text-[5.5px] font-black uppercase tracking-tighter truncate max-w-full">
                      {instSigla || "INST"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-wider text-white flex items-center gap-0.5">
                    <Building size={9} className="text-white" />
                    Instituição
                  </span>
                  {isSuperAdmin && (
                    <span className="text-[6px] md:text-[7px] font-mono px-1 py-0.2 bg-white/20 text-white rounded border border-white/30 font-bold">
                      Admin Geral (Gere Tudo)
                    </span>
                  )}
                  {isInstAdmin && (
                    <span className="text-[6px] md:text-[7px] font-mono px-1 py-0.2 bg-white/20 text-white rounded border border-white/30 font-bold">
                      Admin da Instituição
                    </span>
                  )}
                </div>

                {isSuperAdmin && instituicoesList.length > 1 ? (
                  <select
                    value={getActiveInstituicaoId()}
                    onChange={(e) => {
                      setActiveInstituicaoId(e.target.value);
                      const selected = instituicoesList.find((i) => i.id === e.target.value);
                      if (selected) setActiveInstData(selected);
                      window.dispatchEvent(new CustomEvent("instituicao_changed", { detail: { id: e.target.value } }));
                    }}
                    className="bg-black/50 text-white text-[9px] sm:text-[10px] md:text-[11px] font-black border border-white/20 rounded-md px-1.5 py-0.5 outline-none cursor-pointer max-w-[120px] sm:max-w-[170px] md:max-w-[210px] truncate mt-0.5 hover:border-amber-400 transition"
                    title="Alternar Instituição Ativa (Administrador Geral)"
                  >
                    {instituicoesList.map((inst) => (
                      <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                        {inst.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <h3
                    className="text-[10px] sm:text-[12px] md:text-[13px] font-serif font-black tracking-wider text-white leading-tight truncate max-w-[110px] sm:max-w-[160px] md:max-w-[210px]"
                    style={textShadowStyle}
                    title={instName}
                  >
                    {instAbreviatura}
                  </h3>
                )}
              </div>
            </div>

            {/* BARRA DE PESQUISA GLOBAL - INTEGRADA NO LADO ESQUERDO */}
            <div className="hidden lg:flex ml-4 xl:ml-8 flex-1 min-w-[150px] max-w-[400px]">
              <GlobalSearch 
                colaboradores={colaboradores}
                processos={processos}
                matrixActivities={matrixActivities}
                instituicoes={instituicoes}
              />
            </div>
          </div>

          {/* Center - Date & Time (Floating Box) */}
          <div 
            className="hidden sm:flex flex-col items-center justify-center border-2 border-white/20 px-6 py-1.5 min-w-[210px] md:min-w-[240px] mx-auto rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.7)] transition-colors duration-500"
            style={{ 
              backgroundColor: secondaryBg,
              fontFamily: '"Bookman Old Style", Georgia, serif'
            }}
          >
            <div className="flex flex-col items-center justify-center gap-0.5 w-full leading-tight text-center">
              <span
                className="text-xs md:text-sm font-black tracking-widest text-white"
                style={{
                  color: "#FFFFFF",
                  textShadow: "1.5px 1.5px 0px #000, 2px 2px 0px #000, 3px 3px 6px rgba(0,0,0,0.8)",
                }}
              >
                {dayOfWeek}
              </span>
              <span
                className="text-white text-xl md:text-2xl font-black tracking-widest tabular-nums my-0.5"
                style={{
                  textShadow: "1.5px 1.5px 0px #000, 2.5px 2.5px 0px #000, 3px 3px 6px rgba(0,0,0,0.8)",
                }}
              >
                {timeStr}
              </span>
              <span
                className="text-white text-[11px] md:text-xs font-bold tracking-wide"
                style={{
                  textShadow: "1px 1px 0px #000, 2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                {dateStr}
              </span>
            </div>
          </div>

          {/* Right - User Info and System Controls */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Notification Center */}
            {isAllowedForNotifications && <NotificationCenter user={user} />}
            
            {/* User Profile Area */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <div 
                  className="w-8 h-8 md:w-11 md:h-11 bg-[#E1E8FA] rounded-2xl border-2 flex items-center justify-center text-[#121c60] shadow-xl overflow-hidden border-white/60"
                >
                  {(() => {
                    const isSystemOwner = isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema" || user?.role === "admin";
                    if (isSystemOwner && systemOwnerPhoto) {
                      return (
                        <img
                          src={systemOwnerPhoto}
                          alt={systemOwnerName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      );
                    }
                    const colab = colaboradores.find(
                      (c) =>
                        (user?.nuit && c.nuit && String(c.nuit).trim() === String(user.nuit).trim()) ||
                        (user?.email && c.email && c.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
                        (user?.id && c.id && String(c.id).trim() === String(user.id).trim()) ||
                        (user?.name && c.nome && c.nome.toLowerCase().trim() === user.name.toLowerCase().trim())
                    );
                    const photo =
                      colab?.photo ||
                      colab?.foto ||
                      colab?.imagem ||
                      colab?.avatar ||
                      user?.photoURL ||
                      user?.photo;
                    const altName = isSystemOwner ? systemOwnerName : (colab?.nome || colab?.name || user?.name || "Utilizador");
                    return photo ? (
                      <img
                        src={photo}
                        alt={altName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User
                        className="w-6 h-6 md:w-[28px] md:h-[28px]"
                        strokeWidth={2.5}
                      />
                    );
                  })()}
                </div>
                <div 
                  className="absolute -bottom-1 -right-0.5 w-4 h-4 bg-[#00FF00] rounded-full border-2"
                  style={{ borderColor: primaryBg }}
                ></div>
              </div>

              <div className="hidden sm:flex flex-col gap-1 min-w-0">
                <span
                  className="text-white font-black text-[8px] md:text-[10px] lg:text-[11px] tracking-widest truncate max-w-[180px] lg:max-w-[220px]"
                  style={textShadowStyle}
                >
                  {isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema" || user?.role === "admin"
                    ? systemOwnerName
                    : tc(getDisplayName(user))}
                </span>
                <div 
                  className="text-white text-[5px] md:text-[6px] font-black px-3 py-0.5 rounded shadow-md tracking-wider truncate text-center bg-white/20 border border-white/30"
                >
                  {isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema" || user?.role === "admin"
                    ? "Proprietário e Programador"
                    : tc(
                        user?.cargo ||
                        user?.role ||
                        "Administrador"
                      )}
                </div>
                <div className="bg-black/60 text-white text-[5px] md:text-[6px] font-black px-3 py-0.5 rounded shadow-md tracking-wider truncate border border-white/20 text-center">
                  {isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema" || user?.role === "admin"
                    ? "Proprietário do Sistema"
                    : tc(user?.direcao || user?.departamento || "")}
                </div>
              </div>
            </div>

            {/* System Icons (Window Controls style) */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Botão de Alternar Modo de Acesso para Administradores da Instituição */}
              {isInstitutionalAdminAccount(user) && onOpenRoleSelector && (
                <button
                  type="button"
                  onClick={onOpenRoleSelector}
                  title="Alternar Modo de Acesso (Administrador / Usuário Normal)"
                  className="h-7 sm:h-8 px-2 sm:px-2.5 flex items-center gap-1.5 border-2 border-white/40 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shadow-sm active:scale-95 text-[10px] md:text-[11px] font-bold"
                >
                  <UserCog size={15} className="text-white" />
                  <span className="hidden md:inline text-white">
                    {user?.activeRoleMode === "chefe" ? "Modo: Chefe" : user?.activeRoleMode === "user" ? "Modo: Usuário Normal" : "Modo: Administrador"}
                  </span>
                </button>
              )}

              {/* Botão de IA Quântica SIGDE - Apenas para Administrador Geral / Proprietário */}
              {isSuperBossUser(user) && (
                <button
                  type="button"
                  onClick={onOpenQuantumAI}
                  title="IA Quântica SIGDE (99.8% Coerência) - Abrir Copiloto Inteligente"
                  className="h-7 sm:h-8 px-2 sm:px-2.5 flex items-center gap-1.5 border-2 border-cyan-400 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95 text-[11px] font-bold"
                >
                  <Cpu size={15} className="text-cyan-300 animate-pulse" />
                  <span className="hidden xl:inline text-cyan-200">IA Quântica SIGDE</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-400/20 text-emerald-300 font-bold border border-cyan-400/30">
                    99.8%
                  </span>
                </button>
              )}

              {/* Botão Projeto Científico removido */}
              
              {user && (
                <button
                  onClick={onSync}
                  title="Sincronizar com a Nuvem (Firestore)"
                  className="w-7 h-7 flex items-center justify-center border-2 border-blue-500 rounded bg-transparent text-blue-500 hover:bg-blue-500/10 transition-all cursor-pointer relative"
                >
                  <RefreshCcw size={16} />
                </button>
              )}
              <button
                onClick={onOpenBackup}
                title="Base de Dados"
                className="w-7 h-7 flex items-center justify-center border-2 border-slate-400 rounded bg-transparent text-slate-100 hover:bg-slate-400/10 transition-all"
              >
                <Database size={16} />
              </button>
              {/* Window Control Buttons: Amarelo (Minimizar), Verde (Maximizar), Vermelho (Fechar/Sair) */}
              <button
                type="button"
                onClick={onMinimize}
                title="Minimizar Janela"
                className="w-8 h-8 flex items-center justify-center border-2 border-amber-400 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Minus size={18} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Restaurar Ecrã" : "Maximizar Ecrã Inteiro"}
                className="w-8 h-8 flex items-center justify-center border-2 border-emerald-400 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {isFullscreen ? <Minimize2 size={18} strokeWidth={3} /> : <Maximize2 size={18} strokeWidth={3} />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLogout?.();
                }}
                title="Fechar / Terminar Sessão"
                className="w-8 h-8 flex items-center justify-center border-2 border-red-500 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <LogOut size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Separator and Title */}
        <div className="w-full px-2 sm:px-4 md:px-6 pb-1 pt-0.5 border-t border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBack && onBack && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onBack();
                  }}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 px-3.5 py-1 rounded-full flex items-center gap-2 font-black shadow-lg transition-all cursor-pointer relative z-10 select-none border-2 border-white text-white"
                  style={{ borderColor: "#FFFFFF", color: "#FFFFFF" }}
                  title="Voltar"
                >
                  <ArrowLeft size={16} strokeWidth={3} className="text-white" />
                  <span className="text-[9px] md:text-[11px] font-black tracking-widest text-white">
                    Voltar
                  </span>
                </button>
              )}

              <h2
                className="text-[9px] md:text-[12px] lg:text-base font-black tracking-widest leading-none text-white"
                style={{ ...textShadowStyle, color: "#FFFFFF" }}
              >
                {tc(title || "Menu Principal")}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] transition-all duration-500 ${
                isOnline ? "bg-[#00FF00] shadow-[#00FF00]" : "bg-red-500 shadow-red-500"
              }`}></div>
              <div className="flex flex-col">
                <span
                  className="text-white text-[7px] md:text-[8px] font-black tracking-[0.1em] leading-none"
                  style={textShadowLight}
                >
                  {isOnline ? "Sistema Online" : "Modo Offline"}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <RefreshCcw className={`w-2 h-2 text-white/80 ${isSyncing ? "animate-spin" : ""}`} />
                  <span className="text-[6px] text-white/90 font-bold tracking-tighter">
                    {isSyncing ? "Sincronizando com a Nuvem..." : `Nuvem em Dia ${lastSyncTime ? `(${lastSyncTime})` : ""}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
