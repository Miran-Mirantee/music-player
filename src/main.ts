import "./style.css";
import axios from "axios";

import songCard from "./components/songCard";
import player from "./components/player";

import Song from "./types/song";

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
 *  - Create better player functionalities
 *    - Implement loop
 *    - Implement previous and next song button
 *    - Implement shuffle
 *    - Implement queue
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

const queue: string[] = [];

// const audio = new Audio();
// audio.addEventListener("loadedmetadata", () => {
//   const duration = audio.duration;
//   playBtn.disabled = false;
//   if (durationDom) {
//     durationDom.textContent = formatTime(duration);
//   }
// });
// const audio = new Audio("./music/Kagami.mp3");

// const playBtn = document.querySelector(".play") as HTMLButtonElement;
// playBtn.disabled = true;
// playBtn?.addEventListener("click", () => {
//   audio.play();
// });

// audio.src = "./music/Kagami.mp3";
// playBtn.disabled = false;

// const url = "https://www.youtube.com/watch?v=sXhhdNL05sY";
// const music = await getMusic(url);
// if (music) {
//   audio.src = music;
//   playBtn.disabled = false;
// }

// const pauseBtn = document.querySelector(".pause");
// pauseBtn?.addEventListener("click", () => {
//   audio.pause();
// });

// const currentTimeDom = document.querySelector(".time");
// const durationDom = document.querySelector(".maxTime");

// audio.addEventListener("timeupdate", () => {
// if (currentTimeDom) {
//   currentTimeDom.textContent = formatTime(audio.currentTime);
// }
// if (seekBar) {
//   seekBar.value = (audio.currentTime / audio.duration).toString();
// }
// });

// const volumnRange = document.querySelector(".volumn") as HTMLInputElement;

// (() => {
//   audio.volume = parseFloat(volumnRange.value);
// })();

// volumnRange?.addEventListener("input", (e: any) => {
//   audio.volume = e.target.value;
// });

// const seekBar = document.querySelector(".seekBar") as HTMLInputElement;

// seekBar?.addEventListener("input", (e: any) => {
//   const seekTo = audio.duration * e.target.value;
//   if (audio) {
//     audio.currentTime = seekTo;
//   }
// });

const columnDom = document.querySelector(".column");

const mediaPlayer = player();

columnDom?.append(mediaPlayer.playerDom);

const formDom = document.createElement("form");
formDom.classList.add("search-form");
formDom.addEventListener("submit", async (e) => {
  e.preventDefault();

  const songs: Song[] = await searchSongs(inputDom.value);
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
        queue.push(newSong);
        mediaPlayer.playSong(newSong);
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
