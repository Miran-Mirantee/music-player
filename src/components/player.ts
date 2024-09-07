import formatTime from "../utils/formalTime";
import SongObject from "../types/SongObject";

const player = () => {
  const queue: SongObject[] = [];

  let _currentOrder: number = 0;

  const _nextSong = () => {
    if (queue.length == _currentOrder + 1) {
      _currentOrder = 0;
    } else {
      _currentOrder++;
    }
    _playSong(queue[_currentOrder]);
  };

  const _prevSong = () => {
    if (_currentOrder == 0) {
      _currentOrder = queue.length - 1;
    } else {
      _currentOrder--;
    }
    _playSong(queue[_currentOrder]);
  };

  const _playSong = (song: SongObject) => {
    audio.src = song.url;
    audio.play();
  };

  const _loopSong = () => {
    audio.loop = !audio.loop;
  };

  const _shuffleSong = () => {
    // Step 1: Extract the current song from the array
    const currentSong = queue[_currentOrder];

    // Step 2: Create a new array excluding the current song
    const remainingSongs = queue.filter((_, index) => index !== _currentOrder);

    // Step 3: Shuffle the remaining songs using Fisher-Yates algorithm
    for (let i = remainingSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingSongs[i], remainingSongs[j]] = [
        remainingSongs[j],
        remainingSongs[i],
      ];
    }

    // Step 4: Place the current song at the beginning of the array
    const newQueue = [currentSong, ...remainingSongs];
    queue.splice(0, queue.length, ...newQueue);
    _currentOrder = 0;
  };

  const addSong = (newSong: SongObject) => {
    queue.push(newSong);

    if (queue.length == 1) {
      _playSong(queue[_currentOrder]);
    }
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

  audio.addEventListener("ended", () => {
    if (!audio.loop) {
      _nextSong();
    }
  });

  const playerDom = document.createElement("div");
  playerDom.classList.add("player");

  const leftPanel = document.createElement("div");
  leftPanel.classList.add("player-left-panel");

  const prevBtn = document.createElement("button");
  prevBtn.classList.add("player-prev-btn");
  prevBtn.textContent = "prev";
  prevBtn.addEventListener("click", _prevSong);

  const playBtn = document.createElement("button");
  playBtn.classList.add("player-play-btn");
  playBtn.textContent = "play";
  playBtn.disabled = true;
  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = "play";
    } else {
      audio.pause();
      playBtn.textContent = "pause";
    }
  });

  const nextBtn = document.createElement("button");
  nextBtn.classList.add("player-next-btn");
  nextBtn.textContent = "next";
  nextBtn.addEventListener("click", _nextSong);

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
  loopBtn.addEventListener("click", _loopSong);

  const shuffleBtn = document.createElement("button");
  shuffleBtn.classList.add("player-shuffle-btn");
  shuffleBtn.textContent = "shuffle";
  shuffleBtn.addEventListener("click", _shuffleSong);

  playerDom.append(leftPanel, middlePanel, rightPanel);
  leftPanel.append(prevBtn, playBtn, nextBtn);
  middlePanel.append(seekBar, timeDom);
  timeDom.append(currenttimeDom, " / ", durationDom);
  rightPanel.append(volumeBar, loopBtn, shuffleBtn);

  return { playerDom, addSong, queue };
};

export default player;
