import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CreateRuleDialog from './index';

test('CreateRuleDialog should render null, no icon button, no dialog', () => {
    // Render null, no icon button, no dialog
    const {queryByLabelText} = render(<CreateRuleDialog isOpen={false}/>);
    expect(queryByLabelText(/create rule dialog/i)).not.toBeInTheDocument();
});

test('dialogIcon should render dialog when click in icon dialog and close when press close button', async () => {
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