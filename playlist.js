import { songList } from "./getSongs.js";
import { spotifyToken } from "./getToken.js";
import { writeFileSync } from "fs"
import { imgString } from "./image.js"
import { options } from "./options.js"

const todayDate = new Date()
const dateStr = todayDate.toLocaleDateString(undefined, {year: "numeric", month: "short", day: "2-digit"})

const nTracks = songList.length - 1

let playlistDetails = { // You can change these details as you wish. Changing the description is not recommended because it will include errors as well but you can change it if you'd like.
    "name": options.playlist.name,
    "description": "Generated on " + dateStr + " with " + songList[nTracks].info.user + "'s top " + (nTracks) +  " track(s) from the last " + songList[nTracks].info.period + " days on last.fm - https://github.com/glasspalace/Earworm.",
    "public": options.playlist.public
}

const listPrivacy = playlistDetails.public ? "public" : "private"

const requestHeaders = {
    "Authorization": "Bearer " + spotifyToken,
    "Content-Type": "application/json"
}

async function createPlaylist() {
    console.log("Creating new empty playlist...")
    const createResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + spotifyToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(playlistDetails)
    })
    const fullReply = await createResponse.json()
    console.log("Playlist created.")
    return fullReply.id
}

const searchParams = {
  method: "GET",
  headers: {Authorization: "Bearer " + spotifyToken},
  redirect: "follow"
};

let failed = []

export async function getURI(songInfo) {
    const query = "track:" + songInfo.title + " artist:" + songInfo.artist
    const params = {
        q: query,
        type: "track",
        limit: 5,
        locale: "en-US"
    }
    const endpoint = "https://api.spotify.com/v1/search?" + (new URLSearchParams(params)).toString()
    const results = await fetch(endpoint, searchParams)
    const full = await results.json()
    if (full.tracks.items.length==0) {
        failed.push({
            title: songInfo.title,
            artist: songInfo.artist,
            queryurl: endpoint,
            response: full.tracks
        })
        return null
    } else {
        let found = false
        for (let i = 0; i < full.tracks.items.length; i++) { 
            const thisTrack = full.tracks.items[i]
            if (songInfo.album) {
                if (thisTrack.name.toLowerCase() == songInfo.title.toLowerCase() && thisTrack.album.name.toLowerCase() == songInfo.album.toLowerCase()) {
                    found = true
                    return thisTrack.uri
                }
            }
        }
        if (!found) {
            for (let i = 0; i < full.tracks.items.length; i++) {
                const thisResult = full.tracks.items[i]
                if (thisResult.name.toLowerCase() == songInfo.title.toLowerCase()) {
                    found = true
                    return thisResult.uri
                }
            }
            if (!found) {
                failed.push({
                    title: songInfo.title,
                    artist: songInfo.artist,
                    queryurl: endpoint,
                    response: full.tracks
                })
                return null
            }
        }
    }   
}

let URIs = []

for(let i = 0; i < songList.length - 1; i++) {
    const uri = await getURI(songList[i])
    const pos = i + 1
    const songString = "\"" + songList[i].title + "\" by " + songList[i].artist
    if (uri) {
        console.log("Added " + songString + " with " + songList[i].scrobbles + " scrobbles (" + pos + "/" + (songList.length - 1) + ").")
        URIs.push(uri)
    } else {
        const errorString = "There was an error loading " + songString + " at playlist position " + pos + "."
        playlistDetails.description += " " + errorString
        console.log(errorString)
    }
}

const updateParams = {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
        "uris": URIs,
        "position": 0
    }),
    redirect: "follow"
}

const playlistID = await createPlaylist()
const playlistLink = "https://api.spotify.com/v1/playlists/" + playlistID + "/items"

async function setImage(id) {
    const url = "https://api.spotify.com/v1/playlists/" + id + "/images"
    const imgParams = {
        "method": "PUT",
        "headers": {
            "Authorization": "Bearer " + spotifyToken,
            "Content-Type": "image/jpeg" 
        },
        "body": imgString
    }
    console.log("Setting playlist image...")
    const imgResponse = await fetch(url, imgParams)
    if (imgResponse.statusText == "Accepted") {
        return "Playlist image successfully set."
    } else {
        return imgResponse.error
    }
}

async function updatePlaylist() {
    console.log("Adding tracks to playlist...")
    const playlistResponse = await fetch(playlistLink, updateParams)
    const fullResponse = await playlistResponse.json()
    if (fullResponse.snapshot_id) {
        return URIs.length + " song(s) added to new " + listPrivacy + " playlist \"" + playlistDetails.name + "\" at https://open.spotify.com/playlist/" + playlistID + ". See playlist description in Spotify for errors (if any)."
    } else {
        return fullResponse
    }
}

if (options.imgUse) {
    console.log(await setImage(playlistID))
}

console.log(await updatePlaylist())
writeFileSync("./logs/errorLog.json", JSON.stringify(failed, null, 2))