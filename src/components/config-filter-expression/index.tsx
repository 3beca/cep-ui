import * as React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import {useStyles} from './styles';
import {
    RuleFilterContainer,
    Expression,
    EPassthrow,
    EComparator,
    EDefault,
    isExpressionPassthrow,
    isExpressionLocation,
    isExpressionComparator,
    EComparatorLocation
} from '../rule-filter/models';
import {
    EventPayload,
    EventPayloadField
} from '../event-payload-creator/models';

export const buildLocationExpression = (name: string, lng = 0, lat = 0): EComparatorLocation => (
    {
        type: 'GEO',
        model: 'EXPRESSION',
        field: name,
        operator: 'NEAR',
        value: {
            _geometry: {type: 'Point', coordinates: [lng, lat]}
        }
    }
);

export type FieldSelectorProps = {
    payload: EventPayload;
    selected?: EventPayloadField;
    onSelected: (field: EventPayloadField|undefined) => void;
};
export const FieldSelector: React.FC<FieldSelectorProps> = ({payload, selected, onSelected}) => {
    const styles = useStyles();
    return (
        <Select
            variant='outlined'
            className={styles.fieldSelector}
            value={selected ? selected.name : ''}
            onChange={(ev) => onSelected(payload.find(field => field.name === ev.target.value))}
            inputProps={{
                'aria-label': 'config filter field selector',
            }}>
            {
                payload.map(
                    (field: EventPayloadField) => (
                        <MenuItem
                            aria-label='config filter options'
                            key={field.name}
                            value={field.name}>
                            {field.name}
                        </MenuItem>
                    )
                )
            }
        </Select>
    );
};

export type FieldOperatorProps = {
    operator?: 'EQ'|'GT'|'GTE'|'LT'|'LTE';
    setOperator: (operator: 'EQ'|'GT'|'GTE'|'LT'|'LTE') => void;
};
export const FieldOperator: React.FC<FieldOperatorProps> = ({operator, setOperator}) => {
    return (
        <Select
            variant='outlined'
            value={operator}
            onChange={(ev) => ev.target.value && setOperator(ev.target.value as 'EQ'|'GT'|'GTE'|'LT'|'LTE')}
            inputProps={{
                'aria-label': 'config filter operator selector'
            }}>
            {
                ['EQ', 'GT', 'GTE', 'LT', 'LTE'].map(
                    (operator, index) => (
                        <MenuItem
                            aria-label='config filter operators'
                            key={index}
                            value={operator}>
                            <Typography>{operator}</Typography>
                        </MenuItem>
                    )
                )
            }
        </Select>
    );
};
export type FieldValueProps = {
    type?: string|number;
    value?: string|number;
    setValue: (value: number|string) => void;
};
export const FieldValue: React.FC<FieldValueProps> = ({type, value, setValue}) => {
    return (
        <div>
            <TextField
                type={type === 'number' ? 'number' : 'text'}
                value={value !== undefined ? value : ''}
                label={type === 'number' ? 'Numeric value' : 'String value'}
                onChange={(ev) => setValue((type === 'number' && ev.target.value !== '') ? Number(ev.target.value) : ev.target.value)}
                inputProps={{
                    'aria-label': 'config filter value'
                }}/>
        </div>
    );
};

export type FieldExpressionComparatorProps = {
    field: EventPayloadField;
    expression: EComparator|EDefault|EPassthrow;
    updateExpression: (comaprator: EComparator|EDefault) => void;
};
export const FieldExpressionComparator: React.FC<FieldExpressionComparatorProps> = ({field, expression, updateExpression}) => {
    const operator = (expression as EComparator).operator || '';
    const value = (expression as EComparator).value;
    const updateValue = (value: number|string) => {
        if (isExpressionPassthrow(expression)) updateExpression({field: field.name, model: 'EXPRESSION', type: 'DEFAULT', value: value});
        else updateExpression({...expression, value});
    };
    const updateOperator = (operator: 'EQ'|'GT'|'GTE'|'LT'|'LTE') => {
        if (!isExpressionComparator(expression)) updateExpression({field: field.name, model: 'EXPRESSION', type: 'COMPARATOR', value: value, operator});
        else updateExpression({...expression, operator});
    };
    return (
        <div>
            <FieldOperator operator={operator} setOperator={updateOperator}/>
            <FieldValue type={field.type} value={value} setValue={updateValue}/>
        </div>
    );
};

