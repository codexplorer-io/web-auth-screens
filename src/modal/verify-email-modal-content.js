import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import trim from 'lodash/trim';
import {
    ActionButton,
    PrimaryButton
} from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack } from '@fluentui/react/lib/Stack';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import { useAuthenticationStateActions } from '@codexporer.io/expo-amplify-auth';
import { useScreenEvents } from '../screen-events';
import {
    useWebAuthModalState,
    useWebAuthModalActions,
    MODAL_SCREEN
} from './store';

export const Spacer = styled.div`
    height: 8px;
`;

export const VerifyEmailModalContent = () => {
    const { modalScreen, screenParams } = useWebAuthModalState();
    const { changeModalScreen, setIsLoading, setMessageBarState } = useWebAuthModalActions();

    const email = screenParams?.email;

    const [code, setCode] = useState('');
    const [username, setUsername] = useState('');

    const [isVerifyDisabled, setIsVerifyDisabled] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);

    const [, {
        confirmSignUpWithUsername,
        resendSignUpWithUsername
    }] = useAuthenticationStateActions();

    const {
        onVerifyEmailScreenDisplay,
        onVerifyEmailStart,
        onVerifyEmailSuccess,
        onVerifyEmailError,
        onVerifyEmailSendCodeStart,
        onVerifyEmailSendCodeSuccess,
        onVerifyEmailSendCodeError
    } = useScreenEvents();

    const screenDisplayDependenciesRef = useRef();
    screenDisplayDependenciesRef.current = { onVerifyEmailScreenDisplay };
    useEffect(() => {
        const { onVerifyEmailScreenDisplay } = screenDisplayDependenciesRef.current;
        if (modalScreen === MODAL_SCREEN.verifyEmail) {
            onVerifyEmailScreenDisplay();
        }
    }, [modalScreen]);

    useEffect(() => {
        email && setUsername(email);
    }, [email]);

    useEffect(() => {
        setIsResendDisabled(!username);
    }, [username]);

    useEffect(() => {
        setIsVerifyDisabled(!(username && code));
    }, [username, code]);

    const handleBackToSignUp = () => {
        setMessageBarState({ messageBarState: null });
        changeModalScreen({ modalScreen: MODAL_SCREEN.signUp });
    };

    const handleResendCode = async () => {
        onVerifyEmailSendCodeStart();
        setIsResendDisabled(true);
        setMessageBarState({ messageBarState: null });
        setIsLoading({ isLoading: true });
        try {
            await resendSignUpWithUsername({
                username: trim(username)
            });
            setIsLoading({ isLoading: false });
            onVerifyEmailSendCodeSuccess();
            setCode('');
            setMessageBarState({
                messageBarState: {
                    message: `Verification code has been sent to ${username}. Use the code to verify your email.`,
                    type: MessageBarType.success
                }
            });
        } catch (error) {
            setIsLoading({ isLoading: false });
            onVerifyEmailSendCodeError(error);
            setMessageBarState({
                messageBarState: {
                    message: 'Resend code failed. Check input fields or try again later.',
                    type: MessageBarType.error
                }
            });
        } finally {
            setIsResendDisabled(false);
        }
    };

    const handleVerifyEmail = async () => {
        onVerifyEmailStart();
        setIsVerifyDisabled(true);
        setMessageBarState({ messageBarState: null });
        setIsLoading({ isLoading: true });
        try {
            await confirmSignUpWithUsername({
                username: trim(username),
                code
            });
            setIsLoading({ isLoading: false });
            onVerifyEmailSuccess();
            setMessageBarState({
                messageBarState: {
                    message: 'Your email has been verified successfully. You can sign in with your email and password.',
                    type: MessageBarType.success
                }
            });
            changeModalScreen({ modalScreen: MODAL_SCREEN.signIn });
        } catch (error) {
            setIsLoading({ isLoading: false });
            onVerifyEmailError(error);
            setMessageBarState({
                messageBarState: {
                    message: 'Email verification failed. Resend code or try again later.',
                    type: MessageBarType.error
                }
            });
            setIsVerifyDisabled(false);
        }
    };

    if (modalScreen !== MODAL_SCREEN.verifyEmail) {
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
            <Spacer />
            <PrimaryButton
                text='Send Code'
                onClick={handleResendCode}
                disabled={isResendDisabled}
            />
            <TextField
                label='Code'
                value={code}
                onChange={(event, value) => setCode(value)}
                required
            />
            <Spacer />
            <PrimaryButton
                text='Reset Password'
                onClick={handleVerifyEmail}
                disabled={isVerifyDisabled}
            />
            <Stack horizontal horizontalAlign='space-between'>
                <ActionButton onClick={handleBackToSignUp}>
                    Back to Sign Up
                </ActionButton>
            </Stack>
        </Stack>
    );
};
