import { describe, it, expect } from 'vitest';
import { translate, dirFor, detectUiLang } from '@/i18n';

describe('i18n', () => {
  it('translates keys for all three UI languages', () => {
    expect(translate('fa', 'nav.home')).toBe('خانه');
    expect(translate('de', 'nav.home')).toBe('Start');
    expect(translate('en', 'nav.home')).toBe('Home');
  });

  it('falls back to fa for missing keys', () => {
    expect(translate('de', 'nonexistent.key' as never)).toBe('nonexistent.key');
  });

  it('maps direction correctly', () => {
    expect(dirFor('fa')).toBe('rtl');
    expect(dirFor('de')).toBe('ltr');
    expect(dirFor('en')).toBe('ltr');
  });

  it('detects saved language', () => {
    localStorage.setItem('uiLang', 'de');
    expect(detectUiLang()).toBe('de');
  });
});
