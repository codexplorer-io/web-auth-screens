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

export const SignUpModalContent = () => {
    const { modalScreen } = useWebAuthModalState();
    const {
        changeModalScreen,
        setMessageBarState,
        setIsLoading,
        setScreenParams
    } = useWebAuthModalActions();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);

    const [isDisabledSignUp, setIsDisabledSignUp] = useState(true);

    const {
        onSignUpScreenDisplay,
        onSignUpWithUsernameStart,
        onSignUpWithUsernameSuccess,
        onSignUpWithUsernameError
    } = useScreenEvents();

    const [, {
        signUpWithUsername
    }] = useAuthenticationStateActions();

    const screenDisplayDependenciesRef = useRef();
    screenDisplayDependenciesRef.current = { onSignUpScreenDisplay };
    useEffect(() => {
        const { onSignUpScreenDisplay } = screenDisplayDependenciesRef.current;
        if (modalScreen === MODAL_SCREEN.signUp) {
            onSignUpScreenDisplay();
        }
    }, [modalScreen]);

    useEffect(() => {
        setIsDisabledSignUp(!(username && password && confirmedPassword) ||
            isPasswordError ||
            isConfirmPasswordError);
    }, [username, password, confirmedPassword, isPasswordError, isConfirmPasswordError]);

    useEffect(() => {
        setIsPasswordError(password.length > 0 && password.length < 8);
        setIsConfirmPasswordError(confirmedPassword.length > 0 && confirmedPassword !== password);
    }, [password, confirmedPassword]);

    const handleVerifyEmail = () => {
        setMessageBarState({ messageBarState: null });
        changeModalScreen({ modalScreen: MODAL_SCREEN.verifyEmail });
    };

    const handleSignIn = () => {
        setMessageBarState({ messageBarState: null });
        changeModalScreen({ modalScreen: MODAL_SCREEN.signIn });
    };

    const handleSignUp = async () => {
        onSignUpWithUsernameStart();
        setIsDisabledSignUp(true);
        setMessageBarState({ messageBarState: null });
        setIsLoading({ isLoading: true });
        try {
            await signUpWithUsername({
                username: trim(username),
                password
            });
            setIsLoading({ isLoading: false });
            onSignUpWithUsernameSuccess();
            setMessageBarState({
                messageBarState: {
                    message: 'You have signed up successfully. Check your email for verification code and verify an email, before signing in.',
                    type: MessageBarType.success
                }
            });
            setScreenParams({ screenParams: { email: trim(username) } });
            changeModalScreen({ modalScreen: MODAL_SCREEN.verifyEmail });
        } catch (error) {
            setIsLoading({ isLoading: false });
            onSignUpWithUsernameError(error);
            setMessageBarState({
                messageBarState: {
                    message: 'Sign up failed. Check input fields or try again later.',
                    type: MessageBarType.error
                }
            });
            setIsDisabledSignUp(false);
        }
    };

    if (modalScreen !== MODAL_SCREEN.signUp) {
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
                errorMessage={isPasswordError ? 'Password must be at least 8 characters' : undefined}
                required
                type='password'
                canRevealPassword
            />
            <TextField
                label='Confirm Password'
                value={confirmedPassword}
                onChange={(event, value) => setConfirmedPassword(value)}
                errorMessage={isConfirmPasswordError ? 'Passwords do not match' : undefined}
                required
                type='password'
                canRevealPassword
            />
            <Spacer />
            <PrimaryButton
                text='Sign Up'
                onClick={handleSignUp}
                disabled={isDisabledSignUp}
            />
            <Stack horizontal horizontalAlign='space-between'>
                <ActionButton onClick={handleVerifyEmail}>
                    Verify Email
                </ActionButton>
                <ActionButton onClick={handleSignIn}>
                    Sign In
                </ActionButton>
            </Stack>
            <Separator>or</Separator>
            <SocialButtons />
        </Stack>
    );
};