export const generateComparatorLocation = (fieldName: string, longitude: string, latitude: string, minDistance?: string, maxDistance?: string): EComparatorLocation|EPassthrow => {
    const lng = Number(longitude);
    const lat = Number(latitude);
    if (
        longitude === undefined ||
        longitude === '' ||
        latitude === undefined ||
        latitude === '' ||
        Number.isNaN(lng) ||
        Number.isNaN(lat) ||
        (lng < -180 || lng > 180) ||
        (lat < -90 || lat > 90)
    ) {
        return {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    }
    const location =  buildLocationExpression(fieldName, lng, lat);
    if (minDistance !== '' && minDistance !== undefined) {
        const min = Number(minDistance);
        if (Number.isNaN(min) || min < 0) {
            return {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
        }
        location.value._minDistance = min;
    }
    if (maxDistance !== '' && maxDistance !== undefined) {
        const max = Number(maxDistance);
        if (Number.isNaN(max) || max < 0) {
            return {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
        }
        location.value._maxDistance = max;
    }

    if (
        (maxDistance === '' || maxDistance === undefined) && (minDistance === '' || minDistance === undefined)
    ) {
        return {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    }
    return location;
};
export type FieldExpressionLocationProps = {
    expression: EComparatorLocation;
    updateExpression: (comaprator: EComparatorLocation|EPassthrow) => void;
};
export const FieldExpressionLocation: React.FC<FieldExpressionLocationProps> = ({expression, updateExpression}) => {
    //const [location, setLocation] = React.useState<Geometry>(expression.value);
    const [longitude, setLongitude] = React.useState(expression.value._geometry.coordinates[0] + '');
    const [latitude, setLatitude] = React.useState(expression.value._geometry.coordinates[1] + '');
    const [minDistance, setMindistance] = React.useState(expression.value._minDistance !== undefined ? expression.value._minDistance + '' : '');
    const [maxDistance, setMaxdistance] = React.useState(expression.value._maxDistance !== undefined ? expression.value._maxDistance + ''  : '');
    React.useEffect(() => {
        updateExpression(generateComparatorLocation(expression.field, longitude, latitude, minDistance, maxDistance));
    }, [expression.field, longitude, latitude, minDistance, maxDistance, updateExpression]);
    const longitudeError = Number.isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180;
    const latitudeError = Number.isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90;
    const minDistanceError = Number.isNaN(Number(minDistance)) || Number(minDistance) < 0;
    const maxDistanceError = Number.isNaN(Number(maxDistance)) || Number(maxDistance) < 0;
    return (
        <div>
            <div>
                <div><Typography>Coordinates</Typography></div>
                <div
                    aria-label='config filter location component longitude'>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location longitude'
                        }}
                        value={longitude}
                        error={longitudeError}
                        label={'Longitude'}
                        helperText={longitudeError ? 'Values between -180 and 180' : ''}
                        onChange={(ev) => setLongitude(ev.target.value)}
                        onFocus={ev => ev.target.select()}
                        type='text'/>
                </div>
                <div
                    aria-label='config filter location component latitude'>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location latitude'
                        }}
                        value={latitude}
                        error={latitudeError}
                        label={'Latitude'}
                        helperText={latitudeError ? 'Values between -90 and 90' : ''}
                        onChange={(ev) => setLatitude(ev.target.value)}
                        onFocus={ev => ev.target.select()}
                        type='text'/>
                </div>
            </div>
            <div>
                <div
                    aria-label='config filter location component min distance'>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location min distance'
                        }}
                        value={minDistance}
                        onChange={(ev) => setMindistance(ev.target.value)}
                        error={minDistanceError}
                        helperText={minDistanceError ? 'Distance greater or equal to 0' : 'meters'}
                        label={'Min. distance'}
                        onFocus={ev => ev.target.select()}
                        type='text'/>
                </div>
            </div>
            <div>
                <div
                    aria-label='config filter location component max distance'>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location max distance'
                        }}
                        value={maxDistance}
                        onChange={(ev) => setMaxdistance(ev.target.value)}
                        error={minDistanceError}
                        helperText={maxDistanceError ? 'Distance greater or equal to 0' : 'meters'}
                        label={'Max. distance'}
                        onFocus={ev => ev.target.select()}
                        type='text'/>
                </div>
            </div>
        </div>
    );
};
export type FieldExpressionProps = {
    field?: EventPayloadField;
    expression: Expression;
    updateExpression: (comaprator: Expression) => void;
};
export const FieldExpression: React.FC<FieldExpressionProps> = ({field, expression, updateExpression}) => {
    if (!field) return null;
    if (field.type === 'location') {
        return (
            <FieldExpressionLocation
                expression={isExpressionLocation(expression) ? expression : buildLocationExpression(field.name)}
                updateExpression={updateExpression}/>
        );
    }
    return (
        <FieldExpressionComparator
            field={field}
            expression={isExpressionLocation(expression) ? {type: 'PASSTHROW', model: 'EXPRESSION', field: field.name} : expression}
            updateExpression={updateExpression}/>
    );
};

