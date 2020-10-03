import { NOOP, cutString, loadApikey, clearApikey, saveApikey } from '../index';

test('NOOP do no operation', () => {
    expect(NOOP()).toBe(undefined);
});

test('cutString', () => {
    expect(
        cutString(
            'hiiiiiiiperlarrrrgetextwithoooooooutanyelementwheretobreak',
            10
        )
    ).toBe('hiiiiiiipe...');
    expect(cutString('12345', 10)).toBe('12345');
    expect(cutString((undefined as unknown) as string, 10)).toBe('');
});

test('load apikey from storage to be null when no apikey stored', () => {
    expect(loadApikey()).toBe(null);
});

test('load apikey from storage', () => {
    localStorage.setItem('APIKEY', '123456789');
    expect(loadApikey()).toEqual('123456789');
});

test('cleaer apikey from storage', () => {
    localStorage.setItem('APIKEY', '123456788');
    expect(loadApikey()).toBe('123456788');
    clearApikey();
    expect(loadApikey()).toBe(null);
});

test('save apikey to storage', () => {
    localStorage.setItem('APIKEY', '999999999');
    saveApikey('123456789');
    expect(loadApikey()).toBe('123456789');
});
