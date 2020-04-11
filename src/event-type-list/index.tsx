import React from 'react';
import { TableEventType } from './event-type-table';
import { useStyles } from './styles';

export type CEPListProps = {};
export const CEPList: React.FC<CEPListProps> = function CEPList() {
    const style = useStyles();
    return (
        <div className={style.root}>
            Listado de Reglas CEP
            <TableEventType
                eventTypeList={{results: []}}
                isLoading={true}
                page={1}
                size={10}
            />
        </div>
    );
}

export default CEPList;
