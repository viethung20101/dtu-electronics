/**
 * MixedModeScheduler — orchestrates the digital ↔ SPICE coupling for
 * Phase 1b of the mixed-mode simulator project.
 *
 * Architecture in three layers:
 *
 *   ┌────────────────────────────┐
 *   │ MCU sim (AVR / RP2040 /    │  fires PinManager.onPinChange()
 *   │ ESP32 bridge)              │  events on every digitalWrite()
 *   └─────────────┬──────────────┘
 *                 │ pin edge
 *                 ▼
 *   ┌────────────────────────────┐
 *   │ MixedModeScheduler         │  batches edges, builds netlist via
 *   │   • alter V_pin sources    │  NetlistBuilder, drives ngspice via
 *   │   • short tran advance     │  NgSpiceInteractive
 *   │   • read v(node) for each  │
 *   │     component pin          │
 *   └─────────────┬──────────────┘
 *                 │ node voltage event
 *                 ▼
 *   ┌────────────────────────────┐
 *   │ SpiceResolvedPinResolver   │  threshold-converts v → HIGH/LOW,
 *   │                            │  fires component handler callback
 *   └────────────────────────────┘
 *
 * Phase 1a vendored NgSpiceInteractive and the WASM build.  This file is
 * the Phase 1b skeleton — the API and lifecycle are in place, but the
 * actual `alter + tran + readVec` loop is marked TODO because
 * (a) the WASM is single-threaded, so `bg_run` is not useful and we
 *     need the short-tran workaround, and
 * (b) the netlist build flow needs to be re-wired from the existing
 *     200 ms polling in `subscribeToStore.ts` to event-driven.
 *
 * For now, the scheduler exposes the API surface that component
 * handlers and DynamicComponent will use, plus a `start()` /
 * `stop()` lifecycle controlled by `useSimulatorStore.boards[*].running`.
 * When `start()` is called the scheduler logs "started" and components
 * subscribing to it get FLOATING resolutions — i.e. behavior
 * indistinguishable from "SPICE not available".  Phase 1b's next
 * sub-task replaces the stub data flow with real readVec calls.
 *
 * See:
 *   project/sim-mixedmode/phase-01-mixed-mode-coupling.md
 *   simulation/spice/wasm/NgSpiceInteractive.ts
 */

import { NgSpiceInteractive } from './wasm/NgSpiceInteractive';
import type { PinState, SpiceVoltageSource } from '../PinResolver';

/**
 * Identity of a "pin of interest" — a place a SpiceResolvedPinResolver
 * is watching for voltage changes.  The (boardId, pinName) → SPICE-net
 * mapping is built lazily as components register.
 */
export interface NodeSubscription {
  componentId: string;
  componentPinName: string;
  cb: (state: PinState, voltage: number) => void;
}

type SubscriptionToken = number;

/**
 * Singleton-style scheduler.  Multiple components use the same SPICE
 * engine instance; there's no value in running parallel solvers.
 *
 * Phase 1b: the scheduler holds the engine + the subscription registry
 * but does NOT yet drive real SPICE solves on pin edges.  Phase 1b
 * continued: implement the alter+tran+readVec loop, hook NetlistBuilder.
 */
class MixedModeSchedulerImpl implements SpiceVoltageSource {
  private engine: NgSpiceInteractive | null = null;
  private nextToken: SubscriptionToken = 1;
  private subscriptions = new Map<SubscriptionToken, NodeSubscription>();
  private running = false;
  private initPromise: Promise<void> | null = null;

  /** True while the scheduler is actively driving the SPICE engine. */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Start the scheduler.  Lazy-loads the WASM engine on first call.  No-op
   * if already running.  Called from `useSimulatorStore` when any board
   * transitions to running.
   */
  async start(): Promise<void> {
    if (this.running) return;
    if (!this.engine) {
      this.engine = new NgSpiceInteractive();
    }
    if (!this.initPromise) {
      this.initPromise = this.engine.init();
    }
    await this.initPromise;
    this.running = true;
    // TODO Phase 1b — wire up the alter+tran+readVec loop here.
    // Build initial netlist via NetlistBuilder, send to engine via
    // loadNetlist, then enter the event-driven update cycle.
  }

  /**
   * Stop the scheduler.  Components stay subscribed but stop receiving
   * SPICE-resolved events until the next start().
   */
  stop(): void {
    if (!this.running) return;
    this.running = false;
    // TODO Phase 1b — pause the SPICE driver loop.  Engine instance is
    // intentionally kept warm so restart is cheap; dispose only on
    // unmount or shutdown.
  }

  /**
   * Tear down the engine entirely.  Used on app unmount; in normal flow
   * we just stop() + start() to avoid re-paying the ~2-5 s WASM init
   * cost.
   */
  dispose(): void {
    this.running = false;
    if (this.engine) {
      this.engine.dispose();
      this.engine = null;
    }
    this.initPromise = null;
    this.subscriptions.clear();
  }

  /**
   * Register a component pin to receive SPICE-resolved voltage events.
   * Implements the SpiceVoltageSource contract used by
   * `createSpiceResolvedPinResolver`.  Returns an unsubscribe handle.
   *
   * Phase 1b: stub — no events ever fire.  The caller's resolver will
   * report whatever its fallback state is (typically FLOATING) and
   * never transition.  Phase 1b continued: actually emit events when
   * SPICE solves complete.
   */
  subscribe(
    componentId: string,
    componentPinName: string,
    cb: (state: PinState, voltage: number) => void,
  ): () => void {
    const token = this.nextToken++;
    this.subscriptions.set(token, { componentId, componentPinName, cb });
    return () => {
      this.subscriptions.delete(token);
    };
  }

  /**
   * Look up the latest known voltage on a component pin's SPICE net.
   * Phase 1b skeleton: always returns null (we haven't started solving
   * yet).  Phase 1b continued: query the NgSpiceInteractive engine's
   * last `readVec` cache and return the latest sample.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCurrentVoltage(_componentId: string, _componentPinName: string): number | null {
    return null;
  }

  /**
   * Notify the scheduler that an MCU pin changed state.  Phase 1b will
   * translate this into `alter V_<board>_<pin> dc <value>` + a short
   * `tran` step, then read affected nodes and dispatch to subscribers.
   *
   * Phase 1b skeleton: no-op.  Component handlers continue to receive
   * events from the legacy PinManager path until Phase 1b continued.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMcuPinChange(_boardId: string, _pinName: string, _state: boolean, _vcc: number): void {
    // intentionally empty
  }
}

/** The one and only scheduler.  Lazily constructed. */
let instance: MixedModeSchedulerImpl | null = null;

export function getMixedModeScheduler(): MixedModeSchedulerImpl {
  if (!instance) instance = new MixedModeSchedulerImpl();
  return instance;
}

/** Test helper — drops the singleton so test runs don't pollute each
 *  other. NEVER call from production code. */
export function __resetMixedModeScheduler(): void {
  if (instance) instance.dispose();
  instance = null;
}

export type MixedModeScheduler = MixedModeSchedulerImpl;
