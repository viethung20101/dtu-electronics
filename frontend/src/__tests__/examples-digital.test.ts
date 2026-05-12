/**
 * Digital examples — SPICE netlist + truth-table validation.
 *
 * For each board-less digital example:
 *   1. It's exported as boardFilter:'digital' (so the gallery groups it).
 *   2. Its wires reference only components that actually exist.
 *   3. buildNetlist produces a non-empty netlist with a ground node.
 *   4. Every component metadataId used is actually mapped to SPICE.
 *   5. Every gate / flip-flop INPUT pin is wired — no floating inputs.
 *      This is the test that catches "loose wires" before they ship.
 *   6. A representative subset is actually solved by ngspice and the
 *      output LED voltages are checked against the expected truth table.
 */
import { describe, it, expect } from 'vitest';
import { digitalExamples } from '../data/examples-digital';
import { buildNetlist } from '../simulation/spice/NetlistBuilder';
import { mappedMetadataIds } from '../simulation/spice/componentToSpice';
import { runNetlist } from '../simulation/spice/SpiceEngine';
import { exampleProjects } from '../data/examples';
import type { ExampleProject } from '../data/examples';

function toSpiceComponents(example: (typeof digitalExamples)[number]) {
  return example.components.map((c) => ({
    id: c.id,
    metadataId: c.type.replace(/^(wokwi|velxio)-/, ''),
    properties: c.properties ?? {},
  }));
}

function toSpiceWires(example: (typeof digitalExamples)[number]) {
  return example.wires.map((w) => ({
    id: w.id,
    start: { componentId: w.start.componentId, pinName: w.start.pinName },
    end: { componentId: w.end.componentId, pinName: w.end.pinName },
  }));
}

