import { FC } from 'react'
import { PlaylistPlay, Queue } from '@mui/icons-material'
import { Box, BoxProps, Typography, styled } from '@mui/material'
import Image from 'next/image'
import type { PlaylistsProps } from '@/lib/youtubeServices'
import Link from 'next/link'

interface ChildProps {
  playlist: PlaylistsProps
}

const PostShadow = styled(Box)<BoxProps>(() => ({
  content: '""',
  height: 3,
  borderRadius: '1rem 1rem 0 0',
  marginBottom: '3px',
  transition: '.3s ease',
}))
const MetaData = styled(Box)<BoxProps>(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#bdbdbd' : '#424242',
}))
const HoverOverlayContainer = styled(Box)<BoxProps>(() => ({
  position: 'relative',
  '&:hover .middle': {
    opacity: 1,
  },
  '&:hover img': {
    opacity: 0.5,
  },
}))
const HoverOverlayMiddle = styled(Box)<BoxProps>(() => ({
  transition: '0.5s ease',
  opacity: 0,
  position: 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
}))

const PlaylistsPost: FC<ChildProps> = ({ playlist }) => {
  return (
    <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column'>
      <HoverOverlayContainer>
        <Box display='flex' alignItems='center' flexDirection='column' gap='2px' mb='2px'>
          <PostShadow bgcolor='#333' width={playlist.thumbnails.width * 0.7}></PostShadow>
          <PostShadow bgcolor='#666' width={playlist.thumbnails.width * 0.85}></PostShadow>
        </Box>

        <Image
          src={playlist.thumbnails.url}
          height={playlist.thumbnails.height}
          width={playlist.thumbnails.width}
          alt={playlist.title}
          style={{ position: 'relative', backfaceVisibility: 'visible', transition: '.3s ease' }}
        />

        <HoverOverlayMiddle className='middle'>
          <Link href={`/playlist/${playlist.id}`}>
            <Box
              display='flex'
              justifyContent='center'
              alignItems='center'
              gap={1}
              height={playlist.thumbnails.height}
              width={playlist.thumbnails.width}
            >
              <Queue />
              <Typography variant='body1'>view list</Typography>
            </Box>
          </Link>
        </HoverOverlayMiddle>
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column'>
          <Typography width={playlist.thumbnails.width} textAlign='start' variant='subtitle1'>
            {playlist.title}
          </Typography>
          <MetaData display='flex' width={playlist.thumbnails.width} alignItems='center' gap='5px'>
            <PlaylistPlay />
            <Typography variant='subtitle1'>{playlist.itemCount} videos</Typography>
          </MetaData>
        </Box>
      </HoverOverlayContainer>
    </Box>
  )
}

export default PlaylistsPost
