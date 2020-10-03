import * as React from 'react';
import { useParams } from 'react-router-dom';
import { render, screen } from '../../test-utils';
import RuleDetailsPage from './index';

const fakeUseParams = (useParams as unknown) as jest.Mock;
jest.mock('react-router', () => {
    const useParams = jest.fn();
    return {
        useParams,
        Redirect: jest.fn().mockReturnValue(null)
    };
});

test('RuleDetailsPage should render correctly', async () => {
    fakeUseParams.mockReturnValue({ ruleId: '123456789098' });
    render(<RuleDetailsPage />);

    await screen.findByLabelText(/details rule 123456789098 page/i);
});
