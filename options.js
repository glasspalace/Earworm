export const options = {
    playlist: {
        user: " ", // username on last.fm
        limit: 15, // maximum number of songs in the playlist
        period: 3, // number of days over which to get songs
        minStreams: 4, // minimum number of scrobbles to be included
        name: " ", // name of the playlist
        public: true // whether the playlist is public or not (true or false)
    },
    auth: {
        apiKey: " ", // your API key for last.fm
        spotify: {
            clientID: " ", // your spotify client ID
            clientSecret: " ", //  spotify client secret
            redirectURI: " " // redirect URI (get all of this from developer.spotify.com)
        }
    },
    imgUse: false // whether or not you want to set a custom image for the playlist in image.js (true or false)
}