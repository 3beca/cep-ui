import * as React from 'react';
import { WindowingSize } from '../../services/api';
import { screen, render } from '../../test-utils';
import RuleWindowSize from './index';
import userEvent from '@testing-library/user-event';

test('RuleWindowSize should not render when type is realtime', async () => {
    const updateWindowsize = jest.fn();
    render(
        <RuleWindowSize type='realtime' updateWindowSize={updateWindowsize} />
    );
    expect(
        screen.queryByLabelText(/rule windowsize container/)
    ).not.toBeInTheDocument();
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, undefined);
});

test('RuleWindowSize should render with undefined windowSize', async () => {
    const updateWindowsize = jest.fn();
    render(
        <RuleWindowSize type='sliding' updateWindowSize={updateWindowsize} />
    );
    await screen.findByLabelText(/rule windowsize main container/);
    await screen.findByLabelText(/rule windowsize unit second$/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '');
    expect(
        await screen.findByLabelText(/rule windowsize value container/i)
    ).not.toHaveTextContent(/only positive integers/i);
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, undefined);
});

test('RuleWindowSize should render with disabled do not can change values when disabled', async () => {
    const updateWindowsize = jest.fn();
    render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            disabled={true}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/);
    await screen.findByLabelText(/rule windowsize unit second$/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '');
    expect(
        await screen.findByLabelText(/rule windowsize value container/i)
    ).not.toHaveTextContent(/only positive integers/i);
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, undefined);

    // Change unit to hour
    updateWindowsize.mockClear();
    userEvent.click(await screen.findByLabelText(/rule windowsize unit hour/i));
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    userEvent.click(
        await screen.findByLabelText(/rule windowsize unit minute/i)
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    userEvent.click(
        await screen.findByLabelText(/rule windowsize unit second/i)
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        '15'
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
});

test('RuleWindowSize should render with 10 minutes windowSize', async () => {
    const updateWindowsize = jest.fn();
    const windowSize: WindowingSize = {
        unit: 'minute',
        value: 10
    };
    render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/);
    await screen.findByLabelText(/rule windowsize unit second$/i);
    await screen.findByLabelText(/rule windowsize unit minute selected/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '10');

    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, {
        unit: 'minute',
        value: 10
    });
});

test('RuleWindowSize should change unit from minute to hour', async () => {
    const updateWindowsize = jest.fn();
    const windowSize: WindowingSize = {
        unit: 'minute',
        value: 10
    };
    render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/);
    await screen.findByLabelText(/rule windowsize unit second$/i);
    await screen.findByLabelText(/rule windowsize unit minute selected/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '10');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    const renderedUnit: WindowingSize = { unit: 'minute', value: 10 };
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, renderedUnit);

    // Change unit to hour
    userEvent.click(await screen.findByLabelText(/rule windowsize unit hour/i));
    await screen.findByLabelText(/rule windowsize unit second$/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour selected/i);

    expect(updateWindowsize).toHaveBeenCalledTimes(2);
    const expectedChangedUnit: WindowingSize = { unit: 'hour', value: 10 };
    expect(updateWindowsize).toHaveBeenNthCalledWith(2, expectedChangedUnit);
});

test('RuleWindowSize should change from undefined to 15 seconnds', async () => {
    const updateWindowsize = jest.fn();
    const { rerender } = render(
        <RuleWindowSize type='sliding' updateWindowSize={updateWindowsize} />
    );
    await screen.findByLabelText(/rule windowsize main container/i);
    await screen.findByLabelText(/rule windowsize unit second$/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, undefined);

    // Set seconds unit
    userEvent.click(
        await screen.findByLabelText(/rule windowsize unit second/i)
    );
    await screen.findByLabelText(/rule windowsize unit second selected/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(updateWindowsize).toHaveBeenCalledTimes(2);
    expect(updateWindowsize).toHaveBeenNthCalledWith(2, undefined);

    // Set 15 as value
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize type='sliding' updateWindowSize={updateWindowsize} />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        '15'
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(2);
    const expectedFirstType: WindowingSize = { unit: 'second', value: 1 };
    const expectedWindowsize: WindowingSize = { unit: 'second', value: 15 };
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, expectedFirstType);
    expect(updateWindowsize).toHaveBeenNthCalledWith(2, expectedWindowsize);

    // Rerender with windowsize 15 seconds
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={expectedWindowsize}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
});

test('RuleWindowSize should change from 15 second to 6 minutes', async () => {
    const updateWindowsize = jest.fn();
    const windowSize: WindowingSize = {
        unit: 'second',
        value: 15
    };
    const { rerender } = render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/i);
    await screen.findByLabelText(/rule windowsize unit second selected/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '15');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, windowSize);

    // Change seconds to minutes
    userEvent.click(
        await screen.findByLabelText(/rule windowsize unit minute/i)
    );
    await screen.findByLabelText(/rule windowsize unit second$/i);
    await screen.findByLabelText(/rule windowsize unit minute selected/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(updateWindowsize).toHaveBeenCalledTimes(2);
    const exoectedChangedUnit: WindowingSize = { unit: 'minute', value: 15 };
    expect(updateWindowsize).toHaveBeenNthCalledWith(2, exoectedChangedUnit);

    // Change 15 to 6
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={exoectedChangedUnit}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        '6'
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    const expectedWindowsize: WindowingSize = { unit: 'minute', value: 6 };
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, expectedWindowsize);

    // Rerender with windowsize 6 minutes
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={expectedWindowsize}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
});

