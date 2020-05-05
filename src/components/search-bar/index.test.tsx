import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './index';

jest.useFakeTimers();

test('SearchBar should render with a default hint text and snap', () => {
    const {getByPlaceholderText, rerender, container} = render(<SearchBar/>);

    getByPlaceholderText(/search for.../i);

    rerender(<SearchBar hint={'Enter a name...'}/>);
    getByPlaceholderText(/enter a name../i);
    expect(container).toMatchSnapshot();
});

test('SearchBar should fire onSearchfor after write a text with default params', () => {
    const onSearchfor = jest.fn();
    const {getByLabelText} = render(<SearchBar onSearchFor={onSearchfor}/>);

    const searchText = 'juanjo';
    const input = getByLabelText(/search input/i) as HTMLInputElement;
    userEvent.type(input, searchText);

    expect(input.value).toEqual(searchText);
    expect(onSearchfor).toHaveBeenCalledTimes(0);

    jest.runAllTimers();
    expect(onSearchfor).toHaveBeenNthCalledWith(1, searchText);
});

test('SearchBar should fire onSearchfor after write a text with min size', () => {
    const onSearchfor = jest.fn();
    const {getByLabelText} = render(
        <SearchBar
            onSearchFor={onSearchfor}
            minLength={5}/>
    );

    const searchText = 'jua';
    const input = getByLabelText(/search input/i) as HTMLInputElement;
    userEvent.type(input, searchText);

    expect(input.value).toEqual(searchText);
    expect(onSearchfor).toHaveBeenCalledTimes(0);

    jest.runAllTimers();
    expect(input.value).toEqual(searchText);
    expect(onSearchfor).toHaveBeenCalledTimes(0);

    const longText = 'njo';
    userEvent.type(input, longText);
    jest.runAllTimers();
    expect(onSearchfor).toHaveBeenNthCalledWith(1, searchText + longText);
});

test('SearchBar should fire onSearchfor on each key pressed', async () => {
    const onSearchfor = jest.fn();
    const {getByLabelText} = render(
        <SearchBar
            onSearchFor={onSearchfor}
            minLength={1}
            delay={0}/>
    );

    const searchText = 'juanjo';
    const input = getByLabelText(/search input/i) as HTMLInputElement;
    searchText.split('').map(async c => {
        userEvent.type(input, c);
    });
    jest.runAllTimers();
    expect(onSearchfor).toHaveBeenCalledTimes(6);
    searchText.split('').map((c, i) => expect(onSearchfor).toHaveBeenNthCalledWith(i + 1, searchText.substring(0, i + 1)));
});