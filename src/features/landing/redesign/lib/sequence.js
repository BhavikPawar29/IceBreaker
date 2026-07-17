export const FRAME_COUNT = 50;
export const LAST_FRAME = FRAME_COUNT - 1;

export const FRAME_FILES = [
  "mrofg7as-frame001.png",
  "mrofg7b1-frame002.png",
  "mrofg7be-frame003.png",
  "mrofg7br-frame004.png",
  "mrofg7cf-frame005.png",
  "mrofg7d2-frame006.png",
  "mrofg7dv-frame007.png",
  "mrofg7e7-frame008.png",
  "mrofg7ej-frame009.png",
  "mrofg7f4-frame010.png",
  "mrofg7fc-frame011.png",
  "mrofg7fm-frame012.png",
  "mrofg7g1-frame013.png",
  "mrofg7gb-frame014.png",
  "mrofg7gn-frame015.png",
  "mrofg7gw-frame016.png",
  "mrofg7h5-frame017.png",
  "mrofg7hj-frame018.png",
  "mrofg7i7-frame019.png",
  "mrofg7if-frame020.png",
  "mrofg7io-frame021.png",
  "mrofg7iy-frame022.png",
  "mrofg7jb-frame023.png",
  "mrofg7jq-frame024.png",
  "mrofg7k1-frame025.png",
  "mrofg7kb-frame026.png",
  "mrofg7km-frame027.png",
  "mrofg7l0-frame028.png",
  "mrofg7lk-frame029.png",
  "mrofg7m0-frame030.png",
  "mrofg7n5-frame031.png",
  "mrofg7nu-frame032.png",
  "mrofg7ob-frame033.png",
  "mrofg7ol-frame034.png",
  "mrofg7p5-frame035.png",
  "mrofg7pf-frame036.png",
  "mrofg7qe-frame037.png",
  "mrofg7s0-frame038.png",
  "mrofg7sd-frame039.png",
  "mrofg7so-frame040.png",
  "mrofg7t2-frame041.png",
  "mrofg7tf-frame042.png",
  "mrofg7ty-frame043.png",
  "mrofg7ug-frame044.png",
  "mrofg77y-frame045.png",
  "mrofg78d-frame046.png",
  "mrofg78r-frame047.png",
  "mrofg795-frame048.png",
  "mrofg79j-frame049.png",
  "mrofg79x-frame050.png",
];

export const STORY_FRAMES = {
  opening: 0,
  decision: 6,
  cardMoves: 14,
  cardArrives: 22,
  curiosity: 29,
  response: 36,
  connection: 44,
  final: 49,
};

export const PRELOAD_BATCHES = [
  [0, 9],
  [10, 24],
  [25, 39],
  [40, 49],
];

export const FOCAL_POINTS = {
  desktop: { x: 0.52, y: 0.48 },
  mobile: { x: 0.58, y: 0.5 },
};

export function getFramePath(index) {
  return `/frames/${FRAME_FILES[index]}`;
}
