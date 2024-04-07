import {
    createStore,
    createActionsHook,
    createStateHook
} from 'react-sweet-state';

export const MODAL_SCREEN = {
    signIn: 'signIn',
    signUp: 'signUp',
    forgotPassword: 'forgotPassword',
    verifyEmail: 'verifyEmail'
};

const initialState = {
    isShown: false,
    isModalDismissible: false,
    modalScreen: MODAL_SCREEN.signIn,
    isLoading: false,
    messageBarState: null,
    screenParams: null,
    onShow: null,
    onHide: null
};

export const Store = createStore({
    initialState,
    actions: {
        show: ({
            modalScreen = MODAL_SCREEN.signIn,
            isModalDismissible = false,
            onShow = null,
            onHide = null
        }) => ({ getState, setState }) => {
            const { isShown } = getState();
            if (isShown) {
                return;
            }

            setState({
                ...initialState,
                isShown: true,
                modalScreen,
                isModalDismissible,
                onShow,
                onHide
            });
            onShow?.();
        },
        changeModalScreen: ({ modalScreen }) => ({ setState }) => {
            setState({ modalScreen });
        },
        setScreenParams: ({ screenParams }) => ({ setState }) => {
            setState({ screenParams });
        },
        setIsLoading: ({ isLoading }) => ({ setState }) => {
            setState({ isLoading });
        },
        setMessageBarState: ({ messageBarState }) => ({ setState }) => {
            setState({ messageBarState });
        },
        hide: () => ({ getState, setState }) => {
            const { isShown, onHide } = getState();
            if (!isShown) {
                return;
            }

            setState({
                isShown: false,
                onOpen: null,
                onClose: null
            });
            onHide?.();
        }
    },
    name: 'WebAuthModal'
});

export const useWebAuthModalState = createStateHook(Store);

export const useWebAuthModalActions = createActionsHook(Store);
