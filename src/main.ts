import "./style.css";
import "remixicon/fonts/remixicon.css";
import songCard from "./components/songCard";
import playlistCard from "./components/playlistCard";
import videoCard from "./components/videoCard";
import { AudioController } from "./class/AudioController";
import searchPlaylists from "./utils/searchPlaylists";
import searchSongs from "./utils/searchSongs";
import getPlaylist from "./utils/getPlaylist";
import getPlaylistVideos from "./utils/getPlaylistVideos";
import searchVideos from "./utils/searchVideos";
import SongResponse from "./types/SongResponse";
import SongObject from "./types/SongObject";
import PlaylistResponse from "./types/PlaylistResponse";
import VideoResponse from "./types/VideoResponse";
import MyPlaylist from "./types/MyPlaylist";
import myPlaylistCard from "./components/myPlaylistCard";
import throttle from "./utils/throttle";

/**
 * TODO:
 *  - Where did we store music after we loaded? (biggest mystery)
 *  - Adjust quality of audio according to internet speed
 *  - Add keyboard shortcut
 *  - Add loading indicator
 *  - Add clear queue button
 *  - Add style to playing song in queue
 *  - Add default fallback image
 *  - Create a better UI
 *    - New font? Helvetica font family
 *    - Using Three.js (optional)
 *  - Get search result from youtube (search by name)
 *    - Search artist (optional)
 *  - Add pagination for search (optional)
 *  - Create a local playlist (optional)
 *  - Import a playlist from spotify (optional)
 *  - Implement streaming (too difficult, still don't quite understand the concept) (optional)
 */

/**
 * BUGS:
 *  - Thumbnail doesn't always load (too many requests)
 *  - Need to do something about long video (either hide a long video or implement streaming)
 */

const state = {
  currentSearchType: "song",
  myPlaylists: [] as MyPlaylist[],
};

(() => {
  // localStorage.removeItem("myPlaylists");
  const myPlaylistsString = localStorage.getItem("myPlaylists");
  if (myPlaylistsString) {
    const myPlaylistsJSON = JSON.parse(myPlaylistsString) as MyPlaylist[];

    state.myPlaylists = myPlaylistsJSON;

    console.log(state.myPlaylists);
  }
})();

const addSong = (song: VideoResponse | SongResponse) => {
  const newSongObj: SongObject = {
    videoId: song.videoId,
    artist: song.artist.name,
    thumbnail: song.thumbnails[1]
      ? song.thumbnails[1].url
      : song.thumbnails[0].url,
    duration: song.duration || 0,
    name: song.name,
  };

  audioController.addSong(newSongObj);
};

const throttledAddSong = throttle((song: VideoResponse | SongResponse) => {
  const isDuplicated = (() => {
    for (let i = audioController.queue.length - 1; i >= 0; i--) {
      if (audioController.queue[i].videoId === song.videoId) {
        return true;
      }
    }
    return false;
  })();

  if (!isDuplicated) {
    addSong(song);
    audioController.updateQueueDom();
  }
}, 200);

const handleSearchSongs = async () => {
  try {
    const songs: SongResponse[] = await searchSongs(inputDom.value);

    renderSongs(songs);
    console.log(songs);
  } catch (error) {
    console.error(error);
  }
};

const handleSearchPlaylists = async () => {
  try {
    const playlists: PlaylistResponse[] = await searchPlaylists(inputDom.value);

    const initialPlaylists = playlists;

    renderPlaylists(initialPlaylists);
    console.log(playlists);
  } catch (error) {
    console.error(error);
  }
};

const handleClickSearchPlaylist = async (
  playlists: PlaylistResponse[],
  index: number
) => {
  listDom.textContent = "";
  tabDom.classList.add("hidden");

  const playlistSongs: VideoResponse[] = await getPlaylistVideos(
    playlists[index].playlistId
  );

  const btnPanel = createPlaylistBtnPanel(playlists, playlistSongs, index);
  columnContentDom.insertBefore(btnPanel, listDom);

  renderPlaylistSongs(playlistSongs);
};

