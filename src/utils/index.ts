export const NOOP = () => {};
export const cutString = (text: string = '', size: number) => text.slice(0, size) + (text.length > 40 ? '...' : '');

export const loadApikey = () => {
    return localStorage.getItem('APIKEY');
};
export const clearApikey = () => {
    localStorage.removeItem('APIKEY');
};
export const saveApikey = (apikey: string) => {
    localStorage.setItem('APIKEY', apikey);
};
