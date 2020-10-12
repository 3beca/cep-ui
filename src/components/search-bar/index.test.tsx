import * as React from 'react';
import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './index';

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

test('SearchBar should render with a default hint text and snap', async () => {
    const { rerender, container } = render(<SearchBar />);

    await screen.findByPlaceholderText(/search for.../i);

    rerender(<SearchBar hint={'Enter a name...'} />);
    await screen.findByPlaceholderText(/enter a name../i);
    expect(container).toMatchSnapshot();
});

test('SearchBar should fire onSearchfor after write a text with default params', async () => {
    const onSearchfor = jest.fn();
    render(<SearchBar onSearchFor={onSearchfor} />);

    const searchText = 'juanjo';
    const input = (await screen.findByLabelText(/search input/i)) as HTMLInputElement;
    await userEvent.type(input, searchText);

    expect(input.value).toEqual(searchText);
    expect(onSearchfor).toHaveBeenCalledTimes(0);

    act(() => void jest.runOnlyPendingTimers());
    expect(onSearchfor).toHaveBeenNthCalledWith(1, searchText);
});

test('SearchBar should fire onSearchfor after write a text with min size', async () => {
    const onSearchfor = jest.fn();
    render(<SearchBar onSearchFor={onSearchfor} minLength={5} />);

    const searchText = 'jua';
    const input = (await screen.findByLabelText(/search input/i)) as HTMLInputElement;
    await userEvent.type(input, searchText);

    expect(input.value).toEqual(searchText);
    expect(onSearchfor).toHaveBeenCalledTimes(0);

    act(() => void jest.runOnlyPendingTimers());
    expect(input.value).toEqual(searchText);
    expect(onSearchfor).toHaveBeenCalledTimes(0);

    const longText = 'njo';
    await userEvent.type(input, longText);
    act(() => void jest.runOnlyPendingTimers());
    expect(onSearchfor).toHaveBeenNthCalledWith(1, searchText + longText);
});

test('SearchBar should fire onSearchfor on each key pressed', async () => {
    const onSearchfor = jest.fn();
    render(<SearchBar onSearchFor={onSearchfor} minLength={1} delay={0} />);

    const searchText = 'juanjo';
    const input = (await screen.findByLabelText(/search input/i)) as HTMLInputElement;
    const chars = searchText.split('');
    for (const char of chars) {
        await userEvent.type(input, char);
    }
    act(() => void jest.runOnlyPendingTimers());
    expect(onSearchfor).toHaveBeenCalledTimes(6);
    searchText.split('').map((c, i) => expect(onSearchfor).toHaveBeenNthCalledWith(i + 1, searchText.substring(0, i + 1)));
});
