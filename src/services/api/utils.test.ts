import {
    CONTAINER,
    isContainer,
    isExpressionPassthrow,
    isExpressionDefault,
    isExpressionComparator,
    isExpressionLocation,
    parseRuleFilter,
    getComparatorValue,
    EPASSTHROW,
    EDEFAULT,
    ECOMPARATOR,
    ECOMPARATORLOCATION
} from './utils';
import { RuleFilter, RuleFilterComparator, Geometry } from './models';

test(
    'check types should return the correct type',
    () => {
        const container: CONTAINER = {model: 'CONTAINER'} as CONTAINER;
        const passExpression  = {model: 'EXPRESSION', type: 'PASSTHROW'} as EPASSTHROW;
        const defaultExpression  = {model: 'EXPRESSION', type: 'DEFAULT'} as EDEFAULT;
        const comparatorExpression  = {model: 'EXPRESSION', type: 'COMPARATOR'} as ECOMPARATOR;
        const geoExpression  = {model: 'EXPRESSION', type: 'GEO'} as ECOMPARATORLOCATION;

        expect(isContainer(container)).toBe(true);
        expect(isContainer(passExpression)).toBe(false);
        expect(isExpressionPassthrow(passExpression)).toBe(true);
        expect(isExpressionPassthrow(geoExpression)).toBe(false);
        expect(isExpressionDefault(defaultExpression)).toBe(true);
        expect(isExpressionDefault(geoExpression)).toBe(false);
        expect(isExpressionComparator(comparatorExpression)).toBe(true);
        expect(isExpressionComparator(geoExpression)).toBe(false);
        expect(isExpressionLocation(geoExpression)).toBe(true);
        expect(isExpressionLocation(passExpression)).toBe(false);
    }
);
test(
    'getComparatorValue shuold return each type of Comparator',
    () => {
        expect(getComparatorValue({_eq: 10})).toEqual({name: 'EQ', value: 10});
        expect(getComparatorValue({_eq: '10'})).toEqual({name: 'EQ', value: '10'});
        expect(getComparatorValue({_gt: 10})).toEqual({name: 'GT', value: 10});
        expect(getComparatorValue({_gte: '10'})).toEqual({name: 'GTE', value: '10'});
        expect(getComparatorValue({_lt: 10})).toEqual({name: 'LT', value: 10});
        expect(getComparatorValue({_lte: '10'})).toEqual({name: 'LTE', value: '10'});
        expect(() => getComparatorValue({_hs: 10} as unknown as RuleFilterComparator)).toThrowError();
        const location: Geometry = {_geometry: {type: 'Point', coordinates: [1, 1]}};
        expect(getComparatorValue({_near: location})).toEqual({name: 'NEAR', value: location});
    }
);
test(
    'parseRuleFilter should return a Passthrow expression',
    () => {
        const filter: RuleFilter = {};

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'EXPRESSION',
                type: 'PASSTHROW',
                field: 'root'
            }
        ]);
    }
);

test(
    'parseRuleFilter should return a default expression',
    () => {
        const filter: RuleFilter = {
            temperature: 10
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'EXPRESSION',
                type: 'DEFAULT',
                field: 'temperature',
                value: 10,
            }
        ]);
    }
);

test(
    'parseRuleFilter should return two default expressions',
    () => {
        const filter: RuleFilter = {
            temperature: 10,
            humidity: 70
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'EXPRESSION',
                type: 'DEFAULT',
                field: 'temperature',
                value: 10,
            },
            {
                model: 'EXPRESSION',
                type: 'DEFAULT',
                field: 'humidity',
                value: 70,
            }
        ]);
    }
);

test(
    'parseRuleFilter should return a comaprator expression',
    () => {
        const filter: RuleFilter = {
            temperature: { '_lt': 10}
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'EXPRESSION',
                type: 'COMPARATOR',
                operator: 'LT',
                field: 'temperature',
                value: 10,
            }
        ]);
    }
);

test(
    'parseRuleFilter should return a expression with a DEFAULT if operator do not exist',
    () => {
        const filter: RuleFilter = {
            temperature: { '_hs': 10}
        };

        expect(parseRuleFilter(filter)).toEqual([{
            model: 'CONTAINER',
            type: 'DEFAULT',
            field: 'temperature',
            values: [
                {
                    model: 'EXPRESSION',
                    type: 'DEFAULT',
                    field: '_hs',
                    value: 10
                }
            ]
        }]);
    }
);

test(
    'parseRuleFilter should return a location expresion',
    () => {
        const location: Geometry = {_geometry: {type: 'Point', coordinates: [1, 1]}};
        const filter: RuleFilter = {
            location: { '_near': location}
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'EXPRESSION',
                type: 'GEO',
                operator: 'NEAR',
                field: 'location',
                value: location
            }
        ]);
    }
);

