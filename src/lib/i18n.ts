/**
 * Módulo de Internacionalização (i18n) do SIGEP
 * Suporta Português (pt) e Inglês (en).
 */

export type Language = "pt" | "en";

export const translations = {
  pt: {
    systemTitle: "SIGEP - Sistema Integrado de Gestão Estratégica e Planificação",
    loginTitle: "Acesso ao Sistema",
    loginSubtitle: "Insira as suas credenciais institucionais para aceder",
    identifierLabel: "Identificador (Email, NUIT ou ID)",
    passwordLabel: "Palavra-passe",
    loginButton: "Entrar no Sistema",
    languageLabel: "Idioma / Language",
    forgotPassword: "Esqueceu a palavra-passe?",
    contactAdmin: "Contactar Administrador",
    changePasswordRequired: "Alteração Obrigatória de Palavra-passe",
    newPassword: "Nova Palavra-passe",
    confirmPassword: "Confirmar Palavra-passe",
    savePassword: "Guardar Nova Palavra-passe",
    profileSettings: "Configurações do Perfil",
    languagePreference: "Idioma Preferido",
    portuguese: "Português",
    english: "English (Inglês)",
    save: "Guardar",
    cancel: "Cancelar",
    success: "Sucesso",
    error: "Erro"
  },
  en: {
    systemTitle: "SIGEP - Integrated Strategic Management and Planning System",
    loginTitle: "System Login",
    loginSubtitle: "Enter your institutional credentials to access",
    identifierLabel: "Identifier (Email, NUIT or ID)",
    passwordLabel: "Password",
    loginButton: "Sign In",
    languageLabel: "Language",
    forgotPassword: "Forgot password?",
    contactAdmin: "Contact Administrator",
    changePasswordRequired: "Mandatory Password Change",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    savePassword: "Save New Password",
    profileSettings: "Profile Settings",
    languagePreference: "Preferred Language",
    portuguese: "Portuguese (Português)",
    english: "English",
    save: "Save",
    cancel: "Cancel",
    success: "Success",
    error: "Error"
  }
};

export function getTranslation(lang: Language = "pt", key: keyof typeof translations.pt): string {
  const dict = translations[lang] || translations.pt;
  return dict[key] || translations.pt[key] || key;
}

export function getCurrentLanguage(): Language {
  try {
    const user = JSON.parse(localStorage.getItem("sigep_logged_in_user") || "null");
    if (user && user.idioma) {
      return user.idioma as Language;
    }
    const stored = localStorage.getItem("sigep_language");
    if (stored === "en" || stored === "pt") {
      return stored as Language;
    }
  } catch (e) {}
  return "pt";
}

export function setLanguagePreference(lang: Language) {
  try {
    localStorage.setItem("sigep_language", lang);
    const userStr = localStorage.getItem("sigep_logged_in_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      user.idioma = lang;
      localStorage.setItem("sigep_logged_in_user", JSON.stringify(user));
    }
  } catch (e) {}
}
