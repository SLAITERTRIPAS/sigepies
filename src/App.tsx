/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, ReactNode, Component } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  Database,
} from "lucide-react";
import MainHeader from "./blocos/bloco1_apresentacao/MainHeader";
import { AlertModal } from "./components/ui/AlertModal";
import BackupRestoreModal from "./components/modals/BackupRestoreModal";
import { QuantumCopilotModal } from "./components/quantum/QuantumCopilotModal";
import { QuantumFloatingOrb } from "./components/quantum/QuantumFloatingOrb";
import { ViewRenderer } from "./components/ViewRenderer";
import { EFETIVO_GERAL_DATA } from "./constants/colaboradoresList";
import { runAutomaticBackupIfNeeded, autoRestoreOnStartup } from "./lib/backupService";
import {
  Event,
  Expediente,
  LibraryRegistration,
  BookRegistration,
  ServiceRequest,
  Nota,
  FinancialData,
} from "./types";
import {
  isSuperBossUser,
  isChefeUser,
  isInstitutionalAdminUser,
  isInstitutionalAdminAccount,
  isHRBossUser,
  isPatrimonioBossOrAdmin,
  getUserWorkspace,
  determineUserRole,
  isTechnicianUser,
} from "./lib/auth";
import { ProcessingCircle } from "./components/ui/ProcessingCircle";
import {
  firestoreService,
  wipeDatabaseExceptExclusions,
} from "./lib/firestoreService";
import { databaseMaintenance } from "./lib/databaseMaintenance";
import {
  generateCollaboratorId,
  isMatch,
  checkIsQuadro,
  classifyTipo,
  mergeColaboradores,
  getCircularReplacer,
  safeJSONStringify,
} from "./lib/utils";

import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./lib/firebase";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { getSetoresByDepartamento } from "./constants/formOptions";
export { ErrorBoundary };

interface NavigationSnapshot {
  view: string;
  dashboardTitle: string;
  subMenuStack: {
    title: string;
    items: { title: string; subItems?: { title: string }[] }[];
  }[];
  dashboardActiveItem?: string | undefined;
  dashboardItems?: any[];
}

