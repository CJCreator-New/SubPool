import { useCurrency } from "../../lib/currency-context";
import { cn } from "./ui/utils";

export function CurrencyToggle() {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="flex bg-secondary/50 p-1 rounded-lg border border-border">
            <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all relative z-10",
                    currency === 'INR'
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                INR ₹
            </button>
            <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold transition-all relative z-10",
                    currency === 'USD'
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                USD $
            </button>
        </div>
    );
}
