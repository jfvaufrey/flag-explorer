export interface Region {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  continents: string[];
}

export const regions: Region[] = [
  {
    id: 'world',
    name: 'World',
    emoji: '🌍',
    color: '#2563EB',
    description: 'All 195 countries!',
    continents: ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Antarctica'],
  },
  {
    id: 'north-america',
    name: 'North America',
    emoji: '🌎',
    color: '#DC2626',
    description: '23 countries',
    continents: ['North America'],
  },
  {
    id: 'south-america',
    name: 'South America',
    emoji: '🌎',
    color: '#7C3AED',
    description: '12 countries',
    continents: ['South America'],
  },
  {
    id: 'europe',
    name: 'Europe',
    emoji: '🌍',
    color: '#059669',
    description: '44 countries',
    continents: ['Europe'],
  },
  {
    id: 'asia',
    name: 'Asia',
    emoji: '🌏',
    color: '#D97706',
    description: '48 countries',
    continents: ['Asia'],
  },
  {
    id: 'africa',
    name: 'Africa',
    emoji: '🌍',
    color: '#EA580C',
    description: '54 countries',
    continents: ['Africa'],
  },
  {
    id: 'oceania',
    name: 'Oceania',
    emoji: '🌏',
    color: '#0891B2',
    description: '14 countries',
    continents: ['Oceania'],
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    emoji: '🧊',
    color: '#6366F1',
    description: '1 territory',
    continents: ['Antarctica'],
  },
  {
    id: 'americas',
    name: 'The Americas',
    emoji: '🌎',
    color: '#BE185D',
    description: 'North + South America',
    continents: ['North America', 'South America'],
  },
  {
    id: 'eurasia',
    name: 'Eurasia',
    emoji: '🌍',
    color: '#0D9488',
    description: 'Europe + Asia',
    continents: ['Europe', 'Asia'],
  },
];

export const getRegionById = (id: string): Region | undefined => {
  return regions.find(r => r.id === id);
};
