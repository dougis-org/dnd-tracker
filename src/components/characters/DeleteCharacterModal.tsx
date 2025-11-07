"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useCharacterStore } from '../../lib/characterStore';

type Props = {
  id: string;
  characterName?: string; // optional for display in confirm dialog
  onDeleted?: () => void; // optional callback for navigation after delete
};

export default function DeleteCharacterModal({ id, characterName: _characterName, onDeleted }: Props) {
  const store = useCharacterStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [restored, setRestored] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        globalThis.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleConfirm = () => {
    // perform delete
    store.remove(id);
    setDeleted(true);
    // call optional navigation callback
    if (onDeleted) onDeleted();

    // keep a timer to clear the undo after 5s
    timerRef.current = window.setTimeout(() => {
      setDeleted(false);
      timerRef.current = null;
    }, 5000);
  };

  const handleUndo = () => {
    store.undo();
    if (timerRef.current) {
      globalThis.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDeleted(false);
    setRestored(true);
    // hide restored message shortly
    window.setTimeout(() => setRestored(false), 1500);
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
