import * as React from 'react';

const NOOP = () => {};
export const useSelectableList = <T>(list: T[]|undefined, onSelected: (selecteds: T[])=>void = NOOP) => {
    const [selecteds, setSelecteds] = React.useState(new Set<T>());
    React.useEffect(
        () => {
            setSelecteds(new Set<T>());
        },
        [list]
    );
    const selectOne = React.useCallback(
        (checked: boolean, element: T) => {
            if(checked) {
                selecteds.add(element);
            }
            else {
                selecteds.delete(element);
            }
            onSelected([...selecteds]);
            setSelecteds(new Set(selecteds));
        },
        [onSelected, selecteds]
    );
    const selectAll = React.useCallback(
        (checked: boolean) => {
            if(checked) {
                const listOfElements = Array.isArray(list) ? list : [];
                const allSelecteds = new Set(listOfElements);
                onSelected(listOfElements);
                setSelecteds(allSelecteds);
            }
            else {
                onSelected([]);
                setSelecteds(new Set<T>());
            }
        },
        [list, onSelected]
    );

    return {selectOne, selectAll, selecteds}
};