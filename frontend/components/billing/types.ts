export interface BillItem {
    id: string;
    description: string;
    staffId: string;
    staffName: string;
    price: number;
    qty: number;
    total: number;
    serviceId?: string;
    productId?: string;
    packageId?: string;
    membershipPlanId?: string;
    isMemberPrice?: boolean;
    regularPrice?: number;
    mPrice?: number;
}

