import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

type AppointmentType = "routine" | "urgent" | "birth" | "first";

interface Appointment {
  id: number;
  time: string;
  duration: number;
  patient: string;
  type: AppointmentType;
  weeks: number;
  note?: string;
}

const typeConfig: Record<AppointmentType, { label: string; color: string; bg: string; dot: string }> = {
  routine: { label: "Suivi routine", color: "text-[#B07590]", bg: "bg-[#B07590]/10 border-[#B07590]/20", dot: "bg-[#B07590]" },
  urgent: { label: "Consultation urgente", color: "text-destructive", bg: "bg-destructive/8 border-destructive/20", dot: "bg-destructive" },
  birth: { label: "Accouchement", color: "text-[#C96B4B]", bg: "bg-[#F7C5A0]/40 border-[#F7C5A0]", dot: "bg-[#C96B4B]" },
  first: { label: "Première consultation", color: "text-[#B07590]", bg: "bg-[#F2A7A7]/20 border-[#F2A7A7]/40", dot: "bg-[#F2A7A7]" },
};

const appointments: Record<number, Appointment[]> = {
  23: [
    { id: 1, time: "08:30", duration: 30, patient: "Fatou Diallo", type: "routine", weeks: 32 },
    { id: 2, time: "09:30", duration: 45, patient: "Mariama Sow", type: "routine", weeks: 28 },
    { id: 3, time: "10:30", duration: 30, patient: "Rokhaya Ndiaye", type: "urgent", weeks: 36, note: "TA élevée à surveiller" },
    { id: 4, time: "11:30", duration: 45, patient: "Adja Mbaye", type: "first", weeks: 20 },
    { id: 5, time: "14:00", duration: 60, patient: "Ndèye Diop", type: "birth", weeks: 38, note: "DPA aujourd'hui" },
    { id: 6, time: "15:30", duration: 30, patient: "Aminata Ba", type: "routine", weeks: 14 },
    { id: 7, time: "16:30", duration: 30, patient: "Khady Fall", type: "routine", weeks: 30 },
  ],
  24: [
    { id: 8, time: "09:00", duration: 45, patient: "Aïda Gueye", type: "routine", weeks: 22 },
    { id: 9, time: "11:00", duration: 30, patient: "Ndèye Diop", type: "birth", weeks: 38, note: "Post-partum J1" },
  ],
  25: [
    { id: 10, time: "10:00", duration: 30, patient: "Fatou Diallo", type: "routine", weeks: 33 },
    { id: 11, time: "14:30", duration: 45, patient: "Rokhaya Ndiaye", type: "urgent", weeks: 36, note: "Suivi pré-éclampsie" },
  ],
  26: [],
  27: [
    { id: 12, time: "09:30", duration: 30, patient: "Mariama Sow", type: "routine", weeks: 29 },
    { id: 13, time: "10:30", duration: 45, patient: "Nouvelle patiente", type: "first", weeks: 12 },
  ],
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function MidwifeCalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [view, setView] = useState<"month" | "day">("month");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const selectedAppts = appointments[selectedDay] || [];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">Agenda</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Consultations & accouchements</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-xl p-0.5">
            {(["month", "day"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === v ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {v === "month" ? "Mois" : "Jour"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-primary text-white text-xs px-3 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <Plus size={13} /> RDV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-border p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <ChevronLeft size={15} className="text-foreground" />
            </button>
            <p className="text-sm font-semibold text-foreground font-serif">{MONTHS[currentMonth]} {currentYear}</p>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <ChevronRight size={15} className="text-foreground" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-semibold uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = day === selectedDay;
              const hasAppts = appointments[day]?.length > 0;
              const hasUrgent = appointments[day]?.some(a => a.type === "urgent");
              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setView("day"); }}
                  className={`relative w-8 h-8 mx-auto rounded-xl text-xs font-medium transition-all flex items-center justify-center
                    ${isSelected ? "bg-primary text-white" : isToday ? "bg-[#F7C5A0]/40 text-[#C96B4B] font-bold" : "text-foreground hover:bg-muted"}
                  `}
                >
                  {day}
                  {hasAppts && !isSelected && (
                    <span className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${hasUrgent ? "bg-destructive" : "bg-[#C96B4B]"}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-border space-y-1.5">
            {(Object.entries(typeConfig) as [AppointmentType, typeof typeConfig[AppointmentType]][]).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day view */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground font-serif">
              {DAYS[(new Date(currentYear, currentMonth, selectedDay).getDay() + 6) % 7]} {selectedDay} {MONTHS[currentMonth]}
            </h2>
            <span className="text-xs text-muted-foreground">{selectedAppts.length} rendez-vous</span>
          </div>

          {selectedAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Clock size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Aucun rendez-vous ce jour</p>
              <button className="mt-3 flex items-center gap-1.5 bg-primary text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                <Plus size={13} /> Planifier un RDV
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {selectedAppts.map((appt) => {
                const cfg = typeConfig[appt.type];
                return (
                  <div key={appt.id} className={`flex gap-4 px-5 py-4 hover:bg-muted/20 cursor-pointer transition-colors`}>
                    <div className="flex flex-col items-center gap-1 shrink-0 w-12">
                      <span className="text-xs font-mono font-semibold text-foreground">{appt.time}</span>
                      <div className={`w-0.5 flex-1 rounded-full min-h-4 ${cfg.dot}`} />
                      <span className="text-[9px] text-muted-foreground">{appt.duration}min</span>
                    </div>
                    <div className={`flex-1 rounded-xl border p-3 ${cfg.bg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <User size={12} className={cfg.color} />
                            <p className={`text-sm font-semibold ${cfg.color}`}>{appt.patient}</p>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{cfg.label} · {appt.weeks} SA</p>
                          {appt.note && (
                            <p className="text-[11px] text-muted-foreground/80 mt-1 italic">{appt.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 text-[10px] text-muted-foreground">
                          <MapPin size={10} /> Salle 2
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
