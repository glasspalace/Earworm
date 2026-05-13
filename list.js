import { songList } from "./getSongs.js";

for (let i = 0; i < songList.length - 1; i ++) {
    songList[i].rank = i + 1
}

console.log(JSON.stringify(songList, null, 2))