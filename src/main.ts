import "./style.css";
import axios from "axios";

import songCard from "./components/songCard";
import playlistCard from "./components/playlistCard";

import { AudioController } from "./class/AudioController";

import SongResponse from "./types/SongResponse";
import SongObject from "./types/SongObject";
import PlaylistResponse from "./types/PlaylistResponse";

/**
 * TODO:
 *  - Implement streaming
 *  - Get search result from youtube (search by name)
 *    - Search playlist
 *    - Search artist
 *    - Search videos
 *  - Create a local playlist
 *  - Get a playlist from youtube
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

const searchSongs = async (query: string) => {
  try {
    const response = await axios.get("http://localhost:3000/api/searchSongs", {
      params: { search: query },
    });

    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const searchPlaylists = async (query: string) => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/searchPlaylists",
      {
        params: { search: query },
      }
    );

    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const getMusic = async (url: string) => {
  try {
    const response = await axios.get("http://localhost:3000/api/youtube", {
      responseType: "blob",
      params: { url },
    });
    // console.log(response);

    const audio = URL.createObjectURL(response.data);
    return audio;
  } catch (error) {
    console.log(error);
  }
};

const getPlaylist = async (query: string) => {
  try {
    const response = await axios.get("http://localhost:3000/api/getPlaylist", {
      params: { playlistId: query },
    });
    console.log("getting playlist");
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

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
          // playBtn.disabled = true;
          const newSong = await getMusic(
            `https://www.youtube.com/watch?v=${song.videoId}`
          );
          if (newSong) {
            const newSongObj: SongObject = {
              url: newSong,
              artist: song.artist.name,
              thumbnail: song.thumbnails[1].url,
              duration: song.duration,
              name: song.name,
            };

            console.log(newSongObj);
            audioController.addSong(newSongObj);
          }
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
