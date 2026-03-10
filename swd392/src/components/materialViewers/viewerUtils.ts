export const isImageExtension = (path: string) =>
    /\.(gif|png|jpg|jpeg|webp|svg)$/i.test(path);

export const isPdfExtension = (path: string) => /\.pdf$/i.test(path);

export const isPptxExtension = (path: string) => /\.(ppt|pptx)$/i.test(path);
