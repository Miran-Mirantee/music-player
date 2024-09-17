import VideoResponse from "./VideoResponse";

type MyPlaylist = {
  playlistId: string;
  name: string;
  thumbnail: string;
  songs: VideoResponse[];
};

export default MyPlaylist;
