import formatTime from "../utils/formalTime";
import SongObject from "../types/SongObject";

export class AudioController {
  private queue: SongObject[] = [
    {
      artist: "ChouCho",
      duration: 289,
      name: "kagami1",
      thumbnail:
        "https://lh3.googleusercontent.com/cPyEotRklRgMeWyS2eBMdCKsb5xTntN7Z959M_CvhQiRE6Kxsj-1XExUxarbDrE7NnbAkcCvkFanU4Q=w120-h120-s-l90-rj",
      url: "blob:http://localhost:5173/4aa5927f-6631-4f34-a406-16f7831d47be",
    },
    {
      artist: "ChouCho",
      duration: 289,
      name: "kagami2",
      thumbnail:
        "https://lh3.googleusercontent.com/cPyEotRklRgMeWyS2eBMdCKsb5xTntN7Z959M_CvhQiRE6Kxsj-1XExUxarbDrE7NnbAkcCvkFanU4Q=w120-h120-s-l90-rj",
      url: "blob:http://localhost:5173/4aa5927f-6631-4f34-a406-16f7831d47be",
    },
    {
      artist: "ChouCho",
      duration: 289,
      name: "kagami3",
      thumbnail:
        "https://lh3.googleusercontent.com/cPyEotRklRgMeWyS2eBMdCKsb5xTntN7Z959M_CvhQiRE6Kxsj-1XExUxarbDrE7NnbAkcCvkFanU4Q=w120-h120-s-l90-rj",
      url: "blob:http://localhost:5173/4aa5927f-6631-4f34-a406-16f7831d47be",
    },
    {
      artist: "ChouCho",
      duration: 289,
      name: "kagami4",
      thumbnail:
        "https://lh3.googleusercontent.com/cPyEotRklRgMeWyS2eBMdCKsb5xTntN7Z959M_CvhQiRE6Kxsj-1XExUxarbDrE7NnbAkcCvkFanU4Q=w120-h120-s-l90-rj",
      url: "blob:http://localhost:5173/4aa5927f-6631-4f34-a406-16f7831d47be",
    },
  ];
  // private queue: SongObject[] = [];
  private currentOrder: number = 0;
  private audio: HTMLAudioElement;
  private currenttimeDom: HTMLSpanElement;
  private durationDom: HTMLSpanElement;
  private playBtn: HTMLButtonElement;
  private seekBar: HTMLInputElement;

  public playerDom: HTMLDivElement;
  public queueDom: HTMLDivElement;

  constructor() {
    this.currenttimeDom = document.createElement("span");
    this.currenttimeDom.classList.add("player-currenttime");
    this.currenttimeDom.textContent = "00:00";

    this.durationDom = document.createElement("span");
    this.durationDom.classList.add("player-duration");
    this.durationDom.textContent = "00:00";

    this.playBtn = document.createElement("button");
    this.playBtn.classList.add("player-play-btn");
    this.playBtn.textContent = "play";
    this.playBtn.disabled = true;
    this.playBtn.addEventListener("click", () => {
      if (this.audio.paused) {
        this.audio.play();
        this.playBtn.textContent = "play";
      } else {
        this.audio.pause();
        this.playBtn.textContent = "pause";
      }
    });

    this.seekBar = document.createElement("input");
    this.seekBar.classList.add("player-seek-bar");
    this.seekBar.min = "0";
    this.seekBar.max = "1";
    this.seekBar.step = "0.01";
    this.seekBar.value = "0";
    this.seekBar.type = "range";
    this.seekBar.addEventListener("input", (e: any) => {
      const seekTo = this.audio.duration * e.target.value;
      this.audio.currentTime = seekTo;
    });

    this.audio = new Audio();

    this.audio.addEventListener("loadedmetadata", () => {
      this.playBtn.disabled = false;
      const duration = this.audio.duration;
      this.durationDom.textContent = formatTime(duration);
    });

    this.audio.addEventListener("timeupdate", () => {
      this.currenttimeDom.textContent = formatTime(this.audio.currentTime);
      if (this.audio.duration) {
        this.seekBar.value = (
          this.audio.currentTime / this.audio.duration
        ).toString();
      }
    });

    this.audio.addEventListener("ended", () => {
      if (!this.audio.loop) {
        this.nextSong();
      }
    });

    this.audio.addEventListener("emptied", () => {
      this.seekBar.value = "0";
    });

    this.playerDom = this.createPlayerDom();

    this.queueDom = this.createQueueDom();

    // temp
    this.updateQueueDom();
  }

