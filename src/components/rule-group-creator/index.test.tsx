import * as React from 'react';
import { EventPayload } from '../../services/api/utils';
import {
    render,
    screen
} from '../../test-utils';

import RuleGroupCreator from './index';

test('RuleGroupCreator should not render when ruletype is realtime', async () => {
    render(<RuleGroupCreator ruleTpe='realtime' payload={null} setGroup={() => {}}/>);

    expect(screen.queryByLabelText(/rule group creator container/)).toBeNull();
});

test.skip(
    'PayloadCreator should show a message when no payload',
    async () => {
        const payload: EventPayload|null = null;
        const setPayload = jest.fn();
        render(<RuleGroupCreator ruleTpe='sliding' payload={payload} setGroup={setPayload}/>);

        await screen.findByLabelText(/rule group creator container/i);
        await screen.findByLabelText(/rule group creator button/i);
        await screen.findByLabelText(/rule group creator info message/);
    }
);