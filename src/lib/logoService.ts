import { firestoreService } from "./firestoreService";

// Serviço centralizado para gerenciar o logotipo recente do sistema e sincronizar com o navegador (Favicon)
export function getSystemLogo(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("systemLogo") || null;
  }
  return null;
}

export function updateBrowserFavicon(customLogoUrl?: string | null) {
  if (typeof document === "undefined") return;

  try {
    const logoToApply = customLogoUrl !== undefined ? customLogoUrl : getSystemLogo();

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
    if (!appleLink) {
      appleLink = document.createElement("link");
      appleLink.rel = "apple-touch-icon";
      document.head.appendChild(appleLink);
    }

    if (logoToApply) {
      link.href = logoToApply;
      appleLink.href = logoToApply;
    } else {
      link.href = "/sigep-logo.svg";
      appleLink.href = "/sigep-logo.svg";
    }
  } catch (err) {
    console.warn("Aviso ao atualizar favicon do navegador:", err);
  }
}

export function initFaviconSync() {
  if (typeof window === "undefined") return;

  // Atualiza imediatamente com o logotipo atual guardado
  updateBrowserFavicon();

  // Ouve eventos disparados ao carregar novo logotipo
  const handleLogoEvent = (e: any) => {
    const logo = e?.detail?.logo !== undefined ? e.detail.logo : getSystemLogo();
    updateBrowserFavicon(logo);
  };

  window.addEventListener("sigep_system_logo_updated", handleLogoEvent);
  window.addEventListener("storage", (e) => {
    if (e.key === "systemLogo") {
      updateBrowserFavicon(e.newValue);
    }
  });

  // Subscreve em tempo real à base de dados Firestore
  try {
    firestoreService.config.subscribe("main_config", (data) => {
      if (data && data.systemLogo !== undefined) {
        if (data.systemLogo) {
          localStorage.setItem("systemLogo", data.systemLogo);
        } else {
          localStorage.removeItem("systemLogo");
        }
        updateBrowserFavicon(data.systemLogo || null);
      }
    });
  } catch (err) {
    // Ignorar falhas de subscrição silenciosamente
  }
}
