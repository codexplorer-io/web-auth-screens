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

export const ForgotPasswordModalContent = () => {
    const { modalScreen } = useWebAuthModalState();
    const { changeModalScreen, setIsLoading, setMessageBarState } = useWebAuthModalActions();

    const [username, setUsername] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');

    const [isSendCodeDisabled, setIsSendCodeDisabled] = useState(false);
    const [isResetDisabled, setIsResetDisabled] = useState(true);
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(false);

    const [, {
        forgotPasswordWithUsername,
        forgotPasswordSubmitWithUsername
    }] = useAuthenticationStateActions();

    const {
        onForgotPasswordScreenDisplay,
        onForgotPasswordSendCodeStart,
        onForgotPasswordSendCodeSuccess,
        onForgotPasswordSendCodeError,
        onForgotPasswordResetStart,
        onForgotPasswordResetSuccess,
        onForgotPasswordResetError
    } = useScreenEvents();

    const screenDisplayDependenciesRef = useRef();
    screenDisplayDependenciesRef.current = { onForgotPasswordScreenDisplay };
    useEffect(() => {
        const { onForgotPasswordScreenDisplay } = screenDisplayDependenciesRef.current;
        if (modalScreen === MODAL_SCREEN.forgotPassword) {
            onForgotPasswordScreenDisplay();
        }
    }, [modalScreen]);

    useEffect(() => {
        setIsSendCodeDisabled(!username);
    }, [username]);

    useEffect(() => {
        setIsResetDisabled(!(username && code && password && confirmedPassword) ||
            isPasswordError ||
            isConfirmPasswordError);
    }, [username, code, password, confirmedPassword, isPasswordError, isConfirmPasswordError]);

    useEffect(() => {
        setIsPasswordError(password.length > 0 && password.length < 8);
        setIsConfirmPasswordError(confirmedPassword.length > 0 && confirmedPassword !== password);
    }, [password, confirmedPassword]);

    const handleBackToSignIn = () => {
        setMessageBarState({ messageBarState: null });
        changeModalScreen({ modalScreen: MODAL_SCREEN.signIn });
    };

    const handleSendCode = async () => {
        onForgotPasswordSendCodeStart();
        setIsSendCodeDisabled(true);
        setMessageBarState({ messageBarState: null });
        setIsLoading({ isLoading: true });
        try {
            await forgotPasswordWithUsername({
                username: trim(username)
            });
            setIsLoading({ isLoading: false });
            onForgotPasswordSendCodeSuccess();
            setCode('');
            setMessageBarState({
                messageBarState: {
                    message: `Verification code has been sent to ${username}. Use the code to reset your password.`,
                    type: MessageBarType.success
                }
            });
        } catch (error) {
            setIsLoading({ isLoading: false });
            onForgotPasswordSendCodeError(error);
            setMessageBarState({
                messageBarState: {
                    message: 'Send code failed. Check input fields or try again later.',
                    type: MessageBarType.error
                }
            });
        } finally {
            setIsSendCodeDisabled(false);
        }
    };

    const handleResetPassword = async () => {
        onForgotPasswordResetStart();
        setIsResetDisabled(true);
        setMessageBarState({ messageBarState: null });
        setIsLoading({ isLoading: true });
        try {
            await forgotPasswordSubmitWithUsername({
                username: trim(username),
                code,
                password
            });
            setIsLoading({ isLoading: false });
            onForgotPasswordResetSuccess();
            setMessageBarState({
                messageBarState: {
                    message: 'Your password has been reset successfully.',
                    type: MessageBarType.success
                }
            });
            changeModalScreen({ modalScreen: MODAL_SCREEN.signIn });
        } catch (error) {
            setIsLoading({ isLoading: false });
            onForgotPasswordResetError(error);
            setMessageBarState({
                messageBarState: {
                    message: 'Reset password failed. Resend code or try again later.',
                    type: MessageBarType.error
                }
            });
            setIsResetDisabled(false);
        }
    };

    if (modalScreen !== MODAL_SCREEN.forgotPassword) {
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
                onClick={handleSendCode}
                disabled={isSendCodeDisabled}
            />
            <TextField
                label='Code'
                value={code}
                onChange={(event, value) => setCode(value)}
                required
            />
            <TextField
                label='New Password'
                value={password}
                onChange={(event, value) => setPassword(value)}
                required
                type='password'
                canRevealPassword
            />
            <TextField
                label='Confirm Password'
                value={confirmedPassword}
                onChange={(event, value) => setConfirmedPassword(value)}
                required
                type='password'
                canRevealPassword
            />
            <Spacer />
            <PrimaryButton
                text='Reset Password'
                onClick={handleResetPassword}
                disabled={isResetDisabled}
            />
            <Stack horizontal horizontalAlign='space-between'>
                <ActionButton onClick={handleBackToSignIn}>
                    Back to Sign In
                </ActionButton>
            </Stack>
        </Stack>
    );
};
