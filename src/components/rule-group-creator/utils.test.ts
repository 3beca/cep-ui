import { RuleGroup } from '../../services/api';
import { EventPayload } from '../event-payload-creator/models';
import { RuleGroupPayload } from './models';
import { buildEventPayloadFromGroupPayload, syncEventPayloadAndGroupPayload, parseRuleGroupPayloadToRuleGroup } from './utils';

test('buildEventPayloadFromGroupPayload should return null when GroupPayload not defined', () => {
    expect(buildEventPayloadFromGroupPayload()).toBeNull();
});

test('buildEventPayloadFromGroupPayload should return null when GroupPayload is null', () => {
    expect(buildEventPayloadFromGroupPayload((null as unknown) as RuleGroupPayload)).toBeNull();
});

test('buildEventPayloadFromGroupPayload should return null when GroupPayload is empty array', () => {
    expect(buildEventPayloadFromGroupPayload([])).toBeNull();
});

test('buildEventPayloadFromGroupPayload should return a valid Payload', () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' },
        { field: 'temperature', operator: '_avg', name: 'avgTemperature' },
        { field: 'temperature', operator: '_sum', name: 'sumTemperature' },
        { field: 1, operator: '_sum', name: 'countTemperature' },
        {
            field: 'temperature',
            operator: '_stdDevPop',
            name: 'devPopTemperature'
        },
        {
            field: 'temperature',
            operator: '_stdDevSamp',
            name: 'devSampTemperature'
        }
    ];

    const payload: EventPayload = [
        { name: 'maxTemperature', type: 'number' },
        { name: 'minTemperature', type: 'number' },
        { name: 'avgTemperature', type: 'number' },
        { name: 'sumTemperature', type: 'number' },
        { name: 'countTemperature', type: 'number' },
        { name: 'devPopTemperature', type: 'number' },
        { name: 'devSampTemperature', type: 'number' }
    ];
    expect(buildEventPayloadFromGroupPayload(group)).toEqual(payload);
});

test('syncEventPayloadAndGroupPayload should return that renders with empty group no need update', () => {
    expect(syncEventPayloadAndGroupPayload(null, undefined)).toEqual([false, undefined]);
    expect(syncEventPayloadAndGroupPayload([{ name: 'temperature', type: 'number' }], undefined)).toEqual([false, undefined]);
});

test('syncEventPayloadAndGroupPayload should return that renders with null payload and group with no payload fields do not need be synced', () => {
    const groupWithoutFields: RuleGroupPayload = [{ field: 1, name: 'countEvents', operator: '_sum' }];
    expect(syncEventPayloadAndGroupPayload(null, groupWithoutFields)).toEqual([false, groupWithoutFields]);
});

test('syncEventPayloadAndGroupPayload should return that renders with null payload and group with payload fields needs be synced', () => {
    const groupWithTemperatureField: RuleGroupPayload = [{ field: 'temperature', name: 'countEvents', operator: '_sum' }];
    expect(syncEventPayloadAndGroupPayload(null, groupWithTemperatureField)).toEqual([true, undefined]);

    const groupWithSumAnTemperature: RuleGroupPayload = [
        { field: 1, name: 'countEvents', operator: '_sum' },
        { field: 'temperature', name: 'countEvents', operator: '_sum' }
    ];
    const expectedGroup: RuleGroupPayload = [{ field: 1, name: 'countEvents', operator: '_sum' }];
    expect(syncEventPayloadAndGroupPayload(null, groupWithSumAnTemperature)).toEqual([true, expectedGroup]);
});

test('syncEventPayloadAndGroupPayload should return that renders with same payload fields and group fields do not need to be synced', () => {
    const payload: EventPayload = [{ name: 'temperature', type: 'number' }];

    const groupWithSumAndTemperature: RuleGroupPayload = [
        { field: 1, name: 'countEvents', operator: '_sum' },
        { field: 'temperature', name: 'countEvents', operator: '_sum' }
    ];
    const expectedGroup: RuleGroupPayload = [
        { field: 1, name: 'countEvents', operator: '_sum' },
        { field: 'temperature', name: 'countEvents', operator: '_sum' }
    ];
    expect(syncEventPayloadAndGroupPayload(payload, groupWithSumAndTemperature)).toEqual([false, expectedGroup]);
});

test('syncEventPayloadAndGroupPayload should return that renders with complex payload fields and complex group fields with diferent fields needs to be synced', () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' },
        { field: 'temperature', operator: '_avg', name: 'avgTemperature' },
        { field: 'pressure', operator: '_sum', name: 'sumTemperature' },
        { field: 1, operator: '_sum', name: 'countTemperature' },
        {
            field: 'humidity',
            operator: '_stdDevPop',
            name: 'devPopTemperature'
        },
        {
            field: 'winspeed',
            operator: '_stdDevSamp',
            name: 'devSampTemperature'
        }
    ];

    const payload: EventPayload = [
        { name: 'humidity', type: 'number' },
        { name: 'pressure', type: 'number' }
    ];
    const expectedGroup: RuleGroupPayload = [
        { field: 'pressure', operator: '_sum', name: 'sumTemperature' },
        { field: 1, operator: '_sum', name: 'countTemperature' },
        { field: 'humidity', operator: '_stdDevPop', name: 'devPopTemperature' }
    ];
    expect(syncEventPayloadAndGroupPayload(payload, group)).toEqual([true, expectedGroup]);
});

test('parseRuleGroupPayloadToRuleGroup should parse a RuleGroupPayload and return a RuleGroup', () => {
    expect(parseRuleGroupPayloadToRuleGroup((undefined as unknown) as RuleGroupPayload)).toBe(undefined);
    expect(parseRuleGroupPayloadToRuleGroup((null as unknown) as RuleGroupPayload)).toBe(undefined);
    expect(parseRuleGroupPayloadToRuleGroup([])).toBe(undefined);
    expect(parseRuleGroupPayloadToRuleGroup([{ field: 1, operator: '_sum', name: '' }])).toBe(undefined);

    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' },
        { field: 'temperature', operator: '_avg', name: 'avgTemperature' },
        { field: 'pressure', operator: '_sum', name: 'sumPressure' },
        { field: 1, operator: '_sum', name: 'countEvents' },
        { field: 'humidity', operator: '_stdDevPop', name: 'devPopHumidity' },
        {
            field: 'winspeed',
            operator: '_stdDevSamp',
            name: 'devSampWindspeed'
        },
        { field: 1, operator: '_sum', name: '' },
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' },
        { field: 'temperature', operator: '_avg', name: 'avgTemperature' }
    ];

    const expectedRuleGroup: RuleGroup = {
        maxTemperature: { _max: '_temperature' },
        minTemperature: { _min: '_temperature' },
        avgTemperature: { _avg: '_temperature' },
        sumPressure: { _sum: '_pressure' },
        countEvents: { _sum: 1 },
        devPopHumidity: { _stdDevPop: '_humidity' },
        devSampWindspeed: { _stdDevSamp: '_winspeed' }
    };
    expect(parseRuleGroupPayloadToRuleGroup(group)).toEqual(expectedRuleGroup);
});
