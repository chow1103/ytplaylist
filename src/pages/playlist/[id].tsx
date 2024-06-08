import Header from '@/components/Header'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { useEffect, useState } from 'react'
import { getSession, signOut } from 'next-auth/react'
import {
  Box,
  Fab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  styled,
  tableCellClasses,
  Typography,
  BoxProps,
  TableRowProps,
  TableCellProps,
  Modal,
  List,
  ListItem,
  ListItemText,
  Button,
  ButtonProps,
  FabProps,
  Tooltip,
} from '@mui/material'
import { Edit, PlayArrow, Save } from '@mui/icons-material'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useWindowDimensions } from '@/lib/customHooks'
import TableSortableHead from '@/components/TableSortableHead'
import YouTubeServices, { PlaylistItemsProps } from '@/lib/youtubeServices'
import type { AscDesc, SortByKey } from '@/types/clientTypes'

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context)
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  const playlistId = context.query.id as string
  return {
    props: {
      accessToken: session.accessToken,
      playlistId: playlistId,
    },
  }
}

const StyledTableCell = styled(TableCell)<TableCellProps>(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
    fontSize: '1rem',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '1rem',
  },
}))
const StyledTableRow = styled(TableRow)<TableRowProps>(() => ({
  'td, th': {
    border: 0,
  },
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
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
}))
const EditFab = styled(Fab)<FabProps>(({ theme }) => ({
  position: 'fixed',
  bottom: '3%',
  right: '3%',
  color: theme.palette.mode === 'dark' ? 'white' : '#212121',
}))
const ModalContainer = styled(Box)<BoxProps>(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: theme.palette.mode === 'dark' ? '#212121' : '#fafafa',
  borderRadius: '1rem',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
}))
const ModalButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? 'white' : '#212121',
}))

