import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

import { springs } from "@/components/motion";

import { EASE_OUT } from "./presence";

/** How far a step travels as it enters or leaves, in px: enough to read as a direction. */
const SHIFT = 20;

const moving: Variants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translateX(${direction * SHIFT}px)`,
    filter: "blur(2px)",
  }),
  center: {
    opacity: 1,
    transform: "translateX(0px)",
    filter: "blur(0px)",
    transition: {
      transform: springs.morph,
      opacity: { duration: 0.22, ease: EASE_OUT },
      filter: { duration: 0.22, ease: EASE_OUT },
    },
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    transform: `translateX(${-direction * SHIFT}px)`,
    filter: "blur(2px)",
    transition: { duration: 0.14, ease: EASE_OUT },
  }),
};

const fading: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.18, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } },
};

/**
 * The steps of a sheet, after Family: the old step leaves fast with a blur, the new one comes in
 * from the side it lies on (forward from the right, back from the left), and the sheet's
 * MorphHeight carries the change of height. The leaving step pops out of the layout at once, so
 * the height moves toward the new step from the first frame. Under reduced motion, a crossfade.
 */
export function Steps({
  step,
  direction,
  children,
}: {
  step: string;
  /** 1: forward, -1: back. */
  direction: 1 | -1;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion() === true;
  return (
    <div className="relative">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={reduceMotion ? fading : moving}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
