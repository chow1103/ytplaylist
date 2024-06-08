// Abandoned react-virtuoso doesn't work properly with fixed header

import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { TableVirtuoso, TableComponents } from 'react-virtuoso'
import type { PlaylistItemsProps } from '@/lib/youtubeServices'
import React from 'react'

interface ChildProps {
  playlistItems: PlaylistItemsProps[]
}

const VirtuosoTableComponents: TableComponents<PlaylistItemsProps> = {
  Scroller: React.forwardRef((props, ref) => <TableContainer component={Paper} {...props} ref={ref} />),
  Table: (props) => <Table {...props} sx={{ borderCollapse: 'separate' }} />,
  TableHead: React.forwardRef(() => <TableHead />),
  TableRow: ({ item: _item, ...props }) => <TableRow {...props} hover={true} />,
  TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
}

const PlaylistTable = ({ playlistItems }: ChildProps) => {
  return (
    <TableVirtuoso
      data={playlistItems}
      components={VirtuosoTableComponents}
      fixedHeaderContent={() => (
        <TableRow>
          <TableCell key='position' variant='head'>
            #
          </TableCell>
          <TableCell key='title' variant='head'>
            Title
          </TableCell>
          <TableCell key='channel' variant='head'>
            Artists
          </TableCell>
          <TableCell key='releaseDate' variant='head'>
            Publish date
          </TableCell>
        </TableRow>
      )}
      itemContent={(index, item) => (
        <TableRow>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{item.title}</TableCell>
          <TableCell>{item.channel}</TableCell>
          <TableCell align='right'>{item.releaseDate.toLocaleDateString()}</TableCell>
        </TableRow>
      )}
    />
  )
}

export default PlaylistTable
