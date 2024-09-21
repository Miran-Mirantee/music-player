import "./style.css";
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

/**
 * TODO:
 *  - Where did we store music after we loaded? (biggest mystery)
 *  - Get search result from youtube (search by name)
 *    - Search artist??
 *  - Add cookie to prevent youtube block
 *  - Create a better UI
 *    - Using Three.js (optional)
 *  - Add pagination for search (optional)
 *  - Create a local playlist (optional)
 *  - Import a playlist from spotify (optional)
 *  - Implement streaming (too difficult, still don't quite understand the concept) (optional)
 */

/**
 * BUGS:
 *  - Looping not working as intended
 *  - Song didn't stop when removing from queue (when the queue is more than one song and trying to remove all from the queue)
 *  - If the user download the song then change to other song, the player will play the skipped song once it's fully loaded
 *  - Unable to load a playlist that has a hidden video, might need to consider (fixing it myself)
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

const handleSearchSongs = async () => {
  try {
    const songs: SongResponse[] = await searchSongs(inputDom.value);

    for (const song of songs) {
      const newCard = songCard(song);
      resultDom.append(newCard);

      newCard.addEventListener("click", async () => {
        addSong(song);
      });
    }
    console.log(songs);
  } catch (error) {
    console.error(error);
  }
};

const handleSearchPlaylists = async () => {
  try {
    const playlists: PlaylistResponse[] = await searchPlaylists(inputDom.value);

    const initialPlaylists = playlists;

    const renderPlaylists = (playlists: PlaylistResponse[]) => {
      for (const playlist of playlists) {
        const newCard = playlistCard(playlist);
        resultDom.append(newCard);

        newCard.addEventListener("click", async () => {
          const playlistSongs: VideoResponse[] = await getPlaylistVideos(
            playlist.playlistId
          );

          resultDom.textContent = "";
          const btnPanel = document.createElement("div");
          btnPanel.classList.add("results-btn-panel");

          const backBtn = document.createElement("button");
          backBtn.textContent = "back";
          backBtn.addEventListener("click", () => {
            resultDom.textContent = "";
            renderPlaylists(initialPlaylists);
          });

          const addPlaylistBtn = document.createElement("button");
          addPlaylistBtn.textContent = "add playlist";
          addPlaylistBtn.addEventListener("click", () => {
            const duplicatePlaylist = state.myPlaylists.find((myPlaylist) => {
              return myPlaylist.playlistId == playlist.playlistId;
            });
            if (!duplicatePlaylist) {
              const newPlaylistObject: MyPlaylist = {
                playlistId: playlist.playlistId,
                name: playlist.name,
                thumbnail: playlist.thumbnails[1].url,
                songs: playlistSongs,
              };

              state.myPlaylists.push(newPlaylistObject);
              localStorage.setItem(
                "myPlaylists",
                JSON.stringify(state.myPlaylists)
              );

              renderMyPlaylist();
            } else {
              console.log("you already added this playlist");
            }
          });

          const enqueueBtn = document.createElement("button");
          enqueueBtn.textContent = "enqueue";
          enqueueBtn.addEventListener("click", () => {
            audioController.clearQueue();
            for (const video of playlistSongs) {
              addSong(video);
            }
          });

          btnPanel.append(backBtn, addPlaylistBtn, enqueueBtn);
          resultDom.append(btnPanel);

          for (const video of playlistSongs) {
            const newCard = videoCard(video);
            resultDom.append(newCard);

            newCard.addEventListener("click", async () => {
              addSong(video);
            });
          }
        });
      }
    };

    renderPlaylists(initialPlaylists);
    console.log(playlists);
  } catch (error) {
    console.error(error);
  }
};

const handleSearchVideos = async () => {
  try {
    const videos: VideoResponse[] = await searchVideos(inputDom.value);

    for (const video of videos) {
      const newCard = videoCard(video);
      resultDom.append(newCard);

      newCard.addEventListener("click", () => {
        addSong(video);
      });
    }
    console.log(videos);
  } catch (error) {
    console.error(error);
  }
};

const renderMyPlaylist = () => {
  myPlaylistDom.textContent = "";
  for (const myPlaylist of state.myPlaylists) {
    const newCard = myPlaylistCard(myPlaylist);

    newCard.addEventListener("click", () => {
      const btnPanel = document.createElement("div");

      const enqueueBtn = document.createElement("button");
      enqueueBtn.textContent = "enqueue";
      enqueueBtn.addEventListener("click", () => {
        audioController.clearQueue();
        for (const video of myPlaylist.songs) {
          addSong(video);
        }
      });

      const syncBtn = document.createElement("button");
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

        renderMyPlaylist();
        renderMyPlaylistSong(newPlaylistObject);
      });

      const renderMyPlaylistSong = (playlist: MyPlaylist) => {
        resultDom.textContent = "";
        btnPanel.append(enqueueBtn, syncBtn);
        resultDom.append(btnPanel);

        for (const video of playlist.songs) {
          const newCard = videoCard(video);
          resultDom.append(newCard);

          newCard.addEventListener("click", async () => {
            addSong(video);
          });
        }
      };
      renderMyPlaylistSong(myPlaylist);
    });

    myPlaylistDom.append(newCard);
  }
};

const contentDom = document.createElement("div");
contentDom.classList.add("content");
document.body.append(contentDom);

const audioController = new AudioController();
document.body.append(audioController.playerDom);
document.body.append(audioController.queueDom);

const formDom = document.createElement("form");
formDom.classList.add("search-form");
formDom.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultDom.textContent = "";

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
  columnDom.classList.remove("hidden");
});

const inputDom = document.createElement("input");
inputDom.id = "search-field";
inputDom.placeholder = "search";

const columnDom = document.createElement("div");
columnDom.classList.add("column", "hidden");

const columnCloseBtn = document.createElement("button");
columnCloseBtn.classList.add("column-close-btn");
columnCloseBtn.textContent = "X";
columnCloseBtn.addEventListener("click", () => {
  columnDom.classList.add("hidden");
});

const tabDom = document.createElement("div");
tabDom.classList.add("tab");

const triggerSubmitEvent = (searchType: string) => {
  if (state.currentSearchType != searchType) {
    state.currentSearchType = searchType;
    const event = new Event("submit", { cancelable: true });
    formDom.dispatchEvent(event);
  }
};

const toggleSelectedTabStyles = (dom: HTMLDivElement) => {
  const selectedTab = document.querySelector(".selected");
  if (selectedTab) {
    selectedTab.classList.remove("selected");
  }
  dom.classList.add("selected");
};

const songTabDom = document.createElement("div");
songTabDom.textContent = "Songs";
songTabDom.classList.add("selected");
songTabDom.addEventListener("click", () => {
  triggerSubmitEvent("song");
  toggleSelectedTabStyles(songTabDom);
});

const playlistTabDom = document.createElement("div");
playlistTabDom.textContent = "Playlists";
playlistTabDom.addEventListener("click", () => {
  triggerSubmitEvent("playlist");
  toggleSelectedTabStyles(playlistTabDom);
});

const videoTabDom = document.createElement("div");
videoTabDom.textContent = "Videos";
videoTabDom.addEventListener("click", () => {
  triggerSubmitEvent("video");
  toggleSelectedTabStyles(videoTabDom);
});

const myPlaylistDom = document.createElement("div");
myPlaylistDom.classList.add("my-playlist");

renderMyPlaylist();

const resultDom = document.createElement("div");
resultDom.classList.add("results-list");

contentDom.append(formDom, columnDom);
formDom.append(inputDom);
tabDom.append(songTabDom, playlistTabDom, videoTabDom);
columnDom.append(columnCloseBtn, tabDom, myPlaylistDom, resultDom);
