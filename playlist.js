import { songList, playlistParams } from "./getSongs.js";
import { spotifyToken } from "./getToken.js";
import { writeFileSync } from "fs"
import { imgString } from "./image.js"

const todayDate = new Date()
const dateStr = todayDate.toLocaleDateString(undefined, {year: "numeric", month: "short", day: "2-digit"})

let playlistDetails = { // you can change these details as you wish
    "name": "Earworm",
    "description": "Generated on " + dateStr + " with " + playlistParams.username + "'s top " + (songList.length - 1) +  " tracks from the last " + playlistParams.nDays + " days on last.fm.",
    "public": true // should be true or false
}

const requestHeaders = {
    "Authorization": "Bearer " + spotifyToken,
    "Content-Type": "application/json"
}

async function createPlaylist() { // creates playlist and returns the ID
    const createParams = {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(playlistDetails)
    }
    const createURL = "https://api.spotify.com/v1/me/playlists"
    const createResponse = await fetch(createURL, createParams)
    const fullReply = await createResponse.json()
    return fullReply.id
}

const searchParams = {
  method: "GET",
  headers: {Authorization: "Bearer " + spotifyToken},
  redirect: "follow"
};

let failed = []

async function getURI(songInfo) {
    const query = "track:" + songInfo.title + " artist:" + songInfo.artist
    const params = {
        q: query,
        type: "track",
        limit: 5,
        locale: "en-US"
    }
    const endpoint = "https://api.spotify.com/v1/search?" + (new URLSearchParams(params)).toString()
    //console.log(params.q)
    const results = await fetch(endpoint, searchParams)
    const full = await results.json()
    if (full.tracks.items.length==0) {
        failed.push({
            queryurl: endpoint,
            response: full.tracks
        })
        return null
    } else {
        let found = false
        for (let i = 0; i < params.limit; i++) {
            const thisTrack = full.tracks.items[i]
            if (songInfo.album) {
                if (thisTrack.name == songInfo.title && thisTrack.album.name == songInfo.album) {
                    found = true
                    return thisTrack.uri
                }
            } else if (thisTrack.name == songInfo.title) {
                found = true
                return thisTrack.uri
            }
        }
        if (!found) {
            failed.push({
                queryurl: endpoint,
                response: full.tracks
            })
            return null
        }
    }   
}

let URIs = []

for(let i = 0; i < songList.length - 1; i++) {
    const uri = await getURI(songList[i])
    if (uri) {
        URIs.push(uri)
    } else {
        const errorString = "There was an error loading \"" + songList[i].title + "\" by " + songList[i].artist + " at playlist position " + (i+1) + "."
        playlistDetails.description += " " + errorString
        console.log(errorString)
    }
    //console.log(URIs[i], songList[i])
}

const updateBody = {
    "uris": URIs,
    "position": 0
}

const updateParams = {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify(updateBody),
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
    const imgResponse = await fetch(url, imgParams)
    if (imgResponse.statusText == "Accepted") {
        return "Playlist image successfully set."
    } else {
        return imgResponse.error
    }
}

async function updatePlaylist() {
    const playlistResponse = await fetch(playlistLink, updateParams)
    const fullResponse = await playlistResponse.json()
    if (fullResponse.snapshot_id) {
        return "Created new playlist named " + playlistDetails.name + " at https://open.spotify.com/playlist/" + playlistID + " with top " + URIs.length + " tracks for user " + playlistParams.username + "."
    } else {
        return fullResponse
    }
}

console.log(await setImage(playlistID))
console.log(await updatePlaylist())
writeFileSync("./logs/errorLog.json", JSON.stringify(failed, null, 2))