import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logError, logEvent } from './monitoring'

// Mock Sentry
vi.mock('@sentry/react', () => ({
    withScope: vi.fn((cb) => cb({ setTag: vi.fn() })),
    captureException: vi.fn(),
    addBreadcrumb: vi.fn(),
}))

describe('monitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('logError', () => {
        it('logs error to console in development mode', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
            const error = new Error('Test error')

            logError(error, { context: 'test' })

            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })

        it('handles non-Error objects', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            logError('string error')

            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })
    })

    describe('logEvent', () => {
        it('logs events to console in development mode', () => {
            const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => { })

            logEvent('test-event', { foo: 'bar' })

            expect(consoleSpy).toHaveBeenCalledWith(
                '[event] test-event',
                { foo: 'bar' }
            )
            consoleSpy.mockRestore()
        })
    })
})
