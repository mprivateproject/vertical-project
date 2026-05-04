/**
 * LINE LIFF SDK — loaded from CDN in index.html
 * @see https://developers.line.biz/en/reference/liff/
 */
interface LiffGlobal {
  init(config: {
    liffId: string
    withLoginOnExternalBrowser?: boolean
  }): Promise<void>
  isLoggedIn(): boolean
  getIDToken(): string | null | undefined
  getProfile(): Promise<{
    userId: string
    displayName?: string
    pictureUrl?: string
    statusMessage?: string
  }>
  login(config?: { redirectUri?: string }): void
  logout(): void
}

declare var liff: LiffGlobal | undefined
