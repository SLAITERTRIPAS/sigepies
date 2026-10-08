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
  Search,
  BoxIcon,
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
import InstitutionalProfileModal from "../../components/modals/InstitutionalProfileModal";

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
  const [showInstProfileModal, setShowInstProfileModal] = useState(false);

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
  const primaryBg = activeInst?.headerColor || activeInst?.primaryColor || "#0a0f1d";
  const secondaryBg = "#7f1d1d"; // Cor de fundo do relógio (vinho conforme imagem)
  const accentColor = activeInst?.footerColor || activeInst?.accentColor || "#FFB800";

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
  const isAnyAdmin = isSuperAdmin || isInstAdmin;

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
      <InstitutionalProfileModal 
        isOpen={showInstProfileModal}
        onClose={() => setShowInstProfileModal(false)}
        instituicao={currentInst}
      />
      <header
        className="w-full flex flex-col flex-none z-50 shadow-2xl relative transition-all duration-500"
        style={{ 
          backgroundColor: primaryBg,
          fontFamily: '"Inter", "Segoe UI", sans-serif' 
        }}
      >
        <div className="w-full flex justify-between items-center px-4 py-2 gap-4">
          {/* Left - SIGEP Logo & Search */}
          <div className="flex items-center gap-6 shrink-0 flex-1">
            {/* 1. Logotipo SISTEMA (SIGEP) */}
            <div 
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open_view", { detail: { view: "dashboard" } }));
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* 3D Cube Icon Simulation */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700 rounded-xl rotate-12 shadow-lg group-hover:rotate-0 transition-transform duration-300"></div>
                <div className="absolute inset-0 bg-white/20 rounded-xl backdrop-blur-sm -rotate-6 group-hover:rotate-0 transition-transform duration-300"></div>
                <BoxIcon className="relative w-8 h-8 text-white drop-shadow-md" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter text-white leading-none italic">
                  SIGEP
                </h1>
                <span className="text-[9px] font-bold tracking-[0.3em] text-blue-400 uppercase leading-none mt-1">
                  SISTEMA
                </span>
              </div>
            </div>

            {/* 2. Logotipo e Identidade da INSTITUIÇÃO ATIVA - Oculto para Administrador Geral conforme solicitado */}
            {!isSuperAdmin && (
              <>
                {/* Separador Vertical */}
                <div className="h-10 w-px bg-white/10" />

                <button 
                  onClick={() => isAnyAdmin && setShowInstProfileModal(true)}
                  disabled={!isAnyAdmin}
                  className={`flex items-center gap-3 min-w-0 group/inst transition-all ${isAnyAdmin ? 'cursor-pointer hover:bg-white/5 p-1 rounded-xl' : 'cursor-default'}`}
                  title={isAnyAdmin ? "Clique para gerir o perfil da instituição" : instName}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover/inst:border-blue-500/50 transition-all">
                    {instLogo ? (
                      <img
                        src={instLogo}
                        alt={`Logotipo da ${instName}`}
                        className="w-full h-full object-contain p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Building2 size={20} className="text-blue-400" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">Instituição</span>
                      {isAnyAdmin && <Settings size={8} className="text-white/20 group-hover/inst:text-blue-400 animate-pulse" />}
                    </div>
                    <h3 className="text-xs font-black text-white truncate max-w-[150px] uppercase tracking-wide group-hover/inst:text-blue-200 transition-colors">
                      {instAbreviatura}
                    </h3>
                  </div>
                </button>
              </>
            )}

            {/* Separador Vertical Final antes da Pesquisa */}
            <div className="h-10 w-px bg-white/10" />

            {/* BARRA DE PESQUISA CENTRAL (Estilo Imagem) */}
            <div className="hidden lg:flex flex-1 max-w-[400px]">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-white/40 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="O que desejas encontrar?"
                  className="block w-full bg-black/30 border border-white/10 text-white text-xs rounded-full py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:bg-black/50 transition-all placeholder:text-white/30 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Center - Date & Time (Vinho Box) */}
          <div 
            className="hidden xl:flex flex-col items-center justify-center px-8 py-1.5 min-w-[280px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10"
            style={{ 
              backgroundColor: secondaryBg,
            }}
          >
            <div className="flex flex-col items-center gap-0">
              <span className="text-[10px] font-black tracking-[0.2em] text-white/90 uppercase">
                {dayOfWeek}, {dateStr.toUpperCase()}
              </span>
              <span className="text-2xl md:text-3xl font-black tracking-widest text-white tabular-nums drop-shadow-md">
                {timeStr}
              </span>
            </div>
          </div>

          {/* Right - Controls and User */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* System Actions */}
            <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-lg border border-white/5">
              <button
                onClick={onSync}
                title="Sincronizar"
                className="px-2 py-1 flex items-center gap-1 text-[10px] font-black text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/10 transition-all"
              >
                <RefreshCcw size={12} className={isSyncing ? "animate-spin" : ""} />
                <span>SINC</span>
              </button>
              <button
                onClick={onOpenBackup}
                title="Base de Dados"
                className="px-2 py-1 flex items-center gap-1 text-[10px] font-black text-slate-300 border border-slate-500/30 rounded hover:bg-slate-500/10 transition-all"
              >
                <Database size={12} />
                <span>DB</span>
              </button>
              
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                <button
                  onClick={onMinimize}
                  className="w-6 h-6 flex items-center justify-center rounded bg-amber-500/20 text-amber-500 hover:bg-amber-500/40 transition-all"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="w-6 h-6 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/40 transition-all"
                >
                  {isFullscreen ? <Minimize2 size={14} strokeWidth={3} /> : <Maximize2 size={14} strokeWidth={3} />}
                </button>
                <button
                  onClick={onLogout}
                  className="w-6 h-6 flex items-center justify-center rounded bg-red-500/20 text-red-500 hover:bg-red-500/40 transition-all"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 ml-2">
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-lg group-hover:border-blue-400 transition-all">
                      {systemOwnerPhoto ? (
                        <img src={systemOwnerPhoto} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0f1d] rounded-full shadow-sm"></div>
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-[11px] font-black text-white tracking-wide uppercase">
                      {systemOwnerName}
                    </span>
                    <span className="text-[8px] font-bold text-emerald-400 uppercase mt-0.5">
                      ON-LINE
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-white/40 group-hover:text-white transition-colors" />
                </button>

                {/* Dropdown Menu Simplificado */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Nível de Acesso</p>
                        <p className="text-xs font-black text-blue-400 mt-0.5">{systemOwnerCargo}</p>
                      </div>
                      <button onClick={() => { setShowPasswordModal(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-white/70 hover:bg-white/5 hover:text-white transition-all text-left">
                        <Settings size={14} /> Alterar Palavra-passe
                      </button>
                      <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-all text-left">
                        <LogOut size={14} /> Terminar Sessão
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notification Badge */}
              <div className="relative">
                <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-white/70 hover:text-white relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior do Cabeçalho */}
        <div className="w-full px-4 py-2 bg-black/30 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
              <Globe size={16} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-white/40 uppercase tracking-widest">Início /</span>
              <h2 className="text-sm font-black text-white tracking-widest uppercase italic">
                {title || "RECEPÇÃO DE DOCUMENTOS"}
              </h2>
            </div>
          </div>

          {/* IA Quântica Status (Estilo Imagem) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">IA QUÂNTICA</span>
                <span className="text-[7px] font-bold text-emerald-400 uppercase mt-0.5">SISTEMA ON-LINE</span>
              </div>
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg border border-indigo-400/30">
                  <Cpu size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
