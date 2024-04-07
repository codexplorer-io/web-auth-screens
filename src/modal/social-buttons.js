import React, { useMemo } from 'react';
import styled from 'styled-components';
import { unregisterIcons, registerIcons } from '@fluentui/react/lib/Styling';
import FontAwesome6 from 'react-native-vector-icons/dist/FontAwesome6';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { useAuthenticationStateActions } from '@codexporer.io/expo-amplify-auth';
import { useScreenEvents } from '../screen-events';
import {
    useWebAuthModalState,
    MODAL_SCREEN
} from './store';

export const URL_REDIRECT_KEY = '@codexporer.io/web-auth-screens/social-redirect-url';

unregisterIcons(['GoogleSignInModal', 'AppleSignInModal']);

registerIcons({
    icons: {
        GoogleSignInModal: <FontAwesome6 name='google' brand />,
        AppleSignInModal: <FontAwesome6 name='apple' brand />
    }
});

export const ButtonWrapper = styled.div`
    button {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;

        .ms-Icon {
            & > div {
                font-size: 16px!important;
                line-height: 16px!important;
                display: block!important;
            }
    
            &[data-icon-name=AppleSignInModal] > div {
                font-size: 20px!important;
                line-height: 20px!important;
                margin-top: -2px;
            }
        }   
    }
`;

export const Spacer = styled.div`
    height: 8px;
`;

export const SocialButtons = () => {
    const { modalScreen } = useWebAuthModalState();
    const [,
        {
            signInWithGoogle,
            signInWithApple
        }
    ] = useAuthenticationStateActions();
    const {
        onSignInWithGoogle: onSignInWithGoogleEvent,
        onSignInWithApple: onSignInWithAppleEvent,
        onSignUpWithGoogle: onSignUpWithGoogleEvent,
        onSignUpWithApple: onSignUpWithAppleEvent
    } = useScreenEvents();

    const modalScreenEventsMap = useMemo(() => ({
        [MODAL_SCREEN.signIn]: {
            onContinueWithGoogle: onSignInWithGoogleEvent,
            onContinueWithApple: onSignInWithAppleEvent
        },
        [MODAL_SCREEN.signUp]: {
            onContinueWithGoogle: onSignUpWithGoogleEvent,
            onContinueWithApple: onSignUpWithAppleEvent
        }
    }), [
        onSignInWithAppleEvent,
        onSignInWithGoogleEvent,
        onSignUpWithAppleEvent,
        onSignUpWithGoogleEvent
    ]);

    const handleContinueWithGoogle = () => {
        sessionStorage.setItem(URL_REDIRECT_KEY, window.location.href);
        signInWithGoogle();
        modalScreenEventsMap[modalScreen].onContinueWithGoogle();
    };

    const handleContinueWithApple = () => {
        sessionStorage.setItem(URL_REDIRECT_KEY, window.location.href);
        signInWithApple();
        modalScreenEventsMap[modalScreen].onContinueWithApple();
    };

    return (
        <ButtonWrapper>
            <Spacer />
            <DefaultButton
                text='Continue with Google'
                iconProps={{ iconName: 'GoogleSignInModal' }}
                onClick={handleContinueWithGoogle}
            />
            <Spacer />
            <DefaultButton
                text='Continue with Apple'
                iconProps={{ iconName: 'AppleSignInModal' }}
                onClick={handleContinueWithApple}
            />
            <Spacer />
        </ButtonWrapper>
    );
};
