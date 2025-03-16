'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, useTRPC } from '@/trpc/react';
import { useEffect, useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/registry/default/potion-ui/input';
import { currencies } from '@/types/status';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const teamFormSchema = z.object({
    name: z.string().min(2, {
        message: 'Team name must be at least 2 characters.',
    }),
    slug: z.string().min(2, {
        message: 'Team slug must be at least 2 characters.',
    })
        .regex(/^[a-z0-9-]+$/, {
            message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
        }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    baseCurrency: z.string().min(3, {
        message: 'Please select a currency.',
    }),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

export function TeamCreationForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSlugEdited, setIsSlugEdited] = useState(false);
    const trpc = useTRPC();

    // Use tRPC mutation hook instead of direct server call
    const createTeam = api.team.create.useMutation({
        onSuccess: () => {
            // Invalidate relevant queries to refetch data
            void trpc.team.invalidate();
        },
    });

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamFormSchema),
        defaultValues: {
            name: '',
            slug: '',
            email: '',
            baseCurrency: 'USD',
        },
    });

    // Auto-generate slug from team name
    useEffect(() => {
        const teamName = form.watch('name');
        const currentSlug = form.watch('slug');

        // Only auto-generate if the user hasn't manually edited the slug
        if (teamName && !isSlugEdited) {
            const generatedSlug = teamName
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

            form.setValue('slug', generatedSlug, { shouldValidate: true });
        }
    }, [form.watch('name'), isSlugEdited, form]);

    async function onSubmit(data: TeamFormValues) {
        setIsSubmitting(true);

        try {
            // Use the tRPC mutation instead of direct server call
            const promise = createTeam.mutateAsync({
                name: data.name,
                slug: data.slug,
                email: data.email,
                baseCurrency: data.baseCurrency,
            }).then((team) => {
                return team;
            });

            // Use toast.promise for better UX
            toast.promise(promise, {
                loading: 'Creating team...',
                success: (team) => `${team.name} has been set up and is ready to go.`,
                error: 'Failed to create team. Please try again or contact support.',
            });

            // Wait for the promise to resolve and then refresh the page
            const team = await promise;
            if (team) {
                // Add a small delay to ensure toast is visible before refresh
                setTimeout(() => {
                    // Refresh the page to trigger middleware redirect
                    router.refresh();
                }, 1500); // 1.5 seconds delay
            }
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
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Icons.link className="h-4 w-4 text-primary" />
                                                Team URL Slug
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-1 rounded-md border bg-backgroun pl-3">
                                                    <span className="text-sm text-muted-foreground">
                                                        smb.solomon-ai.dev/
                                                    </span>
                                                    <Input
                                                        placeholder="acme-inc"
                                                        className="h-10 flex-1 border-none shadow-none bg-background/50 focus:ring-0"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            setIsSlugEdited(true);
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                This will be used for your team URL and cannot be changed later.
                                            </FormDescription>
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

                            <motion.div variants={itemVariants}>
                                <FormField
                                    control={form.control}
                                    name="baseCurrency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Icons.creditCard className="h-4 w-4 text-primary" />
                                                Base Currency
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-10 bg-background/50 backdrop-blur-sm focus:border-primary rounded-2xl">
                                                        <SelectValue placeholder="Select a currency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className='rounded-2xl border-none shadow-none md:p-[2%]'>
                                                    {currencies.map((currency) => (
                                                        <SelectItem
                                                            key={currency.code}
                                                            value={currency.code}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span className="font-medium text-xs">{currency.symbol}</span>
                                                                <span>{currency.name}</span>
                                                                <span className="ml-1 text-muted-foreground">({currency.code})</span>
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The primary currency for financial tracking and reporting.
                                            </FormDescription>
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
                                disabled={isSubmitting || createTeam.isPending}
                                className="bg-primary hover:bg-primary/90 font-bold"
                                size="md"
                            >
                                {isSubmitting || createTeam.isPending ? (
                                    <>
                                        <Icons.spinner className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Icons.check className="h-4 w-4" />
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