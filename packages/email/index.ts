/**
 * Main entry point for the email package.
 * Provides initialized Resend client for email sending functionality.
 * @module email
 */

import { Resend } from 'resend'
import { env } from '@solomonai/env'

/**
 * Initialized Resend client instance configured with the API token from environment.
 * This client can be used to send emails throughout the application.
 */
export const resend = new Resend(env.RESEND_TOKEN)
