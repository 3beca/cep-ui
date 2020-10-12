import {
    parseRuleFilter,
    getComparatorValue,
    createANDContainer,
    createORContainer,
    createExpresion,
    parseFilterContainer,
    synchronizeRuleFilterContainerAndEventPayload
} from './utils';
import { RuleFilter, RuleFilterComparator, Geometry, RuleFilterComparatorLocation } from '../../services/api/models';
import { Container, DEFAULT_RULEFILTERCONTAINER, DEFAULT_RULEFILTEREXPRESSION, Expression, RuleFilterContainer } from './models';
import { EventPayload } from '../event-payload-creator/models';

test('getComparatorValue shuold return each type of Comparator', () => {
    expect(getComparatorValue(({ _hs: 10 } as unknown) as RuleFilterComparator)).toEqual({ name: 'EQ', value: '' });
    expect(getComparatorValue({ _eq: 10 })).toEqual({ name: 'EQ', value: 10 });
    expect(getComparatorValue({ _eq: '10' })).toEqual({
        name: 'EQ',
        value: '10'
    });
    expect(getComparatorValue({ _gt: 10 })).toEqual({ name: 'GT', value: 10 });
    expect(getComparatorValue({ _gte: '10' })).toEqual({
        name: 'GTE',
        value: '10'
    });
    expect(getComparatorValue({ _lt: 10 })).toEqual({ name: 'LT', value: 10 });
    expect(getComparatorValue({ _lte: '10' })).toEqual({
        name: 'LTE',
        value: '10'
    });
    const location: Geometry = {
        _geometry: { type: 'Point', coordinates: [1, 1] }
    };
    expect(getComparatorValue({ _near: location })).toEqual({
        name: 'NEAR',
        value: location
    });
});
test('parseRuleFilter should return a Passthrow expression', () => {
    const filter: RuleFilter = {};

    expect(parseRuleFilter(filter)).toEqual(DEFAULT_RULEFILTERCONTAINER);
});

test('parseRuleFilter should return a default expression', () => {
    const filter: RuleFilter = {
        temperature: 10
    };

    expect(parseRuleFilter(filter)).toEqual([
        {
            model: 'EXPRESSION',
            type: 'DEFAULT',
            field: 'temperature',
            value: 10
        }
    ]);
});

test('parseRuleFilter should return two default expressions', () => {
    const filter: RuleFilter = {
        temperature: 10,
        humidity: 70
    };

    expect(parseRuleFilter(filter)).toEqual([
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
            value: 70
        }
    ]);
});

test('parseRuleFilter should return a comaprator expression', () => {
    const filter: RuleFilter = {
        temperature: { _lt: 10 }
    };

    expect(parseRuleFilter(filter)).toEqual([
        {
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            field: 'temperature',
            value: 10
        }
    ]);
});

test('parseRuleFilter should return a expression with a DEFAULT if operator do not exist', () => {
    const filter: RuleFilter = {
        temperature: { _hs: 10 }
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
                    field: '_hs',
                    value: 10
                }
            ]
        }
    ]);
});

test('parseRuleFilter should return a location expresion', () => {
    const location: Geometry = {
        _geometry: { type: 'Point', coordinates: [1, 1] }
    };
    const filter: RuleFilter = {
        location: { _near: location }
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
});

test('parseRuleFilter should return a expression with a container with two expressions', () => {
    const filter: RuleFilter = ({
        temperature: {
            temperature: 10,
            humidity: undefined
        }
    } as unknown) as RuleFilter;

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
                    value: 10
                },
                {
                    model: 'EXPRESSION',
                    type: 'PASSTHROW',
                    field: 'humidity'
                }
            ]
        }
    ]);
});

