import {
  User,
  MapPin,
  Phone,
  Mail,
  Award,
  Clock,
  Edit2,
  Bell,
  Globe,
  Shield,
  ChevronRight,
} from "lucide-react";

const stats = [
  { label: "Patientes suivies", value: "24" },
  { label: "Accouchements", value: "312" },
  { label: "Années d'expérience", value: "8" },
  { label: "Note moyenne", value: "4.9" },
];

const certifications = [
  { title: "Sage-femme d'État", org: "École Nationale de Sages-Femmes du Sénégal", year: "2016" },
  { title: "Spécialisation — Grossesses à haut risque", org: "CHU de Dakar", year: "2019" },
  { title: "Formation en télémédecine obstétricale", org: "OMS / Ministère de la Santé", year: "2022" },
];

const settings = [
  { icon: Bell, label: "Notifications", desc: "Alertes temps réel activées", action: "Configurer" },
  { icon: Globe, label: "Langue", desc: "Français / Wolof", action: "Modifier" },
  { icon: Shield, label: "Confidentialité", desc: "Données patients chiffrées", action: "Voir" },
  { icon: Clock, label: "Horaires de travail", desc: "Lun–Ven, 8h–17h", action: "Modifier" },
];

export function MidwifeProfilePage() {
  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif font-semibold text-foreground">Mon Profil</h1>
        <button className="flex items-center gap-1.5 border border-border bg-white text-sm text-foreground px-3 py-2 rounded-xl hover:bg-muted transition-colors">
          <Edit2 size={13} /> Modifier
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-[#F7C5A0]/30 to-[#F2A7A7]/20 rounded-2xl border border-[#F7C5A0]/40 p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F7C5A0] flex items-center justify-center text-xl font-bold text-[#C96B4B] shrink-0">
            AF
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-foreground">Aïssatou Fall</h2>
            <p className="text-sm text-muted-foreground">Sage-femme certifiée · Grade A</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin size={11} className="text-primary" />
              Centre de Santé de Thiès, Sénégal
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={13} className="text-primary" />
            <span>+221 77 800 12 34</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={13} className="text-primary" />
            <span className="truncate">a.fall@sante.sn</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={13} className="text-primary" />
            <span>N° Ordre : SF-2016-0347</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={13} className="text-primary" />
            <span>8h–17h, Lun–Ven</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-3 text-center">
            <p className="text-xl font-serif font-bold text-[#C96B4B]">{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Award size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground font-serif">Certifications & Formations</h2>
        </div>
        <div className="divide-y divide-border">
          {certifications.map((cert) => (
            <div key={cert.title} className="px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">{cert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cert.org}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{cert.year}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground font-serif">Paramètres</h2>
        </div>
        <div className="divide-y divide-border">
          {settings.map((s) => (
            <button key={s.label} className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left">
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <s.icon size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                {s.action} <ChevronRight size={12} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
