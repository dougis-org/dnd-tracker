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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'init':
      return { ...state, characters: action.payload };
    case 'add': {
      const next = [...state.characters, action.payload];
      return { characters: next, history: [...state.history, state.characters] };
    }
    case 'update': {
      const updated = state.characters.map((c) => (c.id === action.payload.id ? action.payload : c));
      return { characters: updated, history: [...state.history, state.characters] };
    }
    case 'delete': {
      const filtered = state.characters.filter((c) => c.id !== action.payload);
      return { characters: filtered, history: [...state.history, state.characters] };
    }
    case 'undo': {
      const last = state.history[state.history.length - 1];
      if (!last) return state;
      return { characters: last, history: state.history.slice(0, -1) };
    }
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

  return React.createElement(CharacterContext.Provider, { value: store }, children);
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
