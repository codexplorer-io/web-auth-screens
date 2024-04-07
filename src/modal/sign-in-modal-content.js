import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import trim from 'lodash/trim';
import {
    ActionButton,
    PrimaryButton
} from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Separator } from '@fluentui/react/lib/Separator';
import { Stack } from '@fluentui/react/lib/Stack';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import { useAuthenticationStateActions } from '@codexporer.io/expo-amplify-auth';
import { useScreenEvents } from '../screen-events';
import { SocialButtons } from './social-buttons';
import {
    useWebAuthModalState,
    useWebAuthModalActions,
    MODAL_SCREEN
} from './store';

export const Spacer = styled.div`
    height: 8px;
`;

export const SignInModalContent = () => {
    const { modalScreen } = useWebAuthModalState();
    const {
        changeModalScreen,
        setMessageBarState,
        setIsLoading
    } = useWebAuthModalActions();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [isSignInDisabled, setIsSignInDisabled] = useState(true);

    const {
        onSignInScreenDisplay,
        onSignInWithUsernameStart,
        onSignInWithUsernameSuccess,
        onSignInWithUsernameError
    } = useScreenEvents();

    const [, {
        signInWithUsername
    }] = useAuthenticationStateActions();

    const screenDisplayDependenciesRef = useRef();
    screenDisplayDependenciesRef.current = { onSignInScreenDisplay };
    useEffect(() => {
        const { onSignInScreenDisplay } = screenDisplayDependenciesRef.current;
        if (modalScreen === MODAL_SCREEN.signIn) {
            onSignInScreenDisplay();
        }
    }, [modalScreen]);

    useEffect(() => {
        setIsSignInDisabled(!username || !password);
    }, [username, password]);

    const handleForgotPassword = () => {
        setMessageBarState({ messageBarState: null });
        changeModalScreen({ modalScreen: MODAL_SCREEN.forgotPassword });
    };

    const handleSignUp = () => {
        setMessageBarState({ messageBarState: null });
        changeModalScreen({ modalScreen: MODAL_SCREEN.signUp });
    };

    const handleSignIn = async () => {
        onSignInWithUsernameStart();
        setIsSignInDisabled(true);
        setIsLoading({ isLoading: true });
        try {
            await signInWithUsername({
                username: trim(username),
                password
            });
            onSignInWithUsernameSuccess();
            setMessageBarState({
                messageBarState: {
                    message: 'You have signed in successfully.',
                    type: MessageBarType.success
                }
            });
        } catch (error) {
            onSignInWithUsernameError(error);
            setIsLoading({ isLoading: false });

            let message = 'Check input fields or try again later.';

            if (error.code === 'UserNotFoundException' || error.code === 'NotAuthorizedException') {
                message = 'Incorrect username or password.';
            }

            if (error.code === 'UserNotConfirmedException') {
                message = 'Your email address is not verified. Verify email to continue.';
            }

            setMessageBarState({
                messageBarState: {
                    message: `Sign in failed. ${message}.`,
                    type: MessageBarType.error
                }
            });
            setIsSignInDisabled(!(username && password));
        }
    };

    if (modalScreen !== MODAL_SCREEN.signIn) {
        return null;
    }

    return (
        <Stack>
            <TextField
                label='Email'
                value={username}
                onChange={(event, value) => setUsername(value)}
                required
            />
            <TextField
                label='Password'
                value={password}
                onChange={(event, value) => setPassword(value)}
                required
                type='password'
                canRevealPassword
            />
            <Spacer />
            <PrimaryButton
                text='Sign In'
                onClick={handleSignIn}
                disabled={isSignInDisabled}
            />
            <Stack horizontal horizontalAlign='space-between'>
                <ActionButton onClick={handleForgotPassword}>
                    Forgot Password
                </ActionButton>
                <ActionButton onClick={handleSignUp}>
                    Sign Up
                </ActionButton>
            </Stack>
            <Separator>or</Separator>
            <SocialButtons />
        </Stack>
    );
};