test('RuleWindowSize should not accept text as value', async () => {
    const updateWindowsize = jest.fn();
    const windowSize: WindowingSize = {
        unit: 'second',
        value: 15
    };
    const { rerender } = render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/i);
    await screen.findByLabelText(/rule windowsize unit second selected/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '15');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, windowSize);

    // Change 15 to 'helloworld'
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        'helloworld'
    );
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', 'helloworld');
    expect(updateWindowsize).toHaveBeenCalledTimes(10);
    for (let i = 1; i <= 10; i++) {
        expect(updateWindowsize).toHaveBeenNthCalledWith(i, undefined);
    }
    expect(
        await screen.findByLabelText(/rule windowsize value container/i)
    ).toHaveTextContent(/only positive integers/i);
    // Rerender with windowsize undefiend
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={undefined}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
});

test('RuleWindowSize should not accept 0 as value', async () => {
    const updateWindowsize = jest.fn();
    const windowSize: WindowingSize = {
        unit: 'second',
        value: 15
    };
    const { rerender } = render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/i);
    await screen.findByLabelText(/rule windowsize unit second selected/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '15');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, windowSize);

    // Change 15 to 0
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        '0'
    );
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '0');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, undefined);
    expect(
        await screen.findByLabelText(/rule windowsize value container/i)
    ).toHaveTextContent(/only positive integers/i);
    // Rerender with windowsize undefiend
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={undefined}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
});

test('RuleWindowSize should not accept negative as value', async () => {
    const updateWindowsize = jest.fn();
    const windowSize: WindowingSize = {
        unit: 'second',
        value: 15
    };
    const { rerender } = render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/i);
    await screen.findByLabelText(/rule windowsize unit second selected/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '15');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, windowSize);

    // Change 15 to -5
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        '-5'
    );
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '-5');
    expect(updateWindowsize).toHaveBeenCalledTimes(2);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, undefined);
    expect(updateWindowsize).toHaveBeenNthCalledWith(2, undefined);
    expect(
        await screen.findByLabelText(/rule windowsize value container/i)
    ).toHaveTextContent(/only positive integers/i);
    // Rerender with windowsize undefiend
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={undefined}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
});

test('RuleWindowSize should not accept decimals as value', async () => {
    const updateWindowsize = jest.fn();
    const windowSize: WindowingSize = {
        unit: 'second',
        value: 15
    };
    const { rerender } = render(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    await screen.findByLabelText(/rule windowsize main container/i);
    await screen.findByLabelText(/rule windowsize unit second selected/i);
    await screen.findByLabelText(/rule windowsize unit minute$/i);
    await screen.findByLabelText(/rule windowsize unit hour$/i);
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '15');
    expect(updateWindowsize).toHaveBeenCalledTimes(1);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, windowSize);

    // Change 15 to 2.85
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={windowSize}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        '2.85'
    );
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '2.85');
    expect(updateWindowsize).toHaveBeenCalledTimes(4);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, {
        unit: 'second',
        value: 2
    });
    expect(updateWindowsize).toHaveBeenNthCalledWith(2, {
        unit: 'second',
        value: 2
    });
    expect(updateWindowsize).toHaveBeenNthCalledWith(3, undefined);
    expect(updateWindowsize).toHaveBeenNthCalledWith(4, undefined);
    expect(
        await screen.findByLabelText(/rule windowsize value container/i)
    ).toHaveTextContent(/only positive integers/i);

    // Clear decimal part
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={undefined}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
    await userEvent.type(
        await screen.findByLabelText(/rule windowsize input value/i),
        '{backspace}{backspace}'
    );
    expect(
        await screen.findByLabelText(/rule windowsize input value/i)
    ).toHaveAttribute('value', '2.');
    expect(updateWindowsize).toHaveBeenCalledTimes(2);
    expect(updateWindowsize).toHaveBeenNthCalledWith(1, undefined);
    expect(updateWindowsize).toHaveBeenNthCalledWith(2, {
        unit: 'second',
        value: 2
    });
    expect(
        await screen.findByLabelText(/rule windowsize value container/i)
    ).not.toHaveTextContent(/only positive integers/i);

    // Rerender with windowsize expected
    updateWindowsize.mockClear();
    rerender(
        <RuleWindowSize
            type='sliding'
            updateWindowSize={updateWindowsize}
            windowSize={undefined}
        />
    );
    expect(updateWindowsize).toHaveBeenCalledTimes(0);
});
