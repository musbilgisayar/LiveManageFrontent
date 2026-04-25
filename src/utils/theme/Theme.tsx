import _ from 'lodash';
import {
  createTheme,
  type PaletteMode,
  type Direction,
  type ThemeOptions,
} from '@mui/material/styles';
import { useContext, useEffect } from 'react';
import { trTR, enUS, deDE, frFR, itIT, arSA } from '@mui/material/locale';

import { CustomizerContext } from '@/app/context/customizerContext';
import components from './Components';
import typography from './Typography';
import { shadows, darkshadows } from './Shadows';
import { DarkThemeColors } from './DarkThemeColors';
import { LightThemeColors } from './LightThemeColors';
import { baseDarkTheme, baselightTheme } from './DefaultColors';

type BuildThemeInput = {
  activeMode: string;
  isBorderRadius: number;
  activeDir: string;
  activeTheme: string;
  isLanguage: string;
};

function toPrefix(value?: string) {
  return (value || 'tr').split('-')[0].toLowerCase();
}

function getMuiLocale(language?: string) {
  const prefix = toPrefix(language);

  switch (prefix) {
    case 'tr':
      return trTR;
    case 'en':
      return enUS;
    case 'de':
      return deDE;
    case 'fr':
      return frFR;
    case 'it':
      return itIT;
    case 'ar':
      return arSA;
    default:
      return enUS;
  }
}

function normalizeMode(mode: string): PaletteMode {
  return mode === 'dark' ? 'dark' : 'light';
}

function normalizeDirection(direction: string): Direction {
  return direction === 'rtl' ? 'rtl' : 'ltr';
}

function buildTheme({
  activeMode,
  isBorderRadius,
  activeDir,
  activeTheme,
  isLanguage,
}: BuildThemeInput) {
  const mode = normalizeMode(activeMode);
  const direction = normalizeDirection(activeDir);

  const themeOptions = LightThemeColors.find((theme) => theme.name === activeTheme);
  const darkThemeOptions = DarkThemeColors.find((theme) => theme.name === activeTheme);

  const defaultTheme = mode === 'dark' ? baseDarkTheme : baselightTheme;
  const defaultShadow = (
    mode === 'dark' ? darkshadows : shadows
  ) as ThemeOptions['shadows'];

  const selectedTheme = mode === 'dark' ? darkThemeOptions : themeOptions;
  const muiLocale = getMuiLocale(isLanguage);

  const baseMode: ThemeOptions = {
    palette: { mode },
    shape: { borderRadius: isBorderRadius },
    shadows: defaultShadow,
    typography,
    direction,
  };

  const theme = createTheme(
    _.merge({}, baseMode, defaultTheme, selectedTheme),
    muiLocale
  );

  theme.components = components(theme);
  return theme;
}

const ThemeSettings = () => {
  const customizer = useContext(CustomizerContext);

  if (!customizer) {
    throw new Error('ThemeSettings must be used within CustomizerContextProvider');
  }

  const {
    activeDir,
    activeMode,
    activeTheme,
    isBorderRadius,
    isLanguage,
  } = customizer;

  const theme = buildTheme({
    activeDir,
    activeMode,
    activeTheme,
    isBorderRadius,
    isLanguage,
  });

  useEffect(() => {
    document.dir = normalizeDirection(activeDir);
  }, [activeDir]);

  return theme;
};

export { ThemeSettings };