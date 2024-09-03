import "./style.css";
import axios from "axios";

const getMusic = async (url: string) => {
  const response = await axios.get("http://localhost:3000/api/youtube", {
    responseType: "blob",
    params: { url },
  });

  // console.log(response);

  const audio = URL.createObjectURL(response.data);
  return audio;
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// const bodyDom = document.body;

// const url = await getMusic("https://www.youtube.com/watch?v=_9uJoQzbFEc");

// const audio = new Audio(url);
const audio = new Audio("./music/Kagami.mp3");

const playBtn = document.querySelector(".play");
playBtn?.addEventListener("click", () => {
  audio.play();
  if (durationDom) {
    durationDom.textContent = formatTime(audio.duration);
  }
});

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

const form = document.getElementById("searchForm");
form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputValue = document.getElementById("searchField") as HTMLInputElement;
  if (inputValue) {
    const newMusic = await getMusic(inputValue.value);
    audio.src = newMusic;
  }
});
