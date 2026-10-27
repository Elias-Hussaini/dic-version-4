import { useQuery, useQueryClient } from '@tanstack/react-query';
import { wordsRepo, favoritesRepo, practiceRepo, srsRepo, tagsRepo } from '@/db/repositories';
import type { SrsData, Tag, Word } from '@/types';

export const keys = {
  words: ['words'] as const,
  word: (id: number) => ['words', id] as const,
  favorites: ['favorites'] as const,
  practice: ['practice'] as const,
  srs: ['srs'] as const,
  tags: ['tags'] as const,
};

export function useWords() {
  return useQuery({
    queryKey: keys.words,
    queryFn: async (): Promise<Word[]> => wordsRepo.getAll(),
  });
}

export function useWord(id: number | undefined) {
  return useQuery({
    queryKey: keys.word(id ?? -1),
    queryFn: () => wordsRepo.get(id!),
    enabled: id !== undefined,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: keys.favorites,
    queryFn: () => favoritesRepo.all(),
  });
}

export function usePracticeHistory() {
  return useQuery({
    queryKey: keys.practice,
    queryFn: () => practiceRepo.all(),
  });
}

export function useSrs() {
  return useQuery({
    queryKey: keys.srs,
    queryFn: async (): Promise<SrsData> => srsRepo.load(),
    staleTime: 5_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: keys.tags,
    queryFn: async (): Promise<Tag[]> => tagsRepo.load(),
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return {
    words: () => {
      void qc.invalidateQueries({ queryKey: keys.words });
    },
    favorites: () => void qc.invalidateQueries({ queryKey: keys.favorites }),
    practice: () => void qc.invalidateQueries({ queryKey: keys.practice }),
    srs: () => void qc.invalidateQueries({ queryKey: keys.srs }),
    all: () => void qc.invalidateQueries(),
  };
}
