import {z} from 'zod';

export const UsernameValidation = z.object({
    username: z.string().min(2).max(20)
});


export const signUpSchema = z.object ({
    username: z.string().min(2).max(20),
    email: z.string().email({message: 'Invalid eamail address'}),
    phone: z.string().min(10).max(10),
    password: z.string().min(6,{message: "password must be at least 6 characters"}),
    
})