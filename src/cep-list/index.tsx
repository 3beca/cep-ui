import React from 'react';
import { useStyles } from './styles';

export type CEPListProps = {};
export const CEPList: React.FC<CEPListProps> = function CEPList() {
    const style = useStyles();
    return (
        <div className={style.root}>
            Listado de Reglas CEP
        </div>
    );
}

export default CEPList;
