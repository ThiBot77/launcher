import { describe, it, expect, beforeEach } from 'vitest';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import { translate, setLanguage, getLanguage, interpolate, normalizeLanguage, t } from '../i18n';

describe('i18n', () => {
  beforeEach(() => {
    setLanguage('en');
  });

  it('translates nested keys in English', () => {
    setLanguage('en');
    expect(t('nav.drive')).toBe('Drive');
    expect(t('nav.mods')).toBe('Mods');
    expect(t('nav.settings')).toBe('Settings');
    expect(t('nav.controls')).toBe('Controls');
  });

  it('translates nested keys in German', () => {
    setLanguage('de');
    expect(t('nav.drive')).toBe('Fahren');
    expect(t('nav.timetables')).toBe('Fahrpläne');
    expect(t('nav.settings')).toBe('Einstellungen');
    expect(t('nav.controls')).toBe('Steuerung');
  });

  it('falls back to English when a key is missing in the chosen language', () => {
    setLanguage('de');
    // app.vendor is intentionally only defined in en.json
    expect(t('app.vendor')).toBe('neoOMSI Project');
  });

  it('returns key as-is when missing in all languages', () => {
    expect(t('nonexistent.nested.key')).toBe('nonexistent.nested.key');
  });

  it('normalizes regional language tags and defaults to en on unknown', () => {
    expect(normalizeLanguage('de-DE')).toBe('de');
    expect(normalizeLanguage('de-AT')).toBe('de');
    expect(normalizeLanguage('de_CH')).toBe('de');
    expect(normalizeLanguage('en-US')).toBe('en');
    expect(normalizeLanguage('fr-FR')).toBe('fr');
    expect(normalizeLanguage('fr_CA')).toBe('fr');
    expect(normalizeLanguage('es')).toBe('en');
    expect(normalizeLanguage('')).toBe('en');
    expect(normalizeLanguage(null)).toBe('en');
    expect(normalizeLanguage(undefined)).toBe('en');
  });

  it('normalizes language codes when passed to setLanguage()', () => {
    setLanguage('de-DE');
    expect(getLanguage()).toBe('de');
    expect(t('nav.drive')).toBe('Fahren');

    setLanguage('de-AT');
    expect(getLanguage()).toBe('de');

    setLanguage('fr');
    expect(getLanguage()).toBe('fr');
    expect(t('nav.drive')).toBe('Conduire');

    setLanguage('es');
    expect(getLanguage()).toBe('en');
    expect(t('nav.drive')).toBe('Drive');
  });

  it('interpolates {name} style parameters correctly', () => {
    setLanguage('en');
    const result = t('rail.level', { level: 5 });
    expect(result).toBe('Level 5');

    setLanguage('de');
    const deResult = t('rail.level', { level: 7 });
    expect(deResult).toBe('Stufe 7');
  });

  it('translates every English text into French with the same placeholders', () => {
    const pages = import.meta.glob<Record<string, unknown>>('../i18n/pages/*.json', {
      eager: true,
      import: 'default',
    });
    const page = (name: string, lang: string) => pages[`../i18n/pages/${name}.${lang}.json`];
    const names = Object.keys(pages)
      .map((f) => f.match(/\/(\w+)\.en\.json$/)?.[1])
      .filter((n): n is string => !!n);
    const flat = (o: unknown, prefix = '', out: Record<string, string> = {}) => {
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        if (typeof v === 'string') out[prefix + k] = v;
        else flat(v, `${prefix}${k}.`, out);
      }
      return out;
    };
    const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    const pairs: [unknown, unknown][] = [
      [en, fr],
      ...names.map((n) => [page(n, 'en'), page(n, 'fr')] as [unknown, unknown]),
    ];
    for (const [source, target] of pairs) {
      const english = flat(source);
      const french = flat(target);
      for (const [key, text] of Object.entries(english)) {
        if (key === 'app.vendor') continue;
        expect(french[key], key).toBeTypeOf('string');
        expect(holes(french[key]), key).toBe(holes(text));
      }
    }
  });

  it('interpolates stand-alone strings directly with interpolate helper', () => {
    expect(interpolate('Speed: {kmh} km/h', { kmh: 50 })).toBe('Speed: 50 km/h');
    expect(interpolate('Hello {user}!', {})).toBe('Hello {user}!');
  });
});
