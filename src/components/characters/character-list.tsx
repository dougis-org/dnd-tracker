'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from '@/components/ui';

interface Character {
  _id: string;
  name: string;
  race: string;
  classes: Array<{ className: string; level: number }>;
  totalLevel: number;
  updatedAt: string;
  createdAt: string;
}

interface CharacterListResponse {
  characters: Character[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function CharacterList() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterClass, setFilterClass] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        ...(filterClass && { class: filterClass }),
        ...(filterLevel && { level: filterLevel })
      });

      const response = await fetch(`/api/characters?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }

      const data: CharacterListResponse = await response.json();
      setCharacters(data.characters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterClass, filterLevel, currentPage]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleClearFilters = () => {
    setFilterClass('');
    setFilterLevel('');
    setSortBy('name');
    setCurrentPage(1);
  };

  const handleRetry = () => {
    fetchCharacters();
  };

  if (loading) {
    return <div>Loading characters...</div>;
  }

  if (error) {
    return (
      <div>
        <div>Failed to load characters</div>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div>
        <div>No characters found</div>
        <Link href="/characters/new">
          <Button>Create your first character</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Sorting */}
      <div className="flex gap-4 items-end">
        <div>
          <Label htmlFor="sort-select">Sort by</Label>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger id="sort-select" tabIndex={0}>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="level">Level</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="class-filter">Filter by class</Label>
          <Input
            id="class-filter"
            type="text"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            placeholder="Enter class name"
          />
        </div>

        <div>
          <Label htmlFor="level-filter">Filter by level</Label>
          <Input
            id="level-filter"
            type="number"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            placeholder="Enter level"
          />
        </div>

        <Button onClick={handleClearFilters}>Clear filters</Button>
      </div>

      {/* Character List */}
      <ul role="list" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <li key={character._id} role="listitem">
            <Card data-testid="character-card">
              <CardHeader>
                <CardTitle>{character.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>{character.race}</div>
                <div>
                  {character.classes.map((cls, index) => (
                    <span key={index}>
                      {cls.className} {cls.level}
                      {index < character.classes.length - 1 && ', '}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/characters/${character._id}` as any} tabIndex={0}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/characters/${character._id}/edit` as any} tabIndex={0}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}