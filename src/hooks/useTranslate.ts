import { useSettings } from './useSettings';
import { translate, type TKey } from '@/i18n';

export function useTranslate() {
  const lang = useSettings((s) => s.uiLang);
  return (key: TKey) => translate(lang, key);
}
