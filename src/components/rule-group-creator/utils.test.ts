import { RuleGroupPayload } from './models';
import { buildEventPayloadFromGroupPayload } from './utils';

test('buildEventPayloadFromGroupPayload should return null when GroupPayload not defined', () => {
    expect(buildEventPayloadFromGroupPayload()).toBeNull();
});

test('buildEventPayloadFromGroupPayload should return null when GroupPayload is null', () => {
    expect(buildEventPayloadFromGroupPayload(null as unknown as RuleGroupPayload)).toBeNull();
});