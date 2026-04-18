import React, { useEffect, useMemo, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { Todo } from './types/Todo';
import { getTodos, getUser } from './api';
import { User } from './types/User';
import { ModalProvider } from './components/ModalContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './app/store';
import { setTodos } from './features/todos';
import { setCurrentTodo } from './features/currentTodo';
import { setQuery, setStatus } from './features/filter';

export const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector((state: RootState) => state.todos);
  const todoForSelectUser = useSelector(
    (state: RootState) => state.currentTodo,
  );
  const { status, query } = useSelector((state: RootState) => state.filter);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorUserMessage, setErrorUserMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    getTodos()
      .then(newData => dispatch(setTodos(newData)))
      .catch(error =>
        setErrorMessage(new Error(`todo data loading error: ${error}`).message),
      )
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  const onSelectOption = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setStatus(event.target.value as 'all' | 'completed' | 'active'));
  };

  const onChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setQuery(event.target.value));
  };

  const onClearSearch = () => dispatch(setQuery(''));

  const filteredTodos = useMemo(() => {
    let result = [...todos];

    switch (status) {
      case 'completed':
        result = result.filter(todo => todo.completed);
        break;
      case 'active':
        result = result.filter(todo => !todo.completed);
        break;
      default:
        break;
    }

    if (query.trim()) {
      result = result.filter(todo =>
        todo.title.toLowerCase().includes(query.toLowerCase()),
      );
    }

    return result;
  }, [status, todos, query]);

  const onOpenModal = (userId: number, todo: Todo) => {
    getUser(userId)
      .then(userData => setUser(userData))
      .catch(error =>
        setErrorUserMessage(
          new Error(`User data loading error: ${error}`).message,
        ),
      );
    dispatch(setCurrentTodo(todo));
  };

  const onCloseModal = () => {
    dispatch(setCurrentTodo(null));
    setUser(null);
  };

  return (
    <ModalProvider>
      <div className="section">
        <div className="container">
          <div className="box">
            <h1 className="title">Todos:</h1>

            <div className="block">
              <TodoFilter
                onSelectOption={onSelectOption}
                onChangeInput={onChangeInput}
                onClearSearch={onClearSearch}
                valueInput={query}
              />
            </div>

            <div className="block">
              {isLoading && <Loader />}
              {errorMessage || (
                <TodoList
                  todos={filteredTodos}
                  onOpenModal={onOpenModal}
                  errorUser={errorUserMessage}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {errorUserMessage ? (
        <>{alert('User data loading error, please relod peage')}</>
      ) : (
        todoForSelectUser && (
          <TodoModal
            user={user}
            todo={todoForSelectUser}
            onCloseModal={onCloseModal}
          />
        )
      )}
    </ModalProvider>
  );
};
