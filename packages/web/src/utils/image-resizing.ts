export const ImageResizing = {
  compressImage: async (
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
  ): Promise<string | null> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    const img = new Image();

    img.src = URL.createObjectURL(file);

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    const aspectRatio = img.width / img.height;

    let width = img.width;

    let height = img.height;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.8);
  },
};
