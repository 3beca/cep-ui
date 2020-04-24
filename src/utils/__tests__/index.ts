import {NOOP} from '../index';

test('NOOP do no operation', () => {
    expect(NOOP()).toBe(undefined);
});