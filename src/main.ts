import "./style.css";
import songCard from "./components/songCard";
import playlistCard from "./components/playlistCard";
import { AudioController } from "./class/AudioController";
import searchPlaylists from "./utils/searchPlaylists";
import searchSongs from "./utils/searchSongs";
import getPlaylist from "./utils/getPlaylist";
import SongResponse from "./types/SongResponse";
import SongObject from "./types/SongObject";
import PlaylistResponse from "./types/PlaylistResponse";

/**
 * TODO:
 *  - Implement streaming
 *  - Get search result from youtube (search by name)
 *    - Search artist
 *    - Search videos
 *  - Create a local playlist
 *  - Import a playlist from spotify
 *  - Create a better UI
 *    - Using Three.js (optional)
 *  - Add pagination for search
 *  - Add cookie to prevent youtube block
 */

/**
 * BUGS:
 *  - Looping not working as intended
 *  - Song didn't stop when removing from queue (when the queue is more than one song and trying to remove all from the queue)
 */

let currentSearchType = "song";

const columnDom = document.querySelector(".column");

const audioController = new AudioController();
columnDom?.append(audioController.playerDom);
document.body.append(audioController.queueDom);

const formDom = document.createElement("form");
formDom.classList.add("search-form");
formDom.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultDom.textContent = "";

  switch (currentSearchType) {
    case "song":
      const songs: SongResponse[] = await searchSongs(inputDom.value);

      for (const song of songs) {
        const newCard = songCard(song);
        resultDom.append(newCard);

        newCard.addEventListener("click", async () => {
          const newSongObj: SongObject = {
            videoId: song.videoId,
            artist: song.artist.name,
            thumbnail: song.thumbnails[1].url,
            duration: song.duration,
            name: song.name,
          };

          console.log(newSongObj);
          audioController.addSong(newSongObj);
        });
      }
      console.log(songs);
      break;
    case "playlist":
      const playlists: PlaylistResponse[] = await searchPlaylists(
        inputDom.value
      );

      for (const playlist of playlists) {
        const newCard = playlistCard(playlist);
        resultDom.append(newCard);

        newCard.addEventListener("click", async () => {
          const playlistSongs = await getPlaylist(playlist.playlistId);

          for (const song of playlistSongs) {
            const newSongObj: SongObject = {
              videoId: song.videoId,
              artist: song.artist.name,
              thumbnail: song.thumbnails[1]
                ? song.thumbnails[1].url
                : song.thumbnails[0].url,
              duration: song.duration,
              name: song.name,
            };

            // console.log(newSongObj);
            audioController.addSong(newSongObj);
          }

          console.log(playlistSongs);
        });
      }
      console.log(playlists);
      break;

    default:
      break;
  }
});

const inputDom = document.createElement("input");
inputDom.id = "search-field";
inputDom.placeholder = "search";

const tabDom = document.createElement("div");
tabDom.classList.add("tab");

const songTabDom = document.createElement("div");
songTabDom.classList.add("tab-song");
songTabDom.textContent = "Songs";
songTabDom.addEventListener("click", () => {
  currentSearchType = "song";
});

const playlistTabDom = document.createElement("div");
playlistTabDom.classList.add("tab-playlist");
playlistTabDom.textContent = "Playlists";
playlistTabDom.addEventListener("click", () => {
  currentSearchType = "playlist";
});

const videoTabDom = document.createElement("div");
videoTabDom.classList.add("tab-video");
videoTabDom.textContent = "Videos";
videoTabDom.addEventListener("click", () => {
  currentSearchType = "video";
});

const resultDom = document.createElement("div");
resultDom.classList.add("songs-list");

tabDom.append(songTabDom, playlistTabDom, videoTabDom);
formDom.append(inputDom);
columnDom?.append(formDom, tabDom, resultDom);
