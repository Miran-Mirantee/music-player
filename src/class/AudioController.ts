import formatTime from "../utils/formalTime";
import getMusic from "../utils/getMusic";
import SongObject from "../types/SongObject";
import throttle from "../utils/throttle";

export class AudioController {
  private queueContainer: HTMLDivElement;
  private togglePlayerDomDisability: () => void;
  private currentOrder: number = 0;
  private audio: HTMLAudioElement;
  private currenttimeDom: HTMLSpanElement;
  private durationDom: HTMLSpanElement;
  private playBtn: HTMLButtonElement;
  private seekBar: HTMLInputElement;
  private thumbnailDom: HTMLImageElement;
  private nameDom: HTMLAnchorElement;
  private prevVolume: number = 0.1;
  private isLoading: boolean = true;

  public queue: SongObject[] = [];
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
    this.playBtn.classList.add("player-special-btn");
    this.playBtn.title = "Play";
    this.playBtn.ariaLabel = "Play";
    this.playBtn.disabled = this.isLoading;
    this.playBtn.ariaDisabled = this.isLoading.toString();
    this.playBtn.addEventListener("click", () => {
      if (this.audio.paused) {
        this.audio.play();
        this.playBtn.ariaLabel = "Play";
        this.playBtn.title = "Play";
        icon.classList.add("ri-pause-fill");
        icon.classList.remove("ri-play-fill");
      } else {
        this.audio.pause();
        this.playBtn.ariaLabel = "Pause";
        this.playBtn.title = "Pause";
        icon.classList.add("ri-play-fill");
        icon.classList.remove("ri-pause-fill");
      }
    });
    const icon = document.createElement("i");
    icon.classList.add("ri-pause-fill");
    this.playBtn.append(icon);

    this.seekBar = document.createElement("input");
    this.seekBar.classList.add("player-seek-bar");
    this.seekBar.ariaLabel = "Seek bar";
    this.seekBar.title = "Seek bar";
    this.seekBar.min = "0";
    this.seekBar.max = "1";
    this.seekBar.step = "0.001";
    this.seekBar.value = "0";
    this.seekBar.type = "range";
    this.seekBar.disabled = this.isLoading;
    this.seekBar.ariaDisabled = this.isLoading.toString();
    this.seekBar.addEventListener("input", (e: any) => {
      const seekTo = this.audio.duration * e.target.value;
      this.audio.currentTime = seekTo;
    });

    this.thumbnailDom = document.createElement("img");
    this.thumbnailDom.classList.add("player-thumbnail");
    this.thumbnailDom.draggable = false;
    this.thumbnailDom.alt = "Song thumbnail";
    this.thumbnailDom.ariaLabel = "Song thumbnail";
    this.thumbnailDom.src = this.queue[this.currentOrder]
      ? this.queue[this.currentOrder].thumbnail
      : "hey.jpg";

    this.nameDom = document.createElement("a");
    this.nameDom.classList.add("player-song-name");
    this.nameDom.target = "_blank";
    this.nameDom.rel = "noopener noreferrer";
    this.nameDom.title = "Open on Youtube";

    this.audio = new Audio();

    this.audio.addEventListener("loadstart", () => {
      this.thumbnailDom.src = this.queue[this.currentOrder].thumbnail;
      this.nameDom.textContent = this.queue[this.currentOrder].name;
      this.nameDom.href = `https://www.youtube.com/watch?v=${
        this.queue[this.currentOrder].videoId
      }`;
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.isLoading = false;
      const duration = this.audio.duration;
      this.durationDom.textContent = formatTime(duration);
      this.togglePlayerDomDisability();
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
      this.togglePlayerDomDisability();
    });

    const { newPlayerDom, togglePlayerDomDisability } = this.createPlayerDom();
    this.togglePlayerDomDisability = togglePlayerDomDisability;
    this.playerDom = newPlayerDom;

