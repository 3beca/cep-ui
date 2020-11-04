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

export const isValidURL = (url: string) => {
    if (url === '') return true;
    if (!url) return false;
    const reUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    return !!url.match(reUrl);
};
