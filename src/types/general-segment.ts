
export type General_segment_id = {
    Customs_office_code: string;
    Voyage_number: string;
    Date_of_departure: Date;
    Date_of_arrival?: Date
    Time_of_arrival?: Date
    Date_of_last_discharge?: Date
}

export type Totals_segment = {
    Total_number_of_bols: number
    Total_number_of_packages: number
    Total_number_of_containers: number
    Total_gross_mass: number
}

export type Carrier = {
    Carrier_code: string
    Carrier_name?: string
    Carrier_address?: string
}

export type Shipping_Agent = {
    Shipping_Agent_code: string
    Shipping_Agent_name?: string
}

export type Transport_information = {
    Carrier: Carrier
    Shipping_Agent?: Shipping_Agent
    Mode_of_transport_code: string
    Identity_of_transporter: string
    Nationality_of_transporter_code: string
    Place_of_transporter?: string
    Registration_number_of_transport_code?: string
    Date_of_registration?: Date
    Master_information?: string
}

export type Gen_Seg_Load_unload_place = {
    Place_of_departure_code: string
    Place_of_destination_code: string
}

export type Tonnage = {
    Tonnage_net_weight: number
    Tonnage_gross_weight: number
}

export type Attached_Document = {
    Attached_document_code: string
    Attached_document_filename: string
    Attached_document_content: string
}

export type General_segment = {
    General_segment_id: General_segment_id
    Totals_segment: Totals_segment
    Transport_information: Transport_information
    Load_unload_place: Gen_Seg_Load_unload_place,
    Tonnage?: Tonnage
    attached_Document?: Attached_Document
}