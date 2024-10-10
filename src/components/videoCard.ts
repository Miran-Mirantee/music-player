import VideoResponse from "../types/VideoResponse";
import formatTime from "../utils/formalTime";

const videoCard = (video: VideoResponse) => {
  const cardDom = document.createElement("div");
  cardDom.classList.add("card");
  cardDom.ariaLabel = `Add ${video.name} to the queue`;
  cardDom.tabIndex = 0;

  const thumbnailDom = document.createElement("img");
  thumbnailDom.draggable = false;
  thumbnailDom.classList.add("card-thumbnail");
  thumbnailDom.alt = "Thumbnail";
  thumbnailDom.src =
    (video.thumbnails[1] ? video.thumbnails[1].url : video.thumbnails[0].url) ||
    "fallback.jpg";

  const infoDom = document.createElement("div");
  infoDom.classList.add("card-info");

  const songNameDom = document.createElement("div");
  songNameDom.classList.add("card-songName");
  songNameDom.textContent = video.name;
  songNameDom.title = video.name;

  const subInfoDom2 = document.createElement("div");
  subInfoDom2.classList.add("card-subInfo2");

  const artistDom = document.createElement("div");
  artistDom.classList.add("card-artist");
  artistDom.textContent = video.artist.name;
  artistDom.title = video.artist.name;

  const durationDom = document.createElement("div");
  durationDom.classList.add("card-duration");
  durationDom.textContent = video.duration ? formatTime(video.duration) : "0";

  cardDom.append(thumbnailDom, infoDom);
  infoDom.append(songNameDom, subInfoDom2);
  subInfoDom2.append(artistDom, durationDom);

  return cardDom;
};

export default videoCard;
