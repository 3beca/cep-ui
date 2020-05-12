import * as React from 'react';
import { render, fireEvent, waitFor, screen } from '../../../test-utils';
import CreateRuleDialog from './index';
import { RuleTypes } from '../../../services/api';
import {useHistory} from 'react-router-dom';

const mockHistory = useHistory();
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
    const {queryByLabelText} = render(<CreateRuleDialog isOpen={false}/>);
    expect(queryByLabelText(/create rule dialog/i)).not.toBeInTheDocument();
});

test('CreateRuleDialog should render the create rules dialog', async () => {
    const onClose = jest.fn();

    // Render dialog
    const {container, getByLabelText, getByText} = render(
        <CreateRuleDialog isOpen={true}/>
    );
    getByLabelText(/create rule dialog/i);
    expect(onClose).toBeCalledTimes(0);
    getByText(/close/i);
    expect(getByText(/^select$/i)).toBeDisabled();
    expect(container).toMatchSnapshot();

});

test('CreateRuleDialog should render dialog when click in icon dialog and close when press close button', async () => {
    const onClose = jest.fn();

    // Render dialog
    const {getByLabelText, queryByLabelText, getByText, rerender} = render(
        <CreateRuleDialog isOpen={true} onClose={onClose}/>
    );
    getByLabelText(/create rule dialog/i);
    expect(onClose).toBeCalledTimes(0);
    const closeButton = getByText(/close/i);

    // close Dialog
    fireEvent.click(closeButton);
    expect(onClose).toBeCalledTimes(1);

    rerender(<CreateRuleDialog isOpen={false} onClose={onClose}/>);
    await waitFor(() => expect(queryByLabelText(/create rule dialog/i)).not.toBeInTheDocument());
});

const runSelectCardTest = (ariaLabel: RegExp, typeSelected: RuleTypes|'realtime') => {
    test('CreateRuleDialog should render dialog when click in icon dialog and close when select ' + ariaLabel, async () => {
        const onClose = jest.fn();

        // Render dialog
        const {rerender} = render(
            <CreateRuleDialog isOpen={true} onClose={onClose}/>
        );
        await screen.findByLabelText(/create rule dialog/i);
        expect(onClose).toBeCalledTimes(0);
        await screen.findByText(/close/i);
        const selectButton = await screen.findByText(/^select$/i);
        const cardRule = await screen.findByLabelText(ariaLabel);
        expect(selectButton).toBeDisabled();

        // Select rule
        fireEvent.click(cardRule);
        expect(selectButton).not.toBeDisabled();

        // Confirm select
        fireEvent.click(selectButton);
        expect(onClose).toBeCalledTimes(1);
        expect(mockPush).toHaveBeenNthCalledWith(1, '/rules/create/' + typeSelected);

        rerender(<CreateRuleDialog isOpen={false} onClose={onClose}/>);
        await waitFor(() => expect(screen.queryByLabelText(/create rule dialog/i)).not.toBeInTheDocument());
    });
};

runSelectCardTest(/create rule real time card/i, 'realtime');
runSelectCardTest(/create rule hopping card/i, 'hopping');
runSelectCardTest(/create rule sliding card/i, 'sliding');
runSelectCardTest(/create rule tumbling card/i, 'tumbling');