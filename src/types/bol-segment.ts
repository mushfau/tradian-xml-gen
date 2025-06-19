export type Bol_id = {
    Bol_reference: string
    Line_number: number
    Bol_nature: number
    Bol_type_code: string
    Master_bol_ref_number: string
    Unique_carrier_reference: string
}

export type Bol_Load_unload_place = {
    Port_of_origin_code: string
    Original_port_of_loading_code: string
    Place_of_delivery_code: string
    Place_of_ultimate_destination_code: string
    Place_of_loading_code: string
    Place_of_unloading_code: string
}

export type Exporter = {
    Exporter_code?: string
    Exporter_name: string
    Exporter_address: string
}

export type FreightForwarder = {
    FFName: string
    FFId: string
}

export type Notify = {
    Notify_code?: string
    Notify_name: string
    Notify_address: string
}

export type Consignee = {
    Consignee_code?: string
    Consignee_name: string
    Consignee_address: string
}

export type Traders_segment = {
    Exporter: Exporter
    FreightForwarder?: FreightForwarder
    Notify: Notify
    Consignee: Consignee
}

// Final_destination_country: {
//     Final_destination_country_code: "MV",
//     Final_destination_country_name: "MALDIVES",
// },

export type ctn_segment = {
    Ctn_reference: string
    Number_of_packages: number
    Package_type: string
    Type_of_container: string
    Empty_Full: string
    Marks1: string
    Marks2?: string
    Marks3?: string
    Sealing_Party?: string
    Empty_weight?: number
    Goods_Weight?: number
}

export type Seals_segment = {
    Number_of_seals: number
    Marks_of_seals: string
    Sealing_party_code?: string
}

export type Container_item_references = {
    Ctn_item_reference: string
}

export type Goods_segment = {
    Quantity?: number
    Quantity_type_code?: string
    Number_of_packages: string
    Package_type_code: string
    Gross_mass: number
    Shipping_marks: string
    Goods_description: string
    Seals_segment?: Seals_segment
    Container_item_references?: Container_item_references[],
    Volume_in_cubic_meters?: number
    Num_of_ctn_for_this_bol: number

}

export type Freight_segment = {
    PC_indicator?: string
    Freight_value?: number
    Freight_currency?: string
}

export type Split_segment = {
    Number_of_packages: number
}

export type Customs_segment = {
    Customs_value?: number
    Customs_currency?: string
}

export type Insurance_segment = {
    Insurance_value?: number
    Insurance_currency?: string
}

export type Transport_segment = {
    Transport_value?: number
    Transport_currency?: string
}

export type Value_segment = {
    Freight_segment?: Freight_segment
    Customs_segment?: Customs_segment
    Insurance_segment?: Insurance_segment
    Transport_segment?: Transport_segment
}

export type Location = {
    Location_code?: string
    Location_info?: string
}

export type Bol_segment = {
    Bol_id: Bol_id
    Load_unload_place: Bol_Load_unload_place
    Traders_segment: Traders_segment
    ctn_segment?: ctn_segment[]
    Goods_segment: Goods_segment[]
    Split_segment?: Split_segment[]
    Value_segment: Value_segment
    Location?: Location
}
