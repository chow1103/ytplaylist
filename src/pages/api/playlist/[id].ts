import { authOptions } from '../auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { objURLParams, concatJSON } from '@/utils/helper'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { Query, PylistItsQue } from '@/types/serverTypes'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ message: 'User is not authenticated.' })
    return
  }

  const BASE_URL: string = 'https://youtube.googleapis.com/youtube/v3/playlistItems?'
  const API_KEY: string = process.env.API_KEY ?? ''

  const { id } = req.query
  if (!id || Array.isArray(id)) {
    res.status(400).json({ message: 'User must provide a valid playlist id.' })
    return
  }

  const headers = {
    Authorization: `Bearer ${session.accessToken}`,
    Accept: 'application/json',
  }

  if (req.method === 'GET') {
    const params: PylistItsQue = {
      key: API_KEY,
      part: 'snippet',
      maxResults: 50,
      playlistId: id,
    }

    let response = await fetch(`${BASE_URL}${objURLParams(params).toString()}`, {
      method: 'GET',
      headers: headers,
    })
      .then((fetchRes) => {
        if (!fetchRes.ok) {
          throw new Error(`Request error, Status: ${fetchRes.status}`)
        }
        return fetchRes.json()
      })
      .catch((err) => {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch data' })
      })

    if (response) {
      if (response.nextPageToken) {
        do {
          const newResponse = await fetch(
            `${BASE_URL}${objURLParams({
              pageToken: response.nextPageToken,
              ...params,
            }).toString()}`,
            {
              method: 'GET',
              headers: headers,
            }
          )
            .then((fetchRes) => {
              if (!fetchRes.ok) {
                throw new Error(`Request error, Status: ${fetchRes.status}`)
              }
              return fetchRes.json()
            })
            .catch((err) => {
              console.error('Fetch error:', err.message)
              res.status(500).json({ error: 'Failed to fetch data' })
            })

          const concatResponse = concatJSON(response, newResponse, 'items')
          response = concatResponse
          response.nextPageToken = newResponse.nextPageToken || ''
        } while (response.nextPageToken)
      }

      res.status(200).json(response)
    }
  } else if (req.method === 'POST') {
    if (!req.body) {
      res.status(400).json({ message: 'User must provide video id and position' })
      return
    }

    const { playlistId, videoId, position } = req.body
    const params: Query = {
      key: API_KEY,
      part: 'snippet',
    }

    const response = await fetch(`${BASE_URL}${objURLParams(params).toString()}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        snippet: {
          playlistId: playlistId,
          position: position ?? '',
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId,
          },
        },
      }),
    })
      .then((fetchRes) => {
        if (!fetchRes.ok) {
          throw new Error(`Request error, Status: ${fetchRes.status}`)
        }
        return fetchRes.json()
      })
      .catch((err) => {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch data' })
      })

    res.status(200).json(response)
  } else if (req.method === 'PUT') {
    if (!req.body) {
      res.status(400).json({ message: 'User must provide video id and position' })
      return
    }

    const { playlistId, id, position, resourceId } = req.body
    const params: Query = {
      key: API_KEY,
      part: ['snippet', 'id'],
    }

    const response = await fetch(`${BASE_URL}playlistItems/${objURLParams(params).toString()}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        snippet: {
          playlistId: playlistId,
          position: position,
          resourceId: resourceId,
        },
      }),
    })
      .then((fetchRes) => {
        if (!fetchRes.ok) {
          throw new Error(`Request error, Status: ${fetchRes.status}`)
        }
        return fetchRes.json()
      })
      .catch((err) => {
        console.error(`id:${id}, ${err}`)
        res.status(500).json({ error: 'Failed to fetch data' })
      })

    res.status(200).json(response)
  } else if (req.method === 'DELETE') {
    if (!req.body) {
      res.status(400).json({ message: 'User must provide playlist item id' })
      return
    }

    const playlistItemId = req.body
    const params: Query = {
      key: API_KEY,
      part: 'snippet',
      id: playlistItemId,
    }

    const response = await fetch(`${BASE_URL}playlistItems/${objURLParams(params).toString()}`, {
      method: 'DELETE',
      headers: headers,
    })
      .then((fetchRes) => {
        if (!fetchRes.ok) {
          throw new Error(`Request error, Status: ${fetchRes.status}`)
        }
        return fetchRes.json()
      })
      .catch((err) => {
        console.error(err)
        res.status(500).json({ error: 'Failed to fetch data' })
      })

    res.status(200).json(response)
  } else {
    return res.status(405).json({ message: `Method ${req.method} not available` })
  }
}
