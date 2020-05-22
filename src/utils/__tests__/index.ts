import {
    NOOP,
    cutString
} from '../index';

test('NOOP do no operation', () => {
    expect(NOOP()).toBe(undefined);
});

test('cutString', () => {
    expect(cutString('hiiiiiiiperlarrrrgetextwithoooooooutanyelementwheretobreak', 10)).toBe('hiiiiiiipe...');
    expect(cutString('12345', 10)).toBe('12345');
    expect(cutString(undefined as unknown as string, 10)).toBe('');
});