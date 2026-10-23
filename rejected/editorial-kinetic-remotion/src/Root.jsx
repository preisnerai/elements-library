import React from 'react';
import { Composition } from 'remotion';
import { Insert } from './Insert';
import defaults from '../props.json';

export const Root = () => (
  <Composition id="Insert" component={Insert} defaultProps={defaults}
    width={defaults.width} height={defaults.height} fps={defaults.fps} durationInFrames={Math.round(defaults.duration * defaults.fps)}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.duration * props.fps), fps: props.fps, width: props.width, height: props.height })} />
);
