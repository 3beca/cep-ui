import { buildPayloadFromEventLogPayload, EventPayload } from './models';

test('buildPayloadFromEventLogPayload should return null when payload is undefined', () => {
    expect(buildPayloadFromEventLogPayload(undefined)).toEqual(null);
});

test('buildPayloadFromEventLogPayload should return null when payload is null', () => {
    expect(buildPayloadFromEventLogPayload(null)).toEqual(null);
});

test('buildPayloadFromEventLogPayload should return null when payload is a number', () => {
    expect(buildPayloadFromEventLogPayload(10)).toEqual(null);
});

test('buildPayloadFromEventLogPayload should return null when payload is a string', () => {
    expect(buildPayloadFromEventLogPayload('10')).toEqual(null);
});

test('buildPayloadFromEventLogPayload should return null when payload is an empty object', () => {
    const payloadDownloaded = {};
    expect(buildPayloadFromEventLogPayload(payloadDownloaded)).toEqual(null);
});

test('buildPayloadFromEventLogPayload should return null when payload is an complex object', () => {
    const payloadDownloaded = {
        invalidKey: { subkey: 'hi' },
        anotherInvalidKey: [],
        functionAsChild: () => {}
    };
    expect(buildPayloadFromEventLogPayload(payloadDownloaded)).toEqual(null);
});

test('buildPayloadFromEventLogPayload should filter invalid locations', () => {
    const payloadDownloaded = {
        invalidLocation: [],
        invalidLocation1: [12, '15'],
        invalidLocation2: [{}, 12],
        invalidLocation3: ['', []],
        invalidLocation4: [''],
        invalidLocation5: [[], []],
        validLocation: [10, 10]
    };
    expect(buildPayloadFromEventLogPayload(payloadDownloaded)).toEqual([
        { name: 'validLocation', type: 'location' }
    ]);
});

test('buildPayloadFromEventLogPayload should return null when payload is an array', () => {
    const payloadDownloaded = [] as any;
    expect(buildPayloadFromEventLogPayload(payloadDownloaded)).toEqual(null);
});

test('buildPayloadFromEventLogPayload should return null when payload is a function', () => {
    const payloadDownloaded = (() => {}) as any;
    expect(buildPayloadFromEventLogPayload(payloadDownloaded)).toEqual(null);
});

test('buildPayloadFromEventLogPayload should return a valid payload', () => {
    const payloadDownloaded = {
        numericField: 25,
        stringfield: 'string',
        locationField: [100, 100],
        complexObject: {},
        arrayObject: [],
        invalidArray: [100, 100, 100]
    };

    const expected: EventPayload = [
        { name: 'numericField', type: 'number' },
        { name: 'stringfield', type: 'string' },
        { name: 'locationField', type: 'location' }
    ];

    expect(buildPayloadFromEventLogPayload(payloadDownloaded)).toEqual(
        expected
    );
});
