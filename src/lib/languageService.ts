// src/lib/languageService.ts
export interface LanguageItem {
  cultureCode: string; // "tr-TR", "en-US"...
  name: string;
  isDefault: boolean;
}

class LanguageService {
  private languages: LanguageItem[] = [];
  private defaultLocale = "tr-TR";
  private initialized = false;
  private _initPromise: Promise<void> | null = null;

  private static readonly API_VERSION = "1"; // v1

  public getLocalePrefix(locale: string): string {
    return (locale || "").split("-")[0].toLowerCase();
  }

  private getBrowserPrefix(): string {
    if (typeof navigator !== "undefined" && navigator.language) {
      return this.getLocalePrefix(navigator.language);
    }
    return "en";
  }

  private parseLanguages(json: any): LanguageItem[] {
    if (Array.isArray(json)) return json as LanguageItem[];
    if (json && Array.isArray(json.data)) return json.data as LanguageItem[];
    if (json && Array.isArray(json.items)) return json.items as LanguageItem[];
    if (json && Array.isArray(json.languages)) return json.languages as LanguageItem[];
    return [];
  }

  public async initialize(langPrefix?: string): Promise<void> {
    if (this.initialized) return;
    if (this._initPromise) return this._initPromise;

    const prefix = (langPrefix || this.getBrowserPrefix() || "en").toLowerCase();
     
    const url = `/api/v${LanguageService.API_VERSION}.0/culture/list`;

    this._initPromise = (async () => {
      try {
        const res = await fetch(url, {
          cache: "no-store",
          headers: { accept: "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = this.parseLanguages(json);
        if (!list.length) throw new Error("Dil listesi boş");

        this.languages = list;

        const browserPrefix = this.getBrowserPrefix();
        const matched = list.find((l) => this.getLocalePrefix(l.cultureCode) === browserPrefix);
        this.defaultLocale =
          matched?.cultureCode ||
          list.find((l) => l.isDefault)?.cultureCode ||
          list[0]?.cultureCode ||
          "tr-TR";

        this.initialized = true;
      } catch (err) {
        console.error("Dil listesi alınamadı:", err);
        // Güvenli fallback
        this.languages = [
          { cultureCode: "tr-TR", name: "Türkçe", isDefault: true },
          { cultureCode: "en-US", name: "English", isDefault: false },
        ];
        this.defaultLocale = "tr-TR";
        this.initialized = true;
      } finally {
        this._initPromise = null;
      }
    })();

    return this._initPromise;
  }

  public async setCulture(cultureCode: string): Promise<void> {
    const prefix = this.getLocalePrefix(cultureCode) || this.getBrowserPrefix() || "en";
  
    const url = `/api/v${LanguageService.API_VERSION}.0/culture/list`;

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ culture: cultureCode }),
        credentials: "include",
      });
    } catch {
      // prod'da sessiz bırak
    }
  }

  public getLanguages(): LanguageItem[] {
    return this.languages;
  }

  public getDefaultLocale(): string {
    return this.defaultLocale;
  }

  public getSupportedPrefixes(): string[] {
    return this.languages.map((l) => this.getLocalePrefix(l.cultureCode));
  }

  public findLanguageByPrefix(prefix: string): LanguageItem | undefined {
    const p = (prefix || "").toLowerCase();
    return this.languages.find((l) => this.getLocalePrefix(l.cultureCode) === p);
  }
}

export const languageService = new LanguageService();
