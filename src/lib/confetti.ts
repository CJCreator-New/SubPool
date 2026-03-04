import confetti from 'canvas-confetti';

export function celebrate(intensity: 'light' | 'full' = 'full', isDemoMode: boolean = false) {
    if (!isDemoMode) return;
    confetti({
        particleCount: intensity === 'full' ? 20 : 10,
        spread: 70,
        colors: ['#C8F135', '#4DFF91', '#F0ECE4'],
        origin: { y: 0.6 },
        disableForReducedMotion: true,
    });
}
