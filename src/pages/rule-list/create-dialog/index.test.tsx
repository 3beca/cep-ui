import * as React from 'react';
import { render, waitFor, screen } from '../../../test-utils';
import CreateRuleDialog from './index';
import { RuleTypes } from '../../../services/api';
import { useHistory as mockRRHistory } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const mockHistory = mockRRHistory();
const mockPush = mockHistory.push as jest.Mock;
jest.mock('react-router-dom', () => {
    const pushMock = jest.fn();
    return {
        useHistory: () => ({
            push: pushMock
        })
    };
});

afterEach(() => mockPush.mockClear());

test('CreateRuleDialog should render null, no icon button, no dialog', () => {
    // Render null, no icon button, no dialog
    const { queryByLabelText } = render(<CreateRuleDialog isOpen={false} />);
    expect(queryByLabelText(/create rule dialog/i)).not.toBeInTheDocument();
});

test('CreateRuleDialog should render the create rules dialog', async () => {
    const onClose = jest.fn();

    // Render dialog
    render(<CreateRuleDialog isOpen={true} />);
    await screen.findByLabelText(/create rule dialog/i);
    expect(onClose).toBeCalledTimes(0);
    await screen.findByLabelText(/close button/i);
    expect(await screen.findByLabelText(/^select button$/i)).toBeDisabled();
});

test('CreateRuleDialog should render dialog when click in icon dialog and close when press close button', async () => {
    const onClose = jest.fn();

    // Render dialog
    const { rerender } = render(<CreateRuleDialog isOpen={true} onClose={onClose} />);
    await screen.findByLabelText(/create rule dialog/i);
    expect(onClose).toBeCalledTimes(0);
    const closeButton = await screen.findByLabelText(/close button/i);

    // close Dialog
    userEvent.click(closeButton);
    expect(onClose).toBeCalledTimes(1);

    rerender(<CreateRuleDialog isOpen={false} onClose={onClose} />);
    await waitFor(() => expect(screen.queryByLabelText(/create rule dialog/i)).not.toBeInTheDocument());
});

const runSelectCardTest = (ariaLabel: RegExp, typeSelected: RuleTypes | 'realtime') => {
    test('CreateRuleDialog should render dialog when click in icon dialog and close when select ' + ariaLabel, async () => {
        const onClose = jest.fn();

        // Render dialog
        const { rerender } = render(<CreateRuleDialog isOpen={true} onClose={onClose} />);
        await screen.findByLabelText(/create rule dialog/i);
        expect(onClose).toBeCalledTimes(0);
        await screen.findByLabelText(/close button/i);
        const selectButton = await screen.findByLabelText(/^select button$/i);
        const cardRule = await screen.findByLabelText(ariaLabel);
        expect(selectButton).toBeDisabled();

        // Select rule
        userEvent.click(cardRule);
        expect(selectButton).not.toBeDisabled();

        // Confirm select
        userEvent.click(selectButton);
        expect(onClose).toBeCalledTimes(1);
        expect(mockPush).toHaveBeenNthCalledWith(1, '/rules/create/' + typeSelected);

        rerender(<CreateRuleDialog isOpen={false} onClose={onClose} />);
        await waitFor(() => expect(screen.queryByLabelText(/create rule dialog/i)).not.toBeInTheDocument());
    });
};

runSelectCardTest(/create rule real time card/i, 'realtime');
runSelectCardTest(/create rule hopping card/i, 'hopping');
runSelectCardTest(/create rule sliding card/i, 'sliding');
runSelectCardTest(/create rule tumbling card/i, 'tumbling');