test(
    'parseRuleFilter should return a expression with a container with two expressions',
    () => {
        const filter: RuleFilter = {
            temperature: {
                temperature: 10,
                humidity: undefined
            }
        } as unknown as RuleFilter;

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'CONTAINER',
                type: 'DEFAULT',
                field: 'temperature',
                values: [
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'temperature',
                        value: 10,
                    },
                    {
                        model: 'EXPRESSION',
                        type: 'PASSTHROW',
                        field: 'humidity'
                    }
                ]
            }
        ]);
    }
);

test(
    'parseRuleFilter should return a container with with two expressions inside a field of array',
    () => {
        const filter: RuleFilter = {
            temperature: [
                {temperature: 10},
                {humidity: 80}
            ]
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'CONTAINER',
                type: 'DEFAULT',
                field: 'temperature',
                values: [
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'temperature',
                        value: 10,
                    },
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'humidity',
                        value: 80
                    }
                ]
            }
        ]);
    }
);

test(
    'parseRuleFilter should return a container with with two expressions inside RuleFilter',
    () => {
        const filter: RuleFilter = {
            temperature: {
                temperature: 10,
                humidity: 80
            }
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'CONTAINER',
                type: 'DEFAULT',
                field: 'temperature',
                values: [
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'temperature',
                        value: 10,
                    },
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'humidity',
                        value: 80
                    }
                ]
            }
        ]);
    }
);

test(
    'parseRuleFilter should return an OR container with two expressions',
    () => {
        const filter: RuleFilter = {
            '_or': [
                {temperature: 10},
                {humidity: 80}
            ]
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'CONTAINER',
                type: 'OR',
                field: '_or',
                values: [
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'temperature',
                        value: 10,
                    },
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'humidity',
                        value: 80
                    }
                ]
            }
        ]);
    }
);

test(
    'parseRuleFilter should return a AND container with two expressions',
    () => {
        const filter: RuleFilter = {
            '_and': [
                {temperature: 10},
                {humidity: 80}
            ]
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'CONTAINER',
                type: 'AND',
                field: '_and',
                values: [
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'temperature',
                        value: 10,
                    },
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'humidity',
                        value: 80
                    }
                ]
            }
        ]);
    }
);

test(
    'parseRuleFilter should parse complex expressions with a valid response',
    () => {
        const coords: Geometry = {_geometry: {type: 'Point', coordinates: [1, 1]}};
        const filter: RuleFilter = {
            temperature: {'_lt': 8},
            humidity: {'_gte': 80},
            winSpeed: 3,
            '_and': [
                {sensorId: '123456'},
                {sensorType: 'meteo1'}
            ],
            '_or': [
                {'_and': [{temperature: 10}, {humidity: 40}]},
                {'_and': [{temperature: {'_lt': 10}}, {humidity: {'_gt': 40}}]},
                {windSpeed: {'_gt': 25}}
            ],
            location: {'_near': coords}
        };

        expect(parseRuleFilter(filter)).toEqual([
            {
                model: 'EXPRESSION',
                type: 'COMPARATOR',
                operator: 'LT',
                field: 'temperature',
                value: 8,
            },
            {
                model: 'EXPRESSION',
                type: 'COMPARATOR',
                operator: 'GTE',
                field: 'humidity',
                value: 80,
            },
            {
                model: 'EXPRESSION',
                type: 'DEFAULT',
                field: 'winSpeed',
                value: 3,
            },
            {
                model: 'CONTAINER',
                type: 'AND',
                field: '_and',
                values: [
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'sensorId',
                        value: '123456',
                    },
                    {
                        model: 'EXPRESSION',
                        type: 'DEFAULT',
                        field: 'sensorType',
                        value: 'meteo1'
                    }
                ]
            },
            {
                model: 'CONTAINER',
                type: 'OR',
                field: '_or',
                values: [
                    {
                        model: 'CONTAINER',
                        type: 'AND',
                        field: '_and',
                        values: [
                            {
                                model: 'EXPRESSION',
                                type: 'DEFAULT',
                                field: 'temperature',
                                value: 10
                            },
                            {
                                model: 'EXPRESSION',
                                type: 'DEFAULT',
                                field: 'humidity',
                                value: 40
                            }
                        ]
                    },
                    {
                        model: 'CONTAINER',
                        type: 'AND',
                        field: '_and',
                        values: [
                            {
                                model: 'EXPRESSION',
                                type: 'COMPARATOR',
                                field: 'temperature',
                                operator: 'LT',
                                value: 10,
                            },
                            {
                                model: 'EXPRESSION',
                                type: 'COMPARATOR',
                                field: 'humidity',
                                operator: 'GT',
                                value: 40
                            }
                        ]
                    },
                    {
                        model: 'EXPRESSION',
                        type: 'COMPARATOR',
                        operator: 'GT',
                        field: 'windSpeed',
                        value: 25
                    }
                ]
            },
            {
                model: 'EXPRESSION',
                type: 'GEO',
                operator: 'NEAR',
                field: 'location',
                value: coords,
            },
        ]);
    }
);