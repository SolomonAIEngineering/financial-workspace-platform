import { Card, CardContent } from "./card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "./carousel";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Carousel> = {
    component: Carousel,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
    render: () => (
        <Carousel className="w-full max-w-xs">
            <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                        <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                <span className="text-4xl font-semibold">{index + 1}</span>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

export const MultipleItems: Story = {
    render: () => (
        <Carousel className="w-full max-w-md">
            <CarouselContent className="-ml-1">
                {Array.from({ length: 10 }).map((_, index) => (
                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                        <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                <span className="text-2xl font-semibold">{index + 1}</span>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

export const AutoPlay: Story = {
    render: () => (
        <Carousel className="w-full max-w-xs" opts={{ loop: true }} autoPlay>
            <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                        <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                <span className="text-4xl font-semibold">{index + 1}</span>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    ),
};

export const CustomControls: Story = {
    render: () => (
        <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
            <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index}>
                        <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                                <span className="text-4xl font-semibold">{index + 1}</span>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
                <CarouselPrevious variant="outline" className="static h-8 w-8" />
                <CarouselNext variant="outline" className="static h-8 w-8" />
            </div>
        </Carousel>
    ),
}; 