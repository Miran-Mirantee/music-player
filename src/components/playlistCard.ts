import PlaylistResponse from "../types/PlaylistResponse";

const playlistCard = (playlist: PlaylistResponse) => {
  const cardDom = document.createElement("div");
  cardDom.classList.add("card");

  const thumbnailDom = document.createElement("img");
  thumbnailDom.classList.add("card-thumbnail");
  thumbnailDom.src = playlist.thumbnails[1].url;

  const infoDom = document.createElement("div");
  infoDom.classList.add("card-info");

  const playlistNameDom = document.createElement("div");
  playlistNameDom.classList.add("card-playlistName");
  playlistNameDom.textContent = playlist.name;

  const artistDom = document.createElement("div");
  artistDom.classList.add("card-artist");
  artistDom.textContent = playlist.artist.name;

  cardDom.append(thumbnailDom, infoDom);
  infoDom.append(playlistNameDom, artistDom);

  return cardDom;
};

export default playlistCard;
