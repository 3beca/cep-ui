import * as React from 'react';
import { render, screen } from '@testing-library/react';
import TargetEditURL from './index';
import user from '@testing-library/user-event';

test('TargetEditURL should NOT render when no show', async () => {
    const onURLChanged = jest.fn();
    render(<TargetEditURL onURLChanged={onURLChanged} />);

    expect(screen.queryByTestId('target-edit-url')).not.toBeInTheDocument();
});

test('TargetEditURL should render empty when no url in props', async () => {
    const onURLChanged = jest.fn();
    render(<TargetEditURL onURLChanged={onURLChanged} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    const inputURL = screen.getByTestId('target-edit-url-input');
    expect(inputURL).toHaveValue('');
});

test('TargetEditURL should render the url in props', async () => {
    const onURLChanged = jest.fn();
    const url = 'https://cep.triba.ovh';
    render(<TargetEditURL onURLChanged={onURLChanged} url={url} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    const inputURL = screen.getByTestId('target-edit-url-input');
    expect(inputURL).toHaveValue(url);
});

test('TargetEditURL should render empty url and change it to valid url', async () => {
    const onURLChanged = jest.fn();
    const { rerender } = render(<TargetEditURL onURLChanged={onURLChanged} show={true} />);

    expect(screen.queryByTestId('target-edit-url')).toBeInTheDocument();

    // type a valid url
    const validURL = 'https://cep.tribeca.ovh';
    const inputURL = screen.getByTestId('target-edit-url-input');
    expect(inputURL).toHaveValue('');
    await user.type(inputURL, validURL);
    expect(onURLChanged).toHaveBeenCalledTimes(23);
    expect(onURLChanged).toHaveBeenCalledWith(validURL);

    rerender(<TargetEditURL onURLChanged={onURLChanged} url={validURL} show={true} />);
});
