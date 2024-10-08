import PlaylistResponse from "../types/PlaylistResponse";

const playlistCard = (playlist: PlaylistResponse) => {
  const cardDom = document.createElement("div");
  cardDom.classList.add("card");
  cardDom.ariaLabel = `View songs from "${playlist.name}" playlist`;
  cardDom.tabIndex = 0;

  const thumbnailDom = document.createElement("img");
  thumbnailDom.draggable = false;
  thumbnailDom.classList.add("card-thumbnail");
  thumbnailDom.alt = "Thumbnail";
  thumbnailDom.src = playlist.thumbnails[1]
    ? playlist.thumbnails[1].url
    : playlist.thumbnails[0].url;

  const infoDom = document.createElement("div");
  infoDom.classList.add("card-info");

  const playlistNameDom = document.createElement("div");
  playlistNameDom.classList.add("card-playlistName");
  playlistNameDom.textContent = playlist.name;
  playlistNameDom.title = playlist.name;

  const artistDom = document.createElement("div");
  artistDom.classList.add("card-artist");
  artistDom.textContent = playlist.artist.name;
  artistDom.title = playlist.artist.name;

  cardDom.append(thumbnailDom, infoDom);
  infoDom.append(playlistNameDom, artistDom);

  return cardDom;
};

export default playlistCard;