test('parseRuleFilter should return a container with with two expressions inside a field of array', () => {
    const filter: RuleFilter = {
        temperature: [{ temperature: 10 }, { humidity: 80 }]
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
                    value: 10
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
});

test('parseRuleFilter should return a container with with two expressions inside RuleFilter', () => {
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
                    value: 10
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
});

test('parseRuleFilter should return an OR container with two expressions', () => {
    const filter: RuleFilter = {
        _or: [{ temperature: 10 }, { humidity: 80 }]
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
                    value: 10
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
});

test('parseRuleFilter should return a AND container with two expressions', () => {
    const filter: RuleFilter = {
        _and: [{ temperature: 10 }, { humidity: 80 }]
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
                    value: 10
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
});

test('parseRuleFilter should parse complex expressions with a valid response', () => {
    const coords: Geometry = {
        _geometry: { type: 'Point', coordinates: [1, 1] }
    };
    const filter: RuleFilter = {
        temperature: { _lt: 8 },
        humidity: { _gte: 80 },
        winSpeed: 3,
        _and: [{ sensorId: '123456' }, { sensorType: 'meteo1' }],
        _or: [
            { _and: [{ temperature: 10 }, { humidity: 40 }] },
            { _and: [{ temperature: { _lt: 10 } }, { humidity: { _gt: 40 } }] },
            { windSpeed: { _gt: 25 } }
        ],
        location: { _near: coords }
    };

    expect(parseRuleFilter(filter)).toEqual([
        {
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            field: 'temperature',
            value: 8
        },
        {
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GTE',
            field: 'humidity',
            value: 80
        },
        {
            model: 'EXPRESSION',
            type: 'DEFAULT',
            field: 'winSpeed',
            value: 3
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
                    value: '123456'
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
                            value: 10
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
            value: coords
        }
    ]);
});

test('createANDContainer should return a container with AND', () => {
    const expectedANDContainer: Container = {
        model: 'CONTAINER',
        type: 'AND',
        field: '_and',
        values: []
    };
    expect(createANDContainer()).toEqual(expectedANDContainer);
});

test('createOrContainer should return a container with OR', () => {
    const expectedORContainer: Container = {
        model: 'CONTAINER',
        type: 'OR',
        field: '_or',
        values: []
    };
    expect(createORContainer()).toEqual(expectedORContainer);
});

test('createExpresion should return a EXPRESION default with number', () => {
    const fieldName = 'fieldName';
    const value = 25;
    const expectedORContainer: Expression = {
        model: 'EXPRESSION',
        type: 'DEFAULT',
        field: fieldName,
        value
    };
    expect(createExpresion(fieldName, value)).toEqual(expectedORContainer);
});

test('createExpresion should return a EXPRESION default with string', () => {
    const fieldName = 'type';
    const value = 'temperature';
    const expectedExpression: Expression = {
        model: 'EXPRESSION',
        type: 'DEFAULT',
        field: fieldName,
        value
    };
    expect(createExpresion(fieldName, value)).toEqual(expectedExpression);
});

test('createExpresion should return a EXPRESION passthrow when no arguments', () => {
    const expectedExpression: Expression = DEFAULT_RULEFILTEREXPRESSION;
    expect(createExpresion()).toEqual(expectedExpression);
});

test('createExpresion should return a EXPRESION passthrow when only receive fieldname', () => {
    const fieldName = 'type';
    const expectedExpression: Expression = {
        model: 'EXPRESSION',
        type: 'PASSTHROW',
        field: fieldName
    };
    expect(createExpresion(fieldName)).toEqual(expectedExpression);
});

test('parseFilterContainer should return a Passthrow rule filter from a invalid filter container', () => {
    const invalidContainer = {} as RuleFilterContainer;
    expect(parseFilterContainer(invalidContainer)).toEqual({});
});

test('parseFilterContainer should return a Passthrow rule filter from a null filter container', () => {
    const invalidContainer = (null as unknown) as RuleFilterContainer;
    expect(parseFilterContainer(invalidContainer)).toEqual({});
});

test('parseFilterContainer should return a Passthrow rule filter from a undefined filter container', () => {
    const invalidContainer = (undefined as unknown) as RuleFilterContainer;
    expect(parseFilterContainer(invalidContainer)).toEqual({});
});

test('parseFilterContainer should return a Passthrow rule filter from a passthrow filter container', () => {
    const filter: RuleFilter = {};
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});
test('parseFilterContainer should return a Default rule filter from a default filter container', () => {
    const filter: RuleFilter = { type: 'temperature' };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});
test('parseFilterContainer should return a comparator rule filter from a comparator filter container', () => {
    const filter: RuleFilter = { temperatue: { _gt: 25 } };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});
test('parseFilterContainer should return a location comparator rule filter from a lcoation comparator filter container', () => {
    const filter: RuleFilter = {
        location: {
            _near: {
                _geometry: { type: 'Point', coordinates: [100, 200] },
                _minDistance: 300,
                _maxDistance: 400
            }
        }
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});
test('parseFilterContainer should return a location comparator rule filter from a lcoation comparator filter container only coords', () => {
    const filter: RuleFilter = {
        location: {
            _near: {
                _geometry: { type: 'Point', coordinates: [100, 200] }
            }
        }
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});
test('parseFilterContainer should return a location comparator rule filter from a lcoation comparator filter container only max distance', () => {
    const filter: RuleFilter = {
        location: {
            _near: {
                _geometry: { type: 'Point', coordinates: [100, 200] },
                _maxDistance: 400
            }
        }
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});
test('parseFilterContainer should return a location comparator rule filter from a lcoation comparator filter container only min distance', () => {
    const filter: RuleFilter = {
        location: {
            _near: {
                _geometry: { type: 'Point', coordinates: [100, 200] },
                _minDistance: 300
            }
        }
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});
test('parseFilterContainer should return a  valid rule filter from a filter container with type, value and location', () => {
    const location: RuleFilterComparatorLocation = {
        _near: {
            _geometry: { type: 'Point', coordinates: [100, 200] },
            _minDistance: 300
        }
    };
    const filter: RuleFilter = {
        type: 'temperature',
        value: { _lte: 0 },
        location
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});

test('parseFilterContainer should return an AND rule filter from a filter AND container with type, value and location', () => {
    const location: RuleFilterComparatorLocation = {
        _near: {
            _geometry: { type: 'Point', coordinates: [100, 200] },
            _minDistance: 300
        }
    };
    const filter: RuleFilter = {
        _and: [{ type: 'temperature' }, { value: { _lte: 0 } }, { location }]
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});

test('parseFilterContainer should return an OR rule filter from a filter AND container with type, value and location', () => {
    const location: RuleFilterComparatorLocation = {
        _near: {
            _geometry: { type: 'Point', coordinates: [100, 200] },
            _minDistance: 300
        }
    };
    const filter: RuleFilter = {
        _or: [{ type: 'temperature' }, { value: { _lte: 0 } }, { location }]
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});

test('parseFilterContainer should return an nested rule filter from a filter nested container with type, value and location', () => {
    const location: RuleFilterComparatorLocation = {
        _near: {
            _geometry: { type: 'Point', coordinates: [100, 200] },
            _minDistance: 300
        }
    };
    const filter: RuleFilter = {
        _or: [
            {
                _and: [{ type: 'temperature' }, { value: { _lte: 0 } }, { location }]
            },
            {
                _or: [{ type: 'temperature' }, { value: { _lte: 0 } }, { location }]
            }
        ]
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});

test('parseFilterContainer should return an nested rule filter with expressions from a filter nested container with type, value and location', () => {
    const location: RuleFilterComparatorLocation = {
        _near: {
            _geometry: { type: 'Point', coordinates: [100, 200] },
            _minDistance: 300
        }
    };
    const filter: RuleFilter = {
        type: 'humidity',
        value: { _gte: 75 },
        _or: [
            { type: 'windspeed' },
            {
                _and: [{ type: 'temperature' }, { value: { _lte: 0 } }, { location }]
            },
            {
                _or: [{ type: 'temperature' }, { value: { _lte: 0 } }, { location }]
            }
        ]
    };
    expect(parseFilterContainer(parseRuleFilter(filter))).toEqual(filter);
});

test('synchronizeRuleFilterContainerAndEventPayload should return default RuleFilterContainer when no EventPayload', () => {
    const defaultRulefilterContainer: RuleFilterContainer = DEFAULT_RULEFILTERCONTAINER;

    expect(synchronizeRuleFilterContainerAndEventPayload(null, [])).toEqual(defaultRulefilterContainer);
    expect(
        synchronizeRuleFilterContainerAndEventPayload((undefined as unknown) as EventPayload, (null as unknown) as RuleFilterContainer)
    ).toEqual(defaultRulefilterContainer);
    expect(
        synchronizeRuleFilterContainerAndEventPayload((undefined as unknown) as EventPayload, (undefined as unknown) as RuleFilterContainer)
    ).toEqual(defaultRulefilterContainer);
    expect(synchronizeRuleFilterContainerAndEventPayload(null, defaultRulefilterContainer)).toEqual(defaultRulefilterContainer);
});

test('synchronizeRuleFilterContainerAndEventPayload should return the same RuleFilterContainer', () => {
    const payload: EventPayload = [
        { type: 'number', name: 'temperature' },
        { type: 'number', name: 'humidity' },
        { type: 'number', name: 'pressure' }
    ];

    const expectedRuleFilter: RuleFilterContainer = [
        {
            field: 'temperature',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'humidity',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'pressure',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'temperature',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        },
        {
            field: 'humidity',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        },
        {
            field: 'pressure',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        }
    ];

    expect(synchronizeRuleFilterContainerAndEventPayload(payload, expectedRuleFilter)).toEqual(expectedRuleFilter);
});

test('synchronizeRuleFilterContainerAndEventPayload should remove temperature from RuleFilterContainer', () => {
    const payload: EventPayload = [
        { type: 'number', name: 'humidity' },
        { type: 'number', name: 'pressure' }
    ];

    const ruleFilter: RuleFilterContainer = [
        {
            field: 'temperature',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'humidity',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'pressure',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'temperature',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        },
        {
            field: 'humidity',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        },
        {
            field: 'pressure',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        }
    ];

    const expectedRuleFilter: RuleFilterContainer = [
        {
            field: 'humidity',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'pressure',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'humidity',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        },
        {
            field: 'pressure',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        }
    ];

    expect(synchronizeRuleFilterContainerAndEventPayload(payload, ruleFilter)).toEqual(expectedRuleFilter);
});

test('synchronizeRuleFilterContainerAndEventPayload should return default RuleFilterContainer when RuleFilterContainer synced is empty', () => {
    const payload: EventPayload = [
        { type: 'number', name: 'humidity' },
        { type: 'number', name: 'pressure' }
    ];

    const ruleFilter: RuleFilterContainer = [
        {
            field: 'temperature',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'LT',
            value: 15
        },
        {
            field: 'temperature',
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: 'GT',
            value: 1
        }
    ];

    const expectedRuleFilter: RuleFilterContainer = DEFAULT_RULEFILTERCONTAINER;

    expect(synchronizeRuleFilterContainerAndEventPayload(payload, ruleFilter)).toEqual(expectedRuleFilter);
});

test('synchronizeRuleFilterContainerAndEventPayload should return default RuleFilterContainer when nested RuleFilterContainer synced is empty', () => {
    const payload: EventPayload = [
        { type: 'number', name: 'humidity' },
        { type: 'number', name: 'pressure' }
    ];

    const ruleFilter: RuleFilterContainer = [
        {
            model: 'CONTAINER',
            type: 'DEFAULT',
            field: '_and',
            values: [
                {
                    field: 'temperature',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    field: 'temperature',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'GT',
                    value: 1
                }
            ]
        }
    ];

    const expectedRuleFilter: RuleFilterContainer = [
        {
            model: 'CONTAINER',
            type: 'DEFAULT',
            field: '_and',
            values: []
        }
    ];

    expect(synchronizeRuleFilterContainerAndEventPayload(payload, ruleFilter)).toEqual(expectedRuleFilter);
});

test('synchronizeRuleFilterContainerAndEventPayload should remove temperature from RuleFilterContainer', () => {
    const payload: EventPayload = [
        { type: 'number', name: 'humidity' },
        { type: 'number', name: 'pressure' }
    ];

    const ruleFilter: RuleFilterContainer = [
        {
            model: 'CONTAINER',
            field: '_and',
            type: 'AND',
            values: [
                {
                    field: 'temperature',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    field: 'humidity',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    field: 'pressure',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                }
            ]
        },
        {
            model: 'CONTAINER',
            field: '_or',
            type: 'OR',
            values: [
                {
                    model: 'CONTAINER',
                    field: '_and',
                    type: 'AND',
                    values: [
                        {
                            field: 'temperature',
                            model: 'EXPRESSION',
                            type: 'COMPARATOR',
                            operator: 'LT',
                            value: 15
                        }
                    ]
                },
                {
                    field: 'humidity',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    field: 'pressure',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    model: 'CONTAINER',
                    field: '_or',
                    type: 'OR',
                    values: [
                        {
                            field: 'temperature',
                            model: 'EXPRESSION',
                            type: 'COMPARATOR',
                            operator: 'LT',
                            value: 15
                        },
                        {
                            field: 'humidity',
                            model: 'EXPRESSION',
                            type: 'COMPARATOR',
                            operator: 'LT',
                            value: 15
                        },
                        {
                            field: 'pressure',
                            model: 'EXPRESSION',
                            type: 'COMPARATOR',
                            operator: 'LT',
                            value: 15
                        }
                    ]
                }
            ]
        },
        {
            model: 'CONTAINER',
            field: '',
            type: 'DEFAULT',
            values: [
                {
                    field: 'temperature',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                }
            ]
        }
    ];

    const expectedRuleFilter: RuleFilterContainer = [
        {
            model: 'CONTAINER',
            field: '_and',
            type: 'AND',
            values: [
                {
                    field: 'humidity',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    field: 'pressure',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                }
            ]
        },
        {
            model: 'CONTAINER',
            field: '_or',
            type: 'OR',
            values: [
                {
                    model: 'CONTAINER',
                    field: '_and',
                    type: 'AND',
                    values: []
                },
                {
                    field: 'humidity',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    field: 'pressure',
                    model: 'EXPRESSION',
                    type: 'COMPARATOR',
                    operator: 'LT',
                    value: 15
                },
                {
                    model: 'CONTAINER',
                    field: '_or',
                    type: 'OR',
                    values: [
                        {
                            field: 'humidity',
                            model: 'EXPRESSION',
                            type: 'COMPARATOR',
                            operator: 'LT',
                            value: 15
                        },
                        {
                            field: 'pressure',
                            model: 'EXPRESSION',
                            type: 'COMPARATOR',
                            operator: 'LT',
                            value: 15
                        }
                    ]
                }
            ]
        },
        {
            model: 'CONTAINER',
            field: '',
            type: 'DEFAULT',
            values: []
        }
    ];

    expect(synchronizeRuleFilterContainerAndEventPayload(payload, ruleFilter)).toEqual(expectedRuleFilter);
});
