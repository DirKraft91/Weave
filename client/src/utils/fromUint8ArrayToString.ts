export const fromUint8ArrayToString = (data: number[] | Uint8Array<ArrayBufferLike>): string => {
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};
