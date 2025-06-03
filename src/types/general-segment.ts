
export type General_segment_id = {
    Customs_office_code: string;
    Voyage_number: string;
    Date_of_departure: string;
    Date_of_arrival: string
}

export type Totals_segment = {
    Total_number_of_bols: number
    Total_number_of_packages: number
    Total_number_of_containers: number
    Total_gross_mass: number
}

export type Carrier = {
    Carrier_code: string
    Carrier_address: string
    Carrier_name: string
}

export type Shipping_Agent = {
    Shipping_Agent_code: string
    Shipping_Agent_name: string
}

export type Transport_information = {
    Carrier: Carrier
    Shipping_Agent: Shipping_Agent
    Mode_of_transport_code: string
    Identity_of_transporter: string
    Nationality_of_transporter_code: string
}

export type Gs_Load_unload_place = {
    Place_of_departure_code: string
    Place_of_destination_code: string
}

export type Tonnage = {
    Tonnage_net_weight: number
    Tonnage_gross_weight: number
}

export type General_segment = {
    General_segment_id: General_segment_id
    Totals_segment: Totals_segment
    Transport_information: Transport_information
    Load_unload_place: Gs_Load_unload_place,
    Tonnage: Tonnage
}