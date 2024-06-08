import { authOptions } from '../auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { concatJSON, objURLParams } from '@/utils/helper'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { PylistQue } from '@/types/serverTypes'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method != 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ message: `Method ${req.method} not allow, other services are not on priority` })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ message: 'User is not authenticated.' })
    return
  }

  const BASE_URL: string = 'https://youtube.googleapis.com/youtube/v3/playlists?'
  const API_KEY: string = process.env.API_KEY ?? ''

  const params: PylistQue = {
    key: API_KEY,
    part: ['snippet', 'contentDetails'],
    mine: true,
    maxResults: 50,
  }
  const headers = {
    Authorization: `Bearer ${session?.accessToken}`,
    Accept: 'application/json',
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
      console.error('Fetch error:', err.message)
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
          .then((res) => res.json())
          .catch((err) => {
            return {
              message: err,
            }
          })

        const concatResponse = concatJSON(response, newResponse, 'items')
        response = concatResponse
        response.nextPageToken = newResponse.nextPageToken || ''
      } while (response.nextPageToken)
    }

    res.status(200).json(response)
  }
}