  private nextSong = () => {
    if (this.queue.length == this.currentOrder + 1) {
      this.currentOrder = 0;
    } else {
      this.currentOrder++;
    }
    this.playSong(this.queue[this.currentOrder]);
  };

  private prevSong = () => {
    if (this.currentOrder == 0) {
      this.currentOrder = this.queue.length - 1;
    } else {
      this.currentOrder--;
    }
    this.playSong(this.queue[this.currentOrder]);
  };

  private playSong = (song: SongObject) => {
    this.audio.src = song.url;
    this.audio.play();
  };

  private loopSong = () => {
    this.audio.loop = !this.audio.loop;
  };

  private shuffleSong = () => {
    // Step 1: Extract the current song from the array
    const currentSong = this.queue[this.currentOrder];

    // Step 2: Create a new array excluding the current song
    const remainingSongs = this.queue.filter(
      (_, index) => index !== this.currentOrder
    );

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
    this.queue.splice(0, this.queue.length, ...newQueue);
    this.currentOrder = 0;

    this.updateQueueDom();
  };

  private createPlayerDom = () => {
    const dom = document.createElement("div");
    dom.classList.add("player");

    const leftPanel = document.createElement("div");
    leftPanel.classList.add("player-left-panel");

    const prevBtn = document.createElement("button");
    prevBtn.classList.add("player-prev-btn");
    prevBtn.textContent = "prev";
    prevBtn.addEventListener("click", this.prevSong);

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("player-next-btn");
    nextBtn.textContent = "next";
    nextBtn.addEventListener("click", this.nextSong);

    const middlePanel = document.createElement("div");
    middlePanel.classList.add("player-middle-panel");

    const timeDom = document.createElement("div");
    timeDom.classList.add("player-time");

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
      this.audio.volume = e.target.value;
    });
    this.audio.volume = parseFloat(volumeBar.value);

    const loopBtn = document.createElement("button");
    loopBtn.classList.add("player-loop-btn");
    loopBtn.textContent = "loop";
    loopBtn.addEventListener("click", this.loopSong);

    const shuffleBtn = document.createElement("button");
    shuffleBtn.classList.add("player-shuffle-btn");
    shuffleBtn.textContent = "shuffle";
    shuffleBtn.addEventListener("click", this.shuffleSong);

    dom.append(leftPanel, middlePanel, rightPanel);
    leftPanel.append(prevBtn, this.playBtn, nextBtn);
    middlePanel.append(this.seekBar, timeDom);
    timeDom.append(this.currenttimeDom, " / ", this.durationDom);
    rightPanel.append(volumeBar, loopBtn, shuffleBtn);

    return dom;
  };

  private resetPlayerDom = () => {
    this.audio.src = "";
    this.durationDom.textContent = "00:00";
    this.currenttimeDom.textContent = "00:00";
    this.playBtn.disabled = true;
    this.playBtn.textContent = "play";
  };

  private createQueueItemDom = (song: SongObject, index: number) => {
    let isBtnHeld = false;
    let isDragging = false;
    let initialY = 0;
    let offsetY = 0;

    let prevSibling: any;

    const itemDom = document.createElement("div");
    itemDom.classList.add("queue-item");
    itemDom.addEventListener("mousedown", (e) => {
      if (isBtnHeld) {
        isDragging = true;
        initialY = e.clientY;
        offsetY = 0;
        itemDom.classList.add("dragging");
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging && isBtnHeld) {
        offsetY = e.clientY - initialY;

        const draggingItem = this.queueDom.querySelector(".dragging");
        if (draggingItem) {
          const draggingItemRect = draggingItem.getBoundingClientRect();
          const queueDomRect = this.queueDom.getBoundingClientRect();

          // check if draggin item is in the container
          if (
            e.clientY - queueDomRect.top > draggingItemRect.height / 2 &&
            e.clientY - queueDomRect.top <
              queueDomRect.height - draggingItemRect.height / 2
          ) {
            itemDom.style.transform = `translateY(${offsetY}px)`;
          }

          const siblings = [
            ...this.queueDom.querySelectorAll(".queue-item:not(.dragging)"),
          ];

          const nextSibling =
            siblings.find((sibling) => {
              if (sibling instanceof HTMLElement) {
                return (
                  e.clientY - queueDomRect.top <=
                  sibling.offsetTop + sibling.offsetHeight / 2
                );
              }
            }) || null;

          if (prevSibling != nextSibling) {
            console.log("heh");
            offsetY = 0;
            initialY = e.clientY;
            itemDom.style.transform = `translateY(${offsetY}px)`;

            this.queueDom.insertBefore(draggingItem, nextSibling);
          }

          prevSibling = nextSibling;
        }
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isBtnHeld = false;
        isDragging = false;
        itemDom.classList.remove("dragging");
        itemDom.style.transform = `translateY(0px)`;
      }
    });

    const thumbnailDom = document.createElement("img");
    thumbnailDom.classList.add("queue-thumbnail");
    thumbnailDom.src = song.thumbnail;

    const songInfoDom = document.createElement("div");
    songInfoDom.classList.add("queue-song-info");

    const songNameDom = document.createElement("span");
    songNameDom.classList.add("queue-song-name");
    songNameDom.textContent = song.name;

    const btmInfoDom = document.createElement("div");
    btmInfoDom.classList.add("queue-buttom-info");

    const artistDom = document.createElement("span");
    artistDom.classList.add("queue-artist");
    artistDom.textContent = song.artist;

    const durationDom = document.createElement("span");
    durationDom.classList.add("queue-duration");
    durationDom.textContent = formatTime(song.duration);

    const buttonPanel = document.createElement("div");
    buttonPanel.classList.add("queue-button-panel");

    const moveBtn = document.createElement("button");
    moveBtn.classList.add("queue-move-btn");
    moveBtn.textContent = "move";
    moveBtn.addEventListener("mousedown", () => {
      isBtnHeld = true;
    });
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("queue-remove-btn");
    removeBtn.textContent = "X";
    removeBtn.addEventListener("click", () => {
      if (this.currentOrder > index) {
        this.currentOrder--;
      } else if (this.currentOrder == index) {
        if (this.queue.length > 1) {
          this.nextSong();
        } else {
          this.resetPlayerDom();
        }
      }
      this.queue.splice(index, 1);
      this.updateQueueDom();
    });

    itemDom.append(thumbnailDom, songInfoDom, buttonPanel);
    songInfoDom.append(songNameDom, btmInfoDom);
    btmInfoDom.append(artistDom, durationDom);
    buttonPanel.append(moveBtn, removeBtn);

    return itemDom;
  };

  private createQueueDom = () => {
    const dom = document.createElement("div");
    dom.classList.add("queue");
    return dom;
  };

  private updateQueueDom = () => {
    this.queueDom.textContent = "";
    for (const [index, song] of this.queue.entries()) {
      const newQueueItem = this.createQueueItemDom(song, index);
      this.queueDom.append(newQueueItem);
    }
  };

  public addSong = (newSong: SongObject) => {
    this.queue.push(newSong);

    if (this.queue.length == 1) {
      this.playSong(this.queue[this.currentOrder]);
    }

    this.updateQueueDom();
  };
}
