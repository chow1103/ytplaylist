import React from 'react'
import { Box, Button, ButtonProps, ListItemIcon, Menu, MenuItem, Tooltip, styled } from '@mui/material'

import { AccountCircle, Google, Logout } from '@mui/icons-material'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

const AvatarButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.text.primary,
  backgroundColor: 'inherit',
  minWidth: 0,
  borderRadius: '50%',
  padding: 2,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
  },
}))

const UserAvatar = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const { data: session } = useSession()

  return (
    <Box px={2}>
      <Tooltip title='Setting'>
        <AvatarButton
          variant='text'
          id='account-btn'
          aria-controls={open ? 'account-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          {session && session.user && session.user.image ? (
            <Image src={session.user.image} width={35} height={35} alt='' style={{ borderRadius: '50%' }} />
          ) : (
            <AccountCircle fontSize='large' />
          )}
        </AvatarButton>
      </Tooltip>
      <Menu
        id='account-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: '12%',
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        {session && session.user ? (
          <MenuItem
            onClick={() => {
              handleClose()
              signOut()
            }}
          >
            <ListItemIcon>
              <Logout fontSize='small' />
            </ListItemIcon>
            Sign out
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleClose()
              signIn('google')
            }}
          >
            <ListItemIcon>
              <Google fontSize='small' />
            </ListItemIcon>
            Sign in to Google
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}

export default UserAvatar
