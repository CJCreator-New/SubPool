import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusPill } from './StatusPill';
import { SlotFillBar } from './SlotFillBar';
import { Avatar } from './Avatar';
import { OverflowMenu } from './OverflowMenu';
import { TrustScore, TrustBadge } from '../trust-score';
import { cn } from '../ui/utils';
import { C } from '../../tokens';
import type { Pool } from '../../../lib/types';
import { getPlatform } from '../../../lib/constants';
import { useCurrency } from '../../../lib/currency-context';
import { ShieldAlert, ShieldCheck, ShieldEllipsis, MapPin, Monitor } from 'lucide-react';
import type { Platform as PlatformType } from '../../../lib/types';

interface PoolCardProps {
  id?: string;
  pool?: Pool;
  status?: 'open' | 'full';
  platformEmoji?: string;
  platformName?: string;
  planName?: string;
  platformColor?: string;
  slotsTotal?: number;
  slotsFilled?: number;
  pricePerSlot?: string;
  ownerInitials?: string;
  ownerName?: string;
  ownerColor?: string;
  ownerRating?: number;
  ownerTotalHosted?: number;
  isFlagged?: boolean;
  onReport?: () => void;
  onClick?: (pool: Pool) => void;
  index?: number;
  platformData?: PlatformType;
}

