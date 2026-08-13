"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Synthesized rain, layered under whatever is playing.
 * Built from noise at runtime — no audio asset, nothing to license or load.
 *
 * Three layers:
 *  - a low washed-out bed (brown-ish noise through a lowpass) — distant downpour
 *  - a lighter patter (bandpassed noise, gently modulated) — rain on the street
 *  - sparse filtered ticks — droplets on a tin roof, randomized
 */
export function useRain() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const dropTimerRef = useRef<number | null>(null);
  const [raining, setRaining] = useState(false);

  const stop = useCallback(() => {
    if (dropTimerRef.current !== null) {
      window.clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
    }
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (ctx && gain) {
      // Fade out, then suspend so the graph costs nothing while off.
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      window.setTimeout(() => void ctx.suspend().catch(() => undefined), 1600);
    }
    setRaining(false);
  }, []);

  const start = useCallback(() => {
    let ctx = ctxRef.current;

    if (!ctx) {
      ctx = new AudioContext();
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      gainRef.current = master;

      // Shared 4-second noise buffer, looped by both washes.
      const noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = noise.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i += 1) {
        // Leaky integrator tilts white noise toward the low end.
        const white = Math.random() * 2 - 1;
        last = 0.98 * last + 0.02 * white;
        data[i] = white * 0.35 + last * 6;
      }

      // Layer 1: distant downpour.
      const bed = ctx.createBufferSource();
      bed.buffer = noise;
      bed.loop = true;
      const bedFilter = ctx.createBiquadFilter();
      bedFilter.type = "lowpass";
      bedFilter.frequency.value = 420;
      const bedGain = ctx.createGain();
      bedGain.gain.value = 0.5;
      bed.connect(bedFilter).connect(bedGain).connect(master);
      bed.start();

      // Layer 2: street-level patter, slowly swelling and easing.
      const patter = ctx.createBufferSource();
      patter.buffer = noise;
      patter.loop = true;
      patter.playbackRate.value = 1.31; // decorrelate from the bed
      const patterFilter = ctx.createBiquadFilter();
      patterFilter.type = "bandpass";
      patterFilter.frequency.value = 1900;
      patterFilter.Q.value = 0.6;
      const patterGain = ctx.createGain();
      patterGain.gain.value = 0.16;
      const swell = ctx.createOscillator();
      swell.frequency.value = 0.07;
      const swellDepth = ctx.createGain();
      swellDepth.gain.value = 0.05;
      swell.connect(swellDepth).connect(patterGain.gain);
      swell.start();
      patter.connect(patterFilter).connect(patterGain).connect(master);
      patter.start();
    }

    void ctx.resume();
    const master = gainRef.current;
    if (master) master.gain.setTargetAtTime(0.14, ctx.currentTime, 0.8);

    // Layer 3: droplets, scheduled at random.
    const scheduleDrop = () => {
      const context = ctxRef.current;
      const out = gainRef.current;
      if (!context || !out || context.state !== "running") return;

      const osc = context.createOscillator();
      const env = context.createGain();
      osc.type = "sine";
      osc.frequency.value = 1400 + Math.random() * 2600;
      const t = context.currentTime;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.07, t + 0.002);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      osc.connect(env).connect(out);
      osc.start(t);
      osc.stop(t + 0.08);

      dropTimerRef.current = window.setTimeout(scheduleDrop, 60 + Math.random() * 420);
    };
    scheduleDrop();

    setRaining(true);
  }, []);

  const toggleRain = useCallback(() => {
    if (raining) stop();
    else start();
  }, [raining, start, stop]);

  useEffect(() => {
    return () => {
      if (dropTimerRef.current !== null) window.clearTimeout(dropTimerRef.current);
      void ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    };
  }, []);

  return { raining, toggleRain };
}
