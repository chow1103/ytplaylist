import { DefaultSession, Account } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken: string
    error: string
  }
  interface Account {
    access_token: string
    expires_in: number
    refresh_token: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    error: string
  }
}
