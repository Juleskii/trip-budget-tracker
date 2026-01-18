export type Trip = {
    id: string;
    name: string;
    base_currency: string;
    total_budget: number;
    start_date: string;
    end_date: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
};

export type TripInsert = Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export type TripUpdate = Partial<TripInsert>;
