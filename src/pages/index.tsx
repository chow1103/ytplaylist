'use client';

import Grid from '@mui/material/Unstable_Grid2';
import Header from '@/components/Header';
import PlaylistsPost from '@/components/PlaylistsPost';
import {
  Box,
  Button,
  ButtonProps,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
  styled,
} from '@mui/material';
import Image from 'next/image';
import { signIn, getSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import YouTubeServices from '@/lib/youtubeServices';
import type { PlaylistsProps } from '@/lib/youtubeServices';
import { useWindowDimensions } from '@/lib/customHooks';

const SignInButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  display: 'flex',
  gap: 10,
  padding: 15,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#383838' : '#f5f5f5',
  },
}));

const Home = () => {
  const [playlists, setPlaylists] = useState<PlaylistsProps[]>();
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        if (session && session.accessToken) {
          const youtube = await YouTubeServices.build(session.accessToken);
          if (youtube.error) {
            signOut();
            return;
          }
          setPlaylists(youtube.getPlaylists);
          setLoggedIn(true);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const [sortBy, setSortBy] = useState<string>('a-z');
  const [search, setSearch] = useState<string>('');

  const handleChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  const { windowWidth } = useWindowDimensions();

  if (playlists) {
    if (search) {
      playlists.filter((obj) => obj.title.toLowerCase().includes(search.toLowerCase()));
    } else {
      if (sortBy === 'a-z') {
        playlists.sort((a: any, b: any) => {
          return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
        });
      } else if (sortBy === 'count') {
        playlists.sort((a: any, b: any) => {
          return a.itemCount < b.itemCount ? 1 : -1;
        });
      }
    }

    let scale: number = windowWidth / playlists[0].thumbnails.width;
    if (windowWidth > 1535) scale /= 5;
    else if (windowWidth > 1200) scale /= 4;
    else if (windowWidth > 900) scale /= 3;
    else if (windowWidth > 600) scale /= 2;

    for (const obj of playlists) {
      obj.thumbnails.width *= scale - 0.25;
      obj.thumbnails.height *= scale - 0.25;
    }
  }

  return (
    <>
      <Header search={search} setSearch={setSearch} disableSearch={loggedIn} />
      <Box component='main' py={2} px={4} width='100%' height='calc(100vh - 70px - 32px)'>
        {!loggedIn ? (
          <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height='100%'>
            <SignInButton variant='text' onClick={() => signIn('google')}>
              <Image src='icons8_google.svg' height={40} width={40} alt='Google'></Image>
              <Typography variant='h4' component='h2'>
                Sign in to Google
              </Typography>
            </SignInButton>
          </Box>
        ) : (
          <>
            <Box display='flex' justifyContent='space-between'>
              <Typography variant='h4' component='h2' mb={1}>
                Playlists
              </Typography>
              {search ? (
                <div></div>
              ) : (
                <FormControl sx={{ minWidth: 120, alignSelf: 'end' }} size='small'>
                  <Select value={sortBy} onChange={handleChange} displayEmpty>
                    <MenuItem value='a-z'>
                      <em>A - Z</em>
                    </MenuItem>
                    <MenuItem value='count'>Most videos</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
            <Grid container columnSpacing={2} rowSpacing={5} mt={1} width={'100%'}>
              {!playlists
                ? [...Array(5)].map((el, i) => (
                    <Grid key={i} xs={12} sm={6} md={4} lg={3} xl={2.4}>
                      <Box display='flex' justifyContent='center'>
                        <Box display='flex' flexDirection='column' gap={1} alignItems='center'>
                          <Skeleton variant='rounded' width={265} height={160} />
                          <Skeleton variant='rounded' width={265} height={12} />
                          <Box display='flex' alignItems='center' gap={1} alignSelf='start'>
                            <Skeleton variant='circular' width={20} height={20} />
                            <Skeleton variant='rounded' width={100} height={20} />
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  ))
                : (search
                    ? playlists.filter((obj) => obj.title.toLowerCase().includes(search.toLowerCase()))
                    : playlists
                  ).map((playlist, index) => (
                    <Grid key={index} xs={12} sm={6} md={4} lg={3} xl={2.4}>
                      <PlaylistsPost playlist={playlist} />
                    </Grid>
                  ))}
            </Grid>
          </>
        )}
      </Box>
    </>
  );
};

export default Home;
