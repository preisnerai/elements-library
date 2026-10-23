import React from 'react';
import { Composition } from 'remotion';
import S from '../script.json';
import { Video, totalDuration } from './Video';

export const Root = () => (
  <Composition id="GameStudio" component={Video} width={S.width} height={S.height} fps={S.fps} durationInFrames={Math.round(totalDuration() * S.fps)} />
);
