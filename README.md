# Earworm

This is a tool to generate an "On Repeat" like playlist based on your top songs from [last.fm](https://last.fm).

## Prerequisites:
1. You will need [node.js](https://nodejs.org/en) installed on your system to run this.
2. You will need to make a [last.fm API account](https://www.last.fm/api/account/create) and get an API key.
3. You will need to make a Web API app on the [Spotify Developer website](https://developer.spotify.com/dashboard) and get a Client ID, Client Secret and make a Redirect URI. If you're only using this for your own Spotify account, this is all you need; however, you will need to add the email addresses of any other accounts you want to use this tool for in the User Management section.

## Usage:
Once you've got all of the above down, fill in the appropriate details in `options.js` and then type `node .` into the console and follow the instructions!

- You can also run `node list` to see the list of songs in the console. Every time the code runs, the list gets logged in `list.json`.