const handleSearchVideos = async () => {
  try {
    const videos: VideoResponse[] = await searchVideos(inputDom.value);
    renderVideos(videos);
    console.log(videos);
  } catch (error) {
    console.error(error);
  }
};

const handleClickSubmitEvent = (searchType: string) => {
  if (state.currentSearchType != searchType) {
    state.currentSearchType = searchType;
    const event = new Event("submit", { cancelable: true });
    formDom.dispatchEvent(event);
  }
};

const handleToggleSelectedTabStyles = (dom: HTMLDivElement) => {
  const selectedTab = document.querySelector(".selected");
  if (selectedTab) {
    selectedTab.classList.remove("selected");
  }
  dom.classList.add("selected");
};

const handleCloseColumn = () => {
  columnDom.classList.add("hidden");
  formDom.classList.remove("hidden");
  myPlaylistBtn.classList.remove("hidden");
  inputDom.value = "";
  const event = new Event("input");
  inputDom.dispatchEvent(event);
};

const handleOpenMyPlaylistColumn = () => {
  columnDom.classList.remove("hidden");
  formDom.classList.add("hidden");
  myPlaylistBtn.classList.add("hidden");
  // listDom.textContent = "";
  columnContentDom.textContent = "";
  columnContentDom.append(myPlaylistDom);

  renderMyPlaylists();
};

const handleOpenSearchColumn = () => {
  if (columnDom.classList.contains("hidden")) {
    tabDom.classList.remove("hidden");
    listDom.textContent = "";
    columnContentDom.textContent = "";
    columnContentDom.append(tabDom, listDom);
  }
  columnDom.classList.remove("hidden");
};

const renderSongs = (songs: SongResponse[]) => {
  for (const song of songs) {
    const newCard = songCard(song);
    listDom.append(newCard);

    newCard.addEventListener("click", () => throttledAddSong(song));

    newCard.addEventListener("keydown", (event) => {
      if (event.key == "Enter") {
        throttledAddSong(song);
      }
    });
  }
};

const renderPlaylists = (playlists: PlaylistResponse[]) => {
  for (let i = 0; i < playlists.length; i++) {
    const newCard = playlistCard(playlists[i]);
    listDom.append(newCard);

    newCard.addEventListener("click", () => {
      handleClickSearchPlaylist(playlists, i);
    });

    newCard.addEventListener("keydown", (event) => {
      if (event.key == "Enter") {
        handleClickSearchPlaylist(playlists, i);
      }
    });
  }
};

const renderPlaylistSongs = (playlistSongs: VideoResponse[]) => {
  for (const video of playlistSongs) {
    const newCard = videoCard(video);
    listDom.append(newCard);

    newCard.addEventListener("click", () => {
      throttledAddSong(video);
    });

    newCard.addEventListener("keydown", (event) => {
      if (event.key == "Enter") {
        throttledAddSong(video);
      }
    });
  }
};

const createPlaylistBtnPanel = (
  playlists: PlaylistResponse[],
  playlistSongs: VideoResponse[],
  currentIndex: number
) => {
  const btnPanelWrapper = document.createElement("div");
  btnPanelWrapper.classList.add("playlist-btn-panel-wrapper");

  const btnPanel = document.createElement("div");
  btnPanel.classList.add("playlist-btn-panel");

  const backBtn = createPlaylistBackBtn(playlists);

  const rightPanel = document.createElement("div");
  rightPanel.classList.add("playlist-btn-panel-right");

  const addPlaylistBtn = createAddPlaylistBtn(
    playlists[currentIndex],
    playlistSongs
  );
  const enqueueBtn = createEnqueueBtn(playlistSongs);

  rightPanel.append(addPlaylistBtn, enqueueBtn);
  btnPanel.append(backBtn, rightPanel);
  btnPanelWrapper.append(btnPanel);

  return btnPanelWrapper;
};

