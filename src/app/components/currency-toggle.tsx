import { useCurrency, CurrencyCode } from "../../lib/currency-context";
import { cn } from "./ui/utils";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'USD', label: 'USD', symbol: '$' },
    { code: 'EUR', label: 'EUR', symbol: '€' },
    { code: 'GBP', label: 'GBP', symbol: '£' },
    { code: 'INR', label: 'INR', symbol: '₹' },
    { code: 'TRY', label: 'TRY', symbol: '₺' },
];

export function CurrencyToggle() {
    const { currency, setCurrency, symbol } = useCurrency();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-3 gap-2 bg-white/[0.02] border border-white/5 hover:bg-white/10 transition-all rounded-xl"
                >
                    <Globe size={14} className="text-primary/70" />
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest">{currency}</span>
                    <span className="text-[10px] opacity-40">{symbol}</span>
                    <ChevronDown size={12} className="opacity-40" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-card/80 backdrop-blur-xl border-white/5 p-1 rounded-xl">
                {CURRENCIES.map((c) => (
                    <DropdownMenuItem
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
                            currency === c.code 
                                ? "bg-primary/20 text-primary font-black" 
                                : "text-muted-foreground hover:bg-white/5"
                        )}
                    >
                        <span className="font-mono text-[10px] uppercase tracking-widest">{c.label}</span>
                        <span className="text-[10px] opacity-60">{c.symbol}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
