import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Eye, EyeOff, Lock, Copy, Check, Timer, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { usePoolCredentialsQuery } from '../../lib/supabase/queries';
import { decryptData } from '../../lib/crypto';
import { cn } from './ui/utils';

interface CredentialVaultProps {
  poolId: string;
  isMember: boolean;
}

export function CredentialVault({ poolId, isMember }: CredentialVaultProps) {
  const [revealed, setRevealed] = useState(false);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const { data: encryptedData, isLoading, error } = usePoolCredentialsQuery(poolId);

  useEffect(() => {
    let timer: number;
    if (revealed && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleHide();
    }
    return () => clearInterval(timer);
  }, [revealed, timeLeft]);

  const handleReveal = async () => {
    if (!encryptedData) return;
    
    setIsDecrypting(true);
    try {
      // Simulate high-security check delay
      await new Promise(r => setTimeout(r, 1200));
      const decrypted = await decryptData(encryptedData.encrypted_data, encryptedData.nonce);
      setDecryptedData(decrypted);
      setRevealed(true);
      setTimeLeft(60);
    } catch (err) {
      console.error('Decryption failed', err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleHide = () => {
    setRevealed(false);
    setDecryptedData(null);
  };

  const copyToClipboard = () => {
    if (!decryptedData) return;
    navigator.clipboard.writeText(decryptedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMember) {
    return (
      <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col items-center text-center space-y-4">
        <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
          <Lock size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-black text-xl uppercase italic tracking-tighter">Vault Locked</h3>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest max-w-[240px]">
            Node credentials are encrypted. Join this pool to initialize the decryption key.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-48 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse flex items-center justify-center">
        <Shield size={24} className="text-white/20 animate-spin" />
      </div>
    );
  }

  if (error || (!encryptedData && !isLoading)) {
    return (
      <div className="p-8 rounded-[32px] bg-destructive/5 border border-destructive/20 flex flex-col items-center text-center space-y-4">
        <AlertTriangle size={24} className="text-destructive" />
        <div className="space-y-1">
          <h3 className="font-display font-black text-xl uppercase italic tracking-tighter text-destructive">Protocol Offline</h3>
          <p className="font-mono text-[10px] text-destructive/70 uppercase tracking-widest">
            Credentials not found or access denied by central registry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div className={cn(
        "absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[34px] blur-xl opacity-0 transition-opacity duration-500",
        revealed && "opacity-100"
      )} />

      <div className={cn(
        "relative p-8 rounded-[32px] border transition-all duration-500",
        revealed ? "bg-black border-primary/40 shadow-glow-primary/10" : "bg-white/[0.02] border-white/5"
      )}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl border transition-colors",
              revealed ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
            )}>
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-display font-black text-xl uppercase italic tracking-tighter">Secure Vault</h3>
              <p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">AES-256-GCM Protocol Active</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {revealed && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-primary">
                <Timer size={12} className="animate-pulse" />
                <span>REVEAL WINDOW: {timeLeft}S</span>
              </div>
            )}
            {!revealed ? (
              <Button 
                onClick={handleReveal} 
                disabled={isDecrypting}
                className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl border-none"
              >
                {isDecrypting ? 'Decrypting...' : 'Reveal Credentials'}
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                onClick={handleHide}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-white"
              >
                Hide Vault
              </Button>
            )}
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-32 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]"
              >
                <div className="flex gap-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="size-2 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Encrypted Segment</p>
              </motion.div>
            ) : (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 font-mono text-sm break-all relative group/item">
                  <pre className="text-primary whitespace-pre-wrap">{decryptedData}</pre>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover/item:opacity-100"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
                  <AlertTriangle size={14} className="text-primary shrink-0" />
                  <p className="font-mono text-[9px] text-primary/80 uppercase leading-relaxed">
                    Security Warning: Credentials will auto-obfuscate in 1 minute. Never share these nodes outside the pool.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
