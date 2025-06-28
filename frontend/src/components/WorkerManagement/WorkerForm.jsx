import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button as MuiButton,
  TextField,
  FormControl as MuiFormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Typography,
  Paper,
  Grid,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../utils/axios';
import { toast } from 'react-hot-toast';
import {
    DialogDescription,
    DialogHeader,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from '@/lib/axios';

const generatePassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const formSchema = z.object({
  workerId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
  avatar: z.string().optional(),
  role: z.string().default('worker'),
  workerType: z.enum(['collector', 'driver', 'supervisor', 'sweeper', 'cleaner']),
  zone: z.string().min(1, "Zone is required"),
  shift: z.enum(['morning', 'afternoon', 'evening', 'night']),
  workerStatus: z.enum(['active', 'inactive', 'onLeave', 'suspended', 'pending']),
  workerDetails: z.object({
    employeeId: z.string().optional(),
    department: z.string().optional(),
    supervisor: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseExpiry: z.string().optional().nullable(),
    experienceYears: z.number().optional(),
    vehicleAssigned: z.string().optional()
  }).optional().default({}),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  performance: z.object({
    rating: z.number().min(0).max(5).default(0).optional(),
    tasksCompleted: z.number().optional(),
    efficiency: z.number().min(0).max(100).default(0).optional(),
    binsCollected: z.number().optional(),
    distanceCovered: z.number().optional()
  }).optional().default({})
});

const WorkerForm = ({ open, onClose, worker, onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [zones, setZones] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: generatePassword(),
    zone: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdWorker, setCreatedWorker] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerId: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      avatar: "",
      role: "worker",
      workerType: "collector",
      zone: "",
      shift: "morning",
      workerStatus: "active",
      workerDetails: {
        employeeId: "",
        department: "",
        supervisor: "",
        licenseNumber: "",
        licenseExpiry: null,
        experienceYears: 0,
        vehicleAssigned: ""
      },
      performance: {
        rating: 0,
        tasksCompleted: 0,
        efficiency: 0,
        binsCollected: 0,
        distanceCovered: 0
      },
      password: ""
    }
  });

  useEffect(() => {
    fetchZones();
    if (isEdit) {
      fetchWorkerData();
    }
    if (worker) {
      form.reset({
        workerId: worker.workerId || "",
        name: worker.name || "",
        email: worker.email || "",
        phone: worker.phone || "",
        workerType: worker.workerType || "collector",
        zone: worker.zone || "",
        shift: worker.shift || "morning",
        workerStatus: worker.workerStatus || "active",
        address: worker.address || "",
        workerDetails: {
          employeeId: worker.workerDetails?.employeeId || "",
          department: worker.workerDetails?.department || "",
          supervisor: worker.workerDetails?.supervisor || "",
          licenseNumber: worker.workerDetails?.licenseNumber || "",
          licenseExpiry: worker.workerDetails?.licenseExpiry || null,
          experienceYears: worker.workerDetails?.experienceYears || 0,
          vehicleAssigned: worker.workerDetails?.vehicleAssigned || ""
        },
        performance: worker.performance || {
          rating: 0,
          tasksCompleted: 0,
          efficiency: 0,
          binsCollected: 0,
          distanceCovered: 0
        }
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        workerType: "collector",
        zone: "",
        shift: "morning",
        workerStatus: "active",
        address: "",
        workerDetails: {
          employeeId: "",
          department: "",
          supervisor: "",
          licenseNumber: "",
          licenseExpiry: null,
          experienceYears: 0,
          vehicleAssigned: ""
        },
        password: "",
      });
    }
  }, [id, worker]);

  const fetchZones = async () => {
    try {
      const response = await axios.get('/zones');
      setZones(response.data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch zones",
        variant: "destructive"
      });
    }
  };

  const fetchWorkerData = async () => {
    try {
      setLoading(true);
      
      // Try worker API first, then fall back to users API
      let response;
      try {
        response = await axios.get(`/api/workers/${id}`);
      } catch (workerApiError) {
        console.log('Worker API failed, trying users API:', workerApiError);
        response = await axios.get(`/api/users/${id}`);
      }
      
      const workerData = response.data;
      
      form.reset({
        workerId: workerData.workerId || "",
        name: workerData.name || "",
        email: workerData.email || "",
        phone: workerData.phone || "",
        address: workerData.address || "",
        avatar: workerData.avatar || "",
        role: "worker",
        workerType: workerData.workerType || "collector",
        zone: workerData.zone || "",
        shift: workerData.shift || "morning",
        workerStatus: workerData.workerStatus || "active",
        workerDetails: workerData.workerDetails || {},
        performance: workerData.performance || {
          rating: 0,
          tasksCompleted: 0,
          efficiency: 0,
          binsCollected: 0,
          distanceCovered: 0
        }
      });
    } catch (error) {
      console.error('Error fetching worker data:', error);
      toast({
        title: "Error",
        description: "Failed to load worker data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Format the data to match backend schema
      const workerData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        avatar: data.avatar,
        role: 'worker',
        workerId: data.workerId,
        workerType: data.workerType,
        zone: data.zone,
        shift: data.shift,
        workerStatus: data.workerStatus,
        workerDetails: {
          employeeId: data.workerDetails.employeeId,
          department: data.workerDetails.department,
          supervisor: data.workerDetails.supervisor,
          licenseNumber: data.workerDetails.licenseNumber,
          licenseExpiry: data.workerDetails.licenseExpiry,
          experienceYears: data.workerDetails.experienceYears,
          vehicleAssigned: data.workerDetails.vehicleAssigned
        }
      };

      // Only include password for new workers
      if (!worker && data.password) {
        workerData.password = data.password;
      }

      // Try dedicated worker API first, then fall back to users API
      let response;
      try {
        const workerUrl = worker ? `/api/workers/${worker._id}` : '/api/workers';
        const method = worker ? 'patch' : 'post';
        response = await axios[method](workerUrl, workerData);
      } catch (workerApiError) {
        console.log('Worker API failed, trying users API:', workerApiError);
        const userUrl = worker ? `/api/users/${worker._id}` : '/api/users';
        const method = worker ? 'patch' : 'post';
        response = await axios[method](userUrl, workerData);
      }

      if (response.status === 200 || response.status === 201) {
        toast({
          title: `Worker ${worker ? 'Updated' : 'Created'} Successfully`,
          description: `${data.name} has been ${worker ? 'updated' : 'added'} to the system.`,
        });
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error saving worker:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save worker",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleGeneratePassword = () => {
    setFormData((prev) => ({
      ...prev,
      password: generatePassword(),
    }));
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate('/management/workers');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {worker ? 'Edit Worker' : 'Add New Worker'}
      </DialogTitle>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select worker type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="collector">Collector</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="sweeper">Sweeper</SelectItem>
                        <SelectItem value="cleaner">Cleaner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zone</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone._id} value={zone._id}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning</SelectItem>
                        <SelectItem value="afternoon">Afternoon</SelectItem>
                        <SelectItem value="evening">Evening</SelectItem>
                        <SelectItem value="night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workerStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="onLeave">On Leave</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter address" 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!worker && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            placeholder="Enter password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Worker Details Section */}
            {form.watch("workerType") === "driver" && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Driver Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="workerDetails.licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter license number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workerDetails.licenseExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workerDetails.experienceYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

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
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {worker ? 'Update Worker' : 'Create Worker'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerForm; 