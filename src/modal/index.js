import { useEffect, useRef } from 'react';
import { useIsAuthenticated } from '@codexporer.io/expo-amplify-auth';
import {
    useWebAuthModalActions,
    useWebAuthModalState
} from './store';
import { URL_REDIRECT_KEY } from './social-buttons';

export { WebAuthModal } from './component';

export { useWebAuthModalActions };

export const useShowWebAuthModal = () => {
    const isAuthenticated = useIsAuthenticated();
    const { show, hide } = useWebAuthModalActions();
    const { isShown } = useWebAuthModalState();

    useEffect(() => {
        !isAuthenticated && !isShown && show({});
    }, [
        isAuthenticated,
        isShown,
        show
    ]);

    useEffect(() => {
        isAuthenticated && isShown && hide();
    }, [
        isAuthenticated,
        isShown,
        hide
    ]);
};

export const useRedirectToUrl = () => {
    const isAuthenticated = useIsAuthenticated();
    const urlRef = useRef(sessionStorage.getItem(URL_REDIRECT_KEY));

    useEffect(() => {
        const redirectUrl = urlRef.current;
        if (redirectUrl != null) {
            sessionStorage.removeItem(URL_REDIRECT_KEY);
        }

        if (isAuthenticated && redirectUrl) {
            window.location.href = redirectUrl;
        }
    }, [isAuthenticated]);
};
