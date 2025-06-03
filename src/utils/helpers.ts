import { Bol_id, Bol_segment } from "../types/bol-segment";
import { General_segment } from "../types/general-segment";

export const convertArray = (inputArray: any) => {
    const [headers, ...rows] = inputArray;
    return rows.map((row: any) =>
        Object.fromEntries(Object.entries(headers).map(([key, value]) => [value, row[key]]))
    );
}

export const groupBy = (array: any, key: any) => array.reduce((result: any, item: any) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
}, {});


export const countKeys = (obj: any) => {
    return Object.keys(obj).length;
}


export const createGeneralSegment = (hd: any, bls: any): General_segment => {

    const blCount = countKeys(groupBy(bls, "bol_no"))

    const cntCount = countKeys(groupBy(bls, "container_no"))

    const packageCount = bls.reduce((acc: any, bl: any) => {
        const packages = bl['bl_total_packages']
        return acc + packages;
    }, 0);

    const grossMass = bls.reduce((acc: any, bl: any) => {
        const grossMass = bl['bl_total_gross_weight'] * 1
        return acc + grossMass;
    }, 0);

    return {
        General_segment_id: {
            Customs_office_code: hd.Customs_office_code,
            Voyage_number: hd.Voyage_number,
            Date_of_departure: hd.Date_of_departure,
            Date_of_arrival: hd.Date_of_arrival
        },
        Totals_segment: {
            Total_number_of_bols: blCount,
            Total_number_of_packages: packageCount,
            Total_number_of_containers: cntCount,
            Total_gross_mass: grossMass
        },
        Transport_information: {
            Carrier: {
                Carrier_code: "",
                Carrier_name: "",
                Carrier_address: ""
            },
            Shipping_Agent: {
                Shipping_Agent_code: "",
                Shipping_Agent_name: ""
            },
            Mode_of_transport_code: "1",
            Identity_of_transporter: "",
            Nationality_of_transporter_code: "XX"
        },
        Load_unload_place: {
            Place_of_departure_code: hd.Place_of_departure_code,
            Place_of_destination_code: hd.Place_of_destination_code
        },
        Tonnage: {
            Tonnage_net_weight: 0,
            Tonnage_gross_weight: 0,
        }
    }
}


export const createBolSegment = (bls: any): Bol_segment[] => {
    const bol_segments: Bol_segment[] = [];

    Object.keys(bls).map((key, blIndex: number) => {
        console.log("key", key, "blIndex", blIndex)
        const bolItems: any = bls[key];

        const bol_segment = {
            Bol_id: {
                Bol_reference: bolItems[0]['bol_no'],
                Line_number: blIndex,
                Bol_nature: 24,
                Bol_type_code: "BL",
                Master_bol_ref_number: "",
                Unique_carrier_reference: ""
            },
            Load_unload_place: {
                Port_of_origin_code: bolItems[0]['country_of_origin'],             // Country of Origin 
                Place_of_loading_code: bolItems[0]['port_of_loading'],             // Port of Loading      
                Original_port_of_loading_code: bolItems[0]['Origport_of_loading'], // Original Port of Loading      
                Place_of_unloading_code: bolItems[0]['place_of_discharge'],          // Place of Discharge
                Place_of_ultimate_destination_code: bolItems[0]['place_of_receipt'], // Place of Receipt 
                Place_of_delivery_code: bolItems[0]['place_of_delivery'],           // Place of Delivery


            },
            Traders_segment: {
                Exporter: {
                    Exporter_code: "",
                    Exporter_name: bolItems[0]['shipper_name']?.replaceAll("&", "&amp;"),
                    Exporter_address: bolItems[0]['shipper_address']
                },
                FreightForwarder: {
                    FFName: "",
                    FFId: bolItems[0]['ff_id'] || ""
                },
                Notify: {
                    Notify_code: "",
                    Notify_name: bolItems[0]['notify_name']?.replaceAll("&", "&amp;"),
                    Notify_address: bolItems[0]['notify_address']
                },
                Consignee: {
                    Consignee_code: "",
                    Consignee_name: bolItems[0]['consignee_name']?.replaceAll("&", "&amp;"),
                    Consignee_address: bolItems[0]['consignee_address']
                }
            },
            ctn_segment: [] as any,
            Goods_segment: [] as any,
            Value_segment: {}
        }
        bolItems.map((bolItem: any, itemIndex: number) => {
            bol_segment.ctn_segment.push({
                Ctn_reference: bolItem['container_no'],
                Number_of_packages: bolItem['container_no_of_packages'],
                Type_of_container: bolItem['container_type'],
                Empty_Full: "",
                Marks1: bolItem['seal_no'],
                Marks2: "",
                Marks3: "",
                Sealing_Party: "",
                Empty_weight: 0,
                Goods_Weight: bolItem['container_gross_weight']
            });
            bol_segment.Goods_segment.push({
                Number_of_packages: bolItem['bl_total_packages'],
                Package_type_code: bolItem['package_type'],
                Package_type: "",
                Gross_mass: bolItem['bl_total_gross_weight'],
                Shipping_marks: "",
                Goods_description: bolItem['cargo_description']?.replaceAll("&", "&amp;"),
                Num_of_ctn_for_this_bol: 1,
                Container_item_references: {
                    Ctn_item_reference: bolItem['container_no']
                },
            })
            // bol_segments.push({

            // ctn_segment: {
            //     Ctn_reference: bolItem['container_no'],
            //     Number_of_packages: bolItem['container_no_of_packages'],
            //     Type_of_container: bolItem['container_type'],
            //     Empty_Full: "",
            //     Marks1: bolItem['seal_no'],
            //     Marks2: "",
            //     Marks3: "",
            //     Sealing_Party: "",
            //     Empty_weight: 0,
            //     Goods_Weight: bolItem['container_gross_weight']
            // },
            // Goods_segment: {
            //     Number_of_packages: bolItem['bl_total_packages'],
            //     Package_type_code: bolItem['package_type'],
            //     Package_type: "",
            //     Gross_mass: bolItem['bl_total_gross_weight'],
            //     Shipping_marks: "",
            //     Goods_description: bolItem['cargo_description']?.replaceAll("&", "&amp;"),
            //     Num_of_ctn_for_this_bol: 1,
            //     Container_item_references: {
            //         Ctn_item_reference: bolItem['container_no']
            //     },
            // },
            Value_segment: {
                // Freight_segment: {
                //    PC_indicator: "x",
                //     Freight_value: 0,
                //     Freight_currency: "x"
                // }
            }
            // } as any)
        })

        bol_segments.push(bol_segment as any)
    })

    return bol_segments
}