import Head from 'next/head';
import type { AppProps } from 'next/app';
import { Roboto, Poppins } from 'next/font/google';
import { AppCacheProvider } from '@mui/material-nextjs/v13-pagesRouter';
import CssBaseline from '@mui/material/CssBaseline';
import './styles/global.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SessionProvider } from 'next-auth/react';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    logo: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    logo?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    logo: true;
  }
}

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const poppins = Poppins({
  weight: '600',
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
    logo: {
      fontFamily: poppins.style.fontFamily,
    },
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          logo: 'div',
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff3535',
    },
    secondary: {
      main: '#3f65ef',
    },
    error: {
      main: '#ff0000',
    },
    success: {
      main: '#44cc00',
    },
  },
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AppCacheProvider {...pageProps}>
        <Head>
          <title>Youtube Playlist Sorting</title>
          <meta
            name='description'
            content='youtube playlist sorting app as youtube only letting you to sort by a few option, main objective is to able to sort by author and title etc.'
          />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </AppCacheProvider>
    </SessionProvider>
  );
}
