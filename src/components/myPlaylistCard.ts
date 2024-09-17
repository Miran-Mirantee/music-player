import MyPlaylist from "../types/MyPlaylist";

const myPlaylistCard = (playlist: MyPlaylist) => {
  const dom = document.createElement("div");
  dom.classList.add("my-playlist-card");

  const thumbnailDom = document.createElement("img");
  thumbnailDom.classList.add("my-playlist-thumbnail");
  thumbnailDom.src = playlist.thumbnail;

  const nameDom = document.createElement("div");
  nameDom.classList.add("my-playlist-name");
  nameDom.textContent = playlist.name;

  dom.append(thumbnailDom, nameDom);

  return dom;
};
export default myPlaylistCard;