export type ConfigFilterDialogExpressionProps = {
    filter: RuleFilterContainer;
    expression: Expression;
    updateFilter: (filter: RuleFilterContainer) => void;
    payload: EventPayload;
};
export const ConfigFilterDialogExpression: React.FC<ConfigFilterDialogExpressionProps> = ({filter, expression, updateFilter, payload}) => {
    const [selected, setSelected] = React.useState<EventPayloadField|undefined>(payload.find(field => expression.field === field.name));
    const [comparator, setComparator] = React.useState<Expression>(expression);
    const updateExpression = React.useCallback(
        () => {
            expression.field = comparator.field;
            expression.type = comparator.type;
            switch(comparator.type) {
                case 'DEFAULT': {
                    const newExp = expression as EDefault;
                    newExp.value = comparator.value;
                    newExp.field = comparator.field;
                    break;
                }
                case 'COMPARATOR': {
                    const newExp = expression as EComparator;
                    newExp.value = comparator.value;
                    newExp.field = comparator.field;
                    newExp.operator = comparator.operator;
                    break;
                }
                case 'GEO': {
                    const newExp = expression as EComparatorLocation;
                    newExp.value = comparator.value;
                    newExp.field = comparator.field;
                    newExp.operator = comparator.operator;
                    break;
                }
            }
            updateFilter(filter);
        }, [filter, comparator, expression, updateFilter]
    );
    const hasValidComparator = React.useCallback(
        () => {
            if (comparator && comparator.type !== 'PASSTHROW') {
                if (comparator.type !== 'GEO') {
                    return comparator.value !== '';
                }
                return comparator.value._geometry.coordinates.length === 2;
            }
            return false;
        },
        [comparator],
    );
    return (
        <Dialog
            fullWidth={true}
            open={true}
            onClose={() => updateFilter(filter)}
            aria-label='config filter dialog'>
            <DialogTitle>Configure filter</DialogTitle>
            <DialogContent>
                <div>
                    <FieldSelector payload={payload} selected={selected} onSelected={setSelected}/>
                    <FieldExpression
                        field={selected}
                        expression={comparator}
                        updateExpression={setComparator}/>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => updateFilter(filter)}
                    aria-label='config filter button cancel'>
                    Cancel
                </Button>
                <Button
                    disabled={!selected || !comparator || !hasValidComparator()}
                    onClick={updateExpression}
                    aria-label='config filter button save'>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export type ConfigFilterExpressionProps = {
    filter?: RuleFilterContainer;
    expression?: Expression;
    updateFilter: (filter: RuleFilterContainer) => void;
    payload?: EventPayload|null;
};
export const ConfigFilterExpression: React.FC<ConfigFilterExpressionProps> = ({filter, expression, updateFilter, payload}) => {
    React.useEffect(
        () => {
            if(!expression && !!filter) updateFilter(filter);
        }, [updateFilter, filter, expression]
    );
    if (!expression || !filter || !payload) {
        return null;
    }
    return (
        <ConfigFilterDialogExpression
            filter={filter}
            expression={expression}
            updateFilter={updateFilter}
            payload={payload}
        />
    );
};

export default ConfigFilterExpression;