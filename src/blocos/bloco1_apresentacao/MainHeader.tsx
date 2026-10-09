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

  // Instituições registradas para seleção
  const [instituicoesList, setInstituicoesList] = useState<any[]>(() => instituicoes || []);
  const [activeInstData, setActiveInstData] = useState<any>(() => activeInst || getActiveInstituicao());

  useEffect(() => {
    const handleInstChange = (e?: any) => {
      const activeId = e?.detail?.instituicaoId || (typeof window !== "undefined" ? localStorage.getItem("sigep_active_instituicao_id") : null);
      if (activeId && instituicoesList.length > 0) {
        const found = instituicoesList.find((i) => i.id === activeId);
        if (found) {
          setActiveInstData(found);
          return;
        }
      }
      setActiveInstData(getActiveInstituicao());
    };
    window.addEventListener("instituicao_changed", handleInstChange);
    window.addEventListener("sigep_estrutura_updated", handleInstChange);

    const unsubInst = firestoreService.instituicoes.subscribe((list: any[]) => {
      if (list && list.length > 0) {
        setInstituicoesList(list);
        const activeId = typeof window !== "undefined" ? localStorage.getItem("sigep_active_instituicao_id") : null;
        if (activeId) {
          const matched = list.find((i) => i.id === activeId);
          if (matched) setActiveInstData(matched);
        }
      }
    });

    return () => {
      window.removeEventListener("instituicao_changed", handleInstChange);
      window.removeEventListener("sigep_estrutura_updated", handleInstChange);
      unsubInst();
    };
  }, []);

  // Instituição do Utilizador Logado
  const userInstId =
    user?.instituicaoId ||
    user?.instituicao ||
    (typeof window !== "undefined" ? localStorage.getItem("sigep_active_instituicao_id") : null);

  const loggedInst = React.useMemo(() => {
    const list = instituicoesList.length > 0 ? instituicoesList : (instituicoes || []);
    if (userInstId && list.length > 0) {
      const match = list.find(
        (i) =>
          (i.id && String(i.id).trim() === String(userInstId).trim()) ||
          (i.nome && user?.instituicaoNome && i.nome.toLowerCase().trim() === String(user.instituicaoNome).toLowerCase().trim()) ||
          (i.sigla && user?.instituicao && i.sigla.toLowerCase().trim() === String(user.instituicao).toLowerCase().trim()) ||
          (i.nome && user?.instituicao && i.nome.toLowerCase().trim() === String(user.instituicao).toLowerCase().trim())
      );
      if (match) return match;
    }
    if (activeInstData) return activeInstData;
    if (activeInst) return activeInst;
    return getActiveInstituicao();
  }, [user, userInstId, instituicoesList, instituicoes, activeInstData, activeInst]);

  // Logótipo padrão do sistema SIGEP (Fallback)
  const effectiveSystemLogo = systemLogo || getSystemLogo() || "/sigep-logo.svg";

  // Logótipo dinâmico da instituição do utilizador logado
  const rawInstLogo =
    user?.instituicaoLogo ||
    user?.instituicaoLogotipo ||
    user?.instituicaoLogoUrl ||
    loggedInst?.logo ||
    loggedInst?.logotipo ||
    loggedInst?.logoUrl ||
    loggedInst?.emblema ||
    activeInst?.logo ||
    null;

  const validInstLogo =
    rawInstLogo && !rawInstLogo.includes("11zvvpOpZARM1yk_irEDpjJ-qBKlTlhad")
      ? rawInstLogo
      : null;

  const isSuperAdmin = isSuperBossUser(user) || user?.isOwner || user?.role === "Proprietário" || user?.role === "Administrador do Sistema" || user?.role === "admin";
  const isInstAdmin = isInstitutionalAdminAccount(user);
  const isAnyAdmin = isSuperAdmin || isInstAdmin;

  // No campo do logotipo do sistema, deve ser aplicado o logotipo da instituição do usuário logado,
  // EXCETO se o logado for o Administrador Geral (que não pertence a nenhuma instituição e exibe o logotipo do sistema)
  const headerLogoToDisplay = isSuperAdmin ? effectiveSystemLogo : (validInstLogo || effectiveSystemLogo);

  // Logótipo de fundo para o retângulo de horas:
  // Se for o Administrador Geral -> Logótipo do sistema
  // Caso contrário -> Logótipo da instituição do utilizador logado
  const clockBackgroundLogo = React.useMemo(() => {
    if (isSuperAdmin) {
      return effectiveSystemLogo;
    }
    return validInstLogo || loggedInst?.logo || loggedInst?.logotipo || activeInst?.logo || effectiveSystemLogo;
  }, [isSuperAdmin, effectiveSystemLogo, validInstLogo, loggedInst, activeInst]);

  const instName = isSuperAdmin ? "SIGEP" : (loggedInst?.nome || user?.instituicaoNome || "Instituição");
  const instAbreviatura = isSuperAdmin ? "ADMINISTRAÇÃO GERAL" : (loggedInst?.abreviatura || loggedInst?.sigla || instName);

  // Nome real do utilizador logado
  const realUserName = React.useMemo(() => {
    if (isSuperAdmin) {
      return user?.nomeReal || user?.nomeCompleto || user?.nome || user?.name || "SLAITER TRIPAS";
    }

    const colab = colaboradores?.find(
      (c) =>
        (user?.nuit && c.nuit && String(c.nuit).trim() === String(user.nuit).trim()) ||
        (user?.email && c.email && c.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
        (user?.id && c.id && String(c.id).trim() === String(user.id).trim()) ||
        (user?.name && c.nome && c.nome.toLowerCase().trim() === user.name.toLowerCase().trim()) ||
        (user?.nome && c.nome && c.nome.toLowerCase().trim() === user.nome.toLowerCase().trim())
    );

    const proc = !colab && processos?.find(
      (p) =>
        (user?.nuit && p.nuit && String(p.nuit).trim() === String(user.nuit).trim()) ||
        (user?.email && p.email && p.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
        (user?.id && p.id && String(p.id).trim() === String(user.id).trim())
    );

    const target = colab || proc;

    const foundName =
      user?.nomeReal ||
      user?.nomeCompleto ||
      user?.nome ||
      user?.name ||
      target?.nomeCompleto ||
      target?.nome ||
      target?.name ||
      user?.displayName;

    if (foundName && String(foundName).trim().length > 0) {
      return String(foundName).trim();
    }

    if (user?.email) {
      const emailPrefix = user.email.split("@")[0].replace(/[._-]/g, " ");
      return tc(emailPrefix);
    }

    return user?.nuit ? `Utilizador (${user.nuit})` : "Utilizador";
  }, [user, colaboradores, processos, isSuperAdmin]);

  // Formato compacto para cabeçalho: Primeiro e Último Nome
  const shortRealUserName = React.useMemo(() => {
    if (!realUserName) return "UTILIZADOR";
    const parts = realUserName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[parts.length - 1]}`;
    }
    return realUserName;
  }, [realUserName]);

  // Foto real do utilizador logado
  const realUserPhoto = React.useMemo(() => {
    if (isSuperAdmin) {
      return user?.photoURL || user?.fotoUrl || user?.foto || user?.photo || null;
    }

    const colab = colaboradores?.find(
      (c) =>
        (user?.nuit && c.nuit && String(c.nuit).trim() === String(user.nuit).trim()) ||
        (user?.email && c.email && c.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
        (user?.id && c.id && String(c.id).trim() === String(user.id).trim())
    );
    const proc = !colab && processos?.find(
      (p) =>
        (user?.nuit && p.nuit && String(p.nuit).trim() === String(user.nuit).trim()) ||
        (user?.email && p.email && p.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );

    return (
      user?.photoURL ||
      user?.fotoUrl ||
      user?.foto ||
      user?.photo ||
      colab?.fotoUrl ||
      colab?.foto ||
      proc?.fotoUrl ||
      proc?.foto ||
      null
    );
  }, [user, colaboradores, processos, isSuperAdmin]);

  // Iniciais do utilizador logado para avatar elegante
  const userInitials = React.useMemo(() => {
    if (!realUserName) return "U";
    const parts = realUserName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return realUserName.substring(0, 2).toUpperCase();
  }, [realUserName]);

  // Cargo real do utilizador logado
  const realUserCargo = React.useMemo(() => {
    if (isSuperAdmin) {
      return user?.cargoChefia || user?.cargo || user?.role || user?.title || "Proprietário, Programador e Administrador Geral";
    }

    const colab = colaboradores?.find(
      (c) =>
        (user?.nuit && c.nuit && String(c.nuit).trim() === String(user.nuit).trim()) ||
        (user?.email && c.email && c.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );
    return (
      user?.cargoChefia ||
      user?.cargo ||
      user?.role ||
      user?.title ||
      colab?.cargoChefia ||
      colab?.cargo ||
      "Colaborador Autorizado"
    );
  }, [user, colaboradores, isSuperAdmin]);

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
        instituicao={loggedInst}
      />
      <header
        className="w-full flex flex-col flex-none z-50 shadow-2xl relative transition-all duration-500"
        style={{ 
          backgroundColor: primaryBg,
          fontFamily: '"Inter", "Segoe UI", sans-serif' 
        }}
      >
        <div className="w-full flex justify-between items-center px-4 py-2 gap-4">
          {/* Lado Esquerdo - Logótipo do Cabeçalho (Sistema se for Administrador Geral, caso contrário, Instituição Logada) */}
          <div className="flex items-center gap-4 shrink-0 flex-1">
            <div 
              onClick={() => {
                if (isSuperAdmin) {
                  window.dispatchEvent(new CustomEvent("open_view", { detail: { view: "dashboard" } }));
                } else if (isAnyAdmin) {
                  setShowInstProfileModal(true);
                } else {
                  window.dispatchEvent(new CustomEvent("open_view", { detail: { view: "dashboard" } }));
                }
              }}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0 transition-all duration-300 hover:scale-[1.02] active:scale-98"
              title={isSuperAdmin ? "Painel de Administração Geral SIGEP" : `Instituição Logada: ${instName}`}
            >
              {/* Campo do Logótipo com o Logótipo do Sistema ou da Instituição Logada */}
              <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-blue-400/50 group-hover:bg-white/10 transition-all shadow-md">
                <img
                  src={headerLogoToDisplay}
                  alt={instName}
                  className="h-10 md:h-12 w-auto max-w-[150px] object-contain drop-shadow-md transition-all duration-300 group-hover:brightness-110 rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/sigep-logo.svg";
                  }}
                />
              </div>

              {/* Identificação Dinâmica da Instituição ou Administração Geral */}
              <div className="flex flex-col min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest leading-none">
                    {isSuperAdmin ? "SISTEMA DE GESTÃO INTEGRADA" : "INSTITUIÇÃO LOGADA"}
                  </span>
                  {isAnyAdmin && !isSuperAdmin && (
                    <Settings size={9} className="text-white/30 group-hover:text-blue-400 transition-colors animate-pulse" />
                  )}
                </div>
                <h3 className="text-xs md:text-sm font-black text-white truncate max-w-[200px] sm:max-w-[280px] uppercase tracking-wide group-hover:text-blue-200 transition-colors">
                  {isSuperAdmin ? "PAINEL ADMINISTRADOR GERAL" : instAbreviatura}
                </h3>
              </div>
            </div>
          </div>

          {/* Center - Date & Time (Layout Oficial com Topo Dividido e Barra Dourada, Fundo Existente Mantido) */}
          <div 
            className="hidden md:flex relative overflow-hidden flex-col items-center justify-center px-5 lg:px-7 py-2 min-w-[280px] lg:min-w-[320px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 group select-none transition-all duration-300"
            style={{ 
              backgroundColor: secondaryBg,
            }}
            title={isSuperAdmin ? "Relógio Oficial - Sistema SIGEP" : `Relógio Oficial - ${instName}`}
          >
            {/* Logótipo em marca d'água / fundo do retângulo de horas (preservado intacto) */}
            {clockBackgroundLogo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden p-1 select-none">
                <img
                  src={clockBackgroundLogo}
                  alt="Logótipo de Fundo do Relógio"
                  className="w-full h-full max-h-[85%] max-w-[85%] object-contain opacity-35 filter brightness-110 contrast-125 transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Overlay sutil para garantir contraste e legibilidade cristalina do relógio */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/45 pointer-events-none" />
              </div>
            )}

            <div className="relative z-10 w-full flex flex-col items-center leading-none">
              {/* Linha Superior: DIA DA SEMANA | HORA COM ESPAÇAMENTO */}
              <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2">
                <span 
                  className="text-[#FFB800] font-serif font-black text-xs sm:text-[13px] tracking-[0.16em] uppercase whitespace-nowrap"
                  style={{ textShadow: "1.5px 1.5px 0px #000000" }}
                >
                  {rawDayOfWeek.toUpperCase()}
                </span>
                
                <span 
                  className="text-[#FFB800] font-black text-sm sm:text-base mx-1 select-none leading-none"
                  style={{ textShadow: "1.5px 1.5px 0px #000000" }}
                >
                  |
                </span>

                <span 
                  className="text-white font-serif font-black text-base sm:text-lg tracking-[0.2em] tabular-nums whitespace-nowrap"
                  style={{ textShadow: "2px 2px 0px #000000" }}
                >
                  {timeStr.split('').join(' ')}
                </span>
              </div>

              {/* Barra Divisória Horizontal Dourada com cantos arredondados */}
              <div 
                className="w-full h-[3px] bg-[#FFB800] rounded-full my-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.6)]" 
              />

              {/* Linha Inferior: DATA COMPLETA POR EXTENSO */}
              <div className="w-full text-center">
                <span 
                  className="text-slate-100 font-serif font-bold text-[10px] sm:text-[11px] tracking-[0.22em] uppercase whitespace-nowrap"
                  style={{ textShadow: "1.5px 1.5px 0px #000000" }}
                >
                  {dateStr.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Right - User and Controls */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* User Profile - Nome e Foto Reais do Utilizador Logado */}
            {user ? (
              <div className="flex items-center gap-3 mr-2 animate-in fade-in duration-300">
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 group cursor-pointer"
                    title={`Utilizador: ${realUserName} (${realUserCargo})`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-lg group-hover:border-blue-400 transition-all flex items-center justify-center bg-slate-800/40">
                        {realUserPhoto ? (
                          <img 
                            src={realUserPhoto} 
                            alt={realUserName}
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          // Mostra a área da foto vazia (sem foto nem iniciais), mas o nome sim
                          <div className="w-full h-full bg-transparent"></div>
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0f1d] rounded-full shadow-sm"></div>
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-none text-left">
                      <span className="text-[11px] font-black text-white tracking-wide uppercase">
                        {shortRealUserName}
                      </span>
                      <span className="text-[8px] font-bold text-emerald-400 uppercase mt-0.5">
                        ON-LINE
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-white/40 group-hover:text-white transition-colors" />
                  </button>

                  {/* Dropdown Menu Dinâmico do Utilizador Logado */}
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[60]"
                      >
                        <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Utilizador Conectado</p>
                          <p className="text-xs font-black text-white mt-0.5 break-words">{realUserName}</p>
                          <p className="text-[10px] font-bold text-blue-400 mt-1">{realUserCargo}</p>
                          {user?.email && (
                            <p className="text-[9px] text-white/40 truncate mt-0.5">{user.email}</p>
                          )}
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[8px] font-bold text-amber-400/80 uppercase">Instituição</span>
                            <span className="text-[9px] font-black text-white truncate max-w-[140px] uppercase">{instAbreviatura}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setShowPasswordModal(true); setShowMenu(false); }} 
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-white/70 hover:bg-white/5 hover:text-white transition-all text-left cursor-pointer"
                        >
                          <Settings size={14} /> Alterar Palavra-passe
                        </button>
                        <button 
                          onClick={onLogout} 
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
                        >
                          <LogOut size={14} /> Terminar Sessão
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : null}

            {/* System Actions */}
            <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
              <button
                onClick={onSync}
                title="Sincronizar"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all shadow-sm"
              >
                <RefreshCcw size={15} className={isSyncing ? "animate-spin" : ""} />
              </button>
              <button
                onClick={onOpenBackup}
                title="Base de Dados"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all shadow-sm"
              >
                <Database size={15} />
              </button>
              <button
                onClick={onMinimize}
                title="Minimizar"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all shadow-sm"
              >
                <Minus size={15} strokeWidth={3} />
              </button>
              <button
                onClick={toggleFullscreen}
                title="Ecrã Completo / Restaurar"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm"
              >
                {isFullscreen ? <Minimize2 size={15} strokeWidth={2.5} /> : <Maximize2 size={15} strokeWidth={2.5} />}
              </button>
              <button
                onClick={onLogout}
                title="Terminar Sessão / Sair"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shadow-sm"
              >
                <LogOut size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Barra Inferior do Cabeçalho */}
        <div className="w-full px-4 py-2 bg-black/30 border-t border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Botão Voltar que acompanha a navegação */}
            <button
              onClick={() => {
                if (onBack) {
                  onBack();
                } else if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.dispatchEvent(new CustomEvent("open_view", { detail: { view: "menu" } }));
                }
              }}
              title="Voltar à tela ou menu anterior"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white border border-blue-400/30 hover:border-blue-400/60 transition-all font-bold text-xs shadow-sm active:scale-95 group shrink-0 cursor-pointer"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Voltar</span>
            </button>

            <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
              <Globe size={16} />
            </div>

            {/* Trilha de Navegação (Início / Sistema / Submenus / Título) */}
            <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-none py-0.5">
              <button
                onClick={() => {
                  if (onBreadcrumbClick) {
                    onBreadcrumbClick(0, "Início");
                  } else {
                    window.dispatchEvent(new CustomEvent("open_view", { detail: { view: "menu" } }));
                  }
                }}
                className="text-[11px] font-black text-white/50 hover:text-white uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                title="Ir para o Início / Menu Principal"
              >
                Início
              </button>

              {breadcrumb && breadcrumb.length > 0 ? (
                breadcrumb.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <span className="text-white/30 text-xs shrink-0">/</span>
                    <button
                      onClick={() => onBreadcrumbClick?.(idx, crumb)}
                      className="text-[11px] font-bold text-white/70 hover:text-white uppercase tracking-wide truncate max-w-[160px] transition-colors cursor-pointer shrink-0"
                      title={crumb}
                    >
                      {crumb}
                    </button>
                  </React.Fragment>
                ))
              ) : null}

              <span className="text-white/30 text-xs shrink-0">/</span>
              <h2 className="text-xs sm:text-sm font-black text-white tracking-widest uppercase italic truncate">
                {title || "SISTEMA"}
              </h2>
            </div>
          </div>

          {/* IA Quântica Status e Notificações Recebidas */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Botão de Notificações Recebidas do Sistema */}
            <NotificationCenter
              user={user}
              triggerClassName="p-2.5 rounded-xl bg-indigo-900/50 hover:bg-indigo-900/70 transition-all border border-indigo-500/30 text-indigo-200 hover:text-white relative cursor-pointer"
              unreadMessagesCount={unreadMessagesCount}
              onOpenMessages={onOpenMessages}
            />
            <div className="flex items-center gap-3 bg-indigo-600/20 border border-indigo-500/30 px-4 py-1.5 rounded-xl">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">IA QUÂNTICA</span>
                <span className="text-[7px] font-bold text-emerald-400 uppercase mt-0.5">SISTEMA ON-LINE</span>
              </div>
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                <div className="relative w-full h-full bg-indigo-700 rounded-lg flex items-center justify-center shadow-lg border border-indigo-500/30">
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
