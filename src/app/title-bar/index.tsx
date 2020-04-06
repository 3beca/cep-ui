import React from 'react';

import { useStyles } from './styles';

export type TitleBarProps = {};
export const TitleBar: React.FC<TitleBarProps> = function TitleBar() {
    const style = useStyles();
    return (
        <div className={style.root}>
            CEP Service by 3beca
        </div>
    );
}

export default TitleBar;