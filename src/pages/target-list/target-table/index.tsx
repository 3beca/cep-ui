import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import DeleteIcon from '@material-ui/icons/DeleteOutline';

import TitleTable from '../../../components/title-table';
import { PaginatedTable } from '../../../components/paginated-table';
import IconDialog from '../../../components/icon-dialog';
import DeleteDialog from '../../../components/delete-dialog';
import { RowsSizes } from '../../../components/paginated-table';
import { ComponentWithUsePaginationProps } from '../../../services/use-pagination';
import {
    useSelectableList,
    ComponentWithUseSelectableProps
} from '../../../services/use-selectable-list';
import { useGetListFilteredAndPaginated } from '../../../services/use-getlist-enhancer';
import { NOOP } from '../../../utils';
import { useStyles } from './styles';

import { Target } from '../../../services/api';
import { ENTITY } from '../../../services/api-provider/use-api';

export type TargetTableProps = ComponentWithUsePaginationProps &
    ComponentWithUseSelectableProps<Target>;
export const TargetTable: React.FC<TargetTableProps> = ({
    initialPage = 1,
    initialPageSize = 10,
    onSelected = NOOP
}) => {
    const styles = useStyles();
    const {
        isLoading,
        request: forceReload,
        response,
        currentPage: page,
        changePage,
        currentPageSize: pageSize,
        changePageSize
    } = useGetListFilteredAndPaginated<Target>(
        ENTITY.TARGETS,
        initialPage,
        initialPageSize
    );

    const TargetList = response?.data;
    const targets =
        TargetList && Array.isArray(TargetList?.results)
            ? TargetList.results
            : [];
    const isEmpty = response?.data ? response.data.results.length <= 0 : true;
    const hasNextPage = !!TargetList?.next;
    const hasPrevPage = !!TargetList?.prev;

    // Selector
    const { selectOne, selectAll, selecteds } = useSelectableList(
        TargetList?.results,
        onSelected
    );
    const show = selecteds.size > 0;

    return (
        <>
            <TitleTable title='List of Targets'>
                <IconDialog
                    show={show}
                    aria-label='delete selecteds dialog'
                    icon={
                        <DeleteIcon
                            className={styles.deleteIcon}
                            aria-label='delete selecteds icon'
                        />
                    }
                >
                    <DeleteDialog
                        title='Delete Targets'
                        entity={ENTITY.TARGETS}
                        elementsSelecteds={[...selecteds]}
                        onDeleted={forceReload}
                    />
                </IconDialog>
            </TitleTable>
            <PaginatedTable
                page={page}
                size={pageSize as RowsSizes}
                isLoading={isLoading}
                isEmpty={isEmpty}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
                onChangePage={changePage}
                onChangePageSize={changePageSize}
            >
                <Table>
                    <TableHead className={styles.head}>
                        <TableRow>
                            <TableCell padding='checkbox' component='th'>
                                <Checkbox
                                    className={styles.mainCheck}
                                    color='default'
                                    disabled={isLoading || isEmpty}
                                    inputProps={{
                                        'aria-label': 'element-selector-all'
                                    }}
                                    checked={
                                        selecteds.size ===
                                        TargetList?.results.length
                                    }
                                    onChange={(ev, checked) =>
                                        selectAll(checked)
                                    }
                                />
                            </TableCell>
                            <TableCell align='left'>
                                <Typography className={styles.headText}>
                                    Name
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography className={styles.headText}>
                                    Created
                                </Typography>
                            </TableCell>
                            <TableCell align='right'>
                                <Typography className={styles.headText}>
                                    Actions
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {targets.map((target: Target) => (
                            <TableRow
                                key={target.id}
                                aria-label='element row target'
                            >
                                <TableCell padding='checkbox'>
                                    <Checkbox
                                        inputProps={{
                                            role: 'element-selector'
                                        }}
                                        checked={selecteds.has(target)}
                                        onChange={(ev, checked) =>
                                            selectOne(checked, target)
                                        }
                                    />
                                </TableCell>
                                <TableCell
                                    align='left'
                                    aria-label='element name'
                                >
                                    {target.name}
                                </TableCell>
                                <TableCell align='right'>
                                    {new Date(
                                        target.createdAt
                                    ).toLocaleString()}
                                </TableCell>
                                <TableCell align='right'>
                                    <IconDialog
                                        show={true}
                                        aria-label='delete one dialog'
                                        icon={
                                            <DeleteIcon aria-label='delete one icon' />
                                        }
                                    >
                                        <DeleteDialog
                                            title='Delete Targets'
                                            entity={ENTITY.TARGETS}
                                            elementsSelecteds={[target]}
                                            onDeleted={forceReload}
                                        />
                                    </IconDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </PaginatedTable>
        </>
    );
};

export default TargetTable;