const PlaylistPage = ({ accessToken, playlistId }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [playlistItems, setPlaylistItems] = useState<PlaylistItemsProps[] | null>(null)
  const [search, setSearch] = useState<string>('')
  const [ascDesc, setAscDesc] = useState<AscDesc>('')
  const [sortBy, setSortBy] = useState<SortByKey>('')
  const [newPlaylistItems, setNewPlaylistItems] = useState<PlaylistItemsProps[] | null>(null)
  const [editing, setEditing] = useState<boolean>(false)
  const [changed, setChanged] = useState<PlaylistItemsProps[] | null>(null)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [currentProcess, setCurrentProcess] = useState<string>('')
  const [updated, setUpdated] = useState<boolean>(true)

  // reset playlist items when route changes
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = () => {
      setPlaylistItems(null)
    }
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [router.events])

  // fetch playlist items from api
  useEffect(() => {
    if (!updated) return

    const fetchData = async () => {
      try {
        if (accessToken) {
          const youtube = await YouTubeServices.build(accessToken, playlistId)
          if (youtube.error) {
            signOut()
            return
          }
          setPlaylistItems(youtube.getPlaylistItems)
        }
      } catch (err) {
        console.log(err)
      }
    }

    fetchData()
  }, [accessToken, playlistId, updated])

  const { windowWidth } = useWindowDimensions()

  // sorted the playlist into new playlist
  useEffect(() => {
    if (!playlistItems) return
    if (!sortBy) return
    if (editing) {
      if (sortBy === 'position') return
    }

    if (ascDesc === 'asc') {
      const sorted = playlistItems.toSorted((a, b) => {
        if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number')
          return (a[sortBy] as number) - (b[sortBy] as number)

        if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string')
          return (a[sortBy] as string).localeCompare(b[sortBy] as string)

        if (a[sortBy] instanceof Date && b[sortBy] instanceof Date)
          return (a[sortBy] as Date).getTime() - (b[sortBy] as Date).getTime()

        return 0
      })
      setNewPlaylistItems(sorted)
    } else if (ascDesc === 'desc') {
      const sorted = playlistItems.toSorted((a, b) => {
        if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number')
          return (b[sortBy] as number) - (a[sortBy] as number)

        if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string')
          return (b[sortBy] as string).localeCompare(a[sortBy] as string)

        if (a[sortBy] instanceof Date && b[sortBy] instanceof Date)
          return (b[sortBy] as Date).getTime() - (a[sortBy] as Date).getTime()

        return 0
      })
      setNewPlaylistItems(sorted)
    } else {
      setNewPlaylistItems(null)
      setSortBy('')
    }
  }, [playlistItems, sortBy, ascDesc, editing])

  useEffect(() => {
    if (!editing) return

    if (newPlaylistItems) {
      let changedItems: PlaylistItemsProps[] = []

      for (let [index, item] of newPlaylistItems.entries()) {
        if (item.position !== index) {
          item.newPosition = index
          changedItems.push(item)
        }
      }

      setChanged(changedItems)
    }
  }, [editing, newPlaylistItems])

  const handleEdit = () => {
    if (search) {
      setSearch('')
    }
    if (!editing && sortBy && newPlaylistItems) {
      setSortBy('')
      setNewPlaylistItems(null)
    }
    if (changed) {
      setOpenModal(true)
    }
    setEditing((editing) => !editing)
  }

  const handleCancel = () => {
    setChanged(null)
    setOpenModal(false)
  }

  const handleUpdate = async () => {
    if (!changed) return

    setUpdated(false)
    setNewPlaylistItems(null)
    setSortBy('')
    setOpenModal(false)

    // Important! sorting the changed by the absolute change in position (magnitude) so it does mess up the position as I calling the update
    const movements = changed.toSorted(
      (a, b) => Math.abs((a.newPosition as number) - a.position) - Math.abs((b.newPosition as number) - b.position)
    )

    for (const item of movements) {
      setCurrentProcess(item.title)
      const response = await YouTubeServices.updatePlaylistItems({
        id: item.id,
        position: item.newPosition as number,
        resourceId: item.resourceId,
      })
        .then((fetchRes) => {
          if (fetchRes.error) {
            throw new Error(fetchRes.error)
          }
          return fetchRes
        })
        .catch((err) => {
          console.log(err)
        })

      // console.log(response);

      if (response) {
        continue
      }
      // problem with the youtube data api see note.md
      // else {
      //   break;
      // }
    }

    setCurrentProcess('')

    setTimeout(() => {
      setPlaylistItems(null)
      setUpdated(true)
      setChanged(null)
    }, 3000)
  }

  return (
    <>
      <Header search={search} setSearch={setSearch} disableSearch={!editing} />
      <Box
        component='main'
        py={4}
        px={{ xs: 0, sm: 4 }}
        width='100%'
        height='calc(100vh - 70px - 32px)'
        display='flex'
        justifyContent='center'
      >
        <Tooltip title={editing ? 'Save' : 'Edit'} placement='top'>
          <EditFab color={editing ? 'secondary' : 'primary'} aria-label='edit' onClick={handleEdit}>
            {editing ? <Save /> : <Edit />}
          </EditFab>
        </Tooltip>
        <Modal
          open={openModal}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              setOpenModal(false)
            }
          }}
        >
          <ModalContainer>
            <Typography variant='h6' component='h2'>
              Update Confirmation
            </Typography>
            <List dense={true} sx={{ minWidth: '350px', maxHeight: '350px', overflow: 'auto', padding: 0 }}>
              {changed &&
                changed.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
                      primary={item.title}
                      primaryTypographyProps={{ flex: '1 1 auto', maxWidth: '85%' }}
                      secondary={`${item.position} ${String.fromCodePoint(8658)} ${item.newPosition}`}
                      secondaryTypographyProps={{ flex: '1 1 auto', textAlign: 'right' }}
                    />
                  </ListItem>
                ))}
            </List>
            <Box display='flex' width='75%' justifyContent='space-between' alignSelf='center'>
              <ModalButton variant='contained' color='error' onClick={handleCancel}>
                Cancel
              </ModalButton>
              <ModalButton variant='contained' color='success' onClick={handleUpdate}>
                Update
              </ModalButton>
            </Box>
          </ModalContainer>
        </Modal>
        {!playlistItems ? (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%' width='100%'>
            <CircularProgress variant='indeterminate' size={100} thickness={5} value={100} />
          </Box>
        ) : currentProcess && !updated ? (
          <Box
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            height='100%'
            width='100%'
            gap={2}
          >
            <Typography variant='h4' component='h2' mb={10}>
              {currentProcess ? 'Caution! Please do not close the window while updating the playlist.' : ''}
            </Typography>
            <CircularProgress variant='indeterminate' size={100} thickness={5} value={100} />
            <Typography variant='body1' component='h2'>
              {currentProcess ? `Updating the position of ${currentProcess} ...` : ''}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow>
                  {windowWidth < 480 ? (
                    ''
                  ) : (
                    <StyledTableCell width={90}>
                      {search || editing ? (
                        '#'
                      ) : (
                        <TableSortableHead
                          objKey='position'
                          ascDesc={ascDesc}
                          setAscDesc={setAscDesc}
                          sortBy={sortBy}
                          setSortBy={setSortBy}
                        />
                      )}
                    </StyledTableCell>
                  )}

                  <StyledTableCell>
                    {search ? (
                      'Title'
                    ) : (
                      <TableSortableHead
                        objKey='title'
                        ascDesc={ascDesc}
                        setAscDesc={setAscDesc}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                      />
                    )}
                  </StyledTableCell>
                  <StyledTableCell width={600}>
                    {search ? (
                      'Artists'
                    ) : (
                      <TableSortableHead
                        objKey='channel'
                        ascDesc={ascDesc}
                        setAscDesc={setAscDesc}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                      />
                    )}
                  </StyledTableCell>
                  <StyledTableCell width={300}>
                    {search ? (
                      'Release date'
                    ) : (
                      <TableSortableHead
                        objKey='releaseDate'
                        ascDesc={ascDesc}
                        setAscDesc={setAscDesc}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                      />
                    )}
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(search
                  ? playlistItems.filter(
                      (obj) =>
                        obj.title.toLowerCase().includes(search.toLowerCase()) ||
                        obj.channel.toLowerCase().includes(search.toLowerCase())
                    )
                  : sortBy && newPlaylistItems
                  ? newPlaylistItems
                  : playlistItems
                ).map((row, index) => {
                  return (
                    <StyledTableRow key={index} hover={true}>
                      {windowWidth < 480 ? '' : <StyledTableCell width={90}>{row.position + 1}</StyledTableCell>}

                      <StyledTableCell>
                        {!row.thumbnails || windowWidth < 570 ? (
                          row.title
                        ) : (
                          <Box display='flex' alignItems='center' gap={2}>
                            <HoverOverlayContainer>
                              <a target='_blank' href={`https://www.youtube.com/watch?v=${row.resourceId.videoId}`}>
                                <Image src={row.thumbnails?.url} width={80} height={60} alt='' />
                                <HoverOverlayMiddle className='middle'>
                                  <PlayArrow />
                                </HoverOverlayMiddle>
                              </a>
                            </HoverOverlayContainer>

                            <Typography variant='body1'>{row.title}</Typography>
                          </Box>
                        )}
                      </StyledTableCell>
                      <StyledTableCell width={600}>{row.channel}</StyledTableCell>
                      <StyledTableCell width={300}>
                        {row.releaseDate.toLocaleDateString('en-us', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </StyledTableCell>
                    </StyledTableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  )
}

export default PlaylistPage