const renderVideos = (videos: VideoResponse[]) => {
  for (const video of videos) {
    const newCard = videoCard(video);
    listDom.append(newCard);

    newCard.addEventListener("click", () => {
      throttledAddSong(video);
    });
    newCard.addEventListener("keydown", (event) => {
      if (event.key == "Enter") {
        throttledAddSong(video);
      }
    });
  }
};

const createMyPlaylistBtnPanel = (myPlaylist: MyPlaylist) => {
  const btnPanelWrapper = document.createElement("div");
  btnPanelWrapper.classList.add("playlist-btn-panel-wrapper");

  const btnPanel = document.createElement("div");
  btnPanel.classList.add("playlist-btn-panel");

  const backBtn = createMyPlaylistBackBtn();

  const rightPanel = document.createElement("div");
  rightPanel.classList.add("playlist-btn-panel-right");

  const removePlaylistBtn = createRemovePlaylistBtn(myPlaylist.playlistId);
  const enqueueBtn = createEnqueueBtn(myPlaylist.songs);
  const syncBtn = createSyncBtn(myPlaylist);

  rightPanel.append(removePlaylistBtn, enqueueBtn, syncBtn);
  btnPanel.append(backBtn, rightPanel);
  btnPanelWrapper.append(btnPanel);

  return btnPanelWrapper;
};

const renderMyPlaylists = () => {
  myPlaylistDom.textContent = "";
  for (const myPlaylist of state.myPlaylists) {
    const newCard = myPlaylistCard(myPlaylist);

    const _handleCardEvent = () => {
      const myPlaylistBtnPanel = createMyPlaylistBtnPanel(myPlaylist);

      columnContentDom.textContent = "";
      columnContentDom.append(myPlaylistBtnPanel, listDom);
      renderMyPlaylistSongs(myPlaylist);
    };

    myPlaylistDom.append(newCard);
    newCard.addEventListener("click", _handleCardEvent);

    newCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        _handleCardEvent();
      }
    });
  }
};

const createPlaylistBackBtn = (playlists: PlaylistResponse[]) => {
  const backBtn = document.createElement("button");
  backBtn.classList.add("column-icon-btn");
  const backBtnIcon = document.createElement("i");
  backBtnIcon.classList.add("ri-arrow-go-back-fill");
  backBtn.append(backBtnIcon);
  backBtn.addEventListener("click", () => {
    listDom.textContent = "";
    tabDom.classList.remove("hidden");

    columnContentDom.textContent = "";
    columnContentDom.append(tabDom, listDom);

    renderPlaylists(playlists);
  });

  return backBtn;
};

const createMyPlaylistBackBtn = () => {
  const backBtn = document.createElement("button");
  backBtn.classList.add("column-icon-btn");
  const backBtnIcon = document.createElement("i");
  backBtnIcon.classList.add("ri-arrow-go-back-fill");
  backBtn.append(backBtnIcon);
  backBtn.addEventListener("click", () => {
    columnContentDom.textContent = "";
    columnContentDom.append(myPlaylistDom);
    renderMyPlaylists();
  });

  return backBtn;
};

const createAddPlaylistBtn = (
  playlist: PlaylistResponse,
  playlistSongs: VideoResponse[]
) => {
  const addPlaylistBtn = document.createElement("button");
  addPlaylistBtn.classList.add("column-icon-btn");
  const addPlaylistBtnIcon = document.createElement("i");
  addPlaylistBtnIcon.classList.add("ri-play-list-add-line");
  addPlaylistBtn.append(addPlaylistBtnIcon);
  addPlaylistBtn.addEventListener("click", () => {
    const duplicatePlaylist = state.myPlaylists.find((myPlaylist) => {
      return myPlaylist.playlistId == playlist.playlistId;
    });
    if (!duplicatePlaylist) {
      const newPlaylistObject: MyPlaylist = {
        playlistId: playlist.playlistId,
        name: playlist.name,
        thumbnail: playlist.thumbnails[1]
          ? playlist.thumbnails[1].url
          : playlist.thumbnails[0].url,
        songs: playlistSongs,
      };

      state.myPlaylists.push(newPlaylistObject);
      localStorage.setItem("myPlaylists", JSON.stringify(state.myPlaylists));
    } else {
      console.log("you already added this playlist");
    }
  });

  return addPlaylistBtn;
};

