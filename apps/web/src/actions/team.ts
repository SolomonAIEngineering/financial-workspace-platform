'use server';

import { prisma } from '@/server/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const teamSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    baseCurrency: z.string().default('USD'),
    userId: z.string(),
});

export async function createTeam(data: z.infer<typeof teamSchema>) {
    const validated = teamSchema.parse(data);

    try {
        // Create a new team
        const team = await prisma.team.create({
            data: {
                name: validated.name,
                email: validated.email,
                baseCurrency: validated.baseCurrency,
            },
        });

        // Create the user-team relationship
        await prisma.usersOnTeam.create({
            data: {
                userId: validated.userId,
                teamId: team.id,
                role: 'OWNER',
            },
        });

        // Update the user with the team ID
        await prisma.user.update({
            where: { id: validated.userId },
            data: { teamId: team.id },
        });

        revalidatePath('/onboarding');
        return { success: true, team };
    } catch (error) {
        console.error('Failed to create team:', error);
        return { success: false, error: 'Failed to create team' };
    }
} 