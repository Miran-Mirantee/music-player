import SongResponse from "../types/SongResponse";
import formatTime from "../utils/formalTime";

const songCard = (song: SongResponse) => {
  const cardDom = document.createElement("div");
  cardDom.classList.add("card");
  cardDom.ariaLabel = `Add ${song.name} to the queue`;
  cardDom.tabIndex = 0;

  const thumbnailDom = document.createElement("img");
  thumbnailDom.draggable = false;
  thumbnailDom.classList.add("card-thumbnail");
  thumbnailDom.alt = "Thumbnail";
  thumbnailDom.src = song.thumbnails[1].url;

  const infoDom = document.createElement("div");
  infoDom.classList.add("card-info");

  const subInfoDom1 = document.createElement("div");
  subInfoDom1.classList.add("card-subInfo1");

  const songNameDom = document.createElement("div");
  songNameDom.classList.add("card-songName");
  songNameDom.textContent = song.name;
  songNameDom.title = song.name;

  const albumDom = document.createElement("div");
  albumDom.classList.add("card-album");
  albumDom.textContent = song.album.name;
  albumDom.title = song.album.name;

  const subInfoDom2 = document.createElement("div");
  subInfoDom2.classList.add("card-subInfo2");

  const artistDom = document.createElement("div");
  artistDom.classList.add("card-artist");
  artistDom.textContent = song.artist.name;
  artistDom.title = song.artist.name;

  const durationDom = document.createElement("div");
  durationDom.classList.add("card-duration");
  durationDom.textContent = formatTime(song.duration);

  cardDom.append(thumbnailDom, infoDom);
  infoDom.append(subInfoDom1, subInfoDom2);
  subInfoDom1.append(songNameDom, albumDom);
  subInfoDom2.append(artistDom, durationDom);

  return cardDom;
};

export default songCard;