    const { newQueueDom, container } = this.createQueueDom();
    this.queueDom = newQueueDom;
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
    this.updateCurrentPlayingSong();
  };

  private throttledNextSong = throttle(this.nextSong, 200);

  private prevSong = () => {
    this.resetPlayerDom();
    if (this.currentOrder == 0) {
      this.currentOrder = this.queue.length - 1;
    } else {
      this.currentOrder--;
    }
    this.playSong(this.queue[this.currentOrder]);
    this.updateCurrentPlayingSong();
  };

  private throttledPrevSong = throttle(this.prevSong, 200);

  private playSong = async (song: SongObject) => {
    // to prevent error when trying to access a no longer exist song
    if (!this.queue.length) return;

    if (song.source) {
      this.audio.src = song.source;
    } else {
      try {
        const source = await getMusic(
          `https://www.youtube.com/watch?v=${song.videoId}`
        );
        if (source) {
          song.source = source;

          // to prevent from playing the recently downloaded song instead of the current one
          if (this.queue[this.currentOrder].videoId == song.videoId) {
            this.audio.src = source;
          }
        }
      } catch (error) {
        this.queue.splice(this.currentOrder, 1);
        this.updateQueueDom();
        this.currentOrder--;
        this.nextSong();
      }
    }

    // to prevent error when trying to access a no longer exist song
    if (
      this.queue.length &&
      this.queue[this.currentOrder].videoId == song.videoId
    ) {
      this.audio.play();
    }
  };

  private loopSong = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const parent = target.parentNode as HTMLElement; // Now you can safely access parentNode
    parent.classList.toggle("enable");
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
    const togglePlayerDomDisability = () => {
      prevBtn.disabled = this.queue.length ? false : this.isLoading;
      prevBtn.ariaDisabled = this.isLoading.toString();

      nextBtn.disabled = this.queue.length ? false : this.isLoading;
      nextBtn.ariaDisabled = this.isLoading.toString();

      shuffleBtn.disabled = this.queue.length ? false : this.isLoading;
      shuffleBtn.ariaDisabled = this.isLoading.toString();

      this.playBtn.disabled = this.isLoading;
      this.playBtn.ariaDisabled = this.isLoading.toString();

      this.seekBar.disabled = this.isLoading;
      this.seekBar.ariaDisabled = this.isLoading.toString();
    };

    const newPlayerDom = document.createElement("div");
    newPlayerDom.classList.add("player");

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

    const btnPanel = document.createElement("div");
    btnPanel.classList.add("player-btn-panel");

    const prevBtn = document.createElement("button");
    prevBtn.classList.add("player-common-btn");
    prevBtn.ariaLabel = "Previous";
    prevBtn.title = "Previous";
    prevBtn.disabled = this.isLoading;
    prevBtn.ariaDisabled = this.isLoading.toString();
    prevBtn.addEventListener("click", this.throttledPrevSong);
    const prevBtnIcon = document.createElement("i");
    prevBtnIcon.classList.add("ri-skip-back-fill");
    prevBtn.append(prevBtnIcon);

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("player-common-btn");
    nextBtn.ariaLabel = "Next";
    nextBtn.title = "Next";
    nextBtn.disabled = this.isLoading;
    nextBtn.ariaDisabled = this.isLoading.toString();
    nextBtn.addEventListener("click", this.throttledNextSong);
    const nextBtnIcon = document.createElement("i");
    nextBtnIcon.classList.add("ri-skip-forward-fill");
    nextBtn.append(nextBtnIcon);

    const rightBottomPanel = document.createElement("div");
    rightBottomPanel.classList.add("player-right-panel");

    const volumeBtn = document.createElement("button");
    volumeBtn.classList.add("player-common-btn");
    volumeBtn.ariaLabel = "Mute";
    volumeBtn.title = "Mute";
    const volumeBtnIcon = document.createElement("i");
    volumeBtnIcon.classList.add("ri-volume-up-fill");
    volumeBtn.append(volumeBtnIcon);
    volumeBtnIcon.addEventListener("click", () => {
      if (this.audio.volume != 0) {
        this.audio.volume = 0;
        volumeInput.value = "0";
        volumeBtnIcon.classList.remove("ri-volume-up-fill");
        volumeBtnIcon.classList.add("ri-volume-mute-fill");
      } else if (this.audio.volume == 0 && this.prevVolume == 0) {
        this.audio.volume = 0.01;
        this.prevVolume = 0.01;
        volumeBtnIcon.classList.remove("ri-volume-mute-fill");
        volumeBtnIcon.classList.add("ri-volume-up-fill");
      } else {
        this.audio.volume = this.prevVolume;
        volumeInput.value = this.prevVolume.toString();
        volumeBtnIcon.classList.remove("ri-volume-mute-fill");
        volumeBtnIcon.classList.add("ri-volume-up-fill");
      }
    });

    const volumeBar = document.createElement("div");
    volumeBar.classList.add("player-volume-bar");
    const volumeInput = document.createElement("input");
    volumeInput.ariaLabel = "Volume";
    volumeInput.title = "Volume";
    volumeInput.min = "0";
    volumeInput.max = "1";
    volumeInput.step = "0.01";
    volumeInput.value = "0.1";
    volumeInput.type = "range";
    volumeInput.addEventListener("input", (e: any) => {
      this.audio.volume = parseFloat(e.target.value);
      this.prevVolume = parseFloat(e.target.value);

      if (parseFloat(e.target.value) == 0) {
        volumeBtnIcon.classList.remove("ri-volume-up-fill");
        volumeBtnIcon.classList.add("ri-volume-mute-fill");
      } else {
        volumeBtnIcon.classList.remove("ri-volume-mute-fill");
        volumeBtnIcon.classList.add("ri-volume-up-fill");
      }
    });
    this.audio.volume = parseFloat(volumeInput.value);

    const loopBtn = document.createElement("button");
    loopBtn.classList.add("player-common-btn");
    loopBtn.ariaLabel = "Loop";
    loopBtn.title = "Loop";
    const loopBtnIcon = document.createElement("i");
    loopBtnIcon.classList.add("ri-loop-right-fill");
    loopBtn.append(loopBtnIcon);
    loopBtn.addEventListener("click", this.loopSong);

    const shuffleBtn = document.createElement("button");
    shuffleBtn.classList.add("player-common-btn");
    shuffleBtn.ariaLabel = "Shuffle";
    shuffleBtn.title = "Shuffle";
    shuffleBtn.disabled = this.isLoading;
    shuffleBtn.ariaDisabled = this.isLoading.toString();
    const shuffleBtnIcon = document.createElement("i");
    shuffleBtnIcon.classList.add("ri-shuffle-fill");
    shuffleBtn.append(shuffleBtnIcon);

    const _throttledClick = throttle(this.shuffleSong, 300);
    shuffleBtn.addEventListener("click", _throttledClick);

    newPlayerDom.append(topPanel, bottomPanel);
    topPanel.append(this.seekBar);
    timeDom.append(this.currenttimeDom, " / ", this.durationDom);
    bottomPanel.append(leftBottomPanel, middleBottomPanel, rightBottomPanel);
    leftBottomPanel.append(this.thumbnailDom, this.nameDom);
    btnPanel.append(prevBtn, this.playBtn, nextBtn);
    middleBottomPanel.append(btnPanel, timeDom);
    volumeBar.append(volumeInput);
    rightBottomPanel.append(volumeBtn, volumeBar, loopBtn, shuffleBtn);

    return { newPlayerDom, togglePlayerDomDisability };
  };

  private resetPlayerDom = () => {
    const icon = this.playBtn.children[0];
    icon.classList.add("ri-pause-fill");
    icon.classList.remove("ri-play-fill");

    this.isLoading = true;
    this.audio.src = "";
    this.durationDom.textContent = "00:00";
    this.currenttimeDom.textContent = "00:00";

    if (!this.queue.length) {
      this.audio.removeAttribute("src"); // Removes the src attribute completely
      this.audio.load(); // Reloads the element without a source
      this.thumbnailDom.src = "hey.jpg";
      this.nameDom.textContent = "";
    }

    this.togglePlayerDomDisability();
  };

  private createQueueItemDom = (song: SongObject) => {
    let isDragging = false;
    let initialY = 0;
    let offsetY = 0;
    let prevSibling: any;

    const _handleClickQueuePlaySong = () => {
      this.resetPlayerDom();
      this.currentOrder = parseInt(itemDom.id);
      this.playSong(this.queue[parseInt(itemDom.id)]);
      this.updateCurrentPlayingSong();
    };

    const _mousemoveEvent = (e: MouseEvent) => {
      if (isDragging) {
        offsetY = e.clientY - initialY;

        const draggingItemRect = itemDom.getBoundingClientRect();
        const queueDomRect = this.queueDom.getBoundingClientRect();

        const scrollTop = this.queueContainer.scrollTop;
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
    };

    const _mouseupEvent = () => {
      if (isDragging) {
        isDragging = false;
        itemDom.classList.remove("dragging");
        itemDom.style.transform = `translateY(0px)`;

        _removeEventListenerFromDocument();
      }
    };

    const _addEventListenerToDocument = () => {
      document.addEventListener("mousemove", _mousemoveEvent);
      document.addEventListener("mouseup", _mouseupEvent);
    };

    const _removeEventListenerFromDocument = () => {
      document.removeEventListener("mousemove", _mousemoveEvent);
      document.removeEventListener("mouseup", _mouseupEvent);
    };

    const itemDom = document.createElement("div");
    itemDom.classList.add("queue-item");

    itemDom.addEventListener("mousedown", (e) => {
      _addEventListenerToDocument();
      isDragging = true;
      initialY = e.clientY;
      offsetY = 0;
      itemDom.classList.add("dragging");
    });

    itemDom.addEventListener("mouseover", () => {
      removeBtn.classList.remove("hidden");
      durationDom.classList.add("hidden");
    });

    itemDom.addEventListener("mouseleave", () => {
      removeBtn.classList.add("hidden");
      durationDom.classList.remove("hidden");
    });

    const thumbnailDom = document.createElement("img");
    thumbnailDom.classList.add("queue-thumbnail");
    thumbnailDom.src = song.thumbnail;
    thumbnailDom.draggable = false;
    thumbnailDom.alt = "Song thumbnail";
    thumbnailDom.ariaLabel = "Play this song";
    thumbnailDom.title = "Play this song";

    thumbnailDom.addEventListener("click", _handleClickQueuePlaySong);

    const songInfoDom = document.createElement("div");
    songInfoDom.classList.add("queue-song-info");

    const songNameDom = document.createElement("span");
    songNameDom.classList.add("queue-song-name");
    songNameDom.textContent = song.name;
    songNameDom.title = song.name;

    const btmInfoDom = document.createElement("div");
    btmInfoDom.classList.add("queue-buttom-info");

    const artistDom = document.createElement("span");
    artistDom.classList.add("queue-artist");
    artistDom.textContent = song.artist;
    artistDom.title = song.artist;

    const durationDom = document.createElement("span");
    durationDom.classList.add("queue-duration");
    durationDom.textContent = formatTime(song.duration);

    const buttonPanel = document.createElement("div");
    buttonPanel.classList.add("queue-button-panel");

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("queue-remove-btn", "hidden");
    removeBtn.ariaLabel = "Remove from queue";
    const removeBtnIcon = document.createElement("i");
    removeBtnIcon.classList.add("ri-delete-bin-6-line");
    removeBtn.append(removeBtnIcon);
    removeBtn.addEventListener("click", () => {
      const itemId = parseInt(itemDom.id); // The ID (position) of the song to be removed
      const queueLength = this.queue.length; // The current length of the queue

      // Special case: Removing the currently playing song when it's the last one in the queue
      if (this.currentOrder === itemId && queueLength === 1) {
        // Remove the last remaining song from the queue
        this.queue.splice(itemId, 1);

        // Reset the player (since no songs are left)
        this.resetPlayerDom();
      } else {
        // Handle other cases

        // Case 1: The current song playing is later in the queue than the song being removed
        if (this.currentOrder > itemId) {
          this.currentOrder--; // Adjust the current order because the queue shifts up
        }

        // Case 2: The current song being removed is the one that's playing, but there are more songs left
        else if (this.currentOrder === itemId && queueLength > 1) {
          this.nextSong(); // Move to the next song

          // If the removed item is not the last in the queue, adjust the current order
          if (itemId !== queueLength - 1) {
            this.currentOrder--;
          }
        }

        // Remove the song from the queue regardless of the above logic
        this.queue.splice(itemId, 1);
      }

      // Update the queue DOM after all cases are handled
      this.updateQueueDom();
    });

    itemDom.append(thumbnailDom, songInfoDom, buttonPanel);
    songInfoDom.append(songNameDom, btmInfoDom);
    btmInfoDom.append(artistDom);
    buttonPanel.append(removeBtn, durationDom);

    return itemDom;
  };

  private createQueueDom = () => {
    const newQueueDom = document.createElement("div");
    newQueueDom.classList.add("queue", "hidden");
    const container = document.createElement("div");
    container.classList.add("queue-container");
    const expandBtn = document.createElement("div");
    expandBtn.classList.add("queue-expand-btn");
    expandBtn.tabIndex = 0;
    expandBtn.ariaLabel = "Expand the queue";
    expandBtn.addEventListener("click", () => {
      newQueueDom.classList.toggle("hidden");
    });
    expandBtn.addEventListener("keydown", (e) => {
      if (e.key == "Enter") {
        const clickEvent = new Event("click");
        const target = e.target as HTMLElement;
        target.dispatchEvent(clickEvent);
      }
    });
    const clearQueueBtn = document.createElement("div");
    clearQueueBtn.classList.add("queue-clear-btn");
    clearQueueBtn.tabIndex = 0;
    clearQueueBtn.textContent = "Clear";
    clearQueueBtn.ariaLabel = "Clear the queue";
    clearQueueBtn.addEventListener("click", () => {
      this.clearQueue();
      this.updateQueueDom();
    });

    clearQueueBtn.addEventListener("keydown", (e) => {
      if (e.key == "Enter") {
        const clickEvent = new Event("click");
        const target = e.target as HTMLElement;
        target.dispatchEvent(clickEvent);
      }
    });

    newQueueDom.append(container, expandBtn, clearQueueBtn);
    return { newQueueDom, container };
  };

  private updateCurrentPlayingSong = () => {
    const prevPlayingSong = document.querySelector(".playing");
    prevPlayingSong?.classList.remove("playing");
    const queueItem = document.getElementById(this.currentOrder.toString());
    queueItem?.classList.add("playing");
  };

  public updateQueueDom = () => {
    this.queueContainer.textContent = "";
    const fragment = document.createDocumentFragment();
    for (const [index, song] of this.queue.entries()) {
      const newQueueItem = this.createQueueItemDom(song);
      newQueueItem.id = index.toString();
      fragment.append(newQueueItem);
    }

    this.queueContainer.append(fragment);
    this.updateCurrentPlayingSong();
  };

  public addSong = (newSong: SongObject) => {
    this.queue.push(newSong);
    // console.log("erm hello!");

    if (this.queue.length == 1) {
      this.playSong(this.queue[this.currentOrder]);
    }
  };

  public clearQueue = () => {
    this.currentOrder = 0;
    this.queue = [];
    this.resetPlayerDom();
  };
}
