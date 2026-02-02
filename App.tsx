
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { CalendarView } from './components/CalendarView';
import { EventCard } from './components/EventCard';
import { SmartInput } from './components/SmartInput';
import { ImportData } from './components/ImportData';
import { DayModal } from './components/DayModal';
import { AgendaEvent } from './types';
import { FAMILY_MEMBERS } from './constants';
import { supabaseService } from './services/supabaseService';
import { Search, Database, Loader2, Calendar as CalendarIcon, Filter, Clock, AlertCircle } from 'lucide-react';

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'calendar' | 'list' | 'import'>('calendar');
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  // Ajuste: Por defecto 'day' (Hoy) para cumplir con la petición del usuario
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.fetchEvents();
      setEvents(data);
    } catch (err) {
      console.error("Error al cargar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString().split('T')[0];
    
    let result = events.filter(event => {
      const eventDate = new Date(event.date);
      const matchesMember = selectedMember === 'all' || event.memberId === selectedMember;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTime = true;
      if (timeRange === 'day') {
        matchesTime = event.date === todayStr;
      } else if (timeRange === 'week') {
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        const endOfNextWeek = new Date(startOfThisWeek);
        endOfNextWeek.setDate(startOfThisWeek.getDate() + 13);
        matchesTime = eventDate >= startOfThisWeek && eventDate <= endOfNextWeek;
      } else if (timeRange === 'month') {
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        matchesTime = eventDate >= startOfCurrentMonth && eventDate <= endOfNextMonth;
      } else if (timeRange === 'year') {
        matchesTime = eventDate.getFullYear() === now.getFullYear();
      }

      return matchesMember && matchesSearch && matchesTime;
    });

    // Ordenar por cercanía (fecha ascendente y luego hora)
    return result.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
    });
  }, [events, selectedMember, searchQuery, timeRange]);

  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      {selectedDateForModal && (
        <DayModal 
          date={selectedDateForModal} 
          events={events.filter(e => e.date === selectedDateForModal)} 
          onClose={() => setSelectedDateForModal(null)}
          onDelete={async (id) => {
            if (await supabaseService.deleteEvent(id)) setEvents(prev => prev.filter(e => e.id !== id));
          }}
        />
      )}

      {activeView === 'calendar' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Calendario Familiar</h1>
            <div className="flex -space-x-2">
              {FAMILY_MEMBERS.filter(m => m.id !== 'all').map(m => (
                <img key={m.id} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" alt={m.name} />
              ))}
            </div>
          </header>
          
          <SmartInput onEventParsed={async (e) => {
            const res = await supabaseService.saveEvent(e);
            if (res.success) loadData();
          }} />

          <CalendarView events={events} onDateClick={(date) => {
            if (events.some(e => e.date === date)) setSelectedDateForModal(date);
            else { setSearchQuery(date); setTimeRange('all'); setActiveView('list'); }
          }} />
        </div>
      )}

      {activeView === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                {id: 'day', label: 'Hoy'},
                {id: 'week', label: 'Esta + Próxima Semana'},
                {id: 'month', label: 'Este + Próximo Mes'},
                {id: 'year', label: 'Este Año'},
                {id: 'all', label: 'Todo'},
              ].map(range => (
                <button 
                  key={range.id} 
                  onClick={() => setTimeRange(range.id as TimeRange)} 
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${timeRange === range.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {FAMILY_MEMBERS.map(member => (
                <button 
                  key={member.id} 
                  onClick={() => setSelectedMember(member.id)} 
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedMember === member.id ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p>Actualizando agenda...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {filteredEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onDelete={async (id) => {
                    if (await supabaseService.deleteEvent(id)) setEvents(prev => prev.filter(e => e.id !== id));
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="py-20 bg-white rounded-[2rem] border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-4 text-center px-6">
              <Clock className="w-12 h-12 text-slate-200" />
              <p className="text-lg font-bold text-slate-600">No hay eventos para estos filtros</p>
              <button onClick={() => { setTimeRange('all'); setSelectedMember('all'); setSearchQuery(''); }} className="text-indigo-600 font-bold hover:underline">Ver toda la agenda</button>
            </div>
          )}
        </div>
      )}

      {activeView === 'import' && (
        <ImportData onImportComplete={async (newEvents) => {
          const res = await supabaseService.saveBulkEvents(newEvents);
          if (res.success) { loadData(); setActiveView('list'); }
        }} events={events} />
      )}
    </Layout>
  );
};

export default App;
