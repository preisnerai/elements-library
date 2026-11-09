import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { FPS, H, TOTAL_FRAMES, W } from "./constants";
import { Video } from "./Video";

export const Root: React.FC = () => (
  <Composition
    id="Decyzje"
    component={Video}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={W}
    height={H}
  />
);
