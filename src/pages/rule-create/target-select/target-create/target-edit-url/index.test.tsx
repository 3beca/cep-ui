import * as React from 'react';
import { findByTestId, render, screen } from '@testing-library/react';
import TargetEditURL from './index';
import user from '@testing-library/user-event';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('TargetEditURL should NOT render when no show', async () => {
    const onURLChanged = jest.fn();
    const { unmount } = render(<TargetEditURL onURLChanged={onURLChanged} />);

    expect(screen.queryByTestId('target-edit-url')).not.toBeInTheDocument();
    jest.runOnlyPendingTimers();
    unmount();
});

test('TargetEditURL should render empty when no url in props', async () => {
    const onURLChanged = jest.fn();
    const { unmount } = render(<TargetEditURL onURLChanged={onURLChanged} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    const inputURL = screen.getByTestId('target-edit-url-input');
    expect(inputURL).toHaveValue('');
    jest.runOnlyPendingTimers();
    unmount();
});

test('TargetEditURL should render the url in props', async () => {
    const onURLChanged = jest.fn();
    const url = 'https://cep.triba.ovh';
    const { unmount } = render(<TargetEditURL onURLChanged={onURLChanged} url={url} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    const inputURL = screen.getByTestId('target-edit-url-input');
    expect(inputURL).toHaveValue(url);
    jest.runOnlyPendingTimers();
    unmount();
});

test('TargetEditURL should render empty url and change it to valid url', async () => {
    const onURLChanged = jest.fn();
    const { rerender, unmount } = render(<TargetEditURL onURLChanged={onURLChanged} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    // type a valid url
    const validURL = 'https://cep.tribeca.ovh';
    const inputURL = screen.getByTestId('target-edit-url-input');
    expect(inputURL).toHaveValue('');
    await user.type(inputURL, validURL);
    jest.runOnlyPendingTimers();
    expect(onURLChanged).toHaveBeenCalledTimes(1);
    expect(onURLChanged).toHaveBeenCalledWith(validURL);

    rerender(<TargetEditURL onURLChanged={onURLChanged} url={validURL} show={true} />);
    jest.runOnlyPendingTimers();
    unmount();
});

test('TargetEditURL should render a url and change it to a empty url', async () => {
    const onURLChanged = jest.fn();
    const url = 'https://cep.triba.ovh';
    const { unmount } = render(<TargetEditURL onURLChanged={onURLChanged} url={url} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    const inputURL = screen.getByTestId('target-edit-url-input');
    expect(inputURL).toHaveValue(url);
    const emptyURL = url
        .split('')
        .map(() => '{backspace}')
        .join('');
    await user.type(inputURL, emptyURL);
    jest.runOnlyPendingTimers();
    expect(onURLChanged).toHaveBeenCalledTimes(1);
    expect(onURLChanged).toHaveBeenCalledWith('');
    jest.runOnlyPendingTimers();
    unmount();
});

test('TargetEditURL should render a url and change it to a empty url with range', async () => {
    const onURLChanged = jest.fn();
    const url = 'https://cep.triba.ovh';
    const { unmount } = render(<TargetEditURL onURLChanged={onURLChanged} url={url} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    const inputURL = screen.getByTestId('target-edit-url-input') as HTMLInputElement;
    expect(inputURL).toHaveValue(url);
    inputURL.setSelectionRange(0, url.length);
    await user.type(inputURL, '{backspace}');
    jest.runOnlyPendingTimers();
    expect(onURLChanged).toHaveBeenCalledTimes(1);
    expect(onURLChanged).toHaveBeenCalledWith('');
    unmount();
});

test('TargetEditURL should render error message when write a invalid url', async () => {
    const onURLChanged = jest.fn();
    const { rerender, unmount } = render(<TargetEditURL onURLChanged={onURLChanged} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    // type invalid URL
    const invalidURL = 'cep.tribeca.ovh';
    const inputURL = screen.getByTestId('target-edit-url-input') as HTMLInputElement;
    expect(inputURL).toHaveValue('');
    await user.type(inputURL, invalidURL);
    jest.runOnlyPendingTimers();
    expect(onURLChanged).toHaveBeenCalledTimes(0);
    await screen.findByTestId('target-edit-url-error');

    // Fix URL
    inputURL.setSelectionRange(0, 1);
    await user.type(inputURL, 'https://c');
    jest.runOnlyPendingTimers();
    const validURL = 'https://' + invalidURL;
    expect(onURLChanged).toHaveBeenCalledTimes(1);
    expect(onURLChanged).toHaveBeenCalledWith(validURL);
    expect(screen.queryByTestId('target-edit-url-error')).not.toBeInTheDocument();

    rerender(<TargetEditURL onURLChanged={onURLChanged} url={validURL} show={true} />);
    jest.runOnlyPendingTimers();
    unmount();
});

test('TargetEditURL should render error message when receive a invalid url', async () => {
    const onURLChanged = jest.fn();
    const invalidURL = 'cep.tribeca.ovh';
    const { rerender, unmount } = render(<TargetEditURL onURLChanged={onURLChanged} url={invalidURL} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    // Load invalid URL
    const inputURL = screen.getByTestId('target-edit-url-input') as HTMLInputElement;
    expect(inputURL).toHaveValue(invalidURL);
    expect(onURLChanged).toHaveBeenCalledTimes(0);
    await screen.findByTestId('target-edit-url-error');

    // Fix URL
    inputURL.setSelectionRange(0, 1);
    await user.type(inputURL, 'https://c');
    jest.runOnlyPendingTimers();
    const validURL = 'https://' + invalidURL;
    expect(onURLChanged).toHaveBeenCalledTimes(1);
    expect(onURLChanged).toHaveBeenCalledWith(validURL);
    expect(screen.queryByTestId('target-edit-url-error')).not.toBeInTheDocument();

    rerender(<TargetEditURL onURLChanged={onURLChanged} url={validURL} show={true} />);
    jest.runOnlyPendingTimers();
    unmount();
});
