import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "fr";

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    close: "Close", loading: "Loading...", search: "Search", submit: "Submit", cancel: "Cancel",
    "welcome-back": "Welcome back", "search-greeting": "Welcome back, {{name}}", "search-desc": "Search your network to find warm introduction opportunities",
    "search-placeholder": "Search with AI — 'fintech interns in NYC', 'product managers at Google', etc.",
    "enrich-contacts": "Enrich All Contacts", "enriching": "Enriching...", "direct-matches": "Direct Matches", "indirect-opportunities": "Indirect Opportunities",
    "no-matches": "No matches found", "no-matches-desc": "Try a different search term or add more contacts to expand your network",
    visualize: "Visualize", import: "Import", download: "Download",
    "your-network": "Your Network", "total-contacts": "Total contacts", "active-requests": "Active requests",
    "upload-csv": "Upload your LinkedIn contacts CSV and let AI enrich them with detailed information",
    "ask-intro": "Ask Intro", title: "Title", company: "Company", industry: "Industry", seniority: "Seniority", location: "Location",
    confidence: "Confidence", "ai-summary": "AI Summary", "linkedin-profile": "LinkedIn Profile", email: "Email", phone: "Phone",
    "view-profile": "View Profile", "copy-linkedin": "Copy", "open-linkedin": "Open",
    "request-intro": "Request Introduction", "prefilled-message": "Hi {{connector}}, Confluence showed me you know {{name}}. Would you be willing to make a short intro?",
    "edit-message": "Edit your message:", "essay-label": "Tell us about yourself and why you want this introduction (minimum 100 words):",
    "essay-placeholder": "Share your background, goals, and why this introduction would be valuable for you...",
    "word-count": "{{count}} words", "send-request": "Send Request", "minimum-words": "Essay must be at least 100 words",
    "introduction-requests": "Introduction Requests", "manage-intros": "Manage your intro requests and help others connect",
    "requests-sent": "Requests Sent", "requests-received": "Requests Received", "no-requests-sent": "No requests sent yet",
    "search-opportunities": "Search for opportunities on the dashboard to request introductions", "go-dashboard": "Go to Dashboard",
    "no-requests-received": "No requests received yet", "requests-appear": "When others request intros through your network, they'll appear here",
    "intro-request-to": "Intro request to {{company}}", requested: "Requested", received: "Received", "their-message": "Their message:",
    "your-message": "Your message:", accept: "Accept", decline: "Decline", "mark-complete": "Mark as Complete",
    "request-accepted": "Request accepted!", "intro-template": "We've generated a message template to help you make the introduction.",
    "request-declined": "Request declined", "requester-notified": "The requester has been notified.",
    "accepted-intro": "You've accepted this request. Make the intro when ready!", "declined-intro": "This request was declined. Consider reaching out to other connections.",
    "marked-complete": "Introduction marked as complete!", "great-connecting": "Great work connecting people!",
    pending: "Pending", accepted: "Accepted", declined: "Declined", completed: "Completed", requester: "Requester",
    "requester-essay": "About the requester:", linkedin: "LinkedIn", back: "Back to Dashboard", via: "Via",
    "awaiting-approval": "Awaiting Approval", "in-progress": "In Progress", done: "Done", "update-status": "Update Status",
    "logout": "Logout", "intros": "Intros", "language": "Language", "connector-accepted": "The connector has accepted! They will be in touch soon.",
    "confluence": "Confluence",
  },
  fr: {
    close: "Fermer", loading: "Chargement...", search: "Rechercher", submit: "Soumettre", cancel: "Annuler",
    "welcome-back": "Bienvenue", "search-greeting": "Bienvenue, {{name}}", "search-desc": "Recherchez votre réseau pour trouver des opportunités d'introduction chaleureuse",
    "search-placeholder": "Recherchez avec l'IA — 'stagiaires fintech à NYC', 'chefs de produit chez Google', etc.",
    "enrich-contacts": "Enrichir tous les contacts", "enriching": "Enrichissement en cours...", "direct-matches": "Correspondances directes", "indirect-opportunities": "Opportunités indirectes",
    "no-matches": "Aucune correspondance trouvée", "no-matches-desc": "Essayez un terme de recherche différent ou ajoutez plus de contacts pour élargir votre réseau",
    visualize: "Visualiser", import: "Importer", download: "Télécharger",
    "your-network": "Votre réseau", "total-contacts": "Total des contacts", "active-requests": "Demandes actives",
    "upload-csv": "Téléchargez votre CSV de contacts LinkedIn et laissez l'IA les enrichir avec des informations détaillées",
    "ask-intro": "Demander une intro", title: "Titre", company: "Entreprise", industry: "Secteur", seniority: "Ancienneté", location: "Localisation",
    confidence: "Confiance", "ai-summary": "Résumé IA", "linkedin-profile": "Profil LinkedIn", email: "Email", phone: "Téléphone",
    "view-profile": "Voir le profil", "copy-linkedin": "Copier", "open-linkedin": "Ouvrir",
    "request-intro": "Demander une introduction", "prefilled-message": "Bonjour {{connector}}, Confluence m'a montré que vous connaissez {{name}}. Seriez-vous disposé à faire une courte introduction ?",
    "edit-message": "Modifiez votre message :", "essay-label": "Parlez-nous de vous et de pourquoi vous voulez cette introduction (minimum 100 mots) :",
    "essay-placeholder": "Partagez votre formation, vos objectifs et pourquoi cette introduction serait précieuse pour vous...",
    "word-count": "{{count}} mots", "send-request": "Envoyer la demande", "minimum-words": "L'essai doit contenir au moins 100 mots",
    "introduction-requests": "Demandes d'introduction", "manage-intros": "Gérez vos demandes d'introduction et aidez les autres à se connecter",
    "requests-sent": "Demandes envoyées", "requests-received": "Demandes reçues", "no-requests-sent": "Aucune demande envoyée pour le moment",
    "search-opportunities": "Recherchez des opportunités sur le tableau de bord pour demander des introductions", "go-dashboard": "Aller au tableau de bord",
    "no-requests-received": "Aucune demande reçue pour le moment", "requests-appear": "Lorsque d'autres demandent des intros via votre réseau, elles apparaîtront ici",
    "intro-request-to": "Demande d'introduction à {{company}}", requested: "Demandé", received: "Reçu", "their-message": "Leur message :",
    "your-message": "Votre message :", accept: "Accepter", decline: "Refuser", "mark-complete": "Marquer comme terminé",
    "request-accepted": "Demande acceptée !", "intro-template": "Nous avons généré un modèle de message pour vous aider à faire l'introduction.",
    "request-declined": "Demande refusée", "requester-notified": "Le demandeur a été notifié.",
    "accepted-intro": "Vous avez accepté cette demande. Faites l'introduction quand vous êtes prêt !", "declined-intro": "Cette demande a été refusée. Envisagez de contacter d'autres connexions.",
    "marked-complete": "Introduction marquée comme terminée !", "great-connecting": "Excellent travail de mise en relation !",
    pending: "En attente", accepted: "Acceptée", declined: "Refusée", completed: "Terminée", requester: "Demandeur",
    "requester-essay": "À propos du demandeur :", linkedin: "LinkedIn", back: "Retour au tableau de bord", via: "Via",
    "awaiting-approval": "En attente d'approbation", "in-progress": "En cours", done: "Terminé", "update-status": "Mettre à jour le statut",
    "logout": "Déconnexion", intros: "Introductions", language: "Langue", "connector-accepted": "Le connecteur a accepté ! Il vous contactera bientôt.",
    "confluence": "Confluence",
  },
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null;
    const lang = saved || (document.documentElement.lang as Language) || "en";
    setLanguageState(lang);
    document.documentElement.lang = lang;
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    localStorage.setItem("language", lang);
    window.location.reload();
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language]?.[key] || translations["en"][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v);
      });
    }
    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
}
