import * as React from 'react';
import {
    render,
    screen,
    serverGetEventLogList,
    generateEventLogListWith
} from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import PayloadLoader, { Payload } from './index';
import { setupNock } from '../../../test-utils/api';
import { BASE_URL } from '../../../services/config';

const server = setupNock(BASE_URL);

test(
    'PayloadLoader should show a button to try to download the las payload from an event without payload',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload|null = null;
        const setPayload = jest.fn();
        render(<PayloadLoader eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);

        const checkPayload = await screen.findByText(/check payload/i);
        const eventLog = generateEventLogListWith(0);
        serverGetEventLogList(server, 1, 1, eventTypeId, 200, eventLog);
        userEvent.click(checkPayload);
        await screen.findByLabelText(/loading payload/i);
        await screen.findByLabelText(/show payload help/i);
    }
);

test(
    'PayloadLoader should show a button to try to download the las payload from an event with payload',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload|null = null;
        const setPayload = jest.fn();
        render(<PayloadLoader eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);

        const checkPayload = await screen.findByText(/check payload/i);
        const eventLog = generateEventLogListWith(1);
        serverGetEventLogList(server, 1, 1, eventTypeId, 200, eventLog);
        userEvent.click(checkPayload);
        await screen.findByLabelText(/loading payload/i);
        await screen.findByLabelText(/schema payload/i);
    }
);