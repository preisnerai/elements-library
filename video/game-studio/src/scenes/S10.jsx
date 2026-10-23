// S10 — zaślepka (tekst lektora), do zastąpienia właściwą sceną.
import React from 'react';
import { Words } from '../components/Text';
export default function S10({ t, say }) {
  return <Words t={t} at={0} text={say} size={54} y={760} width={820} wrap />;
}
