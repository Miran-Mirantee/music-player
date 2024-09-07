import "./style.css";
import axios from "axios";

import songCard from "./components/songCard";
import player from "./components/player";

import SongResponse from "./types/SongResponse";
import SongObject from "./types/SongObject";

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
 *  - Create queue UI
 *  - Create a better UI
 *    - Using Three.js (optional)
 *  - Add pagination for search
 */

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

const columnDom = document.querySelector(".column");

const mediaPlayer = player();

columnDom?.append(mediaPlayer.playerDom);

const formDom = document.createElement("form");
formDom.classList.add("search-form");
formDom.addEventListener("submit", async (e) => {
  e.preventDefault();

  const songs: SongResponse[] = await searchSongs(inputDom.value);
  resultDom.textContent = "";

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
        mediaPlayer.addSong(newSongObj);
        // audio.src = newSong;
        // playBtn.disabled = false;
        // audio.play();
      }
    });
  }
  console.log(songs);
});

const inputDom = document.createElement("input");
inputDom.id = "search-field";
inputDom.placeholder = "search";

const resultDom = document.createElement("div");
resultDom.classList.add("songs-list");

formDom.append(inputDom);
columnDom?.append(formDom, resultDom);
