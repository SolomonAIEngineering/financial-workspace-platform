'use client';

import { useState } from 'react';
import {
    joinWaitlist,
    type WaitlistActionInput,
} from '@/actions/join-waitlist-action';

export type WaitlistStatus = 'idle' | 'loading' | 'success' | 'error';

export interface WaitlistSubmission {
    // These fields are optional now since we'll get them from the authenticated user
    fullName?: string;
    email?: string;
    companyName?: string;
    reason?: string;
}

interface UseWaitlistProps {
    featureName: string;
}

export function useWaitlist({ featureName }: UseWaitlistProps) {
    const [status, setStatus] = useState<WaitlistStatus>('idle');
    const [error, setError] = useState<Error | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const closeSuccessToast = () => {
        setIsSuccessToastVisible(false);
    };

    const submitToWaitlist = async (data: WaitlistSubmission) => {
        setStatus('loading');
        setError(null);

        try {
            // Prepare data for the server action
            // We only need the reason from the form now - user data will be handled on the server
            const waitlistData: WaitlistActionInput = {
                reason: data.reason || '',
                featureName,
            };

            // Call the server action
            const result = await joinWaitlist(waitlistData);

            if (!result.success) {
                throw new Error(result.message || 'Failed to join waitlist');
            }

            // Handle success
            setStatus('success');
            setIsModalOpen(false);
            setIsSuccessToastVisible(true);

            // Auto-hide success toast after 5 seconds
            setTimeout(() => {
                setIsSuccessToastVisible(false);
            }, 5000);
        } catch (error) {
            console.error('Error submitting to waitlist:', error);
            setStatus('error');
            setError(
                error instanceof Error ? error : new Error('Failed to submit to waitlist')
            );
        }
    };

    return {
        status,
        error,
        isModalOpen,
        isSuccessToastVisible,
        openModal,
        closeModal,
        closeSuccessToast,
        submitToWaitlist,
    };
}
