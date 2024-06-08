import { FC } from 'react'
import { Box, IconButton, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import Logo from './Logo'
import UserAvatar from './UserAvatar'
import { Clear } from '@mui/icons-material'

interface ChildProps {
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
  disableSearch: boolean
}

const Header: FC<ChildProps> = ({ search, setSearch, disableSearch }) => {
  return (
    <Box component='header' display='flex' justifyContent='space-between' alignItems='center' height={70}>
      <Logo />
      {!disableSearch ? (
        <div></div>
      ) : (
        <Box display='flex' alignItems='flex-end' p={2} width={500}>
          <SearchIcon sx={{ mr: 1, my: 0.5 }} />
          <TextField
            variant='standard'
            fullWidth
            placeholder='Search'
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            InputProps={{
              endAdornment: search && (
                <IconButton aria-label='clear' onClick={() => setSearch('')}>
                  <Clear />
                </IconButton>
              ),
            }}
          />
        </Box>
      )}

      <UserAvatar />
    </Box>
  )
}

export default Header
