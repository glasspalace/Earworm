import { writeFileSync } from "fs"
export const playlistParams = {
  username: "your username",
  limit: 15,
  nDays: 4,
  minStreams: 4 // set this as per your requirements
}

const apiKey = "your API Key"

let upper = new Date()
let lower = new Date()
upper.setDate(upper.getDate() + 1)
lower.setDate(lower.getDate() - playlistParams.nDays)
upper.setHours(0, 0, 0, 0)
lower.setHours(0, 0, 0, 0)
upper = upper.getTime() / 1000
lower = lower.getTime() / 1000

const trackRequestParams = new URLSearchParams({
  "api_key": apiKey,
  "format": "json",
  "method": "user.getweeklytrackchart",
  "user": playlistParams.username,
  "from": lower,
  "to": upper
}).toString()

const trackRequestURL = "https://ws.audioscrobbler.com/2.0/?" + trackRequestParams

export async function getSongList() {
  console.log("Fetching song info...")
  const response = await fetch(trackRequestURL)
  const full = await response.json()
  return full
}

const songListRaw = await getSongList()
writeFileSync("./logs/rawList.json", JSON.stringify(songListRaw.weeklytrackchart, null, 2))

export let songList = []

async function getAlbum(trackInfo) {
  const albumReqParams = {
    track: trackInfo[0],
    artist: trackInfo[1],
    api_key: apiKey,
    format: "json",
    method: "track.getInfo"
  }

  const albumEndpoint = "https://ws.audioscrobbler.com/2.0/?" + new URLSearchParams(albumReqParams).toString()

  const albumResponse = await fetch(albumEndpoint)
  const albumFull = await albumResponse.json()
  //console.log(JSON.stringify(albumFull, null, 2))

  if (albumFull.track.album) {
    return albumFull.track.album.title
  } else {
    return null
  }
}

for (let i = 0; i < playlistParams.limit; i++) {
  let track = songListRaw.weeklytrackchart.track[i]
  let artistInfo = Object.values(track.artist)
  if (track.playcount > (playlistParams.minStreams - 1)) {
    songList.push({
      artist: artistInfo[1],
      title: track.name,
      album: await getAlbum([track.name, artistInfo[1]]),
      scrobbles: track.playcount
    })
    //console.log(songList[i])
  }
}

songList.push({
  user: playlistParams.username,
  length: songList.length,
  minimum: playlistParams.minStreams,
  period: playlistParams.nDays
})

writeFileSync("./logs/list.json", JSON.stringify(songList, null, 2))
//console.log(songList.length)
//console.log(requestURL)