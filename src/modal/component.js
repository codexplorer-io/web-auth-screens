import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { MessageBar } from '@fluentui/react/lib/MessageBar';
import {
    useWebAuthModalState,
    useWebAuthModalActions,
    MODAL_SCREEN
} from './store';
import { SignInModalContent } from './sign-in-modal-content';
import { SignUpModalContent } from './sign-up-modal-content';
import { ForgotPasswordModalContent } from './forgot-password-modal-content';
import { VerifyEmailModalContent } from './verify-email-modal-content';

export const Spacer = styled.div`
    height: 8px;
`;

const modalPropsStyles = {
    main: {
        maxWidth: 450
    }
};

const modalProps = {
    isBlocking: true,
    styles: modalPropsStyles
};

const screenConfigMap = {
    [MODAL_SCREEN.signIn]: {
        title: 'Sign In'
    },
    [MODAL_SCREEN.signUp]: {
        title: 'Sign Up'
    },
    [MODAL_SCREEN.forgotPassword]: {
        title: 'Reset Password'
    },
    [MODAL_SCREEN.verifyEmail]: {
        title: 'Verify Email'
    }
};

export const WebAuthModal = () => {
    const {
        isShown,
        isLoading,
        messageBarState,
        modalScreen,
        isModalDismissible
    } = useWebAuthModalState();
    const { hide } = useWebAuthModalActions();

    const { title } = screenConfigMap[modalScreen] ?? {};

    const dialogContentProps = useMemo(() => ({
        type: isModalDismissible ? DialogType.close : DialogType.largeHeader,
        title: title ?? ''
    }), [title, isModalDismissible]);

    return (
        <Dialog
            hidden={!isShown}
            onDismiss={hide}
            dialogContentProps={dialogContentProps}
            modalProps={modalProps}
        >
            {isLoading && (
                <>
                    <Spacer />
                    <Spinner size={SpinnerSize.large} />
                    <Spacer />
                </>
            )}
            {messageBarState && (
                <>
                    <MessageBar
                        messageBarType={messageBarState.type}
                    >
                        {messageBarState.message}
                    </MessageBar>
                    <Spacer />
                </>
            )}
            <SignInModalContent />
            <SignUpModalContent />
            <ForgotPasswordModalContent />
            <VerifyEmailModalContent />
        </Dialog>
    );
};
