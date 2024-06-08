import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import type { AscDesc, SortByKey } from '@/types/clientTypes'

interface ChildProps {
  objKey: SortByKey
  ascDesc: AscDesc
  setAscDesc: React.Dispatch<React.SetStateAction<AscDesc>>
  sortBy: SortByKey
  setSortBy: React.Dispatch<React.SetStateAction<SortByKey>>
}

const TableSortableHead = ({ objKey, ascDesc, setAscDesc, sortBy, setSortBy }: ChildProps) => {
  const head =
    objKey == 'position'
      ? '#'
      : objKey === 'title'
      ? 'Title'
      : objKey === 'channel'
      ? 'Artists'
      : objKey === 'releaseDate'
      ? 'Release date'
      : objKey

  const handleClick = () => {
    if (objKey !== sortBy) {
      setAscDesc('')
    }
    setSortBy(objKey)
    setAscDesc((ascDesc) => (ascDesc === 'asc' ? 'desc' : ascDesc === 'desc' ? '' : 'asc'))
  }

  return (
    <Box
      display='flex'
      justifyContent='space-between'
      alignItems='center'
      sx={{ cursor: 'pointer', userSelect: 'none' }}
      onClick={handleClick}
    >
      <Typography variant='body1' fontWeight='500'>
        {head}
      </Typography>
      <Box position='relative'>
        <ArrowDropUp
          fontSize='small'
          sx={{ position: 'absolute', top: -14, left: -10 }}
          color={ascDesc === 'desc' && sortBy === objKey ? 'inherit' : 'disabled'}
        />
        <ArrowDropDown
          fontSize='small'
          sx={{ position: 'absolute', top: -7, left: -10 }}
          color={ascDesc === 'asc' && sortBy === objKey ? 'inherit' : 'disabled'}
        />
      </Box>
    </Box>
  )
}

export default TableSortableHead
