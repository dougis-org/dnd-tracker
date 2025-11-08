import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import seedCharacters from './mock/characters';
import { Character, PartialCharacter } from '../../types/character';
import { ObjectId } from 'bson';

type State = {
  characters: Character[];
  history: Character[][]; // simple history stack for undo
};

type Action =
  | { type: 'init'; payload: Character[] }
  | { type: 'add'; payload: Character }
  | { type: 'update'; payload: Character }
  | { type: 'delete'; payload: string }
  | { type: 'undo' }
  | { type: 'clear' };

const initialState: State = { characters: [], history: [] };

// Helper to update state with history tracking
function withHistory(state: State, newCharacters: Character[]): State {
  return {
    characters: newCharacters,
    history: [...state.history, state.characters],
  };
}

function handleUpdate(state: State, id: string, newChar: Character): State {
  const updated = state.characters.map((c) => (c.id === id ? newChar : c));
  return withHistory(state, updated);
}

function handleDelete(state: State, id: string): State {
  const filtered = state.characters.filter((c) => c.id !== id);
  return withHistory(state, filtered);
}

function handleUndo(state: State): State {
  const last = state.history[state.history.length - 1];
  if (!last) return state;
  return { characters: last, history: state.history.slice(0, -1) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'init':
      return { ...state, characters: action.payload };
    case 'add':
      return withHistory(state, [...state.characters, action.payload]);
    case 'update':
      return handleUpdate(state, action.payload.id, action.payload);
    case 'delete':
      return handleDelete(state, action.payload);
    case 'undo':
      return handleUndo(state);
    case 'clear':
      return { characters: [], history: [] };
    default:
      return state;
  }
}

type Store = {
  state: State;
  init: () => void;
  add: (partial: PartialCharacter) => Character;
  update: (c: Character) => void;
  remove: (id: string) => void;
  undo: () => void;
  clear: () => void;
};

const CharacterContext = createContext<Store | undefined>(undefined);

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const store: Store = {
    state,
    init: () => dispatch({ type: 'init', payload: seedCharacters }),
    add: (partial: PartialCharacter) => {
      // Validate required fields
      if (!partial.name || !partial.className || partial.level === undefined) {
        throw new Error('Missing required Character fields: name, className, or level');
      }
      const newChar: Character = {
        ...(partial as Character),
        id: (partial.id as string) ?? new ObjectId().toHexString(),
      } as Character;
      dispatch({ type: 'add', payload: newChar });
      return newChar;
    },
    update: (c: Character) => dispatch({ type: 'update', payload: c }),
    remove: (id: string) => dispatch({ type: 'delete', payload: id }),
    undo: () => dispatch({ type: 'undo' }),
    clear: () => dispatch({ type: 'clear' }),
  };

  return (
    <CharacterContext.Provider value={store}>
      {children}
    </CharacterContext.Provider>
  );
};

export function useCharacterStore(): Store {
  const ctx = useContext(CharacterContext);
  if (!ctx) {
    throw new Error('useCharacterStore must be used within a CharacterProvider');
  }
  return ctx;
}

export default {
  CharacterProvider,
  useCharacterStore,
};
