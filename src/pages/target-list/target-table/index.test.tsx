import * as React from 'react';
import {render, screen} from '@testing-library/react';

import TargetTable from './index';
import {
    setupNock,
    generateTargetListWith,
    serverGetTargetList,
    serverDeleteTarget
} from '../../../test-utils';
import {runPaginatedTableTest} from '../../../test-utils/paginated-table-components';
import {runSelectableTableTest} from '../../../test-utils/selectable-table-components';
import {runDeletableTableTest} from '../../../test-utils/deletable-table-component';
import {TargetList, TargetError} from '../../../services/api';
import { BASE_URL } from '../../../services/config';

test('TargetTable snapshot', async () => {
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200);;
    render(<TargetTable/>);
    expect(await screen.findAllByLabelText('element row target')).toHaveLength(10);
});

runPaginatedTableTest(
    'TargetTable',
    TargetTable,
    generateTargetListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: TargetList|TargetError) => serverGetTargetList(setupNock(BASE_URL), page, pageSize, '', status, response)
);

runSelectableTableTest(
    'TargetTable',
    TargetTable,
    generateTargetListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: TargetList|TargetError) => serverGetTargetList(setupNock(BASE_URL), page, pageSize, '', status, response),
    true
);

runDeletableTableTest(
    'TargeTable',
    TargetTable,
    /element row target/,
    generateTargetListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: TargetList|TargetError) => serverGetTargetList(setupNock(BASE_URL), page, pageSize, '', status, response),
    (id: string, status: number = 200, response?: TargetError) => serverDeleteTarget(setupNock(BASE_URL), id, status, response)
);