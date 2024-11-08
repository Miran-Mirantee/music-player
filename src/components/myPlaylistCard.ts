import MyPlaylist from "../types/MyPlaylist";

const myPlaylistCard = (playlist: MyPlaylist) => {
  const dom = document.createElement("div");
  dom.classList.add("my-playlist-card");
  dom.ariaLabel = `View songs from "${playlist.name}" playlist`;
  dom.tabIndex = 0;

  const thumbnailDom = document.createElement("img");
  thumbnailDom.classList.add("my-playlist-thumbnail");
  thumbnailDom.draggable = false;
  thumbnailDom.alt = "Playlist thumbnail";
  thumbnailDom.src = playlist.thumbnail || "fallback.jpg";
  thumbnailDom.onerror = () => {
    thumbnailDom.src = "fallback.jpg";
  };

  const nameDom = document.createElement("div");
  nameDom.classList.add("my-playlist-name");
  nameDom.textContent = playlist.name;
  nameDom.title = playlist.name;

  dom.append(thumbnailDom, nameDom);

  return dom;
};
export default myPlaylistCard;
