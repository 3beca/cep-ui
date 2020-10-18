import * as React from 'react';
import { renderWithAPI as render, screen } from '../../../../../test-utils';
import userEvent from '@testing-library/user-event';

import TargetEditHeaders, { ArrayHeader, parseTargetHeaders } from './';

test('TargetEditHeaders should disable create headers', async () => {
    const onChange = jest.fn();
    render(<TargetEditHeaders onChange={onChange} disabled={true} />);

    // Disable cannot create headers
    expect(await screen.findByLabelText(/open dialog/i)).toBeDisabled();
});

test('TargetEditHeaders should show and close add headers dialog', async () => {
    const onChange = jest.fn();
    render(<TargetEditHeaders onChange={onChange} />);

    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));
    await screen.findByTestId('target-edit-headers-dialog');

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
});

test('TargetEditHeaders can add two headers', async () => {
    const onChange = jest.fn();
    const { rerender } = render(<TargetEditHeaders onChange={onChange} />);

    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByTestId('target-edit-headers-dialog-input-key');
    await screen.findByTestId('target-edit-headers-dialog-input-value');

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), authHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), authHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, [{ name: authHeaderKey, value: authHeaderValue }]);

    // Dialog do not close when add new header, only clean fields
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();

    const currentHeaders: ArrayHeader = [{ name: authHeaderKey, value: authHeaderValue }];
    rerender(<TargetEditHeaders onChange={onChange} headers={currentHeaders} />);

    // Set headers X-APPID
    const appidHeaderKey = 'X-APPID';
    const appidHeaderValue = '123456';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), appidHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), appidHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(2, [
        { name: authHeaderKey, value: authHeaderValue },
        { name: appidHeaderKey, value: appidHeaderValue }
    ]);

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
});

test('TargetEditHeaders do not accept content-type nor content-length nor spaces as headers', async () => {
    const onChange = jest.fn();
    render(<TargetEditHeaders onChange={onChange} />);

    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByTestId('target-edit-headers-dialog-input-key');
    await screen.findByTestId('target-edit-headers-dialog-input-value');

    // Set header Content-Type
    const typeHeaderKey = 'Content-Type';
    const typeHeaderValue = 'application/json';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), typeHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), typeHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(onChange).toHaveBeenCalledTimes(0);

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));

    // Set headers Content-Length
    const lengthHeaderKey = 'Content-Length';
    const lengthHeaderValue = '123';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), lengthHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), lengthHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(onChange).toHaveBeenCalledTimes(0);

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));

    // Set headers with spaces
    const spacesHeaderKey = 'header with spaces';
    const spacesHeaderValue = '123';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), spacesHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), spacesHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, [{ name: 'headerwithspaces', value: spacesHeaderValue }]);

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
});

test('TargetEditHeaders can delete a header', async () => {
    const onChange = jest.fn();
    const { rerender } = render(<TargetEditHeaders onChange={onChange} />);

    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByTestId('target-edit-headers-dialog-input-key');
    await screen.findByTestId('target-edit-headers-dialog-input-value');

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), authHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), authHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    // Dialog do not close when add new header, only clean fields
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, [{ name: authHeaderKey, value: authHeaderValue }]);

    let currentHeaders: ArrayHeader = [{ name: authHeaderKey, value: authHeaderValue }];
    rerender(<TargetEditHeaders onChange={onChange} headers={currentHeaders} />);

    // Set headers X-APPID
    const appidHeaderKey = 'X-APPID';
    const appidHeaderValue = '123456';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), appidHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), appidHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(2, [
        { name: authHeaderKey, value: authHeaderValue },
        { name: appidHeaderKey, value: appidHeaderValue }
    ]);

    currentHeaders = [...currentHeaders, { name: appidHeaderKey, value: appidHeaderValue }];
    rerender(<TargetEditHeaders onChange={onChange} headers={currentHeaders} />);

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Delete header X-APPID
    const deleteButtons = await screen.findAllByTestId('target-edit-headers-item-button-delete');
    expect(deleteButtons).toHaveLength(2);
    userEvent.click(deleteButtons[1]);
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(3, [{ name: authHeaderKey, value: authHeaderValue }]);

    // Show new headers
    currentHeaders = [{ name: authHeaderKey, value: authHeaderValue }];
    rerender(<TargetEditHeaders onChange={onChange} headers={currentHeaders} />);

    expect(await screen.findAllByTestId('target-edit-headers-item-button-delete')).toHaveLength(1);
    expect(await screen.findByTestId('target-edit-headers-item-key')).toHaveTextContent(authHeaderKey);
    expect(await screen.findByTestId('target-edit-headers-item-value')).toHaveTextContent(authHeaderValue);
});

test('TargetCreate merge duplicate headers', async () => {
    const onChange = jest.fn();
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    let currentHeaders: ArrayHeader = [{ name: authHeaderKey, value: authHeaderValue }];
    render(<TargetEditHeaders onChange={onChange} headers={currentHeaders} />);

    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByTestId('target-edit-headers-dialog-input-key');
    await screen.findByTestId('target-edit-headers-dialog-input-value');

    // Set header Authorization to bearer 654321
    const authHeaderValue2 = 'Bearer 654321';
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), authHeaderKey);
    await userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), authHeaderValue2);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, [{ name: authHeaderKey, value: authHeaderValue2 }]);

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
});

test('parseTargetHeaders should parse an ArrayHeader and return a Header', () => {
    expect(parseTargetHeaders((undefined as unknown) as ArrayHeader)).toEqual(undefined);
    expect(parseTargetHeaders([])).toEqual(undefined);
    expect(parseTargetHeaders([{ name: 'header', value: 'my value' }])).toEqual({ header: 'my value' });
    const complexArrayHeader = [
        { name: 'authHeaderKey', value: 'authHeaderValue' },
        { name: 'appidHeaderKey', value: 'appidHeaderValue' }
    ];
    const complexHeader = { authHeaderKey: 'authHeaderValue', appidHeaderKey: 'appidHeaderValue' };
    expect(parseTargetHeaders(complexArrayHeader)).toEqual(complexHeader);
});
