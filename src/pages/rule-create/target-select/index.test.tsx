import * as React from 'react';
import {
    render
} from '../../../test-utils';

import TargetSelector from './index';


beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());


test('TargetSelector should render a filtered by element options when type element and close keep selection', async () => {
    render(<TargetSelector/>);
});