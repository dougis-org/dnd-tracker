import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CharacterList from '../character-list';

// Mock the fetch function to simulate API calls
global.fetch = jest.fn();

const mockCharacters = [
  {
    _id: '1',
    name: 'Aragorn',
    race: 'Human',
    classes: [{ className: 'Ranger', level: 5 }],
    totalLevel: 5,
    updatedAt: '2023-01-01T00:00:00Z',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    _id: '2',
    name: 'Legolas',
    race: 'Elf',
    classes: [{ className: 'Fighter', level: 3 }],
    totalLevel: 3,
    updatedAt: '2023-01-02T00:00:00Z',
    createdAt: '2023-01-02T00:00:00Z',
  },
];

beforeEach(() => {
  (global.fetch as jest.Mock).mockImplementation((url: string) => {
    const urlObj = new URL(url, 'http://localhost');
    const filterClass = urlObj.searchParams.get('class');
    const filterLevel = urlObj.searchParams.get('level');
    const sortBy = urlObj.searchParams.get('sortBy') || 'name';

    let filteredCharacters = [...mockCharacters];

    // Apply filters
    if (filterClass) {
      filteredCharacters = filteredCharacters.filter(char =>
        char.classes.some(cls => cls.className.toLowerCase().includes(filterClass.toLowerCase()))
      );
    }

    if (filterLevel) {
      filteredCharacters = filteredCharacters.filter(char => 
        char.totalLevel === parseInt(filterLevel)
      );
    }

    // Apply sorting
    filteredCharacters.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.totalLevel - a.totalLevel;
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return Promise.resolve({
      ok: true,
      json: async () => ({
        characters: filteredCharacters,
        pagination: {
          page: 1,
          limit: 10,
          total: filteredCharacters.length,
          totalPages: Math.ceil(filteredCharacters.length / 10)
        }
      }),
    });
  });
});

describe('CharacterList', () => {
  it('renders loading state initially', () => {
    render(<CharacterList />);
    expect(screen.getByText('Loading characters...')).toBeInTheDocument();
  });

  it('displays characters after loading', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.getByText('Legolas')).toBeInTheDocument();
    });
  });

  it('displays character information correctly', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.getByText('Human')).toBeInTheDocument();
      expect(screen.getByText('Ranger 5')).toBeInTheDocument();
    });
  });

  it('handles sorting by name', async () => {
    render(<CharacterList />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'name' } });

    await waitFor(() => {
      const characterCards = screen.getAllByTestId('character-card');
      expect(characterCards[0]).toHaveTextContent('Aragorn');
      expect(characterCards[1]).toHaveTextContent('Legolas');
    });
  });

  it('handles sorting by level', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'level' } });

    await waitFor(() => {
      const characterCards = screen.getAllByTestId('character-card');
      expect(characterCards[0]).toHaveTextContent('Aragorn'); // Level 5 first
      expect(characterCards[1]).toHaveTextContent('Legolas'); // Level 3 second
    });
  });

  it('handles filtering by class', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    const classFilter = screen.getByLabelText('Filter by class');
    fireEvent.change(classFilter, { target: { value: 'ranger' } });

    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.queryByText('Legolas')).not.toBeInTheDocument();
    });
  });

  it('handles filtering by level', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    const levelFilter = screen.getByLabelText('Filter by level');
    fireEvent.change(levelFilter, { target: { value: '3' } });

    await waitFor(() => {
      expect(screen.queryByText('Aragorn')).not.toBeInTheDocument();
      expect(screen.getByText('Legolas')).toBeInTheDocument();
    });
  });

  it('displays links to character details and edit pages', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('View');
    const editButtons = screen.getAllByText('Edit');
    
    expect(viewButtons).toHaveLength(2);
    expect(editButtons).toHaveLength(2);
    
    expect(viewButtons[0].closest('a')).toHaveAttribute('href', '/characters/1');
    expect(editButtons[0].closest('a')).toHaveAttribute('href', '/characters/1/edit');
  });

  it('displays empty state when no characters exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        characters: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }),
    });

    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('No characters found')).toBeInTheDocument();
      expect(screen.getByText('Create your first character')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500
    });

    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load characters')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText('Sort by');
    expect(sortSelect).toHaveAttribute('tabindex', '0');
    
    const viewButtons = screen.getAllByText('View');
    viewButtons.forEach(button => {
      expect(button.closest('a')).toHaveAttribute('tabindex', '0');
    });
  });

  it('is accessible to screen readers', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by class')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by level')).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    render(<CharacterList />);
    
    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
    });

    // Apply a filter
    const classFilter = screen.getByLabelText('Filter by class');
    fireEvent.change(classFilter, { target: { value: 'ranger' } });

    await waitFor(() => {
      expect(screen.queryByText('Legolas')).not.toBeInTheDocument();
    });

    // Clear filters
    const clearButton = screen.getByText('Clear filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('Aragorn')).toBeInTheDocument();
      expect(screen.getByText('Legolas')).toBeInTheDocument();
    });
  });
});