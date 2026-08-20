import { combineReducers, compose, createStore } from "redux";
import { userReducer } from "./reducers/user.reducer";

const rootReducer = combineReducers({
  userReducer: userReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(rootReducer, composeEnhancers());
