"use client";
export async function preparePhoto(file: File): Promise<File> {
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose a photo under 10 MB.");
  if (
    !/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) &&
    !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)
  )
    throw new Error("Choose a JPEG, PNG, WebP, or HEIC photo.");
  let blob: Blob = file;
  let url = URL.createObjectURL(blob);
  const image = new Image();
  try {
    image.src = url;
    try {
      await image.decode();
    } catch {
      if (!/heic|heif/i.test(file.type + " " + file.name))
        throw new Error(
          "This photo could not be opened. Try a different file.",
        );
      const { default: convert } = await import("heic2any");
      const result = await convert({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });
      if (Array.isArray(result) && result.length !== 1)
        throw new Error(
          "Choose one still photo, rather than a multi-image HEIC file.",
        );
      blob = Array.isArray(result) ? result[0] : result;
      URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob);
      image.src = url;
      await image.decode();
    }
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 60000000
    )
      throw new Error(
        "This image is too large to prepare. Export a smaller copy.",
      );
    const scale = Math.min(
      1,
      1600 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "Your browser could not prepare the photo. Please try again.",
      );
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let jpeg = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value
            ? resolve(value)
            : reject(new Error("Could not prepare this photo.")),
        "image/jpeg",
        0.9,
      ),
    );
    if (jpeg.size > 2 * 1024 * 1024)
      jpeg = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error("Could not prepare this photo.")),
          "image/jpeg",
          0.78,
        ),
      );
    if (jpeg.size > 2 * 1024 * 1024)
      throw new Error(
        "This photo is too large after preparation. Try a smaller copy.",
      );
    return new File([jpeg], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
