import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { ProgressCircle } from "../components/ProgressCircle";
import { Calendar, Lightbulb, Activity, Heart, Moon, Stethoscope, Baby, Scale, Bell } from "lucide-react";
import { motion } from "motion/react";
import { useApiCall } from "../../hooks/useApiCall";
import { patientService } from "../../api/patientService";
import { appointmentService } from "../../api/appointmentService";
import { useAuth } from "../../context/AuthContext";

// Taille approximative du fœtus selon la semaine
function getBabySize(weeks: number): string {
  if (weeks <= 8) return "framboise 🫐";
  if (weeks <= 12) return "citron 🍋";
  if (weeks <= 16) return "avocat 🥑";
  if (weeks <= 20) return "mangue 🥭";
  if (weeks <= 24) return "maïs 🌽";
  if (weeks <= 28) return "aubergine 🍆";
  if (weeks <= 32) return "noix de coco 🥥";
  if (weeks <= 36) return "pastèque 🍉";
  return "bébé prêt 👶🏾";
}

function PageSkeleton() {
  return (
    <div className="px-6 pt-6 space-y-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
      ))}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: patient, loading: pLoading } = useApiCall(() => patientService.getMe());
  const { data: appointments, loading: aLoading } = useApiCall(() =>
    appointmentService.list(true)
  );

  const loading = pLoading || aLoading;
  const nextAppt = appointments?.[0] ?? null;
  const name = patient?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "Aminata";

  if (loading) return <><Header name={name} /><PageSkeleton /></>;

  return (
    <div className="pb-6">
      <Header name={name} />

      <div className="px-6 -mt-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="flex flex-col items-center py-8">
            <h3 className="text-lg font-['Playfair_Display'] mb-4 text-gray-700">Votre Grossesse</h3>
            <ProgressCircle current={patient?.weeks ?? 0} total={42} />
            <p className="text-sm text-gray-500 mt-4 text-center">
              Votre bébé a la taille d'un{" "}
              <span className="font-semibold text-[#C96B4B]">{getBabySize(patient?.weeks ?? 0)}</span>
            </p>
          </Card>
        </motion.div>

        {nextAppt && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card gradient>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#C96B4B]/10 rounded-full flex items-center justify-center shrink-0">
                  <Calendar className="text-[#C96B4B]" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-800">Prochain Rendez-vous</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {nextAppt.type === "routine" ? "Suivi routine" :
                     nextAppt.type === "urgent" ? "Consultation urgente" :
                     nextAppt.type === "birth"  ? "Accouchement" : "Première consultation"}
                  </p>
                  <p className="text-xs text-gray-500">
                    🕐 {new Date(nextAppt.scheduled_at).toLocaleString("fr-FR", {
                      weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                  {nextAppt.note && <p className="text-xs text-gray-400 mt-1">📍 {nextAppt.note}</p>}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <Lightbulb className="text-[#C96B4B]" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Conseil du Jour</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Buvez au moins 2 litres d'eau par jour. L'hydratation est essentielle pour vous et votre bébé.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {patient && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="mb-3">
              <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Mon Suivi</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Card className="flex flex-col items-center py-4">
                <Scale className="text-[#F2A7A7] mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{patient.weeks} SA</div>
                <div className="text-xs text-gray-500 mt-1">Semaines</div>
              </Card>
              <Card className="flex flex-col items-center py-4">
                <Heart className="text-[#C96B4B] mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{patient.gravida}</div>
                <div className="text-xs text-gray-500 mt-1">Grossesses</div>
              </Card>
              <Card className="flex flex-col items-center py-4">
                <Moon className="text-[#B07590] mb-2" size={24} />
                <div className="text-2xl font-bold text-gray-800">{patient.para}</div>
                <div className="text-xs text-gray-500 mt-1">Naissances</div>
              </Card>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="mb-3">
            <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Actions Rapides</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { path: "/mesure", icon: Activity, label: "Mesurer ma santé", gradient: "from-[#F2A7A7] to-[#C96B4B]" },
              { path: "/grossesse", icon: Stethoscope, label: "Mon Suivi", gradient: "from-[#C96B4B] to-[#B07590]" },
              { path: "/bebe", icon: Baby, label: "Journal Bébé", gradient: "from-[#F7C5A0] to-[#F2A7A7]" },
              { path: "/alerte", icon: Bell, label: "Alertes", gradient: "from-[#B07590] to-[#C96B4B]" },
            ].map(({ path, icon: Icon, label, gradient }) => (
              <Card key={path} onClick={() => navigate(path)} gradient className="flex flex-col items-center py-6 cursor-pointer">
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="text-white" size={26} />
                </div>
                <div className="text-sm font-semibold text-gray-800 text-center">{label}</div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
