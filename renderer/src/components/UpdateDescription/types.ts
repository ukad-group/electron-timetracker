type File = {
  url: string;
  sha512: string;
  size: number;
};

export type Release = {
  files: File[];
  path: string;
  releaseDate: string;
  releaseName: string;
  releaseNotes: string;
  sha512: string;
  tag: string;
  version: string;
};
