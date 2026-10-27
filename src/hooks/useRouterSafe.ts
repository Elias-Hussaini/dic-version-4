import { useNavigate as useReactNavigate } from 'react-router-dom';

/** Safe wrapper — returns a no-op navigate when called outside the Router (tests). */
export function useRouter(): { navigate: (to: string) => void } {
  try {
    const navigate = useReactNavigate();
    return { navigate: (to: string) => void navigate(to) };
  } catch {
    return { navigate: () => undefined };
  }
}