export function PoolCard({
  pool,
  status: manualStatus,
  platformEmoji: manualEmoji,
  platformName: manualName,
  planName: manualPlan,
  platformColor: manualColor,
  slotsTotal: manualTotal,
  slotsFilled: manualFilled,
  pricePerSlot: manualPrice,
  ownerInitials: manualInitials,
  ownerName: manualOwner,
  ownerColor: manualOwnerColor,
  ownerRating: manualRating,
  ownerTotalHosted: manualTotalHosted,
  isFlagged = false,
  onReport,
  onClick,
  index = 0,
  platformData,
}: PoolCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Derive from pool object or use manual props
  const platform = platformData || (pool ? getPlatform(pool.platform) : null);
  const status = manualStatus ?? pool?.status ?? 'open';
  const platformEmoji = manualEmoji ?? platform?.icon ?? '📦';
  const platformName = manualName ?? platform?.name ?? pool?.platform ?? 'Subscription';
  const planName = manualPlan ?? pool?.plan_name ?? 'Standard Plan';
  const platformColor = manualColor ?? (platform as any)?.bg ?? 'rgba(200,241,53,0.15)';
  const slotsTotal = manualTotal ?? pool?.total_slots ?? 4;
  const slotsFilled = manualFilled ?? pool?.filled_slots ?? 2;
  const { formatPrice: currencyFormat } = useCurrency();
  const pricePerSlot = manualPrice ?? (pool ? currencyFormat(pool.price_per_slot / 100) : '0.00');
  
  const ownerName = manualOwner ?? pool?.owner?.display_name ?? pool?.owner?.username ?? 'Host';
  const ownerInitials = manualInitials ?? ownerName.charAt(0).toUpperCase();
  const ownerColor = manualOwnerColor ?? pool?.owner?.avatar_color ?? C.accentLime;
  const ownerRating = manualRating ?? pool?.owner?.rating ?? 0;
  const ownerTotalHosted = manualTotalHosted ?? pool?.owner?.total_hosted ?? 0;

  // Determine badge type based on rating and total hosted
  const isPro = ownerRating >= 4.5 && ownerTotalHosted >= 5;
  const isTrusted = ownerRating >= 4.0 && ownerTotalHosted >= 2;
  const isNew = ownerTotalHosted === 0;

  let badgeType: 'new' | 'trusted' | 'pro' | null = null;
  if (isPro) badgeType = 'pro';
  else if (isTrusted) badgeType = 'trusted';
  else if (isNew) badgeType = 'new';

  const menuOptions = [
    { label: 'Share this pool', onClick: () => console.log('Share') },
    { label: 'Save for later', onClick: () => console.log('Save') },
    { isDivider: true, label: '', onClick: () => { } },
    { icon: '🚩', label: 'Report this pool', isDanger: true, onClick: () => onReport?.() },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.23, 1, 0.32, 1] 
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (pool && onClick) onClick(pool);
      }}
      className={cn(
        "group relative flex w-full flex-col gap-3.5 rounded-lg border p-5 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm",
        isHovered ? "border-primary/40 shadow-xl shadow-black/40" : "border-border bg-card",
        isFlagged && "opacity-60",
        status === 'full' && !isHovered && "opacity-60 grayscale-[0.2]"
      )}
    >
      {/* Background Gradient Shine */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500",
        isHovered && "opacity-100"
      )} />

      {/* Flagged banner */}
      <AnimatePresence>
        {isFlagged && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="absolute top-0 left-0 right-0 bg-[#FFB800] px-3 py-1.5 flex items-center justify-center gap-1.5 z-10"
          >
            <span className="text-[12px]" role="img" aria-label="Warning">⚠️</span>
            <span className="font-mono font-bold text-[10px] text-background uppercase tracking-wider">
              Under Review
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status pill — top right */}
      <div className={cn(
        "absolute right-3.5 flex items-center gap-2 z-10 transition-all duration-300",
        isFlagged ? "top-[42px]" : "top-3.5"
      )}>
        <AnimatePresence>
          {isHovered && !isFlagged && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <OverflowMenu options={menuOptions} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Risk Badge */}
        {platform?.tos_risk_level && (
           <div className={cn(
             "px-2 py-0.5 rounded-full flex items-center gap-1 font-mono text-[8px] font-black uppercase tracking-widest border",
             platform.tos_risk_level === 'safe' ? "bg-success/10 border-success/20 text-success" :
             (platform.tos_risk_level === 'grey' || platform.tos_risk_level === 'grey_area') ? "bg-warning/10 border-warning/20 text-warning" :
             "bg-destructive/10 border-destructive/20 text-destructive"
           )}>
              {platform.tos_risk_level === 'safe' ? <ShieldCheck size={10} /> : 
               (platform.tos_risk_level === 'grey' || platform.tos_risk_level === 'grey_area') ? <ShieldEllipsis size={10} /> : 
               <ShieldAlert size={10} />}
              <span className="hidden sm:inline">{(platform.tos_risk_level === 'grey' || platform.tos_risk_level === 'grey_area') ? 'Caution' : platform.tos_risk_level}</span>
           </div>
        )}

        <StatusPill variant={status} />
      </div>

      {/* Content wrapper - add top padding if flagged */}
      <div className={cn("relative transition-all duration-300", isFlagged ? "pt-7" : "pt-0")}>
        {/* Row 1: Platform */}
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: platformColor }}
            className="flex size-11 items-center justify-center rounded-lg text-2xl transition-transform duration-500 group-hover:scale-110"
          >
            {platformEmoji}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-[17px] font-extrabold text-foreground leading-tight">
              {platformName}
            </span>
            <span className="font-mono text-[11px] font-medium text-muted-foreground">
              {planName}
            </span>
            <div className="flex items-center gap-2 mt-1">
               {platform?.sharing_type && (
                 <span className="font-mono text-[8px] uppercase tracking-tighter text-muted-foreground/60 border border-white/5 px-1.5 py-0.5 rounded-md">
                   {platform.sharing_type.replace('_', ' ')}
                 </span>
               )}
               {platform?.requires_same_location && (
                 <div className="flex items-center gap-0.5 text-primary">
                   <MapPin size={10} />
                   <span className="font-mono text-[8px] uppercase font-bold">Location Bound</span>
                 </div>
               )}
               {platform?.hardware_required && (
                 <div className="flex items-center gap-0.5 text-blue-400">
                   <Monitor size={10} />
                   <span className="font-mono text-[8px] uppercase font-bold">Hardware Req</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Row 2: Slot fill bar */}
        <div className="mt-4">
          <SlotFillBar filled={slotsFilled} total={slotsTotal} />
        </div>

        {/* Row 3: Slots filled label */}
        <span className="mt-1 block font-mono text-[11px] font-medium text-muted-foreground/60">
          {slotsFilled}/{slotsTotal} slots filled
        </span>

        {/* Row 4: Price + Owner */}
        <div className="mt-5 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-baseline gap-1 shrink-0">
            <span className="font-display text-[22px] font-black text-foreground">
              {pricePerSlot}
            </span>
            <span className="font-mono text-[11px] font-medium text-muted-foreground ml-1">
              /mo
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Trust Score */}
            {(ownerRating > 0 || ownerTotalHosted > 0) && (
              <div className="flex items-center gap-1.5 opacity-90 hidden sm:flex">
                <TrustScore rating={ownerRating} size="sm" />
                {badgeType && <TrustBadge type={badgeType} />}
              </div>
            )}
            <div className="transition-transform duration-300 group-hover:scale-105 shrink-0">
              <Avatar initials={ownerInitials} size="sm" color={ownerColor} />
            </div>
            <span className="font-mono text-[11px] font-medium text-muted-foreground truncate max-w-[60px]">
              {ownerName}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}