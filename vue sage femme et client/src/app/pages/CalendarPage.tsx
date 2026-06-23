import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Calendar, Clock, MapPin, Plus, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export function CalendarPage() {
  const appointments = [
    {
      id: 1,
      title: "Consultation prénatale",
      date: "26 Mai 2026",
      time: "10h00",
      location: "Centre de Santé Dalifort",
      type: "prenatal",
      upcoming: true,
      days: 3,
    },
    {
      id: 2,
      title: "Échographie morphologique",
      date: "2 Juin 2026",
      time: "14h30",
      location: "Clinique Madeleine",
      type: "echo",
      upcoming: true,
      days: 10,
    },
    {
      id: 3,
      title: "Vaccination Bébé - Polio 2",
      date: "15 Juin 2026",
      time: "09h00",
      location: "Centre de Santé Dalifort",
      type: "vaccination",
      upcoming: true,
      days: 23,
    },
    {
      id: 4,
      title: "Consultation post-natale",
      date: "15 Mai 2026",
      time: "11h00",
      location: "Centre de Santé Dalifort",
      type: "postnatal",
      upcoming: false,
    },
  ];

  const upcomingAppointments = appointments.filter((a) => a.upcoming);
  const pastAppointments = appointments.filter((a) => !a.upcoming);

  return (
    <div className="pb-6">
      <Header greeting="Votre" name="Agenda" avatar="📅" />

      <div className="px-6 -mt-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Playfair_Display'] text-lg text-gray-800">
              Rendez-vous à venir
            </h3>
            <span className="text-xs bg-[#C96B4B]/10 text-[#C96B4B] px-3 py-1 rounded-full font-semibold">
              {upcomingAppointments.length}
            </span>
          </div>

          <div className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        appointment.type === "prenatal"
                          ? "bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B]"
                          : appointment.type === "echo"
                          ? "bg-gradient-to-br from-[#C96B4B] to-[#B07590]"
                          : "bg-gradient-to-br from-[#F7C5A0] to-[#F2A7A7]"
                      }`}
                    >
                      <Calendar className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-800 text-sm leading-tight">
                          {appointment.title}
                        </h4>
                        <ChevronRight size={18} className="text-gray-400 shrink-0" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock size={14} />
                          <span>
                            {appointment.date} à {appointment.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin size={14} />
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                          Dans {appointment.days} jour{appointment.days > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">
            Rendez-vous passés
          </h3>

          <div className="space-y-3">
            {pastAppointments.map((appointment) => (
              <Card key={appointment.id} className="opacity-60">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="text-gray-500" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">
                      {appointment.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>
                        {appointment.date} à {appointment.time}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        ✓ Effectué
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Rappel
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              N'oubliez pas d'apporter votre carnet de santé et vos analyses lors de vos rendez-vous.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
