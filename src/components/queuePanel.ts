import formatTime from "../utils/formalTime";
import SongObject from "../types/SongObject";

const queuePanel = () => {
  const _queue: SongObject[] = [];

  const _updateDom = () => {
    queueDom.textContent = "";
    for (const song of _queue) {
      const newQueueitem = _queueItem(song);
      queueDom.append(newQueueitem);
    }
  };

  const _queueItem = (song: SongObject) => {
    const itemDom = document.createElement("div");
    itemDom.classList.add("queue-item");

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

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("queue-remove-btn");
    removeBtn.textContent = "X";

    itemDom.append(thumbnailDom, songInfoDom, buttonPanel);
    songInfoDom.append(songNameDom, btmInfoDom);
    btmInfoDom.append(artistDom, durationDom);
    buttonPanel.append(moveBtn, removeBtn);

    return itemDom;
  };

  const updateQueue = (queue: SongObject[]) => {
    _queue.splice(0, _queue.length, ...queue);
    _updateDom();
  };

  const queueDom = document.createElement("div");
  queueDom.classList.add("queue");

  return { queueDom, updateQueue };
};

export default queuePanel;
