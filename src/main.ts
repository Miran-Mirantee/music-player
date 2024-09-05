import "./style.css";
import axios from "axios";

import songCard from "./components/songCard";

/**
 * TODO:
 *  - Implement streaming
 *  - Get search result from youtube (search by name)
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
 *  - add pagination for search
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

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const audio = new Audio();
// const audio = new Audio("./music/Kagami.mp3");

const playBtn = document.querySelector(".play") as HTMLButtonElement;
playBtn.disabled = true;
playBtn?.addEventListener("click", () => {
  audio.play();
  if (durationDom) {
    durationDom.textContent = formatTime(audio.duration);
  }
});

audio.src = "./music/Kagami.mp3";
playBtn.disabled = false;

// const url = "https://www.youtube.com/watch?v=sXhhdNL05sY";
// const music = await getMusic(url);
// if (music) {
//   audio.src = music;
//   playBtn.disabled = false;
// }

const pauseBtn = document.querySelector(".pause");
pauseBtn?.addEventListener("click", () => {
  audio.pause();
});

const currentTimeDom = document.querySelector(".time");
const durationDom = document.querySelector(".maxTime");

audio.addEventListener("timeupdate", () => {
  if (currentTimeDom) {
    currentTimeDom.textContent = formatTime(audio.currentTime);
  }
  if (seekBar) {
    seekBar.value = (audio.currentTime / audio.duration).toString();
  }
});

const volumnRange = document.querySelector(".volumn") as HTMLInputElement;

(() => {
  audio.volume = parseFloat(volumnRange.value);
})();

volumnRange?.addEventListener("input", (e: any) => {
  audio.volume = e.target.value;
});

const seekBar = document.querySelector(".seekBar") as HTMLInputElement;

seekBar?.addEventListener("input", (e: any) => {
  const seekTo = audio.duration * e.target.value;
  if (audio) {
    audio.currentTime = seekTo;
  }
});

const form = document.getElementById("search-form");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputValue = document.getElementById(
    "search-field"
  ) as HTMLInputElement;

  const listDom = document.querySelector(".songs-list");

  if (inputValue && listDom) {
    const songs = await searchSongs(inputValue.value);
    for (const song of songs) {
      const newCard = songCard(song);
      listDom.append(newCard);
    }

    console.log(songs);
  }
});
