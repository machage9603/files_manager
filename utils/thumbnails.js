import fs from 'fs';
import imageThumbnail from 'image-thumbnail';

async function generateThumbnail(localPath, sizes = [100, 250, 500]) {
  if (!fs.existsSync(localPath)) throw (new Error('File not found'));

  const thumbnails = sizes
    .map((thumbnailSize) => imageThumbnail(localPath, { width: thumbnailSize }));
  await Promise.all(thumbnails);

  thumbnails.forEach((thumbnail, index) => {
    fs.writeFileSync(`${localPath}_${sizes[index]}`, thumbnail);
  });
}

export default generateThumbnail;
