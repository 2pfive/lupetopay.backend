
export interface CreateUserDTO {
    email: string;
    firstname: string;
    lastname: string;
    telephone: string;
    password: string;
    role?:AdminRoles
}


export type AdminRoles='super_admin' | 'admin' | 'support'