const createRemovePlaylistBtn = (playlistId: string) => {
  const removePlaylistBtn = document.createElement("button");
  removePlaylistBtn.classList.add("column-icon-btn");
  const removePlaylistBtnIcon = document.createElement("i");
  removePlaylistBtnIcon.classList.add("ri-delete-bin-6-line");

  removePlaylistBtn.append(removePlaylistBtnIcon);

  removePlaylistBtn.addEventListener("click", () => {
    const index = state.myPlaylists.findIndex((myPlaylist) => {
      return myPlaylist.playlistId == playlistId;
    });

    state.myPlaylists.splice(index, 1);
    localStorage.setItem("myPlaylists", JSON.stringify(state.myPlaylists));

    columnContentDom.textContent = "";
    columnContentDom.append(myPlaylistDom);
    renderMyPlaylists();
  });

  return removePlaylistBtn;
};

const createEnqueueBtn = (songs: VideoResponse[]) => {
  const enqueueBtn = document.createElement("button");
  enqueueBtn.classList.add("column-non-icon-btn");
  enqueueBtn.textContent = "enqueue";
  enqueueBtn.addEventListener("click", () => {
    audioController.clearQueue();
    for (const song of songs) {
      addSong(song);
    }
    audioController.updateQueueDom();
  });
  return enqueueBtn;
};

const createSyncBtn = (myPlaylist: MyPlaylist) => {
  const syncBtn = document.createElement("button");
  syncBtn.classList.add("column-non-icon-btn");
  syncBtn.textContent = "sync";
  syncBtn.addEventListener("click", async () => {
    const newPlaylistInfo = await getPlaylist(myPlaylist.playlistId);
    const newPlaylistSongs = await getPlaylistVideos(myPlaylist.playlistId);
    const index = state.myPlaylists.findIndex((playlist) => {
      return playlist.playlistId == myPlaylist.playlistId;
    });

    const newPlaylistObject: MyPlaylist = {
      playlistId: myPlaylist.playlistId,
      name: newPlaylistInfo.name,
      thumbnail: newPlaylistInfo.thumbnails[1].url,
      songs: newPlaylistSongs,
    };

    state.myPlaylists.splice(index, 1, newPlaylistObject);
    localStorage.setItem("myPlaylists", JSON.stringify(state.myPlaylists));

    renderMyPlaylistSongs(newPlaylistObject);
  });

  return syncBtn;
};

const renderMyPlaylistSongs = (playlist: MyPlaylist) => {
  listDom.textContent = "";

  for (const video of playlist.songs) {
    const newCard = videoCard(video);
    listDom.append(newCard);

    newCard.addEventListener("click", () => {
      throttledAddSong(video);
    });

    newCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        throttledAddSong(video);
      }
    });
  }
};

const contentDom = document.createElement("div");
contentDom.classList.add("content");

const audioController = new AudioController();
document.body.append(
  contentDom,
  audioController.playerDom,
  audioController.queueDom
);

const formDom = document.createElement("form");
formDom.classList.add("search-form");
formDom.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (inputDom.value) {
    listDom.textContent = "";

    switch (state.currentSearchType) {
      case "song":
        await handleSearchSongs();
        break;
      case "playlist":
        await handleSearchPlaylists();
        break;
      case "video":
        await handleSearchVideos();
        break;
      default:
        break;
    }
  }
});

