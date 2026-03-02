const assetImages = [
  "/assets/IMG_0185.jpg",
  "/assets/IMG_1744.jpg",
  "/assets/IMG_1778.jpg",
  "/assets/IMG_20200716_101417_751~2.jpg",
  "/assets/IMG_20201213_113737_777~2.jpg",
  "/assets/IMG_20210322_152147_311.jpg",
  "/assets/IMG_20210804_143828_719.jpg",
  "/assets/IMG_20220306_141006_017.jpg",
  "/assets/IMG_20220319_123348_274.jpg",
  "/assets/26efbc9a-e8da-4e84-b753-2d64c7c8a03f.jpg",
  "/assets/2ad4a559-afa1-47f1-8400-37b28fab01eb.jpg",
  "/assets/838ed924-53bb-4a32-a868-57dbaf99edc8.jpg",
  "/assets/cctv surveillance.jpg",
  "/assets/consultacy.jpg",
  "/assets/networking implem.jpg",
  "/assets/ict maintainace.jpg",
  "/assets/smart intruder.jpg",
  "/assets/lan.jpg",
  "/assets/pbx.jpg",
];

export const getRandomAssetImages = (count: number) => {
  const shuffled = [...assetImages].sort(() => 0.5 - Math.random());
  const size = Math.max(1, Math.min(count, shuffled.length));
  return shuffled.slice(0, size);
};

export default assetImages;
