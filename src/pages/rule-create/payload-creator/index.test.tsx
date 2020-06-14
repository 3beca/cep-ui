import * as React from 'react';
import {
    render,
    screen,
    serverGetEventLogList,
    generateEventLogListWith,
    generateEventLogListWithPayload
} from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import PayloadCreator from './index';
import { setupNock } from '../../../test-utils/api';
import { BASE_URL } from '../../../services/config';
import { Payload } from '../../../services/api/utils';
import { waitFor } from '@testing-library/react';

const server = setupNock(BASE_URL);

test(
    'PayloadCreator should show a button to try to download the las payload from an event without payload',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload|null = null;
        const setPayload = jest.fn();
        render(<PayloadCreator eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);

        await screen.findByLabelText(/payload creator$/i);
        const checkPayload = await screen.findByLabelText(/payload download button/i);
        const eventLog = generateEventLogListWith(0);
        serverGetEventLogList(server, 1, 1, eventTypeId, 200, eventLog);
        userEvent.click(checkPayload);
        expect(await screen.findByLabelText(/payload download button/i)).toBeDisabled();
        await screen.findByLabelText(/payload creator loading/i);
        await screen.findByLabelText(/payload creator help$/i);
        const closeDialog = await screen.findByLabelText(/payload creator help button close/i);
        userEvent.click(closeDialog);
        expect(screen.queryByLabelText(/payload creator help$/i)).not.toBeInTheDocument();
        expect(await screen.findByLabelText(/payload download button/i)).not.toBeDisabled();
    }
);

test(
    'PayloadCreator should show a button to try to download the las payload from an event with invalid payload',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload|null = null;
        const setPayload = jest.fn();
        render(<PayloadCreator eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);

        await screen.findByLabelText(/payload creator$/i);
        const checkPayload = await screen.findByLabelText(/payload download button/i);
        const eventLog = generateEventLogListWithPayload({invalidField: {}});
        serverGetEventLogList(server, 1, 1, eventTypeId, 200, eventLog);
        userEvent.click(checkPayload);
        expect(await screen.findByLabelText(/payload download button/i)).toBeDisabled();
        await screen.findByLabelText(/payload creator loading/i);
        await screen.findByLabelText(/payload creator help$/i);
        const closeDialog = await screen.findByLabelText(/payload creator help button close/i);
        userEvent.click(closeDialog);
        expect(screen.queryByLabelText(/payload creator help$/i)).not.toBeInTheDocument();
        expect(await screen.findByLabelText(/payload download button/i)).not.toBeDisabled();
    }
);

test(
    'PayloadCreator should show a button to try to download the las payload from an event with payload',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload|null = null;
        const setPayload = jest.fn();
        const {rerender} = render(<PayloadCreator eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);

        const checkPayload = await screen.findByLabelText(/payload download button/i);
        const payloadDownloaded = {
            numericField: 25,
            stringField: 'string',
            locationField: [100, 100],
            complexObject: {},
            arrayObject: [],
            invalidArray: [100, 100, 100]
        };
        const eventLog = generateEventLogListWithPayload(payloadDownloaded);
        serverGetEventLogList(server, 1, 1, eventTypeId, 200, eventLog);
        userEvent.click(checkPayload);
        expect(await screen.findByLabelText(/payload download button/i)).toBeDisabled();
        await screen.findByLabelText(/payload creator loading/i);
        await waitFor(() => expect(screen.queryByLabelText(/payload creator loading/i)).not.toBeInTheDocument());
        await screen.findByLabelText(/payload download button enabled/i);
        expect(setPayload).toHaveBeenCalledTimes(1);
        const expectedPayload: Payload = [
            {name: 'numericField', type: 'number'},
            {name: 'stringField', type: 'string'},
            {name: 'locationField', type: 'location'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(1, expectedPayload);

        rerender(<PayloadCreator eventTypeId={eventTypeId} payload={expectedPayload} setPayload={setPayload}/>);
        await screen.findByLabelText(/payload creator schema/i);
        expect(await screen.findAllByLabelText(/payload field$/)).toHaveLength(3);
    }
);

test(
    'PayloadCreator should show disabled',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload|null = null;
        const setPayload = jest.fn();
        render(<PayloadCreator eventTypeId={eventTypeId} payload={payload} setPayload={setPayload} disabled={true}/>);

        await screen.findByLabelText(/payload creator disabled/i);
        expect(await screen.findByLabelText(/payload download button/i)).toBeDisabled();
    }
);

