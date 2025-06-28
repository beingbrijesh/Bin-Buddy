import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

const formSchema = z.object({
    taskId: z.string().optional(),
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    deadline: z.date({
        required_error: "Please select a deadline",
    }),
    estimatedTime: z.string().min(1, "Estimated time is required"),
    notes: z.string().optional(),
});

const TaskAssignmentModal = ({ open, onClose, worker, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [availableTasks, setAvailableTasks] = useState([]);
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            deadline: new Date(),
            estimatedTime: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (open) {
            fetchAvailableTasks();
        }
    }, [open]);

    const fetchAvailableTasks = async () => {
        try {
            const response = await fetch('/api/tasks/available');
            const data = await response.json();

            if (!response.ok) {
                throw new Error('Failed to fetch available tasks');
            }

            setAvailableTasks(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load available tasks",
                variant: "destructive",
            });
        }
    };

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/workers/${worker._id}/assign-task`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    deadline: format(data.deadline, "yyyy-MM-dd'T'HH:mm:ss"),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to assign task');
            }

            toast({
                title: "Task Assigned",
                description: "Task has been successfully assigned to the worker",
            });

            onSuccess();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Assign Task to {worker?.name}</DialogTitle>
                    <DialogDescription>
                        Create a new task or assign an existing one to the worker
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {availableTasks.length > 0 && (
                            <FormField
                                control={form.control}
                                name="taskId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Existing Task (Optional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an existing task" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {availableTasks.map((task) => (
                                                    <SelectItem key={task._id} value={task._id}>
                                                        {task.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select an existing task or create a new one below
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter task description"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estimatedTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Time (hours)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                placeholder="Enter estimated hours"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Deadline</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={
                                                        "w-full pl-3 text-left font-normal"
                                                    }
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter any additional notes or instructions"
                                            className="min-h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Assigning..." : "Assign Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default TaskAssignmentModal; 