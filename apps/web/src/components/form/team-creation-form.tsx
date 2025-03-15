'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/registry/default/potion-ui/input';
import { createTeam } from '@/actions/team';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const teamFormSchema = z.object({
    name: z.string().min(2, {
        message: 'Team name must be at least 2 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    baseCurrency: z.string().default('USD'),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface TeamCreationFormProps {
    userId: string;
}

export function TeamCreationForm({ userId }: TeamCreationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            name: '',
            email: '',
            baseCurrency: 'USD',
        },
    });

    async function onSubmit(data: TeamFormValues) {
        setIsSubmitting(true);

        try {
            await createTeam({
                name: data.name,
                email: data.email,
                baseCurrency: data.baseCurrency,
                userId,
            });

            // Refresh the page to trigger middleware redirect
            router.refresh();
        } catch (error) {
            console.error('Failed to create team:', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 24
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <Card className="overflow-hidden border border-border/70 bg-card/50 backdrop-blur-sm">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6 p-6">
                            <motion.div variants={itemVariants}>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Icons.add className="h-4 w-4 text-primary" />
                                                Team Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Acme Inc."
                                                    className="h-10 bg-background/50 backdrop-blur-sm focus:border-primary"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Icons.sendMessage className="h-4 w-4 text-primary" />
                                                Team Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="team@example.com"
                                                    className="h-10 bg-background/50 backdrop-blur-sm focus:border-primary"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </motion.div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
                            <div className="text-sm text-muted-foreground">
                                <Icons.info className="mr-2 inline-block h-4 w-4" />
                                Your team helps organize your financial data
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90"
                                size="md"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Icons.check className="mr-2 h-4 w-4" />
                                        Create Team
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </motion.div>
    );
} 