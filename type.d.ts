type UsersType = {
    _id?: string;
    username?: string;
    email?: string;
    number: string;
    role: 'ADMIN' | 'USER' | 'MAGASINE' | 'DELIVERY';
    dynamics: string | null;
    profile: string | null;
}

type PayloadType = {
    id: string;
    username: string;
    email: string;
    role: string;
    dynamic: string;
    profile: string;
}

type Parsonalizer = {
    height: number;
    Width: number;
    font: string;
    text: string;
    color: string;
    materiel: string;
}
type Order = {
    _id: string;
    variant?: Variants;
    parsonalizer?: Parsonalizer;
    orderInfo: string;
    quantity: number;
    price: number;
}

type OrderInfo = {
    _id: string;
    fullname: string;
    phoneNumber: string;
    wilaya: string;
    adresse: string;
    email?: string;
    user?: string;
    status: string;
    tracking?: string;
    items: Order[];
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    dynamic: string;
}