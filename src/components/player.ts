const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const player = () => {
  const playSong = (audioSrc: string) => {
    audio.src = audioSrc;
  };

  const audio = new Audio();

  audio.addEventListener("loadedmetadata", () => {
    playBtn.disabled = false;
    const duration = audio.duration;
    durationDom.textContent = formatTime(duration);
  });

  audio.addEventListener("timeupdate", () => {
    currenttimeDom.textContent = formatTime(audio.currentTime);
    seekBar.value = (audio.currentTime / audio.duration).toString();
  });

  const playerDom = document.createElement("div");
  playerDom.classList.add("player");

  const leftPanel = document.createElement("div");
  leftPanel.classList.add("player-left-panel");

  const prevBtn = document.createElement("button");
  prevBtn.classList.add("player-prev-btn");
  prevBtn.textContent = "prev";

  const playBtn = document.createElement("button");
  playBtn.classList.add("player-play-btn");
  playBtn.textContent = "play";
  playBtn.disabled = true;
  playBtn.addEventListener("click", () => {
    audio.play();
  });

  const nextBtn = document.createElement("button");
  nextBtn.classList.add("player-next-btn");
  nextBtn.textContent = "next";

  const middlePanel = document.createElement("div");
  middlePanel.classList.add("player-middle-panel");

  const seekBar = document.createElement("input");
  seekBar.classList.add("player-seek-bar");
  seekBar.min = "0";
  seekBar.max = "1";
  seekBar.step = "0.01";
  seekBar.value = "0";
  seekBar.type = "range";
  seekBar.addEventListener("input", (e: any) => {
    const seekTo = audio.duration * e.target.value;
    audio.currentTime = seekTo;
  });

  const timeDom = document.createElement("div");
  timeDom.classList.add("player-time");

  const currenttimeDom = document.createElement("span");
  currenttimeDom.classList.add("player-currenttime");
  currenttimeDom.textContent = "00:00";

  const durationDom = document.createElement("span");
  durationDom.classList.add("player-duration");
  durationDom.textContent = "00:00";

  const rightPanel = document.createElement("div");
  rightPanel.classList.add("player-right-panel");

  const muteBtn = document.createElement("button");
  muteBtn.classList.add("player-mute-btn");
  muteBtn.textContent = "mute";

  const volumeBar = document.createElement("input");
  volumeBar.classList.add("player-volume-bar");
  volumeBar.min = "0";
  volumeBar.max = "1";
  volumeBar.step = "0.01";
  volumeBar.value = "0.1";
  volumeBar.type = "range";
  volumeBar.addEventListener("input", (e: any) => {
    audio.volume = e.target.value;
  });
  audio.volume = parseFloat(volumeBar.value);

  const loopBtn = document.createElement("button");
  loopBtn.classList.add("player-loop-btn");
  loopBtn.textContent = "loop";

  const shuffleBtn = document.createElement("button");
  shuffleBtn.classList.add("player-shuffle-btn");
  shuffleBtn.textContent = "shuffle";

  playerDom.append(leftPanel, middlePanel, rightPanel);
  leftPanel.append(prevBtn, playBtn, nextBtn);
  middlePanel.append(seekBar, timeDom);
  timeDom.append(currenttimeDom, " / ", durationDom);
  rightPanel.append(muteBtn, volumeBar, loopBtn, shuffleBtn);

  return { playerDom, playSong };
};

export default player;
