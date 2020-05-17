import * as React from 'react';
import {render, screen, serverGetEventTypeList, setupNock, generateEventTypeListWith} from '../../test-utils';
import {RuleCreatePage} from './index';
import {useParams} from 'react-router';
import { BASE_URL } from '../../services/config';

const fakeUseParams = useParams as unknown as jest.Mock;
jest.mock('react-router', () => {
    const useParams = jest.fn();
    return {
        useParams
    };
});

test('RuleCreatePage for realtime rules should render 3 sections, Manage EventTypes, Create rule and Manage Target and snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    fakeUseParams.mockReturnValue({type: 'realtime'});
    const {container} = render(<RuleCreatePage/>);

    await screen.findByLabelText(/create realtime rule page/i);
    await screen.findByLabelText(/manage eventtype section/i);
    await screen.findByLabelText(/create rule section/i);
    await screen.findByLabelText(/manage target section/i);
    await screen.findByLabelText(/search a eventtype/i);
    expect(container).toMatchSnapshot();
});