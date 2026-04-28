import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const clientID = "yourID"
const clientSecret = "your secret"
const redirectURI = "your URI"
const scope = "playlist-modify-public playlist-modify-private ugc-image-upload"

const links = {
    token: "https://accounts.spotify.com/api/token",
    authorize: "https://accounts.spotify.com/authorize?"
}

const queryParams = new URLSearchParams({
    "response_type": "code",
    "client_id": clientID,
    "scope": scope,
    "redirect_uri": redirectURI
}).toString()

const queryString = links.authorize + queryParams


export async function getSpotifyToken() {
    console.log("Open this URL: " + queryString)

    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

    const kekmaURL = await rl.question("Input the URL you were redirected to after the login: ")
    rl.close();

    const requestHeaders = {
        "Authorization": "Basic " + btoa(clientID + ":" + clientSecret),
        "Content-Type": "application/x-www-form-urlencoded"
    }

    const requestBody = new URLSearchParams({
        "grant_type": "authorization_code",
        "redirect_uri": redirectURI,
        "code": kekmaURL.substring(25)
    })

    const requestParams = {
        method: "POST",
        headers: requestHeaders,
        body: requestBody,
        redirect: "follow"
    }

    const response = await fetch(links.token, requestParams);
    const full = await response.json();
    return full.access_token

}

export const spotifyToken = await getSpotifyToken()
//console.log(spotifyToken)