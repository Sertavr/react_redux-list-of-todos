import React from 'react';
import { options } from '../../constants/constants';
import { setStatus } from '../../features/filter';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

export const Select: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(state => state.filter);

  const onSelectOption = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setStatus(event.target.value as 'all' | 'completed' | 'active'));
  };

  return (
    <select data-cy="statusSelect" onChange={onSelectOption} value={status}>
      {options.map(option => {
        const [value, name] = option;

        return (
          <option key={value} value={value}>
            {name}
          </option>
        );
      })}
    </select>
  );
};
