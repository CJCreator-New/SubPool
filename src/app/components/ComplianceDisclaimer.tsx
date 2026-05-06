import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ShieldCheck, Info, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface ComplianceDisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  platformName: string;
  riskLevel: 'safe' | 'grey_area' | 'risky';
  complianceNote?: string;
}

export function ComplianceDisclaimer({ 
  isOpen, 
  onClose, 
  onConfirm, 
  platformName, 
  riskLevel, 
  complianceNote 
}: ComplianceDisclaimerProps) {
  if (!isOpen) return null;

  const isHighRisk = riskLevel === 'risky';
  const isGrey = riskLevel === 'grey_area';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#0D0D0D] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
      >
        <div className="relative p-10 space-y-8">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className={cn(
              "size-20 rounded-3xl flex items-center justify-center shadow-lg",
              isHighRisk ? "bg-destructive/20 text-destructive shadow-destructive/20" :
              isGrey ? "bg-warning/20 text-warning shadow-warning/20" :
              "bg-success/20 text-success shadow-success/20"
            )}>
              {isHighRisk ? <AlertTriangle size={40} /> : isGrey ? <Info size={40} /> : <ShieldCheck size={40} />}
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-3xl uppercase italic tracking-tighter leading-none">
                {isHighRisk ? 'Security Protocol' : 'Compliance Advisory'}
              </h2>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                Node Uplink: {platformName} Cluster
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
              <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                {complianceNote || `You are about to join a shared ${platformName} node. Please review the following protocol specifications before initializing the uplink.`}
              </p>
              
              <ul className="space-y-3">
                {[
                  "Automated settlement via SubPool Escrow.",
                  "Zero-Tolerance policy for credential leakage.",
                  isHighRisk ? "Account status may be subject to platform TOS shifts." : "Standard platform sharing rules apply."
                ].map((rule, i) => (
                  <li key={i} className="flex items-start gap-3 font-mono text-[10px] text-muted-foreground uppercase">
                    <span className="text-primary mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {isHighRisk && (
              <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
                <p className="font-mono text-[9px] text-destructive uppercase leading-relaxed font-bold">
                  Warning: This platform has high volatility regarding account sharing policies. Disruption risks are elevated.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={onClose}
              className="flex-1 h-16 rounded-2xl font-display font-black uppercase tracking-widest text-[11px]"
            >
              Abort Mission
            </Button>
            <Button 
              onClick={onConfirm}
              className={cn(
                "flex-1 h-16 rounded-2xl font-display font-black uppercase tracking-widest text-[11px] shadow-lg",
                isHighRisk ? "bg-destructive text-white hover:bg-destructive/90" : "bg-primary text-black"
              )}
            >
              Authorize Uplink
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