test(
    'PayloadCreator should delete fields from payload',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload = [
            {name: 'numericField', type: 'number'},
            {name: 'stringField', type: 'string'},
            {name: 'locationField', type: 'location'}
        ];
        const setPayload = jest.fn();

        render(<PayloadCreator eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);
        await screen.findByLabelText(/payload creator schema/i);
        expect(await screen.findAllByLabelText(/payload field$/i)).toHaveLength(3);
        const buttonRemovePayloadField = await screen.findAllByLabelText(/payload field button remove/);
        expect(buttonRemovePayloadField).toHaveLength(3);

        userEvent.click(buttonRemovePayloadField[0]);
        const expectedPayloadDeleteFirst: Payload = [
            {name: 'stringField', type: 'string'},
            {name: 'locationField', type: 'location'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(1, expectedPayloadDeleteFirst);

        userEvent.click(buttonRemovePayloadField[1]);
        const expectedPayloadDeletedSecond: Payload = [
            {name: 'numericField', type: 'number'},
            {name: 'locationField', type: 'location'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(2, expectedPayloadDeletedSecond);

        userEvent.click(buttonRemovePayloadField[2]);
        const expectedPayloadDeletedThird: Payload = [
            {name: 'numericField', type: 'number'},
            {name: 'stringField', type: 'string'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(3, expectedPayloadDeletedThird);
    }
);

test(
    'PayloadCreator should create a payload by hand',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload|null = null;
        const setPayload = jest.fn();
        const {rerender} = render(<PayloadCreator eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);

        const addFieldButton = await screen.findByLabelText(/payload addfield button open dialog/i);
        userEvent.click(addFieldButton);
        await screen.findByLabelText(/payload addfield dialog$/i);

        // Add a location field
        setPayload.mockClear();
        const locationFieldName = 'myLocationfield';
        await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), locationFieldName);
        userEvent.click(await screen.findByLabelText(/payload addfield dialog location/i));
        userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i))
        expect(setPayload).toHaveBeenCalledTimes(1);
        const expectedLocationPayload: Payload = [
            {name: locationFieldName, type: 'location'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(1, expectedLocationPayload);

        // Add a numeric field
        setPayload.mockClear();
        const numberFieldName = 'myNumericfield';
        await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), numberFieldName);
        userEvent.click(await screen.findByLabelText(/payload addfield dialog number/i));
        userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i))
        expect(setPayload).toHaveBeenCalledTimes(1);
        const expectedNumberPayload: Payload = [
            {name: numberFieldName, type: 'number'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(1, expectedNumberPayload);

        // Add a numeric field
        setPayload.mockClear();
        const stringFieldName = 'myNumericfield';
        await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), stringFieldName);
        userEvent.click(await screen.findByLabelText(/payload addfield dialog string/i));
        userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i))
        expect(setPayload).toHaveBeenCalledTimes(1);
        const expectedStringPayload: Payload = [
            {name: stringFieldName, type: 'string'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(1, expectedStringPayload);

        userEvent.click(await screen.findByLabelText(/payload addfield dialog close/i));
        expect(screen.queryByLabelText(/paylaod addfield dialog/i)).not.toBeInTheDocument();

        // Rerender with 3 fields
        const updatedPayload = [...expectedLocationPayload, ...expectedNumberPayload, ...expectedStringPayload];
        rerender(<PayloadCreator eventTypeId={eventTypeId} payload={updatedPayload} setPayload={setPayload}/>);
        await screen.findByLabelText(/payload creator schema/i);
        expect(await screen.findAllByLabelText(/payload field$/)).toHaveLength(3);
    }
);

test(
    'PayloadCreator should add new fields to a payload',
    async () => {
        const eventTypeId = 'eventtypeid';
        const payload: Payload = [
            {name: 'oneFieldName', type: 'number'}
        ];
        const setPayload = jest.fn();

        render(<PayloadCreator eventTypeId={eventTypeId} payload={payload} setPayload={setPayload}/>);
        await screen.findByLabelText(/payload creator schema/i);
        expect(await screen.findAllByLabelText(/payload field$/i)).toHaveLength(1);

        const addFieldButton = await screen.findByLabelText(/payload addfield button open dialog/i);
        userEvent.click(addFieldButton);
        await screen.findByLabelText(/payload addfield dialog$/i);

        setPayload.mockClear();
        const stringFieldName = 'myNumericfield';
        await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), stringFieldName);
        userEvent.click(await screen.findByLabelText(/payload addfield dialog string/i));
        userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i))
        expect(setPayload).toHaveBeenCalledTimes(1);
        const expectedStringPayload: Payload = [
            {name: stringFieldName, type: 'string'}
        ];
        expect(setPayload).toHaveBeenNthCalledWith(1, [...payload, ...expectedStringPayload]);
    }
);