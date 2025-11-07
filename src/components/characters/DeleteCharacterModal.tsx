"use client";

import React, { useState } from 'react';
import { useCharacterStore } from '../../lib/characterStore';
import { useUndoTimer } from './useUndoTimer';

type Props = {
  id: string;
  characterName?: string;
  onDeleted?: () => void;
};

export default function DeleteCharacterModal({
  id,
  characterName: _characterName,
  onDeleted,
}: Props) {
  const store = useCharacterStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [restored, setRestored] = useState(false);
  const { setTimer, clearTimer } = useUndoTimer();

  const handleConfirm = () => {
    store.remove(id);
    setDeleted(true);
    if (onDeleted) onDeleted();

    setTimer(() => {
      setDeleted(false);
    }, 5000);
  };

  const handleUndo = () => {
    store.undo();
    clearTimer();
    setDeleted(false);
    setRestored(true);
    globalThis.setTimeout(() => setRestored(false), 1500);
  };

  return (
    <div>
      <button onClick={() => setConfirmOpen(true)}>Delete</button>

      {confirmOpen && !deleted && (
        <div role="dialog" aria-label="confirm-delete">
          <p>Are you sure you want to delete this character?</p>
          <button onClick={handleConfirm}>Yes, delete</button>
          <button onClick={() => setConfirmOpen(false)}>Cancel</button>
        </div>
      )}

      {deleted && (
        <div role="status">
          <span>Character deleted.</span>
          <button onClick={handleUndo}>Undo</button>
        </div>
      )}

      {restored && <div role="status">Character restored</div>}
    </div>
  );
}
