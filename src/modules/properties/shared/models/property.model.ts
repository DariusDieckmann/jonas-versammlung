import type { Property } from "../schemas/property.schema";

export interface PropertyWithDetails extends Property {
    organizationName?: string;
}
