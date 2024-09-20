import formatTime from "../utils/formalTime";
import getMusic from "../utils/getMusic";
import SongObject from "../types/SongObject";

export class AudioController {
  private queue: SongObject[] = [];
  private queueContainer: HTMLDivElement;
  private currentOrder: number = 0;
  private audio: HTMLAudioElement;
  private currenttimeDom: HTMLSpanElement;
  private durationDom: HTMLSpanElement;
  private playBtn: HTMLButtonElement;
  private seekBar: HTMLInputElement;
  private thumbnailDom: HTMLImageElement;
  private nameDom: HTMLSpanElement;

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

    this.thumbnailDom = document.createElement("img");
    this.thumbnailDom.classList.add("player-thumbnail");
    this.thumbnailDom.src = this.queue[this.currentOrder]
      ? this.queue[this.currentOrder].thumbnail
      : "hey.jpg";

    this.nameDom = document.createElement("span");
    this.nameDom.classList.add("player-song-name");
    this.nameDom.textContent = this.queue[this.currentOrder]
      ? this.queue[this.currentOrder].name
      : "name";

    this.audio = new Audio();

    this.audio.addEventListener("loadedmetadata", () => {
      this.playBtn.disabled = false;
      const duration = this.audio.duration;
      this.durationDom.textContent = formatTime(duration);
      this.thumbnailDom.src = this.queue[this.currentOrder].thumbnail;
      this.nameDom.textContent = this.queue[this.currentOrder].name;
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

    const { dom, container } = this.createQueueDom();
    this.queueDom = dom;
    this.queueContainer = container;
  }

  private nextSong = () => {
    this.resetPlayerDom();
    if (this.queue.length == this.currentOrder + 1) {
      this.currentOrder = 0;
    } else {
      this.currentOrder++;
    }
    this.playSong(this.queue[this.currentOrder]);
  };

  private prevSong = () => {
    this.resetPlayerDom();
    if (this.currentOrder == 0) {
      this.currentOrder = this.queue.length - 1;
    } else {
      this.currentOrder--;
    }
    this.playSong(this.queue[this.currentOrder]);
  };

  private playSong = async (song: SongObject) => {
    if (song.source) {
      this.audio.src = song.source;
    } else {
      try {
        const source = await getMusic(
          `https://www.youtube.com/watch?v=${song.videoId}`
        );
        if (source) {
          song.source = source;
          this.audio.src = source;
        }
      } catch (error) {
        this.queue.splice(this.currentOrder, 1);
        this.updateQueueDom();
        this.currentOrder--;
        this.nextSong();
      }
    }
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

    const topPanel = document.createElement("div");
    topPanel.classList.add("player-top-panel");

    const timeDom = document.createElement("div");
    timeDom.classList.add("player-time");

    const bottomPanel = document.createElement("div");
    bottomPanel.classList.add("player-bottom-panel");

    const leftBottomPanel = document.createElement("div");
    leftBottomPanel.classList.add("player-left-panel");

    const middleBottomPanel = document.createElement("div");
    middleBottomPanel.classList.add("player-middle-panel");

    const prevBtn = document.createElement("button");
    prevBtn.classList.add("player-prev-btn");
    prevBtn.textContent = "prev";
    prevBtn.addEventListener("click", this.prevSong);

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("player-next-btn");
    nextBtn.textContent = "next";
    nextBtn.addEventListener("click", this.nextSong);

    const rightBottomPanel = document.createElement("div");
    rightBottomPanel.classList.add("player-right-panel");

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

    dom.append(topPanel, bottomPanel);
    topPanel.append(this.seekBar, timeDom);
    timeDom.append(this.currenttimeDom, " / ", this.durationDom);
    bottomPanel.append(leftBottomPanel, middleBottomPanel, rightBottomPanel);
    leftBottomPanel.append(this.thumbnailDom, this.nameDom);
    middleBottomPanel.append(prevBtn, this.playBtn, nextBtn);
    rightBottomPanel.append(volumeBar, loopBtn, shuffleBtn);

    return dom;
  };

  private resetPlayerDom = () => {
    this.audio.src = "";
    this.durationDom.textContent = "00:00";
    this.currenttimeDom.textContent = "00:00";
    this.playBtn.disabled = true;
    this.playBtn.textContent = "play";
    this.thumbnailDom.src = "hey.jpg";
    this.nameDom.textContent = "name";
  };

  private createQueueItemDom = (song: SongObject) => {
    let isDragging = false;
    let initialY = 0;
    let offsetY = 0;
    let prevSibling: any;

    const _handleClickQueuePlaySong = () => {
      this.resetPlayerDom();
      this.playSong(this.queue[parseInt(itemDom.id)]);
      this.currentOrder = parseInt(itemDom.id);
    };

    const itemDom = document.createElement("div");
    itemDom.classList.add("queue-item");
    itemDom.addEventListener("mousedown", (e) => {
      isDragging = true;
      initialY = e.clientY;
      offsetY = 0;
      itemDom.classList.add("dragging");
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        offsetY = e.clientY - initialY;

        const draggingItemRect = itemDom.getBoundingClientRect();
        const queueDomRect = this.queueDom.getBoundingClientRect();

        const scrollTop = this.queueDom.scrollTop;
        const adjustedClientY = e.clientY + scrollTop;

        // check if draggin item is in the container
        if (
          e.clientY - queueDomRect.top > draggingItemRect.height / 2 &&
          e.clientY - queueDomRect.top <
            queueDomRect.height - draggingItemRect.height / 2
        ) {
          itemDom.style.transform = `translateY(${offsetY}px)`;
        }

        const siblings = [
          ...this.queueContainer.querySelectorAll(".queue-item:not(.dragging)"),
        ];

        const nextSibling =
          siblings.find((sibling) => {
            if (sibling instanceof HTMLElement) {
              return (
                adjustedClientY - queueDomRect.top <=
                sibling.offsetTop + sibling.offsetHeight / 2
              );
            }
          }) || null;

        // Swapping if the last nextSibling is different
        if (prevSibling != nextSibling) {
          offsetY = 0;
          initialY = e.clientY;
          itemDom.style.transform = `translateY(${offsetY}px)`;

          this.queueContainer.insertBefore(itemDom, nextSibling);

          // Swapping previous and current song in queue
          if (itemDom.previousSibling instanceof HTMLElement) {
            if (
              itemDom.previousSibling &&
              parseInt(itemDom.previousSibling.id) > parseInt(itemDom.id)
            ) {
              // changing current order of song
              if (parseInt(itemDom.previousSibling.id) == this.currentOrder) {
                this.currentOrder = parseInt(itemDom.id);
              } else if (parseInt(itemDom.id) == this.currentOrder) {
                this.currentOrder = parseInt(itemDom.previousSibling.id);
              }
              [
                this.queue[parseInt(itemDom.id)],
                this.queue[parseInt(itemDom.previousSibling.id)],
              ] = [
                this.queue[parseInt(itemDom.previousSibling.id)],
                this.queue[parseInt(itemDom.id)],
              ];
              const temp = itemDom.id;
              itemDom.id = itemDom.previousSibling.id;
              itemDom.previousSibling.id = temp;
            }
          }

          // Swapping next and current song in queue
          if (itemDom.nextSibling instanceof HTMLElement) {
            if (
              itemDom.nextSibling &&
              parseInt(itemDom.nextSibling.id) < parseInt(itemDom.id)
            ) {
              // changing current order of song
              if (parseInt(itemDom.nextSibling.id) == this.currentOrder) {
                this.currentOrder = parseInt(itemDom.id);
              } else if (parseInt(itemDom.id) == this.currentOrder) {
                this.currentOrder = parseInt(itemDom.nextSibling.id);
              }
              [
                this.queue[parseInt(itemDom.id)],
                this.queue[parseInt(itemDom.nextSibling.id)],
              ] = [
                this.queue[parseInt(itemDom.nextSibling.id)],
                this.queue[parseInt(itemDom.id)],
              ];
              const temp = itemDom.id;
              itemDom.id = itemDom.nextSibling.id;
              itemDom.nextSibling.id = temp;
            }
          }
        }
        prevSibling = nextSibling;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        itemDom.classList.remove("dragging");
        itemDom.style.transform = `translateY(0px)`;
      }
    });

    const thumbnailDom = document.createElement("img");
    thumbnailDom.classList.add("queue-thumbnail");
    thumbnailDom.src = song.thumbnail;
    thumbnailDom.draggable = false;

    thumbnailDom.addEventListener("click", _handleClickQueuePlaySong);

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

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("queue-remove-btn");
    removeBtn.textContent = "X";
    removeBtn.addEventListener("click", () => {
      const itemId = parseInt(itemDom.id);
      const queueLength = this.queue.length;

      if (this.currentOrder > itemId) {
        this.currentOrder--;
      } else if (this.currentOrder === itemId) {
        if (queueLength > 1) {
          this.nextSong();

          // Adjust currentOrder if the removed item is not the last in the queue
          if (itemId !== queueLength - 1) {
            this.currentOrder--;
          }
        } else {
          this.resetPlayerDom();
        }
      }

      // Remove the song from the queue
      this.queue.splice(itemId, 1);

      // Update the queue DOM
      this.updateQueueDom();
    });

    itemDom.append(thumbnailDom, songInfoDom, buttonPanel);
    songInfoDom.append(songNameDom, btmInfoDom);
    btmInfoDom.append(artistDom, durationDom);
    buttonPanel.append(removeBtn);

    return itemDom;
  };

  private createQueueDom = () => {
    const dom = document.createElement("div");
    dom.classList.add("queue");
    const container = document.createElement("div");
    container.classList.add("queue-container");
    const expandBtn = document.createElement("div");
    expandBtn.classList.add("queue-expand-btn");

    dom.append(container, expandBtn);
    return { dom, container };
  };

  private updateQueueDom = () => {
    this.queueContainer.textContent = "";
    for (const [index, song] of this.queue.entries()) {
      const newQueueItem = this.createQueueItemDom(song);
      newQueueItem.id = index.toString();
      this.queueContainer.append(newQueueItem);
    }
  };

  public addSong = (newSong: SongObject) => {
    this.queue.push(newSong);

    if (this.queue.length == 1) {
      this.playSong(this.queue[this.currentOrder]);
    }

    this.updateQueueDom();
  };

  public clearQueue = () => {
    this.resetPlayerDom();
    this.currentOrder = 0;
    this.queue = [];
  };
}
