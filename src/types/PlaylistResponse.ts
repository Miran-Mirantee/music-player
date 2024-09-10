type PlaylistResponse = {
  artist: { name: string; artistId: string };
  name: string;
  playlistId: string;
  thumbnails: { height: number; url: string; width: number }[];
  type: string;
};

export default PlaylistResponse;
