import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import FairOS from "../../service/FairOS";
import {setActiveItem} from "../catalog/catalogSlice";

const initialState = {
    status: 'idle',
    statusText: '',
    isLoggedIn: false,
    username: '',
    password: '',
    pod: '',
    kv: ''
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const login = createAsyncThunk(
    'user/login',
    async ({username, password}, {dispatch}) => {
        const fairOS = new FairOS();
        const data = await fairOS.login(username, password);
        localStorage.setItem('osm_username', username);
        localStorage.setItem('osm_password', password);
        const isLoggedIn = data.code === 200;
        dispatch(setUser({username, password, isLoggedIn}));

        return isLoggedIn;
    }
);

export const tryLogin = createAsyncThunk(
    'user/tryLogin',
    async (params, {dispatch}) => {
        const fairOS = new FairOS();
        const username = localStorage.getItem('osm_username');
        const password = localStorage.getItem('osm_username');
        let activeMap = localStorage.getItem('osm_active');
        if (!username || !password) {
            return false;
        }

        const data = await fairOS.login(username, password);
        const isLoggedIn = data.code === 200;
        if (isLoggedIn && activeMap) {
            activeMap = JSON.parse(activeMap);
            await fairOS.podOpen(activeMap.pod, password);
            await fairOS.kvOpen(activeMap.kv);
            window._fair_pod = activeMap.pod;
            window._fair_kv = activeMap.kv;
            dispatch(setActiveItem(activeMap));
        }

        dispatch(setUser({username, password, isLoggedIn}));

        return isLoggedIn;
    }
);

export const userSlice = createSlice({
    name: 'user',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        setUser: (state, action) => {
            const {isLoggedIn, username, password, pod, kv} = action.payload;
            state.isLoggedIn = !!isLoggedIn;
            state.username = username;
            state.password = password;
            state.pod = pod;
            state.kv = kv;
        },
        fullReset: (state) => {
            state.isLoggedIn = false;
            state.username = '';
            state.password = '';
            state.pod = '';
            state.kv = '';
        },
        resetStatus: (state) => {
            state.status = '';
            state.statusText = '';
        }
    },
    // The `extraReducers` field lets the slice handle actions defined elsewhere,
    // including actions generated by createAsyncThunk or in other slices.
    extraReducers: (builder) => {
        builder
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'idle';
            })
            .addCase(login.pending, (state) => {
                state.status = 'login';
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'error';
                state.statusText = action.error.message;
            })

            .addCase(tryLogin.fulfilled, (state, action) => {
                state.status = 'idle';
            })
            .addCase(tryLogin.pending, (state) => {
                state.status = 'login';
            })
            .addCase(tryLogin.rejected, (state, action) => {
                state.status = 'error';
            });
    },
});

export const {setUser, resetStatus, fullReset} = userSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// export const selectCount = (state) => state.user.value;
export const selectUser = (state) => state.user;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const logout = () => (dispatch) => {
    dispatch(fullReset());
    dispatch(setActiveItem(null));
    localStorage.setItem('osm_username', '');
    localStorage.setItem('osm_password', '');
    localStorage.setItem('osm_active', '');
};

export default userSlice.reducer;
