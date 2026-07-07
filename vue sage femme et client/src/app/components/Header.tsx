import { Bell } from "lucide-react";

interface HeaderProps {
  greeting?: string;
  name?: string;
  /** Non utilisé en desktop — conservé pour compatibilité */
  avatar?: string;
  showOffline?: boolean;
}

/**
 * Header de page commun aux deux espaces (patiente et sage-femme).
 * Affiche un bandeau gradient avec le titre de la section et une cloche.
 */
export function Header({
  greeting = "Bonjour",
  name,
}: HeaderProps) {
  const title = name ? `${greeting}, ${name} ✨` : greeting;

  return (
    <div className="bg-gradient-to-r from-[#C96B4B] via-[#B07590] to-[#C96B4B] px-8 py-6 mb-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-white text-2xl font-['Playfair_Display'] tracking-wide">
          {title}
        </h1>
        <button
          aria-label="Notifications"
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <Bell size={18} />
        </button>
      </div>
    </div>
  );
}
