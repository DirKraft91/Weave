class CookieService {
  private static instance: CookieService;
  private readonly COOKIE_EXPIRATION_DATE = new Date(0).toUTCString();

  private constructor() { }

  public static getInstance(): CookieService {
    if (!CookieService.instance) {
      CookieService.instance = new CookieService();
    }
    return CookieService.instance;
  }

  get(name: string): string | null {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }

  set(name: string, value: string, days: number): void {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; secure; samesite=strict`;
  }

  delete(name: string): void {
    document.cookie = `${name}=; expires=${this.COOKIE_EXPIRATION_DATE}; path=/`;
  }
}

export const cookieService = CookieService.getInstance();
