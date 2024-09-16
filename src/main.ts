import "./style.css";
import songCard from "./components/songCard";
import playlistCard from "./components/playlistCard";
import videoCard from "./components/videoCard";
import { AudioController } from "./class/AudioController";
import searchPlaylists from "./utils/searchPlaylists";
import searchSongs from "./utils/searchSongs";
import getPlaylist from "./utils/getPlaylist";
import searchVideos from "./utils/searchVideos";
import SongResponse from "./types/SongResponse";
import SongObject from "./types/SongObject";
import PlaylistResponse from "./types/PlaylistResponse";
import VideoResponse from "./types/VideoResponse";

/**
 * TODO:
 *  - Implement streaming (too difficult, still don't quite understand the concept)
 *  - Get search result from youtube (search by name)
 *    - Search artist
 *    - Search videos
 *  - Create a local playlist
 *  - Import a playlist from spotify
 *  - Create a better UI
 *    - Using Three.js (optional)
 *  - Add pagination for search
 *  - Add cookie to prevent youtube block
 *  - Where did we store music after we loaded? (biggest mystery)
 */

/**
 * BUGS:
 *  - Looping not working as intended
 *  - Song didn't stop when removing from queue (when the queue is more than one song and trying to remove all from the queue)
 *  - If the user download the song then change to other song, the player will play the skipped song once it's fully loaded
 */

const state = {
  currentSearchType: "song",
};

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

const handleSerachSongs = async () => {
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
          const playlistSongs: VideoResponse[] = await getPlaylist(
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

          const enqueueBtn = document.createElement("button");
          enqueueBtn.textContent = "enqueue";
          enqueueBtn.addEventListener("click", () => {
            audioController.clearQueue();
            for (const video of playlistSongs) {
              addSong(video);
            }
          });

          btnPanel.append(backBtn, enqueueBtn);
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
    }

    console.log(videos);
  } catch (error) {
    console.error(error);
  }
};

const columnDom = document.querySelector(".column");

const audioController = new AudioController();
columnDom?.append(audioController.playerDom);
document.body.append(audioController.queueDom);

const formDom = document.createElement("form");
formDom.classList.add("search-form");
formDom.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultDom.textContent = "";

  switch (state.currentSearchType) {
    case "song":
      await handleSerachSongs();
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
});

const inputDom = document.createElement("input");
inputDom.id = "search-field";
inputDom.placeholder = "search";

const tabDom = document.createElement("div");
tabDom.classList.add("tab");

const songTabDom = document.createElement("div");
songTabDom.classList.add("tab-song");
songTabDom.textContent = "Songs";
songTabDom.addEventListener("click", () => {
  state.currentSearchType = "song";
});

const playlistTabDom = document.createElement("div");
playlistTabDom.classList.add("tab-playlist");
playlistTabDom.textContent = "Playlists";
playlistTabDom.addEventListener("click", () => {
  state.currentSearchType = "playlist";
});

const videoTabDom = document.createElement("div");
videoTabDom.classList.add("tab-video");
videoTabDom.textContent = "Videos";
videoTabDom.addEventListener("click", () => {
  state.currentSearchType = "video";
});

const resultDom = document.createElement("div");
resultDom.classList.add("results-list");

tabDom.append(songTabDom, playlistTabDom, videoTabDom);
formDom.append(inputDom);
columnDom?.append(formDom, tabDom, resultDom);