const inputWrapper = document.createElement("div");
inputWrapper.classList.add("input-wrapper");

const searchIcon = document.createElement("i");
searchIcon.classList.add("ri-search-line");

const clearSearchBtn = document.createElement("button");
clearSearchBtn.classList.add("clear-search-btn", "hidden");
const clearSearchBtnIcon = document.createElement("i");
clearSearchBtnIcon.classList.add("ri-close-line");
clearSearchBtn.type = "button";
clearSearchBtn.append(clearSearchBtnIcon);
clearSearchBtn.addEventListener("click", () => {
  inputDom.value = "";
  const event = new Event("input");
  inputDom.dispatchEvent(event);
});

const inputDom = document.createElement("input");
inputDom.id = "search-field";
inputDom.placeholder = "search";
inputDom.autocomplete = "off";
inputDom.addEventListener("focus", handleOpenSearchColumn);
inputDom.addEventListener("input", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.value) {
    clearSearchBtn.classList.remove("hidden");
  } else {
    clearSearchBtn.classList.add("hidden");
  }
});

const columnDom = document.createElement("div");
columnDom.classList.add("column", "hidden");

const columnCloseBtn = document.createElement("button");
columnCloseBtn.classList.add("column-close-btn", "column-icon-btn");
const columnCloseBtnIcon = document.createElement("i");
columnCloseBtnIcon.classList.add("ri-close-line");
columnCloseBtn.append(columnCloseBtnIcon);
columnCloseBtn.addEventListener("click", handleCloseColumn);

const tabDom = document.createElement("div");
tabDom.classList.add("tab");

const songTabDom = document.createElement("div");
songTabDom.textContent = "Songs";
songTabDom.tabIndex = 0;
songTabDom.classList.add("selected");
songTabDom.addEventListener("click", () => {
  handleClickSubmitEvent("song");
  handleToggleSelectedTabStyles(songTabDom);
});
songTabDom.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    handleClickSubmitEvent("song");
    handleToggleSelectedTabStyles(songTabDom);
  }
});

const playlistTabDom = document.createElement("div");
playlistTabDom.textContent = "Playlists";
playlistTabDom.tabIndex = 0;
playlistTabDom.addEventListener("click", () => {
  handleClickSubmitEvent("playlist");
  handleToggleSelectedTabStyles(playlistTabDom);
});
playlistTabDom.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    handleClickSubmitEvent("playlist");
    handleToggleSelectedTabStyles(playlistTabDom);
  }
});

const videoTabDom = document.createElement("div");
videoTabDom.textContent = "Videos";
videoTabDom.tabIndex = 0;
videoTabDom.addEventListener("click", () => {
  handleClickSubmitEvent("video");
  handleToggleSelectedTabStyles(videoTabDom);
});
videoTabDom.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    handleClickSubmitEvent("video");
    handleToggleSelectedTabStyles(videoTabDom);
  }
});

const listDom = document.createElement("div");
listDom.classList.add("list");

const myPlaylistBtn = document.createElement("button");
myPlaylistBtn.classList.add("my-playlist-btn");
const myPlaylistBtnIcon = document.createElement("i");
myPlaylistBtnIcon.classList.add("ri-play-list-fill");
myPlaylistBtn.append(myPlaylistBtnIcon);
myPlaylistBtn.addEventListener("click", handleOpenMyPlaylistColumn);

const myPlaylistDom = document.createElement("div");
myPlaylistDom.classList.add("my-playlist");

const columnContentDom = document.createElement("div");
columnContentDom.classList.add("column-content");

contentDom.append(formDom, columnDom, myPlaylistBtn);
inputWrapper.append(inputDom, searchIcon, clearSearchBtn);
formDom.append(inputWrapper);
tabDom.append(songTabDom, playlistTabDom, videoTabDom);
columnContentDom.append(tabDom, listDom);
columnDom.append(columnCloseBtn, columnContentDom);
