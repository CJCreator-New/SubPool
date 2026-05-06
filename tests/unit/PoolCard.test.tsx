import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PoolCard } from '../../src/app/components/subpool/PoolCard';
import { CurrencyProvider } from '../../src/lib/currency-context';

// Wrap component with CurrencyProvider to satisfy useCurrency hook
function renderWithContext(ui: React.ReactElement) {
  return render(
    <CurrencyProvider>
      {ui}
    </CurrencyProvider>
  );
}

describe('PoolCard Component', () => {
    it('renders with manual props correctly', () => {
        renderWithContext(
            <PoolCard 
                platformName="Spotify" 
                planName="Family Plan" 
                slotsTotal={6} 
                slotsFilled={4}
                pricePerSlot="$3.50"
                ownerName="John Doe"
            />
        );

        // Assert platform name is rendered
        expect(screen.getByText('Spotify')).toBeInTheDocument();
        // Assert plan name is rendered
        expect(screen.getByText('Family Plan')).toBeInTheDocument();
        // Assert slots label
        expect(screen.getByText('4/6 slots filled')).toBeInTheDocument();
        // Assert price
        expect(screen.getByText('$3.50')).toBeInTheDocument();
        // Assert owner name
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('renders fallback UI when missing description/owner details', () => {
        renderWithContext(<PoolCard />);

        // By default it should show "Subscription"
        expect(screen.getByText('Subscription')).toBeInTheDocument();
        // Default plan
        expect(screen.getByText('Standard Plan')).toBeInTheDocument();
        // Default host
        expect(screen.getByText('Host')).toBeInTheDocument();
    });

    it('calls onClick when the card is clicked', () => {
        const handleClick = vi.fn();
        const mockPool = { id: 'test-pool-id', platform: 'netflix' } as any;

        renderWithContext(<PoolCard pool={mockPool} onClick={handleClick} />);

        // Click the first element matching the pool platform name
        const card = screen.getByText('Netflix').closest('div[class*="group relative"]');
        if (card) {
            fireEvent.click(card);
        }
        
        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(handleClick).toHaveBeenCalledWith(mockPool);
    });

    it('displays warning banner when isFlagged is true', () => {
        renderWithContext(<PoolCard isFlagged={true} />);
        
        expect(screen.getByText('Under Review')).toBeInTheDocument();
        expect(screen.getByLabelText('Warning')).toBeInTheDocument();
    });
});
