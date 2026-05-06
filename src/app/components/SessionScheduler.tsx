import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, Check, AlertCircle, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from './ui/button';
import { usePoolSessionsQuery, useBookSessionMutation } from '../../lib/supabase/queries';
import { format, addHours, startOfHour, isAfter, isBefore, areIntervalsOverlapping } from 'date-fns';
import { cn } from './ui/utils';
import { toast } from 'sonner';

interface SessionSchedulerProps {
  poolId: string;
  userId: string;
  isMember: boolean;
}

export function SessionScheduler({ poolId, userId, isMember }: SessionSchedulerProps) {
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [viewOffset, setViewOffset] = useState(0); // For scrolling the timeline
  
  const { data: sessions, isLoading } = usePoolSessionsQuery(poolId);
  const bookMutation = useBookSessionMutation();

  const now = startOfHour(new Date());
  const timelineHours = 48; // Show 48 hours
  const hours = Array.from({ length: timelineHours }).map((_, i) => addHours(now, i + viewOffset));

  const handleBook = async () => {
    if (!selectedSlot) return;
    
    try {
      await bookMutation.mutateAsync({
        pool_id: poolId,
        user_id: userId,
        start_at: selectedSlot.toISOString(),
        end_at: addHours(selectedSlot, 1).toISOString(),
      });
      toast.success('Frequency allocation confirmed.');
      setSelectedSlot(null);
    } catch (err: any) {
      toast.error(err.message || 'Interference detected. Slot unavailable.');
    }
  };

  const isOccupied = (hour: Date) => {
    return sessions?.some(s => 
      areIntervalsOverlapping(
        { start: new Date(s.start_at), end: new Date(s.end_at) },
        { start: hour, end: addHours(hour, 0.99) }
      )
    );
  };

  const getOccupant = (hour: Date) => {
    const session = sessions?.find(s => 
      areIntervalsOverlapping(
        { start: new Date(s.start_at), end: new Date(s.end_at) },
        { start: hour, end: addHours(hour, 0.99) }
      )
    );
    return session?.user;
  };

  if (!isMember) return null;

  return (
    <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-display font-black text-xl uppercase italic tracking-tighter">Access Schedule</h3>
            <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">Temporal Allocation Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewOffset(p => Math.max(0, p - 6))}
            disabled={viewOffset === 0}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setViewOffset(p => p + 6)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground uppercase tracking-widest px-4">
          <span>Active Timeline</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-white/5 border border-white/10" /> Available</div>
            <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-primary" /> Selected</div>
            <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-white/20" /> Occupied</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {hours.slice(0, 12).map((hour, i) => {
            const occupied = isOccupied(hour);
            const selected = selectedSlot?.getTime() === hour.getTime();
            const occupant = getOccupant(hour);
            const isPast = isBefore(hour, new Date());

            return (
              <button
                key={hour.toISOString()}
                disabled={occupied || isPast}
                onClick={() => setSelectedSlot(hour)}
                className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 relative group overflow-hidden",
                  selected ? "bg-primary border-primary text-black shadow-glow-primary" : 
                  occupied ? "bg-white/[0.05] border-white/10 opacity-50 cursor-not-allowed" :
                  isPast ? "opacity-20 cursor-not-allowed grayscale" :
                  "bg-white/[0.01] border-white/5 hover:border-primary/40 hover:bg-white/[0.03]"
                )}
              >
                <span className="font-mono text-[10px] uppercase font-black tracking-tighter">
                  {format(hour, 'HH:mm')}
                </span>
                <span className="font-mono text-[8px] uppercase opacity-60">
                  {format(hour, 'MMM d')}
                </span>
                
                {occupied && (
                  <div className="flex flex-col items-center mt-1">
                     <User size={10} className="mb-0.5" />
                     <span className="font-mono text-[7px] uppercase truncate w-16 text-center">{occupant?.username || 'Active'}</span>
                  </div>
                )}
                
                {selected && (
                  <motion.div layoutId="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-black text-white p-1 rounded-full border border-primary/20">
                    <Check size={8} />
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Clock size={20} />
              </div>
              <div className="space-y-1">
                <p className="font-display font-black text-sm uppercase italic">Selected Frequency</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  {format(selectedSlot, 'MMMM d, yyyy @ HH:mm')} - 1 HR SESSION
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="ghost" onClick={() => setSelectedSlot(null)} className="flex-1 sm:flex-initial font-mono text-[10px] uppercase tracking-widest">Cancel</Button>
              <Button 
                onClick={handleBook} 
                disabled={bookMutation.isPending}
                className="flex-1 sm:flex-initial bg-primary text-black font-black uppercase tracking-widest shadow-glow-primary"
              >
                {bookMutation.isPending ? 'TRANSMITTING...' : 'CONFIRM UPLINK'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex items-start gap-3">
        <AlertCircle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="font-mono text-[9px] text-muted-foreground uppercase leading-relaxed">
          Fair Usage Policy: Only one active session per member per platform at any given time. Interference with other members' scheduled uplinks may result in node suspension.
        </p>
      </div>
    </div>
  );
}
