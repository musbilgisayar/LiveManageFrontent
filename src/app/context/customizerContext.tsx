'use client';

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import config from './config';

interface CustomizerContextState {
  activeDir: string;
  setActiveDir: (dir: string) => void;

  activeMode: string;
  setActiveMode: (mode: string) => void;

  activeTheme: string;
  setActiveTheme: (theme: string) => void;

  activeLayout: string;
  setActiveLayout: (layout: string) => void;

  isCardShadow: boolean;
  setIsCardShadow: (shadow: boolean) => void;

  isLayout: string;
  setIsLayout: (layout: string) => void;

  isBorderRadius: number;
  setIsBorderRadius: (radius: number) => void;

  isCollapse: string;
  setIsCollapse: (collapse: string) => void;

  isSidebarHover: boolean;
  setIsSidebarHover: (isHover: boolean) => void;

  isMobileSidebar: boolean;
  setIsMobileSidebar: (isMobileSidebar: boolean) => void;

  isLanguage: string;
  setIsLanguage: (lang: string) => void;
}

export const CustomizerContext = createContext<CustomizerContextState | null>(null);

interface CustomizerInitialSettings {
  activeDir?: string;
  activeMode?: string;
  activeTheme?: string;
  activeLayout?: string;
  isCardShadow?: boolean;
  isLayout?: string;
  isBorderRadius?: number;
  isCollapse?: string;
  isLanguage?: string;
  isSidebarHover?: boolean;
  isMobileSidebar?: boolean;
}

interface CustomizerContextProps {
  children: ReactNode;
  initialSettings?: CustomizerInitialSettings;
}

export const CustomizerContextProvider: React.FC<CustomizerContextProps> = ({
  children,
  initialSettings,
}) => {
  const [activeDir, setActiveDir] = useState<string>(
    initialSettings?.activeDir ?? config.activeDir
  );
  const [activeMode, setActiveMode] = useState<string>(
    initialSettings?.activeMode ?? config.activeMode
  );
  const [activeTheme, setActiveTheme] = useState<string>(
    initialSettings?.activeTheme ?? config.activeTheme
  );
  const [activeLayout, setActiveLayout] = useState<string>(
    initialSettings?.activeLayout ?? config.activeLayout
  );

  const [isCardShadow, setIsCardShadow] = useState<boolean>(
    initialSettings?.isCardShadow ?? config.isCardShadow
  );
  const [isLayout, setIsLayout] = useState<string>(
    initialSettings?.isLayout ?? config.isLayout
  );
  const [isBorderRadius, setIsBorderRadius] = useState<number>(
    initialSettings?.isBorderRadius ?? config.isBorderRadius
  );
  const [isCollapse, setIsCollapse] = useState<string>(
    initialSettings?.isCollapse ?? config.isCollapse
  );
  const [isLanguage, setIsLanguage] = useState<string>(
    initialSettings?.isLanguage ?? config.isLanguage
  );
  const [isSidebarHover, setIsSidebarHover] = useState<boolean>(
    initialSettings?.isSidebarHover ?? false
  );
  const [isMobileSidebar, setIsMobileSidebar] = useState<boolean>(
    initialSettings?.isMobileSidebar ?? false
  );

  useEffect(() => {
    document.documentElement.setAttribute('class', activeMode);
    document.documentElement.setAttribute('dir', activeDir);
    document.documentElement.setAttribute('data-color-theme', activeTheme);
    document.documentElement.setAttribute('data-layout', activeLayout);
    document.documentElement.setAttribute('data-boxed-layout', isLayout);
    document.documentElement.setAttribute('data-sidebar-type', isCollapse);
  }, [activeMode, activeDir, activeTheme, activeLayout, isLayout, isCollapse]);

  return (
    <CustomizerContext.Provider
      value={{
        activeDir,
        setActiveDir,
        activeMode,
        setActiveMode,
        activeTheme,
        setActiveTheme,
        activeLayout,
        setActiveLayout,
        isCardShadow,
        setIsCardShadow,
        isLayout,
        setIsLayout,
        isBorderRadius,
        setIsBorderRadius,
        isCollapse,
        setIsCollapse,
        isLanguage,
        setIsLanguage,
        isSidebarHover,
        setIsSidebarHover,
        isMobileSidebar,
        setIsMobileSidebar,
      }}
    >
      {children}
    </CustomizerContext.Provider>
  );
};

export function useCustomizer() {
  const ctx = React.useContext(CustomizerContext);
  if (!ctx) {
    throw new Error('CustomizerContext Provider bulunamadı.');
  }
  return ctx;
}