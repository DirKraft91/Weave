export const fromUint8ArrayToString = (data: number[] | Uint8Array): string => {
  return btoa(String.fromCharCode(...new Uint8Array(data)));
};
