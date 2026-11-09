import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { FPS, SCENE_SEC, TRANSITION_FRAMES } from "./constants";
import { Decision1 } from "./scenes/Decision1";
import { Decision2 } from "./scenes/Decision2";
import { Decision3 } from "./scenes/Decision3";
import { Decision4 } from "./scenes/Decision4";
import { Summary } from "./scenes/Summary";

const scenes = [
  [Decision1, SCENE_SEC.d1],
  [Decision2, SCENE_SEC.d2],
  [Decision3, SCENE_SEC.d3],
  [Decision4, SCENE_SEC.d4],
  [Summary, SCENE_SEC.sum],
] as const;

export const Video: React.FC = () => (
  <TransitionSeries>
    {scenes.flatMap(([Scene, sec], i) => {
      const seq = (
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={sec * FPS}>
          <Scene />
        </TransitionSeries.Sequence>
      );
      if (i === scenes.length - 1) return [seq];
      return [
        seq,
        <TransitionSeries.Transition
          key={`t${i}`}
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
        />,
      ];
    })}
  </TransitionSeries>
);
