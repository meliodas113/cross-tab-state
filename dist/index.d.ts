import * as react from 'react';

declare function useCrossTabState<T>(key: string, initialValue: T): readonly [T, (value: T | ((prev: T) => T)) => void];

declare function useCrossTabReducer<R extends React.Reducer<any, any>>(key: string, reducer: R, initialState: React.ReducerState<R>): readonly [react.ReducerState<R>, (action: React.ReducerAction<R>) => void];

export { useCrossTabReducer, useCrossTabState };
