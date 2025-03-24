
export interface PaxAvailabilityResponse {
    id: number;
    slotId: number;
    type: string;
    name?: string;
    description?: string;
    price: any; 
    min?: number;
    max?: number;
    remaining: number;
  }
  
  export interface SlotResponse {
    id: number;
    productId: number;
    startDate: string; 
    startTime: string;
    endTime?: string;
    providerSlotId: string;
    remaining: number;
    paxAvailabilities: PaxAvailabilityResponse[];
  }
  
 
  export interface SlotInput {
    startDate: string;
    startTime: string;
    endTime?: string;
    providerSlotId: string;
    remaining: number;
    paxAvailability: {
      type: string;
      name?: string;
      description?: string;
      price: any;
      min?: number;
      max?: number;
      remaining: number;
    }[];
  }