describe('digitalExamples — shape', () => {
  it('exports at least 15 board-less digital circuits', () => {
    expect(digitalExamples.length).toBeGreaterThanOrEqual(15);
  });

  it('every example uses boardFilter: "digital" and category: "circuits"', () => {
    for (const ex of digitalExamples) {
      expect((ex as any).boardFilter, `${ex.id} boardFilter`).toBe('digital');
      expect(ex.category, `${ex.id} category`).toBe('circuits');
    }
  });

  it('every digital example id is unique and ends up in exampleProjects', () => {
    const allIds = new Set(exampleProjects.map((e) => e.id));
    const missing = digitalExamples.map((e) => e.id).filter((id) => !allIds.has(id));
    expect(missing).toEqual([]);
  });

  it('no example lists a board in its components[]', () => {
    const BOARD_PREFIXES = [
      'wokwi-arduino-',
      'wokwi-esp32',
      'wokwi-raspberry-',
      'wokwi-nano-rp',
      'velxio-esp32',
      'velxio-raspberry-',
      'velxio-pi-pico-w',
      'wokwi-attiny',
    ];
    for (const ex of digitalExamples) {
      const boards = ex.components.filter((c) => BOARD_PREFIXES.some((p) => c.type.startsWith(p)));
      expect(
        boards.map((b) => b.id),
        `${ex.id}`,
      ).toEqual([]);
    }
  });

  it('no example sets a boardType (digital circuits are board-less)', () => {
    for (const ex of digitalExamples) {
      expect(ex.boardType, `${ex.id}`).toBeUndefined();
    }
  });

  it('every component type has a SPICE mapping', () => {
    const mapped = new Set(mappedMetadataIds());
    const unmapped = new Set<string>();
    for (const ex of digitalExamples) {
      for (const c of ex.components) {
        const id = c.type.replace(/^(wokwi|velxio)-/, '');
        if (!mapped.has(id)) unmapped.add(`${ex.id}:${c.id}(${id})`);
      }
    }
    expect(Array.from(unmapped)).toEqual([]);
  });

  it('every wire endpoint references a component that exists', () => {
    for (const ex of digitalExamples) {
      const ids = new Set(ex.components.map((c) => c.id));
      for (const w of ex.wires) {
        expect(ids.has(w.start.componentId), `${ex.id}:${w.id}.start(${w.start.componentId})`).toBe(
          true,
        );
        expect(ids.has(w.end.componentId), `${ex.id}:${w.id}.end(${w.end.componentId})`).toBe(true);
      }
    }
  });

  it('every example has at least one signal-generator (5V rail + SPICE ground)', () => {
    for (const ex of digitalExamples) {
      const hasSig = ex.components.some((c) => c.type === 'wokwi-signal-generator');
      expect(hasSig, `${ex.id} has no signal-generator (no 5V / ground reference)`).toBe(true);
    }
  });

  it('every example has at least one logic gate', () => {
    for (const ex of digitalExamples) {
      const gates = ex.components.filter((c) => c.type.startsWith('velxio-logic-gate-'));
      expect(gates.length, `${ex.id} has no logic gate`).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('digitalExamples — netlist generation', () => {
  it('each example produces a non-empty netlist with a ground net', () => {
    for (const ex of digitalExamples) {
      const { netlist } = buildNetlist({
        components: toSpiceComponents(ex),
        wires: toSpiceWires(ex),
        boards: [],
        analysis: { kind: 'op' },
      });
      expect(netlist.length, `${ex.id} netlist empty`).toBeGreaterThan(20);
      expect(netlist, `${ex.id} missing .end`).toContain('.end');
      // Each signal-generator must drop a V-source whose second node is 0.
      const sigs = ex.components.filter((c) => c.type === 'wokwi-signal-generator');
      for (const sig of sigs) {
        const re = new RegExp(`^V_${sig.id}\\s+\\S+\\s+0\\b`, 'm');
        expect(netlist, `${ex.id}: ${sig.id} GND not canonicalised to 0`).toMatch(re);
      }
    }
  });

  it('every gate emits a B-source card with a 1 MΩ load', () => {
    for (const ex of digitalExamples) {
      const { netlist } = buildNetlist({
        components: toSpiceComponents(ex),
        wires: toSpiceWires(ex),
        boards: [],
        analysis: { kind: 'op' },
      });
      const gates = ex.components.filter((c) => c.type.startsWith('velxio-logic-gate-'));
      for (const g of gates) {
        const bre = new RegExp(`^B_${g.id}\\b`, 'm');
        const rre = new RegExp(`^R_${g.id}_load\\b`, 'm');
        expect(netlist, `${ex.id}: gate ${g.id} missing B-source`).toMatch(bre);
        expect(netlist, `${ex.id}: gate ${g.id} missing load resistor`).toMatch(rre);
      }
    }
  });
});

// ─── Structural: every gate input pin must be wired ───────────────────────
// "Loose wires" usually mean a gate's A/B/C/D input is left dangling — the
// SPICE B-source then references an undriven net and the solve goes
// non-physical. This test enumerates every gate in every example and
// asserts the pins are connected.
const GATE_INPUT_PINS: Record<string, string[]> = {
  'logic-gate-not': ['A'],
  'logic-gate-and': ['A', 'B'],
  'logic-gate-or': ['A', 'B'],
  'logic-gate-nand': ['A', 'B'],
  'logic-gate-nor': ['A', 'B'],
  'logic-gate-xor': ['A', 'B'],
  'logic-gate-xnor': ['A', 'B'],
  'logic-gate-and-3': ['A', 'B', 'C'],
  'logic-gate-or-3': ['A', 'B', 'C'],
  'logic-gate-nand-3': ['A', 'B', 'C'],
  'logic-gate-nor-3': ['A', 'B', 'C'],
  'logic-gate-and-4': ['A', 'B', 'C', 'D'],
  'logic-gate-or-4': ['A', 'B', 'C', 'D'],
  'logic-gate-nand-4': ['A', 'B', 'C', 'D'],
  'logic-gate-nor-4': ['A', 'B', 'C', 'D'],
};

describe('digitalExamples — no loose wires', () => {
  it('every gate input pin is connected to at least one wire', () => {
    const failures: string[] = [];
    for (const ex of digitalExamples) {
      for (const c of ex.components) {
        const metaId = c.type.replace(/^(wokwi|velxio)-/, '');
        const inputPins = GATE_INPUT_PINS[metaId];
        if (!inputPins) continue;
        for (const pin of inputPins) {
          const wired = ex.wires.some(
            (w) =>
              (w.start.componentId === c.id && w.start.pinName === pin) ||
              (w.end.componentId === c.id && w.end.pinName === pin),
          );
          if (!wired) failures.push(`${ex.id}: ${c.id}.${pin} (${metaId}) is floating`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('every gate output pin (Y) feeds at least one wire', () => {
    // A gate whose Y is not consumed isn't catastrophic (SPICE handles it
    // because of the 1 MΩ load), but it usually indicates a wiring mistake
    // — the gate was placed and forgotten. Surface it as a separate failure
    // category so the maintainer can tell which kind of mistake it is.
    const failures: string[] = [];
    for (const ex of digitalExamples) {
      for (const c of ex.components) {
        const metaId = c.type.replace(/^(wokwi|velxio)-/, '');
        if (!GATE_INPUT_PINS[metaId]) continue;
        const wired = ex.wires.some(
          (w) =>
            (w.start.componentId === c.id && w.start.pinName === 'Y') ||
            (w.end.componentId === c.id && w.end.pinName === 'Y'),
        );
        if (!wired) failures.push(`${ex.id}: ${c.id}.Y (${metaId}) output is unused`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('every LED has both A and C wired', () => {
    const failures: string[] = [];
    for (const ex of digitalExamples) {
      const leds = ex.components.filter((c) => c.type === 'wokwi-led');
      for (const l of leds) {
        for (const pin of ['A', 'C']) {
          const wired = ex.wires.some(
            (w) =>
              (w.start.componentId === l.id && w.start.pinName === pin) ||
              (w.end.componentId === l.id && w.end.pinName === pin),
          );
          if (!wired) failures.push(`${ex.id}: led ${l.id}.${pin} is floating`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('every slide switch routes pin 2 (output) to something', () => {
    // SPICE only models pin 1 ↔ pin 2 of a slide-switch. If pin 2 is
    // floating, toggling the switch produces no visible effect.
    const failures: string[] = [];
    for (const ex of digitalExamples) {
      const sws = ex.components.filter((c) => c.type === 'wokwi-slide-switch');
      for (const s of sws) {
        const wired = ex.wires.some(
          (w) =>
            (w.start.componentId === s.id && w.start.pinName === '2') ||
            (w.end.componentId === s.id && w.end.pinName === '2'),
        );
        if (!wired) failures.push(`${ex.id}: switch ${s.id}.2 (output) is floating`);
      }
    }
    expect(failures).toEqual([]);
  });
});

// ─── Live SPICE solves — verify the netlist actually converges ──────────────
// We don't run a full truth table per circuit (that'd be hundreds of solves
// per CI run). Instead, every example is solved with all switches OPEN
// (low) and all switches CLOSED (high) — if either fails, the circuit is
// structurally broken.
function withSwitchValues(ex: ExampleProject, value: 0 | 1): ExampleProject {
  return {
    ...ex,
    components: ex.components.map((c) =>
      c.type === 'wokwi-slide-switch'
        ? { ...c, properties: { ...c.properties, value } }
        : c,
    ),
  };
}

async function solveExample(ex: ExampleProject) {
  const { netlist } = buildNetlist({
    components: toSpiceComponents(ex),
    wires: toSpiceWires(ex),
    boards: [],
    analysis: { kind: 'op' },
  });
  return runNetlist(netlist);
}

describe('digitalExamples — live ngspice convergence', () => {
  for (const ex of digitalExamples) {
    it(
      `${ex.id} solves with switches all-LOW and all-HIGH`,
      { timeout: 30_000 },
      async () => {
        const low = await solveExample(withSwitchValues(ex, 0));
        expect(
          low.variableNames.length,
          `${ex.id} (all LOW): no variables returned`,
        ).toBeGreaterThan(0);
        const high = await solveExample(withSwitchValues(ex, 1));
        expect(
          high.variableNames.length,
          `${ex.id} (all HIGH): no variables returned`,
        ).toBeGreaterThan(0);
      },
    );
  }
});

// ─── Truth-table archetypes ────────────────────────────────────────────────
// For each gate-archetype, sweep its switches through every input
// combination and check that the gate output drives the expected LED.
// `gateOutputV` extracts the SPICE node attached to a gate's Y pin by
// parsing the gate's `B_<id>` card — the first token after the name is the
// positive node, which is the Y net.
async function gateOutputV(
  ex: ExampleProject,
  gateId: string,
  switchSettings: Record<string, 0 | 1>,
): Promise<number> {
  const patched: ExampleProject = {
    ...ex,
    components: ex.components.map((c) => {
      if (c.type !== 'wokwi-slide-switch') return c;
      const v = switchSettings[c.id];
      if (v === undefined) return c;
      return { ...c, properties: { ...c.properties, value: v } };
    }),
  };
  const { netlist } = buildNetlist({
    components: toSpiceComponents(patched),
    wires: toSpiceWires(patched),
    boards: [],
    analysis: { kind: 'op' },
  });
  // Gates emit `B_<id> <yNode> 0 V = ...` — pick out yNode.
  const bRe = new RegExp(`^B_${gateId}\\s+(\\S+)\\s+`, 'm');
  const m = netlist.match(bRe);
  if (!m) throw new Error(`No B-source for gate ${gateId} in netlist`);
  const yNet = m[1];
  const result = await runNetlist(netlist);
  return result.dcValue(`v(${yNet})`);
}

function isHIGH(v: number) {
  return v > 4.0;
}
function isLOW(v: number) {
  return v < 1.0;
}

describe('digitalExamples — truth table spot checks', () => {
  it(
    'AND gate: only HIGH when both inputs HIGH',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-and-two-switches')!;
      expect(ex, 'AND example present').toBeDefined();
      const cases: Array<[0 | 1, 0 | 1, boolean]> = [
        [0, 0, false],
        [1, 0, false],
        [0, 1, false],
        [1, 1, true],
      ];
      for (const [a, b, expected] of cases) {
        const v = await gateOutputV(ex, 'u1', { s1: a, s2: b });
        if (expected) expect(isHIGH(v), `AND(${a},${b}) → ${v}V (want HIGH)`).toBe(true);
        else expect(isLOW(v), `AND(${a},${b}) → ${v}V (want LOW)`).toBe(true);
      }
    },
  );

  it(
    'XOR gate: HIGH when inputs differ',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-xor-difference')!;
      expect(ex, 'XOR example present').toBeDefined();
      const cases: Array<[0 | 1, 0 | 1, boolean]> = [
        [0, 0, false],
        [1, 0, true],
        [0, 1, true],
        [1, 1, false],
      ];
      for (const [a, b, expected] of cases) {
        const v = await gateOutputV(ex, 'u1', { s1: a, s2: b });
        if (expected) expect(isHIGH(v), `XOR(${a},${b}) → ${v}V (want HIGH)`).toBe(true);
        else expect(isLOW(v), `XOR(${a},${b}) → ${v}V (want LOW)`).toBe(true);
      }
    },
  );

  it(
    'NAND-built XOR: matches XOR truth table',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-xor-from-nands')!;
      expect(ex, 'NAND-only XOR present').toBeDefined();
      const cases: Array<[0 | 1, 0 | 1, boolean]> = [
        [0, 0, false],
        [1, 0, true],
        [0, 1, true],
        [1, 1, false],
      ];
      for (const [a, b, expected] of cases) {
        const v = await gateOutputV(ex, 'n4', { sA: a, sB: b });
        if (expected) expect(isHIGH(v), `NAND-XOR(${a},${b}) → ${v}V (want HIGH)`).toBe(true);
        else expect(isLOW(v), `NAND-XOR(${a},${b}) → ${v}V (want LOW)`).toBe(true);
      }
    },
  );

  it(
    'Half adder: SUM = A XOR B, CARRY = A AND B',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-half-adder')!;
      expect(ex, 'half adder present').toBeDefined();
      const cases: Array<[0 | 1, 0 | 1, boolean, boolean]> = [
        [0, 0, false, false],
        [1, 0, true, false],
        [0, 1, true, false],
        [1, 1, false, true],
      ];
      for (const [a, b, sum, car] of cases) {
        const vS = await gateOutputV(ex, 'gSum', { sA: a, sB: b });
        const vC = await gateOutputV(ex, 'gC', { sA: a, sB: b });
        if (sum) expect(isHIGH(vS), `HA(${a},${b}).SUM → ${vS}V (want HIGH)`).toBe(true);
        else expect(isLOW(vS), `HA(${a},${b}).SUM → ${vS}V (want LOW)`).toBe(true);
        if (car) expect(isHIGH(vC), `HA(${a},${b}).CARRY → ${vC}V (want HIGH)`).toBe(true);
        else expect(isLOW(vC), `HA(${a},${b}).CARRY → ${vC}V (want LOW)`).toBe(true);
      }
    },
  );

  it(
    'Full adder: SUM and Cout match A+B+Cin',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-full-adder')!;
      expect(ex, 'full adder present').toBeDefined();
      for (let a = 0 as 0 | 1; a <= 1; a = (a + 1) as 0 | 1) {
        for (let b = 0 as 0 | 1; b <= 1; b = (b + 1) as 0 | 1) {
          for (let ci = 0 as 0 | 1; ci <= 1; ci = (ci + 1) as 0 | 1) {
            const total = a + b + ci;
            const expSum = total & 1;
            const expCo = total >> 1;
            const vS = await gateOutputV(ex, 'x2', { sA: a, sB: b, sCi: ci });
            const vC = await gateOutputV(ex, 'orC', { sA: a, sB: b, sCi: ci });
            if (expSum)
              expect(isHIGH(vS), `FA(${a},${b},${ci}).SUM → ${vS}V (want HIGH)`).toBe(true);
            else expect(isLOW(vS), `FA(${a},${b},${ci}).SUM → ${vS}V (want LOW)`).toBe(true);
            if (expCo)
              expect(isHIGH(vC), `FA(${a},${b},${ci}).Cout → ${vC}V (want HIGH)`).toBe(true);
            else expect(isLOW(vC), `FA(${a},${b},${ci}).Cout → ${vC}V (want LOW)`).toBe(true);
          }
        }
      }
    },
  );

  it(
    'Majority voter: HIGH iff ≥ 2 of 3 inputs HIGH',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-majority-voter')!;
      expect(ex, 'majority voter present').toBeDefined();
      for (let a = 0 as 0 | 1; a <= 1; a = (a + 1) as 0 | 1) {
        for (let b = 0 as 0 | 1; b <= 1; b = (b + 1) as 0 | 1) {
          for (let c = 0 as 0 | 1; c <= 1; c = (c + 1) as 0 | 1) {
            const expected = a + b + c >= 2;
            const v = await gateOutputV(ex, 'or3', { sA: a, sB: b, sC: c });
            if (expected) expect(isHIGH(v), `MAJ(${a},${b},${c}) → ${v}V (want HIGH)`).toBe(true);
            else expect(isLOW(v), `MAJ(${a},${b},${c}) → ${v}V (want LOW)`).toBe(true);
          }
        }
      }
    },
  );

  it(
    '2-to-1 MUX: SEL routes D0 or D1 to Y',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-mux-2to1')!;
      expect(ex, '2-to-1 MUX present').toBeDefined();
      // SEL = 0 → Y = D0;  SEL = 1 → Y = D1
      const cases: Array<[0 | 1, 0 | 1, 0 | 1, boolean]> = [
        [0, 0, 0, false],
        [0, 1, 0, true],
        [0, 0, 1, false],
        [0, 1, 1, true],
        [1, 0, 0, false],
        [1, 1, 0, false],
        [1, 0, 1, true],
        [1, 1, 1, true],
      ];
      for (const [sel, d0, d1, expected] of cases) {
        const v = await gateOutputV(ex, 'orY', { sSel: sel, sD0: d0, sD1: d1 });
        if (expected)
          expect(isHIGH(v), `MUX(sel=${sel},d0=${d0},d1=${d1}) → ${v}V HIGH`).toBe(true);
        else expect(isLOW(v), `MUX(sel=${sel},d0=${d0},d1=${d1}) → ${v}V LOW`).toBe(true);
      }
    },
  );

  it(
    '2-to-4 decoder: exactly one output HIGH per input combination',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-decoder-2to4')!;
      expect(ex, '2-to-4 decoder present').toBeDefined();
      const outs = ['a0', 'a1', 'a2', 'a3']; // Y0..Y3 gates
      for (let a = 0 as 0 | 1; a <= 1; a = (a + 1) as 0 | 1) {
        for (let b = 0 as 0 | 1; b <= 1; b = (b + 1) as 0 | 1) {
          const expectedIdx = (b << 1) | a;
          for (let i = 0; i < 4; i++) {
            const v = await gateOutputV(ex, outs[i], { sA: a, sB: b });
            if (i === expectedIdx)
              expect(isHIGH(v), `dec(A=${a},B=${b}) Y${i} → ${v}V (want HIGH)`).toBe(true);
            else expect(isLOW(v), `dec(A=${a},B=${b}) Y${i} → ${v}V (want LOW)`).toBe(true);
          }
        }
      }
    },
  );

  it(
    'Hamming(7,4): p1 = D0 XOR D1 XOR D3 (spot check)',
    { timeout: 30_000 },
    async () => {
      const ex = digitalExamples.find((e) => e.id === 'digital-hamming-encoder-74')!;
      expect(ex, 'Hamming encoder present').toBeDefined();
      // Spot-check four points of the 16-row truth table for p1.
      const cases: Array<[0 | 1, 0 | 1, 0 | 1, 0 | 1, boolean]> = [
        [0, 0, 0, 0, false],
        [1, 0, 0, 0, true],
        [0, 1, 0, 0, true],
        [1, 1, 0, 1, true],
      ];
      for (const [d0, d1, d2, d3, expected] of cases) {
        const v = await gateOutputV(ex, 'hmP1b', { hmD0: d0, hmD1: d1, hmD2: d2, hmD3: d3 });
        if (expected)
          expect(isHIGH(v), `p1(D=${d3}${d2}${d1}${d0}) → ${v}V (want HIGH)`).toBe(true);
        else expect(isLOW(v), `p1(D=${d3}${d2}${d1}${d0}) → ${v}V (want LOW)`).toBe(true);
      }
    },
  );
});
