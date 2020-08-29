import * as React from 'react';
import {
    render,
    screen
} from '../../test-utils';

import RuleGroupCreator from './index';

test('RuleGroupCreator should not render when ruletype is realtime', async () => {
    render(<RuleGroupCreator ruleTpe='realtime' payload={null} setGroup={() => {}}/>);

    expect(screen.queryByLabelText(/rule group creator/)).toBeNull();
});