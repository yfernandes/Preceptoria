import sharp from "sharp";
import type { IDocument } from "entities";

export async function compressImage(file: IDocument) {
	const fileName = file.destPath + "/" + file.fileName;
	await sharp(fileName + file.extension)
		.jpeg({
			quality: 80,
			progressive: true, // Create a progressive JPEG
			chromaSubsampling: "4:2:0", // Use chroma subsampling
		})
		.toFile(fileName + ".compressed.jpg")
		.then((info) => {
			console.log("Image compression successful:", info);
		})
		.catch((err) => {
			console.error("Error compressing image:", err);
		});
}
