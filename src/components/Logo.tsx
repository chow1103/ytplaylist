import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

const Logo = () => {
  return (
    <Link href='/'>
      <Box display='flex' alignItems='center' px={3} gap={1}>
        <Image src='/playlist.svg' width={35} height={35} alt='ytplylst' />
        <Typography component='h1' fontSize='18px' letterSpacing='-1.5px' variant='logo'>
          Playlist Sorter
        </Typography>
      </Box>
    </Link>
  );
};

export default Logo;
