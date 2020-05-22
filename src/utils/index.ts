export const NOOP = () => {};
export const cutString = (text: string = '', size: number) => text.slice(0, size) + ((text.length > 40) ? '...' : '');