import "./style.css";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// const bodyDom = document.body;
const audio = new Audio("./music/Kagami.mp3");

// const audioDuration =

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
  console.log(seekTo);
  if (audio) {
    audio.currentTime = seekTo;
  }
});
