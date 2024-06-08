interface Thumbnails {
  url: string
  width: number
  height: number
}
export interface PlaylistsProps {
  id: string
  title: string
  thumbnails: Thumbnails
  itemCount: number
}
export interface PlaylistItemsProps {
  id: string
  resourceId: {
    kind: string
    videoId: string
  }
  channel: string
  channelId: string
  title: string
  position: number
  thumbnails: Thumbnails | null
  releaseDate: Date
  company: string
  newPosition?: number
}

interface ErrorElement {
  message: string
  domain: string
  reason: string
  location: string
  locationType: string
}
export interface Error {
  error: {
    code: number
    message: string
    errors: ErrorElement[]
    status: string
  }
}

function instanceOfError(data: any): data is Error {
  return 'error' in data
}

interface AsyncClassCons {
  playlists?: PlaylistsProps[]
  playlistItems?: PlaylistItemsProps[]
  error?: Error
}

export default class YouTubeService {
  static #BASE_URL: string = '/api/playlist'
  static #accessToken: string
  static #playlistId: string
  static #playlists: PlaylistsProps[]
  static #playlistItems: PlaylistItemsProps[]
  static #error: Error | null = null

  constructor({ playlists, playlistItems, error }: AsyncClassCons = {}) {
    if (error) YouTubeService.#error = error
    if (playlists) {
      YouTubeService.#playlists = playlists
      YouTubeService.#error = null
    }
    if (playlistItems) {
      YouTubeService.#playlistItems = playlistItems
      YouTubeService.#error = null
    }
  }

  private async init(accessToken: string, playlistId?: string) {
    YouTubeService.#accessToken = accessToken
    if (!playlistId) {
      const playlists = await YouTubeService.fetchPlaylists()
      if (instanceOfError(playlists)) return new YouTubeService({ error: playlists })
      return new YouTubeService({ playlists: playlists })
    }
    if (YouTubeService.#playlistId !== playlistId && playlistId) {
      YouTubeService.#playlistId = playlistId
      const playlistItems = await YouTubeService.fetchPlaylistItems()
      if (instanceOfError(playlistItems)) return new YouTubeService({ error: playlistItems })
      return new YouTubeService({ playlistItems: playlistItems })
    }
  }

  public static async build(accessToken: string, playlistId?: string) {
    const youtube = new YouTubeService()
    await youtube.init(accessToken, playlistId)
    return youtube
  }

  private static async fetchPlaylists(): Promise<PlaylistsProps[] | Error> {
    const response = await fetch(this.#BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
      },
    })
      .then((res) => res.json())
      .catch((err) => console.log(err))

    if (response.error) {
      console.log(response.error)
      return response
    }

    const items = response.items
    const playlists: PlaylistsProps[] = items?.map((item: any) => {
      return {
        id: item.id,
        title: item.snippet.title,
        thumbnails: item.snippet.thumbnails.medium,
        itemCount: item.contentDetails.itemCount,
      }
    })

    return playlists
  }

  private static async fetchPlaylistItems(): Promise<PlaylistItemsProps[] | Error> {
    const response = await fetch(`${this.#BASE_URL}/${this.#playlistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
      },
    })
      .then((res) => res.json())
      .catch((err) => console.log(err))

    if (response.error) {
      console.log(response.error)
      return response
    }

    const items = response.items
    const playlistItems: PlaylistItemsProps[] = items?.map((item: any) => {
      const companyMatch = item.snippet.description.match(/Provided to YouTube by (.*)/i)
      const releaseDateMatch = item.snippet.description.match(/Released on: (\d{4}-\d{2}-\d{2})/i)

      return {
        id: item.id,
        title: item.snippet.title,
        resourceId: item.snippet.resourceId,
        channel: item.snippet.videoOwnerChannelTitle,
        channelId: item.snippet.videoOwnerChannelId,
        position: item.snippet.position,
        thumbnails: item.snippet.thumbnails.default,
        releaseDate: releaseDateMatch ? new Date(releaseDateMatch[1]) : new Date(item.snippet.publishedAt),
        company: companyMatch ? companyMatch[1] : '',
      }
    })

    return playlistItems
  }

  public static async insertPlaylistItems({ videoId, position }: any) {
    const response = await fetch(`${this.#BASE_URL}/${this.#playlistId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${YouTubeService.#accessToken}`,
      },
      body: JSON.stringify({
        videoId: videoId,
        position: position,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err))

    if (response.error) {
      console.log(response.error)
    }

    return response
  }

  public static async updatePlaylistItems({ id, position, resourceId }: any) {
    const response = await fetch(`${this.#BASE_URL}/${this.#playlistId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.#accessToken}`,
      },
      body: JSON.stringify({
        playlistId: this.#playlistId,
        id: id,
        position: position,
        resourceId: resourceId,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err))

    if (response.error) {
      console.log(response.error)
    }

    return response
  }

  public static async deletePlaylistItems(playlistItemId: string) {
    const response = await fetch(`${this.#BASE_URL}/${this.#playlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${this.#accessToken}`,
      },
      body: playlistItemId,
    })
      .then((res) => res.json())
      .catch((err) => console.log(err))

    if (response.error) {
      console.log(response.error)
    }

    return response
  }

  public get error() {
    return YouTubeService.#error
  }
  public get getPlaylists() {
    return YouTubeService.#playlists
  }
  public get getPlaylistItems() {
    return YouTubeService.#playlistItems
  }
}