export default function App() {
  const [historyStack, setHistoryStack] = useState<NavigationSnapshot[]>([]);
  const [view, setView] = useState<any>(() => {
    try {
      const storedUserStr =
        localStorage.getItem("sigep_logged_in_user") ||
        localStorage.getItem("sigep_user");
      if (storedUserStr) {
        const parsed = JSON.parse(storedUserStr);
        if (parsed && isSuperBossUser(parsed)) {
          // Só vai para a seleção de papéis se tiver mais que uma opção (se for chefe também)
          if (isChefeUser(parsed)) {
            return "admin_role_selection";
          }
          return "dashboard";
        }
      }
    } catch (e) {}
    return "presentation";
  });
  const [statsActiveItem, setStatsActiveItem] = useState<string | null>(null);
  const [subMenuStack, setSubMenuStack] = useState<
    {
      title: string;
      items: { title: string; subItems?: { title: string }[] }[];
    }[]
  >([]);
  const [dashboardTitle, setDashboardTitle] = useState(() => {
    try {
      const storedUserStr =
        localStorage.getItem("sigep_logged_in_user") ||
        localStorage.getItem("sigep_user");
      if (storedUserStr) {
        const parsed = JSON.parse(storedUserStr);
        if (parsed && isSuperBossUser(parsed)) {
          if (!isChefeUser(parsed)) {
            return "Sistema";
          }
        }
      }
    } catch (e) {}
    return "";
  });
  const [dashboardItems, setDashboardItems] = useState<any[]>([]);
  const [errorStates, setErrorStates] = useState<Record<string, string>>({});
  const [dashboardActiveItem, setDashboardActiveItem] = useState<
    string | undefined
  >(undefined);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [notes, setNotes] = useState<Nota[]>([]);
  const [visitorType, setVisitorType] = useState("Estudante");
  const [verifiedVisitor, setVerifiedVisitor] = useState<any>(null);
  const [selectedService, setSelectedService] = useState("");
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]); // Added suppliers state
  const [matrixActivities, setMatrixActivities] = useState<any[]>([]); // Added centralized state for activities
  const [events, setEvents] = useState<Event[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [libraryRegistrations, setLibraryRegistrations] = useState<
    LibraryRegistration[]
  >([]);
  const [bookRegistrations, setBookRegistrations] = useState<
    BookRegistration[]
  >([]);
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [efetivoEscolar, setEfetivoEscolar] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [rawColaboradores, setRawColaboradores] = useState<any[]>([]);
  const [rawChefiaColaboradores, setRawChefiaColaboradores] = useState<any[]>(
    [],
  );
  const colaboradores = React.useMemo(() => {
    return mergeColaboradores([...rawChefiaColaboradores, ...rawColaboradores]);
  }, [rawColaboradores, rawChefiaColaboradores]);
  const [processos, setProcessos] = useState<any[]>([]);
  const [alocacoes, setAlocacoes] = useState<any[]>([]);
  const [accessAlerts, setAccessAlerts] = useState<any[]>([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [activeInst, setActiveInst] = useState<any>(null); // Adicionado

  const [user, setUser] = useState<any>(() => {
    try {
      const storedUserStr =
        localStorage.getItem("sigep_logged_in_user") ||
        localStorage.getItem("sigep_user");
      if (storedUserStr) {
        const parsed = JSON.parse(storedUserStr);
        if (parsed && (parsed.email || parsed.nuit || parsed.id || parsed.name)) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    if (user && isSuperBossUser(user)) {
      if (view === "presentation" || view === "login") {
        if (isChefeUser(user)) {
          setDashboardTitle("");
          setView("admin_role_selection");
        } else {
          setDashboardTitle("Sistema");
          setDashboardActiveItem(undefined);
          setView("dashboard");
        }
      }
    }
  }, [user]);

  // Instituição Dinâmica (Movido de MainHeader para App)
  useEffect(() => {
    const instId = user?.instituicaoId || "isps";
    let unsub = () => {};
    
    try {
      unsub = firestoreService.instituicoes.subscribe((instituicoes: any[]) => {
        if (instituicoes && instituicoes.length > 0) {
          const found = instituicoes.find((i) => i.id === instId) || instituicoes[0];
          if (found) {
            setActiveInst(found);
          }
        }
      });
    } catch (e) {
      console.warn("Aviso ao carregar dados da instituição no App:", e);
    }

    const handleInstUpdated = (e: any) => {
      if (e.detail?.payload) {
        setActiveInst((prev: any) => ({ ...(prev || {}), ...e.detail.payload }));
      }
    };
    window.addEventListener("instituicao_updated", handleInstUpdated);

    return () => {
      unsub();
      window.removeEventListener("instituicao_updated", handleInstUpdated);
    };
  }, [user?.instituicaoId]);

  // Aplicar cores como variáveis CSS (adicionar este efeito)
  useEffect(() => {
    if (activeInst) {
      document.documentElement.style.setProperty('--color-primary', activeInst.primaryColor || "#050b38");
      document.documentElement.style.setProperty('--color-secondary', activeInst.secondaryColor || "#070e2d");
      document.documentElement.style.setProperty('--color-accent', activeInst.accentColor || "#FFB800");
    }
  }, [activeInst]);

  const [headerActions, setHeaderActions] = useState<ReactNode>(null);

  const [innerPath, setInnerPath] = useState<string[]>([]);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [urlParams, setUrlParams] = useState<{
    processoId?: string;
    dept?: string;
    role?: string;
    shared_by?: string;
  }>({});
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showQuantumModal, setShowQuantumModal] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [backupAlert, setBackupAlert] = useState<{ message: string; type: string } | null>(null);
  const [showSectorSelector, setShowSectorSelector] = useState(false);
  const [assignedSectorsForLogin, setAssignedSectorsForLogin] = useState<string[]>([]);
  const [selectedSectorForLogin, setSelectedSectorForLogin] = useState<string>("");
  const [sessionTerminatedNotice, setSessionTerminatedNotice] = useState<string | null>(null);

  const handleSelectSector = (sector: string) => {
    if (!sector) return;
    const updatedUser = { ...user, setor: sector };
    setUser(updatedUser);
    localStorage.setItem("sigep_user", safeJSONStringify(updatedUser));
    localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updatedUser));
    setDashboardTitle(sector);
    setShowSectorSelector(false);
    setView("dashboard");
  };

  const handleConfirmSectorSelection = () => {
    if (!selectedSectorForLogin) return;
    handleSelectSector(selectedSectorForLogin);
  };

  // Sistema de Backup Automático de 12 horas e Restauração Automática no Arranque (Deploy/Remix)
  useEffect(() => {
    // Regra de restauração de base de dados no arranque (após deploy/remix)
    autoRestoreOnStartup().catch((e) =>
      console.warn("Erro ao executar restauração automática no arranque:", e),
    );

    // Verificação inicial ao carregar o sistema
    runAutomaticBackupIfNeeded().catch((e) =>
      console.warn("Erro ao verificar backup automático inicial:", e),
    );

    // Verificação periódica de 15 em 15 minutos enquanto o utilizador estiver logado
    // Isso garante que se o utilizador ficar 12h com o sistema aberto, o backup ocorre.
    const backupInterval = setInterval(() => {
      runAutomaticBackupIfNeeded().catch((e) =>
        console.warn("Erro ao verificar backup automático agendado:", e),
      );
    }, 15 * 60 * 1000); // 15 minutos

    const handleBackupAlert = (event: any) => {
      const detail = event.detail;
      if (detail && detail.message) {
        setBackupAlert({
          message: detail.message,
          type: detail.type || "info",
        });
        setTimeout(() => {
          setBackupAlert(null);
        }, 8000);
      }
    };

    window.addEventListener("sigep_backup_alert", handleBackupAlert);
    return () => {
      window.removeEventListener("sigep_backup_alert", handleBackupAlert);
      clearInterval(backupInterval);
    };
  }, []);

  const handleSyncData = async () => {
    setModalMessage("Sincronizando todos os dados com o servidor remoto (Firestore)...");
    try {
      const res = await firestoreService.ensureCloudDataInitialized();
      if (isSuperBossUser(extendedUser)) {
        await firestoreService.seedAllCollaborators(EFETIVO_GERAL_DATA);
      }
      setModalMessage("✅ Sucesso! Todos os dados e planos de actividades estão sincronizados com a nuvem e acessíveis em qualquer computador.");
    } catch (error) {
      console.error(error);
      setModalMessage("Erro ao sincronizar dados com o servidor remoto.");
    }
  };

  // Ativação automática e interativa do modo tela cheia ao carregar o sistema
  useEffect(() => {
    const enterFullScreen = () => {
      const docEl = document.documentElement;
      const requestMethod =
        docEl.requestFullscreen ||
        (docEl as any).mozRequestFullScreen ||
        (docEl as any).webkitRequestFullScreen ||
        (docEl as any).msRequestFullscreen;

      if (requestMethod) {
        requestMethod.call(docEl).catch((err) => {
          console.debug(
            "Tentativa de tela cheia automática impedida pelo navegador. Aguardando interação...",
          );
        });
      }
    };

    // Tentar de imediato no carregamento
    enterFullScreen();

    // Registamos um listener de clique/toque único para garantir a ativação na primeira interação
    const handleFirstGesture = () => {
      enterFullScreen();
      document.removeEventListener("click", handleFirstGesture);
      document.removeEventListener("touchstart", handleFirstGesture);
    };

    document.addEventListener("click", handleFirstGesture);
    document.addEventListener("touchstart", handleFirstGesture);

    return () => {
      document.removeEventListener("click", handleFirstGesture);
      document.removeEventListener("touchstart", handleFirstGesture);
    };
  }, []);

  // Clear header actions whenever the main view changes
  useEffect(() => {
    setHeaderActions(null);
    setInnerPath([]);
  }, [view, subMenuStack]);

  useEffect(() => {
    // InitialAuthStateCheck de alta velocidade para arranque instantâneo
    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          return;
        }

        let initialUser: any = null;

        try {
          const storedUserStr =
            localStorage.getItem("sigep_logged_in_user") ||
            localStorage.getItem("sigep_user");
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            if (
              storedUser &&
              (storedUser.email ||
                storedUser.nuit ||
                storedUser.id ||
                storedUser.name)
            ) {
              initialUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                id: firebaseUser.uid,
                name:
                  firebaseUser.displayName ||
                  (firebaseUser.email
                    ? firebaseUser.email.split("@")[0]
                    : "Utilizador"),
                role: "Utilizador",
                status: "Ativo",
                ...storedUser,
              };

              // A capa de entrada inicial ('presentation') deve ser preservada incondicionalmente
              // até que o utilizador clique explicitamente em Entrar no Sistema.
            }
          }
        } catch (e) {
          console.warn("Erro ao recuperar utilizador local:", e);
        }

        if (initialUser) {
          setUser(initialUser);
          setView((currentView: any) => {
            if (currentView === "presentation") {
              return "presentation";
            }
            return currentView;
          });
        } else {
          setUser(null);
          setView((currentView: any) => {
            if (currentView === "presentation") {
              return "presentation";
            }
            return "login";
          });
        }
        
        // Background Sync não-bloqueante
        if (initialUser && (initialUser.email || (initialUser as any).nuit)) {
          setTimeout(async () => {
            try {
              const usersRef = collection(db, "users");
              const q = (initialUser as any).email
                ? query(usersRef, where("email", "==", String((initialUser as any).email).toLowerCase().trim()))
                : query(usersRef, where("nuit", "==", String((initialUser as any).nuit).trim()));

              const snap = await Promise.race([
                getDocs(q),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout sync")), 2000))
              ]) as any;

              if (snap && !snap.empty) {
                const latestData = { ...snap.docs[0].data(), id: snap.docs[0].id } as any;
                const refinedRole = determineUserRole(latestData);

                const localSessionToken = localStorage.getItem("sigep_session_token");
                if (
                  latestData.currentSessionToken &&
                  localSessionToken &&
                  latestData.currentSessionToken !== localSessionToken
                ) {
                  console.warn("[SIGEP] Sessão terminada: conta aberta noutro dispositivo.");
                  localStorage.removeItem("sigep_logged_in_user");
                  localStorage.removeItem("sigep_user");
                  localStorage.removeItem("sigep_current_view");
                  localStorage.removeItem("sigep_session_token");
                  sessionStorage.removeItem("session_start");
                  setUser(null);
                  setView("login");
                  setSessionTerminatedNotice(
                    "A sua conta foi acedida através de outro dispositivo ou navegador. A sessão neste dispositivo foi encerrada automaticamente por segurança."
                  );
                  return;
                }

                if (!localSessionToken && latestData.currentSessionToken) {
                  localStorage.setItem("sigep_session_token", latestData.currentSessionToken);
                } else if (!latestData.currentSessionToken) {
                  const freshToken = localSessionToken || ("sigep_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12));
                  localStorage.setItem("sigep_session_token", freshToken);
                  updateDoc(doc(db, "users", latestData.id), { currentSessionToken: freshToken }).catch(() => {});
                }
                
                setUser((prev: any) => {
                  const updated = { ...prev, ...latestData, role: refinedRole, mustChangePassword: false };
                  localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updated));
                  localStorage.setItem("sigep_user", safeJSONStringify(updated));
                  return updated;
                });
              }
            } catch (syncErr) {
              console.warn("Background sync skipped:", syncErr);
            }
          }, 1000);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      }
    });

    return () => authUnsub();
  }, []);

  // Controlo de Sessão Única em Tempo Real:
  // Se o mesmo utilizador iniciar sessão num segundo dispositivo, o primeiro dispositivo fecha a sessão automaticamente
  useEffect(() => {
    if (!user) return;

    let targetDocId = user.id && !String(user.id).startsWith("local_") ? user.id : null;
    let unsubSnapshot: (() => void) | null = null;
    let isTerminating = false;

    const terminateDeviceSession = (remoteToken: string, localToken: string) => {
      if (isTerminating) return;
      isTerminating = true;

      console.warn(`[SIGEP] Sessão encerrada: utilizador autenticado noutro dispositivo (remoto: ${remoteToken}, local: ${localToken})`);

      // Limpar todos os dados de autenticação locais deste dispositivo
      localStorage.removeItem("sigep_logged_in_user");
      localStorage.removeItem("sigep_user");
      localStorage.removeItem("sigep_current_view");
      localStorage.removeItem("sigep_session_token");
      sessionStorage.removeItem("session_start");

      setUser(null);
      setView("login");
      setSubMenuStack([]);
      setHistoryStack([]);
      setDashboardTitle("");
      setDashboardItems([]);
      setDashboardActiveItem(undefined);
      setInnerPath([]);
      setSessionTerminatedNotice(
        "A sua conta foi acedida através de outro dispositivo ou navegador. Por motivos de segurança institucional do SIGEP, apenas é permitida uma sessão ativa em simultâneo. A sessão neste dispositivo foi encerrada automaticamente."
      );
    };

    const verifyToken = (remoteToken?: string) => {
      if (!remoteToken) return;
      const localToken = localStorage.getItem("sigep_session_token");
      if (localToken && remoteToken !== localToken) {
        terminateDeviceSession(remoteToken, localToken);
      }
    };

    const setupListener = async () => {
      try {
        let docIdToListen = targetDocId;
        if (!docIdToListen && (user.email || user.nuit)) {
          const usersRef = collection(db, "users");
          const q = user.email
            ? query(usersRef, where("email", "==", String(user.email).toLowerCase().trim()))
            : query(usersRef, where("nuit", "==", String(user.nuit).trim()));
          const snap = await getDocs(q);
          if (!snap.empty) {
            docIdToListen = snap.docs[0].id;
          }
        }

        if (docIdToListen) {
          const userDocRef = doc(db, "users", docIdToListen);
          unsubSnapshot = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                if (data?.currentSessionToken) {
                  verifyToken(data.currentSessionToken);
                }
              }
            },
            (err) => {
              console.warn("Aviso na escuta de sessão única:", err);
            }
          );
        }
      } catch (e) {
        console.warn("Erro ao configurar verificação de sessão única:", e);
      }
    };

    setupListener();

    // Verificação adicional no foco da janela ou retorno do segundo plano
    const checkActiveSession = async () => {
      if (document.visibilityState === "visible") {
        try {
          const localToken = localStorage.getItem("sigep_session_token");
          if (!localToken) return;

          let docId = targetDocId;
          if (!docId && (user.email || user.nuit)) {
            const usersRef = collection(db, "users");
            const q = user.email
              ? query(usersRef, where("email", "==", String(user.email).toLowerCase().trim()))
              : query(usersRef, where("nuit", "==", String(user.nuit).trim()));
            const snap = await getDocs(q);
            if (!snap.empty) docId = snap.docs[0].id;
          }

          if (docId) {
            const snap = await getDoc(doc(db, "users", docId));
            if (snap.exists()) {
              const remoteToken = snap.data()?.currentSessionToken;
              if (remoteToken && remoteToken !== localToken) {
                terminateDeviceSession(remoteToken, localToken);
              }
            }
          }
        } catch (e) {}
      }
    };

    window.addEventListener("focus", checkActiveSession);
    document.addEventListener("visibilitychange", checkActiveSession);

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      window.removeEventListener("focus", checkActiveSession);
      document.removeEventListener("visibilitychange", checkActiveSession);
    };
  }, [user?.id, user?.email, user?.nuit]);

  // Garantir que os dados do Administrador estejam na base de dados de forma assíncrona em segundo plano
  useEffect(() => {
    const timer = setTimeout(() => {
      const seedData = async () => {
        try {
          const usersRef = collection(db, "users");

          const adminData = {
            id: "ST849547771",
            uid: "ST849547771",
            name: "SLAITER TRIPAS",
            nome: "SLAITER TRIPAS",
            designacao: "SLAITER TRIPAS",
            email: "slaitertripas@gmail.com",
            usuario: "slaitertripas@gmail.com",
            role: "Proprietário / Administrador Geral",
            cargo: "Proprietário, Programador e Administrador Geral",
            cargoChefia: "Nenhum (Administrador Geral)",
            funcao: "Proprietário, Programador e Administrador Geral",
            categoria: "Proprietário, Programador e Administrador Geral",
            orgao: "Administração Geral do Sistema",
            unidade: "Administração Geral do Sistema",
            unidadeOrganica: "Administração Geral do Sistema",
            direcao: "Administração Geral do Sistema",
            departamento: "Administração Geral do Sistema",
            status: "Ativo / Proprietário e Administrador Geral",
            efetivo: false,
            isOwner: true,
            isProgrammer: true,
            mustChangePassword: false,
            password: "231383ft",
          };

          const qAdmin = query(
            usersRef,
            where("email", "==", "slaitertripas@gmail.com"),
          );
          const snapAdmin = await getDocs(qAdmin);

          if (snapAdmin.empty) {
            const docRef = doc(db, "users", "ST849547771");
            await setDoc(
              docRef,
              { ...adminData, createdAt: new Date().toISOString() },
              { merge: true },
            );
          } else {
            const docRef = snapAdmin.docs[0].ref;
            await updateDoc(docRef, {
              ...adminData,
              updatedAt: new Date().toISOString(),
            });
          }

          try {
            await deleteDoc(doc(db, "colaboradores", "ST849547771"));
          } catch (_) {}
          
          if (user) {
            const isDeveloper = user.email === "slaitertripas@gmail.com";
            const isAdmin =
              user.role === "Administrador" ||
              user.role === "Admin" ||
              String(user.role).toLowerCase().includes("admin");

            if ((isDeveloper || isAdmin) && user.status !== "Afetado") {
              const updatedUser = { ...user, status: "Afetado" };
              setUser(updatedUser);
              localStorage.setItem("sigep_user", safeJSONStringify(updatedUser));
              localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updatedUser));

              const q = query(usersRef, where("email", "==", user.email || ""));
              const snap = await getDocs(q);
              if (!snap.empty) {
                await updateDoc(doc(db, "users", snap.docs[0].id), {
                  status: "Afetado",
                  updatedAt: serverTimestamp(),
                });
              }
            }
          }
        } catch (err) {
          console.warn("Aviso na verificação de dados de fundo:", err);
        }
      };

      seedData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Sincronização automática em segundo plano com a base de dados Firebase
  useEffect(() => {
    const syncTimer = setTimeout(async () => {
      try {
        await firestoreService.ensureCloudDataInitialized();
      } catch (err) {
        console.warn("Aviso na inicialização de fundo da nuvem:", err);
      }
    }, 6000);
    return () => clearTimeout(syncTimer);
  }, []);

  useEffect(() => {
    if (user && user.id && user.email) {
      try {
        // Persistir apenas se for um usuário real
        localStorage.setItem("sigep_last_user_email", user.email);
      } catch (e) {
        console.warn("Failed to persist user data:", e);
      }
    }
  }, [user?.email, user?.id]);

  // Track Active Session (Heartbeat)
  useEffect(() => {
    if (!user || !user.id) return;

    const updateStatus = async (isOnline: boolean) => {
      try {
        await firestoreService.users.update(user.id, {
          lastSeenAt: new Date().toISOString(),
          isOnline: isOnline,
        });
      } catch (e) {
        console.warn("Session tracking error:", e);
      }
    };

    updateStatus(true);
    const interval = setInterval(() => updateStatus(true), 15 * 60 * 1000); // 15 min interval to conserve quota

    const handleVisibility = () => {
      if (document.visibilityState === "visible") updateStatus(true);
    };

    window.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user?.id]);

  useEffect(() => {
    if (user && view) {
      localStorage.setItem("sigep_current_view", view);
    }
  }, [view, user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const procId = params.get("processoId") || params.get("processoNo");
      const dept = params.get("dept");
      const role = params.get("role");
      const sharedBy = params.get("shared_by");

      if (procId || dept || role) {
        setUrlParams({
          processoId: procId || undefined,
          dept: dept || undefined,
          role: role || undefined,
          shared_by: sharedBy || undefined,
        });
        setView("colaboradores");
      }
    }

    const handleDataRestored = () => {
      console.log("🔄 Dados restaurados detectados no sistema. A recarregar estados...");
      try {
        const mat = localStorage.getItem("sigep_local_matrix_activities") || localStorage.getItem("sigep_matrix_activities");
        if (mat) setMatrixActivities(JSON.parse(mat));
        const act = localStorage.getItem("sigep_local_actividades") || localStorage.getItem("sigep_actividades");
        if (act) setActivities(JSON.parse(act));
        const colab = localStorage.getItem("sigep_local_colaboradores");
        if (colab) setRawColaboradores(JSON.parse(colab));
        const chef = localStorage.getItem("sigep_local_colaboradores_chefia");
        if (chef) setRawChefiaColaboradores(JSON.parse(chef));
        const supp = localStorage.getItem("sigep_local_suppliers");
        if (supp) setSuppliers(JSON.parse(supp));
        const proc = localStorage.getItem("sigep_local_processos_individuais") || localStorage.getItem("sigep_local_processos");
        if (proc) setProcessos(JSON.parse(proc));
        const exp = localStorage.getItem("sigep_local_expedientes");
        if (exp) setExpedientes(JSON.parse(exp));
        const nots = localStorage.getItem("sigep_local_notes");
        if (nots) setNotes(JSON.parse(nots));
        const evts = localStorage.getItem("sigep_local_calendar_events") || localStorage.getItem("sigep_local_events");
        if (evts) setEvents(JSON.parse(evts));
      } catch (e) {
        console.warn("Aviso ao recarregar dados pós-restauração:", e);
      }
    };

    window.addEventListener("sigep_data_restored", handleDataRestored);
    
    // Ouvinte para mudar de vista globalmente
    const handleOpenViewEvent = (e: any) => {
      if (e.detail?.view) {
        handleSetView(e.detail.view);
      }
    };
    window.addEventListener("open_view", handleOpenViewEvent);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === "q" || e.key === "Q")) || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "q" || e.key === "Q"))) {
        e.preventDefault();
        if (!isSuperBossUser(user)) return;
        setShowQuantumModal((prev) => !prev);
      }
    };
    const handleOpenQuantumEvent = () => {
      if (isSuperBossUser(user)) {
        setShowQuantumModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open_quantum_copilot", handleOpenQuantumEvent);

    return () => {
      window.removeEventListener("sigep_data_restored", handleDataRestored);
      window.removeEventListener("open_view", handleOpenViewEvent);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open_quantum_copilot", handleOpenQuantumEvent);
    };
  }, []);

  // Removed session invalidation effect to allow multiple concurrent logins.

  useEffect(() => {
    // Firestore Subscriptions - Optimized: Only subscribe to essentials initially
    const handleSubError = (err: any, col: string) => {
      const errStr = (err?.message || String(err)).toLowerCase();
      const errCode = err?.code || "";
      if (
        errCode === "resource-exhausted" ||
        errCode === "unavailable" ||
        errStr.includes("quota") ||
        errStr.includes("resource_exhausted") ||
        errStr.includes("resource-exhausted")
      ) {
        setIsQuotaExceeded(true);
        console.warn(
          `⚠️ Quota atingida para ${col}. Exibindo dados locais/cache.`,
        );
        return;
      }
      console.warn(
        `Erro na subscrição em ${col}:`,
        err?.message || String(err),
      );
      if (errCode === "permission-denied" || errStr.includes("permission")) {
        setErrorStates((prev) => ({
          ...prev,
          [col]: "Acesso restrito ou sem permissão.",
        }));
      }
    };

    // Core data needed for Home/Dashboard/Menu
    let unsubEvents = () => {};
    let unsubNotes = () => {};
    let unsubAccessAlerts = () => {};
    let unsubExp = () => {};
    let unsubLibraryVisits = () => {};
    let unsubLibraryBooks = () => {};
    let unsubServiceReqs = () => {};
    let unsubSuppliers = () => {};
    let unsubMatrix = () => {};
    let unsubActividades = () => {};
    let unsubColaboradores = () => {};
    let unsubChefias = () => {};
    let unsubProcessos = () => {};
    let unsubAlocacoes = () => {};
    let unsubFinancial = () => {};
    let unsubEfetivo = () => {};

    if (user) {
      // Basic data needed across views
      unsubMatrix = firestoreService.matrixActivities.subscribe(
        setMatrixActivities,
        (err) => handleSubError(err, "matrixActivities"),
        null,
      );
      unsubColaboradores = firestoreService.colaboradores.subscribe(
        (data: any[]) => {
          setRawColaboradores(data);
        },
        (err) => handleSubError(err, "colaboradores"),
        null,
      );
      unsubChefias = firestoreService.colaboradoresChefia.subscribe(
        (data: any[]) => {
          setRawChefiaColaboradores(data);
        },
        (err) => handleSubError(err, "colaboradoresChefia"),
        null,
      );
      unsubActividades = firestoreService.actividades.subscribe(
        setActivities,
        (err) => handleSubError(err, "actividades"),
        null,
      );

      if (
        view === "dashboard" ||
        view === "menu" ||
        view === "home" ||
        view === "calendar" ||
        view === "sistema"
      ) {
        unsubEvents = firestoreService.events.subscribe(
          setEvents,
          (err) => handleSubError(err, "events"),
          "createdAt",
          100,
        );
        unsubNotes = firestoreService.notes.subscribe(
          setNotes,
          (err) => handleSubError(err, "notes"),
          "createdAt",
          50,
        );
        unsubAccessAlerts = firestoreService.accessAlerts.subscribe(
          setAccessAlerts,
          (err) => handleSubError(err, "accessAlerts"),
          "createdAt",
          20,
        );
      }

      if (view === "processos" || view === "sistema") {
        unsubProcessos = firestoreService.processos.subscribe(
          setProcessos,
          (err) => handleSubError(err, "processos"),
          "createdAt",
          100,
        );
      }

      if (
        view === "suppliers" ||
        view === "supplier_management" ||
        view === "supplier_form" ||
        view === "dashboard" ||
        view === "sistema"
      ) {
        unsubSuppliers = firestoreService.suppliers.subscribe(
          setSuppliers,
          (err) => handleSubError(err, "suppliers"),
        );
      }

      if (view === "expediente" || view === "sistema") {
        unsubExp = firestoreService.expedientes.subscribe(
          setExpedientes,
          (err) => handleSubError(err, "expedientes"),
          "dataChegada",
          100,
        );
      }

      if (view === "service_requests" || view === "sistema") {
        unsubServiceReqs = firestoreService.serviceRequests.subscribe(
          setServiceRequests,
          (err) => handleSubError(err, "serviceRequests"),
          "createdAt",
          50,
        );
      }

      if (view === "alocacoes" || view === "sistema") {
        unsubAlocacoes = firestoreService.alocacoes_docentes.subscribe(
          setAlocacoes,
          (err) => handleSubError(err, "alocacoes_docentes"),
        );
      }

      if (view === "financial" || view === "sistema") {
        unsubFinancial = firestoreService.financialData.subscribe(
          setFinancialData,
          (err) => handleSubError(err, "financialData"),
        );
      }

      if (view === "efetivo" || view === "sistema") {
        unsubEfetivo = firestoreService.efetivo_escolar.subscribe(
          setEfetivoEscolar,
          (err) => handleSubError(err, "efetivo_escolar"),
        );
      }

      if (
        view === "library_visit" ||
        view === "visitor_services" ||
        view === "visitor_welcome" ||
        view === "library_management" ||
        view === "sistema"
      ) {
        unsubLibraryVisits = firestoreService.libraryVisits.subscribe(
          setLibraryRegistrations,
          (err) => handleSubError(err, "libraryVisits"),
          "createdAt",
          100,
        );
        unsubLibraryBooks = firestoreService.libraryBooks.subscribe(
          setBookRegistrations,
          (err) => handleSubError(err, "libraryBooks"),
          "createdAt",
          100,
        );
      }
    }

    let unsubMessages = () => {};
    if (user?.id && (view === "dashboard" || view === "menu")) {
      unsubMessages = firestoreService.messages.subscribe(
        user.id,
        (msgs: any[]) => {
          const unread = msgs.filter(
            (m) => m.recipientId === user.id && !m.read,
          ).length;
          setUnreadMessagesCount(unread);
        },
      );
    }

    return () => {
      [
        unsubEvents,
        unsubNotes,
        unsubExp,
        unsubLibraryVisits,
        unsubLibraryBooks,
        unsubServiceReqs,
        unsubSuppliers,
        unsubMatrix,
        unsubActividades,
        unsubColaboradores,
        unsubChefias,
        unsubProcessos,
        unsubAlocacoes,
        unsubFinancial,
        unsubEfetivo,
        unsubAccessAlerts,
      ].forEach((unsub) => unsub());
      unsubMessages();
    };
  }, [user, view]);

  useEffect(() => {
    if (!user || isSuperBossUser(user) || !accessAlerts.length) return;

    // Filter alerts meant for this user
    const unreadAlerts = accessAlerts.filter(
      (alert) => !alert.readBy?.includes(user.email),
    );

    const relevantAlerts = unreadAlerts.filter((alert) => {
      const userDept = user.departamento || "";
      const userDir = user.direcao || "";
      const target = alert.targetSector || "";

      const isBoss =
        user.name &&
        (user.name.toLowerCase().includes("diretor") ||
          user.name.toLowerCase().includes("chefe"));
      if (!isBoss) return false;

      return (
        isMatch(userDept, target) ||
        isMatch(userDir, target) ||
        isMatch(user.name, target)
      );
    });

    if (relevantAlerts.length > 0) {
      const messages = relevantAlerts.map(
        (a) =>
          `- O Utilizador ${a.userName} tentou aceder ao seu setor (${a.targetSector}).`,
      );
      setModalMessage(
        "Um ou mais utilizadores tentaram aceder à sua área reservada sem permissão:\n\n" +
          messages.join("\n"),
      );

      // Mark as read
      relevantAlerts.forEach((alert) => {
        firestoreService.accessAlerts
          .update(alert.id, {
            readBy: [...(alert.readBy || []), user.email],
          })
          .catch((err) =>
            console.error(
              "Error marking alert as read:",
              err?.message || String(err),
            ),
          );
      });
    }
  }, [accessAlerts, user]);

  useEffect(() => {
    if (efetivoEscolar.length > 0) {
      const nuits = efetivoEscolar
        .map((estudante) => estudante.nuit)
        .filter(Boolean);
      console.log("NUITs recolhidos:", nuits);
    }
  }, [efetivoEscolar]);

  const handleLogin = async (userData: any) => {
    let sessionToken = userData.currentSessionToken || localStorage.getItem("sigep_session_token");
    if (!sessionToken) {
      sessionToken = "sigep_sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 12);
    }
    localStorage.setItem("sigep_session_token", sessionToken);

    const userWithToken = { ...userData, currentSessionToken: sessionToken };
    setUser(userWithToken);
    localStorage.setItem("sigep_logged_in_user", safeJSONStringify(userWithToken));
    localStorage.setItem("sigep_user", safeJSONStringify(userWithToken));

    // Gravar telemetria de login e novo sessionToken no Firestore
    try {
      const nowIso = new Date().toISOString();
      const sessionPayload = {
        lastLoginAt: nowIso,
        lastSeenAt: nowIso,
        isOnline: true,
        currentSessionToken: sessionToken,
      };

      if (userData.id && !String(userData.id).startsWith("local_")) {
        firestoreService.users.update(userData.id, sessionPayload).catch((err: any) => {
          console.warn("Aviso silencioso ao gravar telemetria de login:", err);
        });
      } else if (userData.email || userData.nuit) {
        const usersRef = collection(db, "users");
        const q = userData.email
          ? query(usersRef, where("email", "==", String(userData.email).toLowerCase().trim()))
          : query(usersRef, where("nuit", "==", String(userData.nuit).trim()));
        getDocs(q).then((snap) => {
          if (!snap.empty) {
            updateDoc(doc(db, "users", snap.docs[0].id), sessionPayload).catch(() => {});
          }
        }).catch(() => {});
      }

      sessionStorage.setItem("session_start", nowIso);
    } catch (e: any) {
      console.error("Error tracking login:", e?.message || String(e));
    }

    setHistoryStack([]);

    // Redirecionamento automático baseado na alocação do utilizador
    const isSuperBoss = isSuperBossUser(userData);
    const isInstAdminAccount = isInstitutionalAdminAccount(userData);
    const isHRBoss = isHRBossUser(userData);
    const isTecnico = isTechnicianUser(userData);

    if (isSuperBoss) {
      // Administrador Geral ao aceder ao sistema vai direto à sua área de trabalho (Sistema Aberto)
      // Mas se tiver mais opções (se for chefe também), ele escolhe por onde navegar
      if (isChefeUser(userData)) {
        setDashboardTitle("");
        setView("admin_role_selection");
      } else {
        setDashboardTitle("Sistema");
        setDashboardActiveItem(undefined);
        setView("dashboard");
      }
    } else if (isInstAdminAccount) {
      // Administrador da Instituição: direciona para o painel de escolha entre Administrador e Usuário Normal
      setView("admin_role_selection");
    } else if (isHRBoss) {
      // Chefe da Repartição de Pessoal: direcionado diretamente para a área de trabalho da Repartição de Pessoal
      setDashboardTitle("Repartição de Pessoal");
      setDashboardActiveItem("Gestão de Pessoal");
      setView("dashboard");
    } else if (isTecnico) {
      // Técnicos devem sempre passar pela seleção de setor/área de trabalho
      // Se não tiverem setores atribuídos, oferecemos os setores do departamento deles
      const deptSectors = getSetoresByDepartamento(userData.departamento);
      const available = (userData.setoresAtribuidos && userData.setoresAtribuidos.length > 0)
        ? userData.setoresAtribuidos
        : (deptSectors.length > 0 ? deptSectors : [userData.departamento || ""]);
      
      setAssignedSectorsForLogin(available);
      setDashboardTitle(userData.departamento || userData.direcao || "Departamento de Património");
      setView("sector_selection");
    } else {
      if (userData.setoresAtribuidos && Array.isArray(userData.setoresAtribuidos) && userData.setoresAtribuidos.length > 1) {
        setAssignedSectorsForLogin(userData.setoresAtribuidos);
        setSelectedSectorForLogin(userData.setoresAtribuidos[0]);
        setDashboardTitle(userData.departamento || userData.direcao || "Departamento de Património");
        setView("sector_selection");
      } else {
        // Cada colaborador afetado, ao fazer login, será direcionado à sua área de trabalho afetado
        const workspace = getUserWorkspace(userData);
        if (workspace) {
          setDashboardTitle(workspace);
          setView("dashboard");
        } else {
          // Fallback caso não tenha área definida
          setView("menu");
        }
      }
    }
  };

  const handleSelectAdminRoleMode = (mode: "admin" | "chefe" | "user") => {
    const targetUser = user || extendedUser;
    if (!targetUser) return;

    const updatedUser = { ...targetUser, activeRoleMode: mode };
    setUser(updatedUser);
    localStorage.setItem("sigep_user", safeJSONStringify(updatedUser));
    localStorage.setItem("sigep_logged_in_user", safeJSONStringify(updatedUser));

    if (mode === "admin") {
      // Se selecionar administrador, direciona ao painel da instituição
      setDashboardTitle("Sistema");
      setDashboardActiveItem("Gestão das Instituições");
      setView("dashboard");
    } else if (mode === "chefe") {
      // Se escolher como chefe de algum setor / departamento:
      const isHRBoss = isHRBossUser(updatedUser);
      if (isHRBoss) {
        setDashboardTitle("Repartição de Pessoal");
        setDashboardActiveItem("Gestão de Pessoal");
        setView("dashboard");
      } else if (updatedUser.setoresAtribuidos && Array.isArray(updatedUser.setoresAtribuidos) && updatedUser.setoresAtribuidos.length > 1) {
        setAssignedSectorsForLogin(updatedUser.setoresAtribuidos);
        setSelectedSectorForLogin(updatedUser.setoresAtribuidos[0]);
        setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Área de Chefia");
        setView("sector_selection");
      } else {
        const workspace = getUserWorkspace(updatedUser);
        if (workspace) {
          setDashboardTitle(workspace);
          setView("dashboard");
        } else {
          setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Painel de Chefia");
          setView("dashboard");
        }
      }
    } else {
      // Se escolher como usuario normal, deve ser direcionado a areas operacionais onde foi alocado
      const isTecnico = isTechnicianUser(updatedUser);

      if (isTecnico) {
        const deptSectors = getSetoresByDepartamento(updatedUser.departamento);
        const available = (updatedUser.setoresAtribuidos && updatedUser.setoresAtribuidos.length > 0)
          ? updatedUser.setoresAtribuidos
          : (deptSectors.length > 0 ? deptSectors : [updatedUser.departamento || ""]);
        setAssignedSectorsForLogin(available);
        setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Departamento");
        setView("sector_selection");
      } else if (updatedUser.setoresAtribuidos && Array.isArray(updatedUser.setoresAtribuidos) && updatedUser.setoresAtribuidos.length > 1) {
        setAssignedSectorsForLogin(updatedUser.setoresAtribuidos);
        setSelectedSectorForLogin(updatedUser.setoresAtribuidos[0]);
        setDashboardTitle(updatedUser.departamento || updatedUser.direcao || "Área de Trabalho");
        setView("sector_selection");
      } else {
        const workspace = getUserWorkspace(updatedUser);
        if (workspace) {
          setDashboardTitle(workspace);
          setView("dashboard");
        } else {
          setView("menu");
        }
      }
    }
  };

  const handleGlobalSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      // 1. Sync Chefia Accounts
      const result = await firestoreService.syncChefiaAccounts(colaboradores);

      // 2. Migrate System Config if missing in cloud but present in local
      try {
        const cloudConfig = await firestoreService.config.get("main_config");
        if (!cloudConfig) {
          const localName = localStorage.getItem("proprietarioName");
          if (localName) {
            await firestoreService.config.set("main_config", {
              proprietarioName: localName,
              proprietarioCargo:
                localStorage.getItem("proprietarioCargo") || "",
              proprietarioPhoto:
                localStorage.getItem("proprietarioPhoto") || null,
              itEmail: localStorage.getItem("itEmail") || "",
              itWhatsapp: localStorage.getItem("itWhatsapp") || "",
              itLinkedin: localStorage.getItem("itLinkedin") || "",
              itFacebook: localStorage.getItem("itFacebook") || "",
              itWeb: localStorage.getItem("itWeb") || "",
            });
          }
        }
      } catch (e) {
        console.warn("Skip config migration during sync:", e);
      }

      // 3. Migrate Monografia if missing in cloud
      try {
        const cloudMono =
          await firestoreService.monografia.getById("main_mono");
        if (!cloudMono) {
          const localAuthor = localStorage.getItem("mono_authorName");
          if (localAuthor) {
            await firestoreService.monografia.set("main_mono", {
              authorName: localAuthor,
              monoTitle: localStorage.getItem("mono_title") || "",
              orientador: localStorage.getItem("mono_orientador") || "",
              dedicatoriaText:
                localStorage.getItem("mono_dedicatoria_v3") || "",
              agradecimentosText:
                localStorage.getItem("mono_agradecimentos") || "",
              resumoText: localStorage.getItem("mono_resumo_v3") || "",
              abstractText: localStorage.getItem("mono_abstract") || "",
              updatedAt: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.warn("Skip mono migration during sync:", e);
      }

      alert(
        `Sincronização concluída com sucesso!\n\n- Contas de chefia e liderança atualizadas e sincronizadas.\n- Novas contas criadas: ${result.created}\n- Contas existentes atualizadas: ${result.updated}\n- Configurações e dados da monografia sincronizados na nuvem.\n\nAgora todas as atualizações feitas por qualquer utilizador são visíveis em tempo real em ambos os links.`,
      );
    } catch (error) {
      console.error("Erro na sincronização global:", error);
      alert("Erro ao realizar a sincronização. Por favor, tente novamente.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.id) {
        firestoreService.users
          .update(user.id, {
            isOnline: false,
          })
          .catch((e: any) => {
            console.warn("Erro ao definir status offline:", e?.message || String(e));
          });
      }
      sessionStorage.removeItem("session_start");
    } catch (e: any) {
      console.warn("Erro no logout:", e?.message || String(e));
    }

    setUser(null);
    localStorage.removeItem("sigep_current_view");
    localStorage.removeItem("sigep_logged_in_user");
    localStorage.removeItem("sigep_user");
    localStorage.removeItem("sigep_session_token");
    setSubMenuStack([]);
    setHistoryStack([]);
    setDashboardTitle("");
    setDashboardItems([]);
    setDashboardActiveItem(undefined);
    setInnerPath([]);
    setView("presentation");
  };

  const handleRegister = async (data: any) => {
    try {
      // 1. Criar Registo de utilizador para login com senha 123
      const nomeSeguro = String(data.nome || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(" ")
        .join(".");
      const defaultEmail = `${nomeSeguro}@songo.ac.mz`;
      const emailObj = data.email || defaultEmail;

      const collabId = generateCollaboratorId(data.nome, data.nuit || "");

      const newUserLogin = {
        email: emailObj,
        nuit: data.nuit || "",
        password: "1234",
        mustChangePassword: true,
        name: data.nome,
        role:
          data.cargo === "Administrador do Sistema" ? "Administrador" : "User",
      };

      // 2. Criar Processo Individual
      const newProcesso = {
        id: `PROC-${Math.floor(Math.random() * 10000)}`,
        colaboradorId: collabId,
        colaboradorNome: data.nome,
        dataEntrada: new Date().toISOString().split("T")[0],
        status: "Pendente",
        documentos: ["Ficha de Registo", "BI"],
        unidadeOriginal: data.unidade || "",
        unidadeAtual: data.unidade || "",
        direcao: data.direcao || "",
        departamento: data.departamento || "",
        tipo: "Registo Inicial",
        resumo: `Processo de admissão - ${data.funcao || data.cargo || "Funcionário"}`,
      };

      // 3. Adicionar aos Colaboradores
      const newColaborador = {
        id: collabId,
        numeroProcesso: collabId,
        ord: colaboradores.length + 1,
        nome: data.nome,
        genero: data.genero === "Masculino" || data.genero === "M" ? "M" : "F",
        dataNascimento: data.dataNascimento,
        localNascimento: {
          pais: data.localNascimento?.pais || "",
          provincia: data.localNascimento?.provincia || "",
          distrito: data.localNascimento?.distrito || "",
        },
        nuit: data.nuit,
        numeroBI: data.numeroBI,
        nivelAcademico: data.nivelAcademico,
        areaFormacao: data.areaFormacao,
        funcao: data.funcao,
        tipoContrato: data.tipoContrato,
        tipoRelacaoContractual: data.tipoRelacaoContractual,
        email: emailObj,
        tipo: data.tipo,
        efetivo:
          data.tipoRelacaoContractual?.includes("Quadro") &&
          !data.tipoRelacaoContractual?.includes("Fora"),
        unidade: data.unidade,
        direcao: data.direcao,
        departamento: data.departamento,
        cargo: data.cargo || "",
        validado: false,
      };

      await firestoreService.processos.add(newProcesso);
      await firestoreService.colaboradores.update(collabId, newColaborador);
      await firestoreService.users.set(collabId, {
        id: collabId,
        ...newUserLogin,
      });

      // Validation logic messages
      if (data.tipo === "Docente") {
        handleShowAlert(
          "O registo do docente será validado pela Direção Académica antes de ser incluído na alocação de horários.",
        );
      } else if (data.tipo === "CTA") {
        handleShowAlert(
          "O registo do CTA será validado pelo Chefe de Repartição de Pessoal antes de ser incluído na alocação de horários.",
        );
      } else {
        handleShowAlert(
          "Registo efetuado com sucesso! Aguarde a validação institucional.",
        );
      }

      setView("login");
    } catch (err: any) {
      console.error(err?.message || String(err));
      handleShowAlert("Erro ao processar o registo. Tente novamente.");
    }
  };

  const pushCurrentToHistory = useCallback(() => {
    setHistoryStack((prev) => {
      const currentSnapshot: NavigationSnapshot = {
        view,
        dashboardTitle,
        subMenuStack: subMenuStack,
        dashboardActiveItem,
        dashboardItems: dashboardItems,
      };
      
      const last = prev[prev.length - 1];
      if (
        last &&
        last.view === currentSnapshot.view &&
        last.dashboardTitle === currentSnapshot.dashboardTitle &&
        last.subMenuStack === currentSnapshot.subMenuStack &&
        last.dashboardActiveItem === currentSnapshot.dashboardActiveItem
      ) {
        return prev;
      }
      return [...prev, currentSnapshot];
    });
    try {
      window.history.pushState({ sigepNav: true }, "");
    } catch (e) {
      // Ignore
    }
  }, [view, dashboardTitle, subMenuStack, dashboardActiveItem, dashboardItems]);

  const handleSetView = useCallback((newView: typeof view) => {
    if (newView !== view) {
      pushCurrentToHistory();
      setView(newView);
    }
  }, [view, pushCurrentToHistory]);

  const handleEventClick = () => {
    pushCurrentToHistory();
    setView("event_detail");
  };

  const handleBackFromEvent = () => {
    setSelectedEvent(null);
    goBack();
  };

  const isCourse = (title: string) => {
    const upperTitle = (title || "").toUpperCase();
    return (
      upperTitle.includes("CURSO") ||
      upperTitle.includes("ENGENHARIA") ||
      upperTitle.includes("PESQUISA") ||
      upperTitle.includes("LICENCIATURA") ||
      upperTitle.includes("MESTRADO") ||
      upperTitle.includes("PÓS-GRADUAÇÃO") ||
      upperTitle.includes("POS-GRADUAÇÃO") ||
      upperTitle.includes("DEE") ||
      upperTitle.includes("DECC") ||
      upperTitle.includes("DECM") ||
      upperTitle.includes("DEPARTAMENTO DE ENGENHARIA") ||
      upperTitle.includes("DEPARTAMENTO DE PESQUISA") ||
      upperTitle.startsWith("DEPARTAMENTO DE")
    );
  };

  const isAdmin = isSuperBossUser(user) || isInstitutionalAdminUser(user);

  const openSubMenu = (
    title: string,
    items: { title: string; subItems?: { title: string }[] }[],
  ) => {
    pushCurrentToHistory();

    const lower = (title || "").toLowerCase().trim();

    if (title === "Caixa de Mensagens") {
      setDashboardTitle("Caixa de Mensagens");
      setDashboardActiveItem("Caixa de Mensagens");
      setView("dashboard");
      return;
    }
    if (title === "Assinatura Digital") {
      setDashboardTitle(title);
      setView("assinatura_digital");
      return;
    }
    if (title === "Economato" || title === "Gestão de Economato") {
      setDashboardTitle("Gestão de Economato");
      setView("economato");
      return;
    }
    if (title === "Gestão Patrimonial") {
      setDashboardTitle(title);
      setView("gestao_patrimonial");
      return;
    }
    if (title === "Documentos Normativos") {
      setDashboardTitle(title);
      setView("documentos_normativos");
      return;
    }
    if (title === "Relatórios") {
      setDashboardTitle(title);
      setView("relatorios");
      return;
    }
    if (
      title === "Gestão de Colaboradores" ||
      title === "Gestão de Pessoal" ||
      lower === "gestão de colaboradores" ||
      lower === "gestao de colaboradores"
    ) {
      setDashboardTitle("Gestão de Colaboradores");
      setDashboardActiveItem("Gestão de Pessoal");
      setView("colaboradores");
      return;
    }
    if (title === "Monografia" || title === "Gerar Monografia") {
      setDashboardTitle(title);
      setView("monografia");
      return;
    }
    if (title === "Gestão de Produtos e Preços") {
      setDashboardTitle(title);
      setView("produtos_precos");
      return;
    }
    if (title === "Gestão de Fornecedores" || title === "Fornecedores") {
      setDashboardTitle(title);
      setView("supplier_management");
      return;
    }
    if (
      title === "Registo de Fornecedores" ||
      title === "Registo de Fornecedor" ||
      title === "Formulário de Registo de Fornecedores" ||
      title === "Formulário de Registo de Fornecedor" ||
      title === "SupplierRegistration" ||
      title === "UGEA_SupplierForm"
    ) {
      setDashboardTitle("Registo de Fornecedor");
      setView("supplier_form");
      return;
    }
    if (title === "Plano de Aquisição") {
      setDashboardTitle(title);
      setView("plano_aquisicao");
      return;
    }
    if (title === "Plano de Contratação") {
      setDashboardTitle(title);
      setView("plano_contratacao");
      return;
    }

    // NAVEGAÇÃO DE PLANOS / GESTÃO DE PLANOS
    const isPlan =
      title === "PESOE" ||
      title === "Plano de Actividade da UGEA" ||
      title === "Plano de Atividade da UGEA" ||
      lower === "gestão de planos" ||
      lower === "gestao de planos" ||
      lower === "gestão de planos e actividades" ||
      lower === "gestao de planos e actividades" ||
      lower === "plano" ||
      lower === "planos" ||
      lower === "plano setorial" ||
      lower === "plano de atividades" ||
      lower === "planos de atividades" ||
      lower === "plano de actividades" ||
      lower === "planos de actividades" ||
      lower === "plano de atividade" ||
      lower === "plano de actividade" ||
      lower === "plano do gabinete" ||
      lower === "plano individual" ||
      lower === "meu plano individual" ||
      lower === "plano da direção" ||
      lower === "plano da direccao" ||
      lower === "planificação" ||
      lower === "planificacao" ||
      lower === "planificação de atividades" ||
      lower === "planificação de actividades" ||
      lower === "matriz de atividades" ||
      lower === "matriz de actividades" ||
      lower === "repartição de planificação" ||
      lower === "reparticao de planificacao" ||
      (lower.includes("plano") && !lower.includes("aquisição") && !lower.includes("contratação")) ||
      lower.includes("planific");

    if (isPlan) {
      setDashboardTitle(title);
      setDashboardActiveItem("Gestão de Planos");
      setView("plano_workflow");
      return;
    }

    if (title === "Entrada de Expediente" || title === "Saída de Expediente") {
      setDashboardTitle(title);
      setView("gestao_documentos");
      return;
    }

    if (title === "Painel da UGEA") {
      setDashboardTitle("Unidade Gestora e Executora de Aquisições");
      setView("dashboard");
      return;
    }

    if (items && items.length > 0) {
      setSubMenuStack((prev) => [...prev, { title, items }]);
      setView("submenu");
    } else {
      setDashboardTitle(title);
      setDashboardActiveItem(title);
      setView("dashboard");
    }
  };

  const goBack = useCallback(() => {
    setDashboardActiveItem(undefined);

    if (historyStack.length > 0) {
      const prevSnapshot = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, -1));

      setView(prevSnapshot.view as any);
      setDashboardTitle(prevSnapshot.dashboardTitle || "");
      setSubMenuStack(prevSnapshot.subMenuStack || []);
      setDashboardActiveItem(prevSnapshot.dashboardActiveItem);
      if (prevSnapshot.dashboardItems) {
        setDashboardItems(prevSnapshot.dashboardItems);
      }
      return;
    }

    // Fallback estrutural se a pilha de histórico estiver vazia
    if (view === "dashboard") {
      if (
        extendedUser?.setoresAtribuidos &&
        Array.isArray(extendedUser.setoresAtribuidos) &&
        extendedUser.setoresAtribuidos.length > 1
      ) {
        setView("sector_selection");
      } else if (subMenuStack.length > 0) {
        setView("submenu");
      } else {
        setView("menu");
      }
    } else if (view === "sector_selection") {
      setView("login");
    } else if (view === "submenu") {
      if (subMenuStack.length > 1) {
        setSubMenuStack((prev) => prev.slice(0, -1));
      } else {
        setSubMenuStack([]);
        setView("menu");
      }
    } else if (view === "menu") {
      setView("login");
    } else if (
      view === "login" ||
      view === "registration_form" ||
      view === "library_visit" ||
      view === "gestao_documentos" ||
      view === "monitoria" ||
      view === "colaboradores" ||
      view === "supplier_management" ||
      view === "plano_aquisicao" ||
      view === "plano_contratacao" ||
      view === "monografia" ||
      view === "economato" ||
      view === "gestao_patrimonial"
    ) {
      if (
        view === "gestao_documentos" ||
        view === "monitoria" ||
        view === "colaboradores" ||
        view === "monografia" ||
        view === "economato" ||
        view === "gestao_patrimonial"
      ) {
        if (dashboardTitle) {
          setView("dashboard");
        } else if (subMenuStack.length > 0) {
          setView("submenu");
        } else {
          setView("menu");
        }
      } else {
        setView(
          view === "supplier_management" ||
            view === "plano_aquisicao" ||
            view === "plano_contratacao"
            ? "menu"
            : "presentation",
        );
      }
    } else {
      setView("presentation");
    }
  }, [historyStack, view, subMenuStack, dashboardTitle]);

  useEffect(() => {
    const handlePopState = () => {
      goBack();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [goBack]);

  const handleBreadcrumbClick = (index: number, crumbText: string) => {
    pushCurrentToHistory();
    if (crumbText === "Menu principal" || index === 0) {
      setSubMenuStack([]);
      setView("menu");
      return;
    }
    const stackIdx = subMenuStack.findIndex(
      (s) => s.title.toLowerCase() === crumbText.toLowerCase(),
    );
    if (stackIdx !== -1) {
      setSubMenuStack((prev) => prev.slice(0, stackIdx + 1));
      setView("submenu");
    }
  };

  const handleShowAlert = (message: string) => {
    setModalMessage(message);
  };

  const currentSubMenu =
    subMenuStack.length > 0 ? subMenuStack[subMenuStack.length - 1] : null;

  const extendedUser = React.useMemo(() => {
    if (!user) return null;

    // Quick lookups using find() - still O(N) but memoized so it only runs when data changes
    // Only search in colaboradores if user is NOT found in processos to save cycles
    const userProcess = (processos || []).find(
      (p) =>
        (p.email &&
          user.email &&
          p.email.toLowerCase() === user.email.toLowerCase()) ||
        (p.nuit && user.nuit && p.nuit === user.nuit),
    );

    let colab = null;
    if (!userProcess && colaboradores && colaboradores.length > 0) {
      colab = colaboradores.find(
        (c) =>
          (c.email &&
            user.email &&
            c.email.toLowerCase() === user.email.toLowerCase()) ||
          (c.nuit && user.nuit && c.nuit === user.nuit),
      );
    }

    const role =
      userProcess?.cargoChefia &&
      userProcess.cargoChefia !== "Nenhum" &&
      userProcess.cargoChefia !== "-"
        ? userProcess.cargoChefia
        : colab?.cargoChefia &&
            colab.cargoChefia !== "Nenhum" &&
            colab.cargoChefia !== "-"
          ? colab.cargoChefia
          : user.role;

    const photoURL =
      userProcess?.fotoUrl || userProcess?.foto || user.photoURL || user.photo;

    const isOwner = isSuperBossUser(user) || user.isOwner;
    const systemOwnerName = isOwner ? (localStorage.getItem("proprietarioName") || user.name) : user.name;
    const systemOwnerPhoto = isOwner ? (localStorage.getItem("proprietarioPhoto") || photoURL) : photoURL;

    const targetSource = userProcess || colab;
    return {
      ...user,
      name: systemOwnerName,
      nome: systemOwnerName,
      role,
      photoURL: systemOwnerPhoto,
      title:
        targetSource?.title ||
        targetSource?.cargoChefia ||
        targetSource?.cargo ||
        user.title,
      cargo: targetSource?.cargo || user.cargo,
      cargoChefia: targetSource?.cargoChefia || user.cargoChefia,
      isChefia:
        targetSource?.isChefia ||
        user.isChefia ||
        !!(
          targetSource?.cargoChefia &&
          targetSource?.cargoChefia !== "Nenhum" &&
          targetSource?.cargoChefia !== "-"
        ),
      estadoMandato: targetSource?.estadoMandato || user.estadoMandato,
      status: targetSource?.status || user.status,
      direcao: targetSource?.direcao || user.direcao,
      departamento: targetSource?.departamento || user.departamento,
      reparticao: targetSource?.reparticao || user.reparticao,
      setor: targetSource?.setor || user.setor,
      areaDeAfetacao: targetSource?.areaDeAfetacao || user.areaDeAfetacao,
      setoresAtribuidos: targetSource?.setoresAtribuidos || user.setoresAtribuidos || [],
    };
  }, [user?.email, user?.nuit, processos?.length, colaboradores?.length]);

  return (
    <div
      className={`h-screen w-full flex flex-col font-serif relative ${view === "home" || view === "presentation" ? "bg-[#04092b] text-white" : "bg-white text-black"}`}
    >
      <AnimatePresence mode="wait">
          {!isMinimized ? (
            <motion.div
              key="main-system"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col overflow-hidden"
            >
              {isQuotaExceeded && (
              <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-[10px] font-black tracking-widest flex items-center justify-center gap-2 shadow-xl animate-pulse">
                <AlertCircle size={14} />
                LIMITE DE TRÁFEGO DIÁRIO ATINGIDO. O SISTEMA ESTÁ EM MODO DE LEITURA LIMITADA.
                <button onClick={() => setIsQuotaExceeded(false)} className="ml-4 opacity-50 hover:opacity-100">
                  <X size={14} />
                </button>
              </div>
            )}

            {view !== "home" && view !== "presentation" && view !== "login" && view !== "registration_form" && view !== "library_visit" && (
              <MainHeader
                unreadMessagesCount={unreadMessagesCount}
                user={extendedUser}
                activeInst={activeInst}
                colaboradores={colaboradores}
                onBack={goBack}
                showBack={historyStack.length > 0 || ((view as string) !== "menu" && (view as string) !== "login" && (view as string) !== "home")}
                onBreadcrumbClick={handleBreadcrumbClick}
                onLogout={handleLogout}
                onOpenMessages={() => {
                  pushCurrentToHistory();
                  setDashboardTitle("Caixa de Mensagens");
                  setView("dashboard");
                }}
                onOpenBackup={() => setShowBackupModal(true)}
                onOpenQuantumAI={() => setShowQuantumModal(true)}
                onMinimize={() => setIsMinimized(true)}
                onSync={handleSyncData}
                onOpenRoleSelector={() => setView("admin_role_selection")}
                breadcrumb={[
                  ...(subMenuStack.length > 0 ? ["Menu principal"] : []),
                  ...(view === "submenu" ? subMenuStack.slice(0, -1).map((s) => s.title) : subMenuStack.map((s) => s.title)),
                  ...(view !== "submenu" && view !== "menu" && dashboardTitle ? [dashboardTitle] : []),
                  ...(innerPath.length > 1 ? innerPath.slice(0, -1) : []),
                ].filter(Boolean)}
                title={innerPath.length > 0 ? innerPath[innerPath.length - 1] : view === "submenu" ? (subMenuStack.length > 0 ? subMenuStack[subMenuStack.length - 1].title : "") : view === "menu" ? "Menu Principal" : dashboardTitle || "Direção"}
                actions={headerActions}
              />
            )}

            <div className="flex-grow relative flex flex-col min-h-0 overflow-y-auto mt-0">
          <ViewRenderer
            view={view}
            user={user}
            extendedUser={extendedUser}
            dashboardTitle={dashboardTitle}
            dashboardItems={dashboardItems}
            processos={processos}
            colaboradores={colaboradores}
            events={events}
            expedientes={expedientes}
            libraryRegistrations={libraryRegistrations}
            bookRegistrations={bookRegistrations}
            notes={notes}
            goBack={goBack}
            onLogout={handleLogout}
            openSubMenu={openSubMenu}
            currentSubMenu={currentSubMenu}
            onShowAlert={handleShowAlert}
            onSetView={handleSetView}
            matrixActivities={matrixActivities}
            activities={activities}
            suppliers={suppliers}
            dashboardActiveItem={dashboardActiveItem}
            setInnerPath={setInnerPath}
            setDashboardTitle={setDashboardTitle}
            financialData={financialData}
            setFinancialData={setFinancialData}
            onNavigate={(title, items) => {
              openSubMenu(title, items || []);
            }}
            onUpdateEvent={(id, data) => firestoreService.events.update(id, data)}
            onDeleteEvent={(id) => firestoreService.events.delete(id)}
            onDeleteExpediente={(id) => firestoreService.expedientes.delete(id)}
            onDeleteBook={(id) => firestoreService.libraryVisits.delete(id)}
            onDeleteNote={(id) => firestoreService.notes.delete(id)}
            onUpdateUser={(id, data) => firestoreService.users.update(id, data)}
            onLogin={handleLogin}
            onSelectAdminRoleMode={handleSelectAdminRoleMode}
            onSelectSector={handleSelectSector}
          />
            </div>
          </motion.div>
        ) : (
          <div className="fixed inset-0 z-[10000] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-slate-100">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-[#FFB800] text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#121c60] text-[#FFB800] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <div className="w-6 h-6 bg-[#FFB800] rounded-md animate-pulse"></div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black text-[10px] uppercase tracking-widest rounded-full mb-3">
                Sistema Minimizado
              </span>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Ecrã Minimizado
              </h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
                A aplicação SIGEP está em modo minimizado. Clique no botão abaixo para restaurar a visualização completa do sistema.
              </p>
              <button
                onClick={() => setIsMinimized(false)}
                className="w-full py-3.5 px-6 bg-[#121c60] hover:bg-[#1b2880] text-[#FFB800] rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl border border-[#FFB800]/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Restaurar Ecrã Completo</span>
                <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse shadow-[0_0_8px_#00FF00]"></div>
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

        <AlertModal isOpen={!!modalMessage} onClose={() => setModalMessage("")} message={modalMessage} />
        <BackupRestoreModal isOpen={showBackupModal} onClose={() => setShowBackupModal(false)} />
        
        {view !== "login" && isSuperBossUser(user) && (
          <>
            <QuantumFloatingOrb
              currentView={dashboardTitle || view}
              onOpenCockpit={() => setShowQuantumModal(true)}
            />
            <QuantumCopilotModal
              isOpen={showQuantumModal}
              onClose={() => setShowQuantumModal(false)}
              currentView={dashboardTitle || view}
            />
          </>
        )}
        
        {sessionTerminatedNotice && (
          <div className="fixed inset-0 z-[999999] bg-[#0c1236]/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500/30 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-inner border border-red-100">
                <ShieldAlert size={36} strokeWidth={2.2} />
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-800 font-black text-[10px] uppercase tracking-widest rounded-full mb-3">
                Sessão Concorrente Detectada
              </span>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Sessão Encerrada Noutro Dispositivo
              </h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">
                {sessionTerminatedNotice}
              </p>
              <button
                onClick={() => setSessionTerminatedNotice(null)}
                className="w-full py-3.5 px-6 bg-[#121c60] hover:bg-[#1a298a] active:scale-95 text-[#FFB800] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all border border-[#FFB800]/40"
              >
                Compreendido / Ir para o Login
              </button>
            </div>
          </div>
        )}
        {backupAlert && (
          <div className="fixed top-5 right-5 z-[99999] bg-[#121c60] text-white border-2 border-[#FFB800] p-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md animate-bounce">
            <div className="p-2.5 bg-[#FFB800] text-[#121c60] rounded-xl font-bold shrink-0 shadow-md"><Database size={20} /></div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[#FFB800] tracking-widest block mb-0.5">Notificação do Backup</span>
              <p className="text-xs font-bold leading-tight text-white/95">{backupAlert.message}</p>
            </div>
            <button onClick={() => setBackupAlert(null)} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"><X size={18} /></button>
          </div>
        )}
      </div>
    );
  }
