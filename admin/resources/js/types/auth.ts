export type Admin = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Auth = {
    admin: Admin | null;
};

export type SharedProps = {
    name: string;
    auth: Auth;
    ip: string | null;
};
