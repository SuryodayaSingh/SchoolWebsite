import 'next-auth'

declare module 'next-auth' {
    interface User{
        _id?: string;
        isVerified?: boolean;
        username?: string;
        phone?: string;
        role?: string;
    }

    interface Session {
        user: {
            _id?: string;
             isVerified?: boolean;
            username?: string;
            role?: string;
        } & DeafualtSession['user']
    }
}