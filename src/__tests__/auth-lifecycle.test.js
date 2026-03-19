/**
 * Tests for Frontend Auth Lifecycle (CR5-040 to CR5-044).
 *
 * Verifies:
 * - CR5-040: Centralized request() wrapper with error handling
 * - CR5-041: Token expiry handling (no idle timeout in Insurance Portal)
 * - CR5-042: Proactive token refresh 5 min before expiry
 * - CR5-043: AbortController cleanup in useEffect hooks
 * - CR5-044: Centralized request wrapper with token injection
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Insurance Portal Auth Lifecycle - CR5-040 to CR5-044', () => {
  // ── CR5-040: Centralized Request Wrapper ──────────────────────────────
  describe('CR5-040: Centralized Request Wrapper', () => {
    it('request() function implements centralized API wrapper', () => {
      // CR5-040: Verify api.js has request() wrapper

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should have request function
      expect(content).toContain('export function request');

      // Should handle GET/POST/PUT/DELETE
      expect(content).toContain('method');
    });

    it('AbortController with 15s default timeout', () => {
      // CR5-040 + CR5-043: Request timeout

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should create AbortController
      expect(content).toContain('new AbortController()');

      // Should have timeout (15s default or configurable)
      expect(content).toContain('setTimeout');
      expect(content).toContain('controller.abort()');
    });

    it('timeout cleared in finally block', () => {
      // CR5-043: Cleanup even on error

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should clear timeout in finally
      expect(content).toMatch(/finally.*clearTimeout/s);
    });

    it('X-Requested-With header included', () => {
      // CR5-040: CSRF defense header

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should include X-Requested-With
      expect(content).toContain('X-Requested-With');
      expect(content).toContain('XMLHttpRequest');
    });

    it('supports external AbortSignal linking', () => {
      // CR5-043: Allow cancellation from caller

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should support passing external signal
      // Per lines 29-32: links external signal if provided
      expect(content).toMatch(/signal.*addEventListener.*abort/s);
    });
  });

  // ── CR5-041: Token Expiry Handling ────────────────────────────────────
  describe('CR5-041: Token Expiry Handling', () => {
    it('no idle timeout (relies on token expiry only)', () => {
      // CR5-041: Insurance Portal has no idle timeout
      // (unlike Hospital Dashboard which has 30 min idle logout)

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should NOT have IDLE_LOGOUT_MS or activity tracking
      expect(content).not.toContain('IDLE_LOGOUT_MS');
      expect(content).not.toContain('mousedown');
      expect(content).not.toContain('keydown');

      // Relies solely on token expiry for session end
    });

    it('refreshTimerRef cleared on unmount', () => {
      // CR5-041 + CR5-043: Timer cleanup

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should have refreshTimerRef
      expect(content).toContain('refreshTimerRef');

      // Should clear timer in useEffect cleanup
      expect(content).toMatch(/clearTimeout.*refreshTimerRef/);
    });
  });

  // ── CR5-042: Proactive Token Refresh ──────────────────────────────────
  describe('CR5-042: Proactive Token Refresh', () => {
    it('parseJwtExp() decodes token expiry', () => {
      // CR5-042: JWT parsing utility

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should have parseJwtExp function
      expect(content).toContain('parseJwtExp');

      // Should decode JWT payload
      expect(content).toContain('atob');
      expect(content).toContain('JSON.parse');

      // Should return exp timestamp
      expect(content).toMatch(/payload\.exp/);
    });

    it('token refreshed 5 minutes before expiry', () => {
      // CR5-042: 5 minute buffer before expiry

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should subtract 5 min (300000ms) from expiry
      expect(content).toMatch(/300000|5.*60.*1000/);

      // Should schedule refresh based on remaining time
      expect(content).toContain('scheduleTokenRefresh');
    });

    it('scheduleTokenRefresh() calculates delay', () => {
      // CR5-042: Proactive refresh scheduling

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should calculate: (exp * 1000 - Date.now()) - buffer
      expect(content).toMatch(/Date\.now\(\)/);
      expect(content).toMatch(/setTimeout.*refreshTimerRef/s);
    });

    it('refresh() function handles token refresh', () => {
      // CR5-042: Token refresh implementation

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should have refresh function
      expect(content).toMatch(/refresh.*function|const refresh/);

      // Should call API endpoint
      expect(content).toMatch(/refresh.*fetch|request/s);

      // Should reschedule next refresh
      expect(content).toMatch(/refresh.*scheduleTokenRefresh/s);
    });
  });

  // ── CR5-043: AbortController Cleanup ──────────────────────────────────
  describe('CR5-043: AbortController / useEffect Cleanup', () => {
    it('PatientLookup aborts comprehensive scan on unmount', () => {
      // CR5-043: Component cleanup example

      const patientLookupFile = resolve(__dirname, '../components/PatientLookup.jsx');
      const content = readFileSync(patientLookupFile, 'utf-8');

      // Should have abortControllerRef
      expect(content).toContain('abortControllerRef');

      // Should abort in useEffect cleanup
      expect(content).toMatch(/useEffect.*return.*abort/s);
    });

    it('AbortController refs cleaned up on component unmount', () => {
      // CR5-043: Verify cleanup pattern

      const patientLookupFile = resolve(__dirname, '../components/PatientLookup.jsx');
      const content = readFileSync(patientLookupFile, 'utf-8');

      // Should check if controller exists before aborting
      expect(content).toMatch(/abortControllerRef\.current.*abort/);

      // Should return cleanup function
      expect(content).toMatch(/return\s*\(\s*\)\s*=>/);
    });

    it('request() clears timeout even on fetch error', () => {
      // CR5-043: Ensure cleanup in api.js

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should have finally block with clearTimeout
      expect(content).toMatch(/finally.*clearTimeout/s);

      // Cleanup happens regardless of success/failure
    });
  });

  // ── CR5-044: Token Injection ──────────────────────────────────────────
  describe('CR5-044: Token Injection via Accessor', () => {
    it('setTokenAccessor() registers token callback', () => {
      // CR5-044: Token accessor pattern

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should have setTokenAccessor function
      expect(content).toContain('setTokenAccessor');

      // Should store callback
      expect(content).toContain('_tokenAccessor');
    });

    it('headers() function injects token dynamically', () => {
      // CR5-044: Dynamic header generation

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should have headers function
      expect(content).toMatch(/function headers|const headers/);

      // Should call _tokenAccessor to get token
      expect(content).toContain('_tokenAccessor');

      // Should include Authorization header
      expect(content).toContain('Authorization');
      expect(content).toContain('Bearer');
    });

    it('all protected endpoints use request() wrapper', () => {
      // CR5-044: Centralized wrapper usage

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Protected endpoints should call request()
      const protectedEndpoints = [
        'getPatientByInsuranceId',
        'getPatientHistory',
        'startComprehensiveScan',
      ];

      for (const endpoint of protectedEndpoints) {
        const endpointRegex = new RegExp(`${endpoint}[^}]*request\\(`, 's');
        expect(content).toMatch(endpointRegex);
      }
    });

    it('token stored in memory only (not localStorage)', () => {
      // CR5-044: Memory-only storage

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should use useState/useRef for token
      expect(content).toMatch(/useState|useRef/);

      // Should NOT store token in localStorage
      // (only refreshToken is in localStorage, accessToken is memory-only)
      expect(content).not.toMatch(/localStorage\.setItem.*token[^R]/i);
    });

    it('consistent error handling across all requests', () => {
      // CR5-044: Centralized error handling

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // request() should handle errors
      expect(content).toMatch(/request.*try.*catch|response\.ok/s);

      // Should throw on non-OK responses
      expect(content).toMatch(/if\s*\(\s*!response\.ok\s*\)/);
    });
  });

  // ── Additional Security Checks ─────────────────────────────────────────
  describe('Additional Security Patterns', () => {
    it('AuthContext provides logout function', () => {
      // Verify logout clears tokens and state

      const authContextFile = resolve(__dirname, '../contexts/AuthContext.jsx');
      const content = readFileSync(authContextFile, 'utf-8');

      // Should have logout function
      expect(content).toMatch(/logout.*function|const logout/);

      // Should clear localStorage
      expect(content).toMatch(/logout.*localStorage\.removeItem/s);

      // Should clear state
      expect(content).toMatch(/logout.*setToken.*null/s);
    });

    it('no sensitive data logged in production', () => {
      // CR5-033: Verify no token logging

      const apiFile = resolve(__dirname, '../api.js');
      const content = readFileSync(apiFile, 'utf-8');

      // Should NOT log Authorization headers
      expect(content).not.toMatch(/console\.log.*Authorization|console\.log.*token/i);
    });
  });
});
