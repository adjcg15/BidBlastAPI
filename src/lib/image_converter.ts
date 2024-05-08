class ImageConverter {
    public static bufferToBase64(buffer: Buffer | null): string {
        let base64Image = "";

        if(buffer !== null) {
            base64Image = buffer.toString("base64");
        }

        return base64Image;
    }
}

export default ImageConverter;