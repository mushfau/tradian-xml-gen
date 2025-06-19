import { BL } from "../types/bl";
import { Bol_id, Bol_segment } from "../types/bol-segment";
import { General_segment, General_segment_id, Shipping_Agent, Totals_segment, Transport_information } from "../types/general-segment";
import { Header } from "../types/header";

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


export const countKeys = (obj: any, keyType: string) => {
    if (keyType === 'container_no' && Object.keys(obj)[0] === 'undefined') {
        return 0;
    }
    return Object.keys(obj).length;
}


export const createGeneralSegment = (hd: Header, bls: BL[], packageCount: number, grossMass: number): General_segment => {

    const blCount = countKeys(groupBy(bls, "bol_no"), "bol_no")

    const ctnGroups = groupBy(bls, "container_no");
    const cntCount = countKeys(ctnGroups, "container_no")

    // const packageCount = bls.reduce((acc: any, bl: any) => {
    //     const packages = cntCount === 0 ? (bl['no_of_packages'] * 1) : (bl['container_no_of_packages'] * 1)
    //     return acc + packages;
    // }, 0);

    // const grossMass = bls.reduce((acc: any, bl: any) => {
    //     const grossMass = cntCount === 0 ? (bl['goods_gross_weight'] * 1) : (bl['container_gross_weight'] * 1)
    //     return acc + grossMass;
    // }, 0);

    return {
        General_segment_id: {
            Customs_office_code: hd.customs_office_code,
            Voyage_number: hd.voyage_number,
            Date_of_departure: hd.date_of_departure as any,
            Date_of_arrival: hd.date_of_arrival as any
        } as General_segment_id,
        Totals_segment: {
            Total_number_of_bols: blCount,
            Total_number_of_packages: packageCount, // calculate this based on bls
            Total_number_of_containers: cntCount,
            Total_gross_mass: grossMass // calculate this based on bls
        } as Totals_segment,
        Transport_information: {
            Carrier: {
                Carrier_code: "",
                Carrier_name: "",
                Carrier_address: ""
            },
            Shipping_Agent: {
                Shipping_Agent_code: "",
                Shipping_Agent_name: ""
            } as Shipping_Agent,
            Mode_of_transport_code: "1",
            Identity_of_transporter: "",
            Nationality_of_transporter_code: hd.nationality_of_transporter_code
        } as Transport_information,
        Load_unload_place: {
            Place_of_departure_code: hd.place_of_departure_code,
            Place_of_destination_code: hd.place_of_destination_code
        },
        Tonnage: {
            Tonnage_net_weight: 0,
            Tonnage_gross_weight: 0,
        }
    } as General_segment
}


export const createBolSegment_ = (bls: any): Bol_segment[] => {
    const bol_segments: Bol_segment[] = [];

    Object.keys(bls).map((key, blIndex: number) => {
        const bolItems: any = bls[key];
        const bolItemsGrpByCtn = groupBy(bolItems, "container_no")

        const bol_segment = {
            Bol_id: {
                Bol_reference: bolItems[0]['bol_no'],
                Line_number: blIndex,
                Bol_nature: 23,
                Bol_type_code: "BL",
                Master_bol_ref_number: bolItems[0]['master_bol_ref_number'] || "",
                Unique_carrier_reference: ""
            },
            Load_unload_place: {
                Port_of_origin_code: bolItems[0]['country_of_origin'],             // Country of Origin 
                Original_port_of_loading_code: bolItems[0]['original_port_of_loading'], // Original Port of Loading    
                Place_of_delivery_code: bolItems[0]['place_of_delivery'],           // Place of Delivery
                Place_of_ultimate_destination_code: bolItems[0]['place_of_receipt'], // Place of Receipt 
                Place_of_loading_code: bolItems[0]['port_of_loading'],             // Port of Loading      
                Place_of_unloading_code: bolItems[0]['place_of_discharge'],          // Place of Discharge
            },

            // <Port_of_origin_code>AF</Port_of_origin_code>
            // <Original_port_of_loading_code>MVMLE</Original_port_of_loading_code>
            // <Place_of_delivery_code>MVMLE</Place_of_delivery_code>
            // <Place_of_ultimate_destination_code>MVMLE</Place_of_ultimate_destination_code>
            // <Place_of_loading_code>MVMLE</Place_of_loading_code>
            // <Place_of_unloading_code>MVMLE</Place_of_unloading_code>

            Traders_segment: {
                Exporter: {
                    Exporter_code: "",
                    Exporter_name: bolItems[0]['shipper_name']?.replaceAll("&", "&amp;"),
                    Exporter_address: bolItems[0]['shipper_address']
                },
                FreightForwarder: {
                    FFName: "",
                    FFId: bolItems[0]['freight_forwarder'] || ""
                },
                Notify: {
                    Notify_code: "",
                    Notify_name: bolItems[0]['notify_name']?.replaceAll("&", "&amp;"),
                    Notify_address: bolItems[0]['notify_address']
                },
                Consignee: {
                    Consignee_code: bolItems[0]['consignee_code'],
                    Consignee_name: bolItems[0]['consignee_name']?.replaceAll("&", "&amp;"),
                    Consignee_address: bolItems[0]['consignee_address']
                }
            },
            ctn_segment: [] as any,
            Goods_segment: [] as any,
            Value_segment: {}
        }
        bolItems.map((bolItem: any, itemIndex: number) => {
            if (bolItem['container_no']) {
                bol_segment.ctn_segment.push({
                    Ctn_reference: bolItem['container_no'],
                    Number_of_packages: bolItem['container_no_of_packages'],
                    Package_type: bolItem['package_type'],
                    Type_of_container: bolItem['container_type'],
                    Empty_Full: "1/1",
                    Marks1: bolItem['seal_no'],
                    Marks2: "",
                    Marks3: "",
                    Sealing_Party: "",
                    Empty_weight: 0,
                    Goods_Weight: bolItem['container_gross_weight']
                });
                bol_segment.Goods_segment.push({
                    Number_of_packages: bolItem['no_of_packages'],
                    Package_type_code: bolItem['package_type_code'],
                    // Package_type: bolItem['package_type'],
                    Gross_mass: bolItem['goods_gross_weight'],
                    Shipping_marks: bolItem['shipping_marks'],
                    Goods_description: bolItem['goods_description']?.replaceAll("&", "&amp;"),
                    Container_item_references: {
                        Ctn_item_reference: bolItem['container_no']
                    },
                    Num_of_ctn_for_this_bol: 1 // check on this
                })
            } else {
                bol_segment.Goods_segment.push({
                    Quantity: bolItem['quantity'],
                    Quantity_type_code: bolItem['quantity_type'],
                    Number_of_packages: bolItem['no_of_packages'],
                    Package_type_code: bolItem['package_type_code'],
                    // Package_type: bolItem['package_type'],
                    Gross_mass: bolItem['goods_gross_weight'],
                    Shipping_marks: bolItem['shipping_marks'],
                    Goods_description: bolItem['goods_description']?.replaceAll("&", "&amp;"),
                    // Container_item_references: {
                    //     Ctn_item_reference: bolItem['container_no']
                    // },
                    Num_of_ctn_for_this_bol: 0 // check on this
                })
            }


            Value_segment: {
                // Freight_segment: {
                //    PC_indicator: "x",
                //     Freight_value: 0,
                //     Freight_currency: "x"
                // }
            }
        })

        bol_segments.push(bol_segment as any)
    })

    return bol_segments
}


export const createBolSegment = (bls: any): { bol_segments: Bol_segment[], packageCount: number, grossMass: number } => {
    let packageCount = 0;
    let grossMass = 0;
    const ctnGroups = groupBy(bls, "container_no");
    const cntCount = countKeys(ctnGroups, "container_no")
    const grpdBols = groupBy(bls, "bol_no");

    const blsForBol: any[] = [];

    Object.keys(grpdBols).forEach((bol_no) => {
        const bolGrp = grpdBols[bol_no];

        if (cntCount === 0) {
            // Case 0: M containers, 1 goods, 1 bol
            console.log("Case 0: 0 ctns, M goods, 1 bol");

            blsForBol.push({
                bol_no: bol_no,
                type: "0CMG",
                items: bolGrp,
            });
        } else {

            // Case 1: 0 container, M goods, 1 bol
            if (bolGrp.length === 1) {

                console.log("Case 1: 1 ctn, 1 goods, 1 bol");
                blsForBol.push({
                    bol_no: bol_no,
                    type: "1C1G",
                    items: bolGrp,
                })
            } else {
                // Case 2: 1 container, M goods, 1 bol
                const grpdCtns = groupBy(bolGrp, "container_no");

                if (Object.keys(grpdCtns).length === 1) {
                    console.log("Case 2: 1 ctn, multiple goods, 1 bol");
                    blsForBol.push({
                        bol_no: bol_no,
                        type: "1CMG",
                        items: bolGrp,
                    })
                } else {  // Case 3: M containers, 1 goods, 1 bol

                    const grpdGoods = groupBy(bolGrp, "goods_description");

                    if (Object.keys(grpdGoods).length === 1) {
                        console.log("Case 3: multiple ctns, 1 goods, 1 bol");
                        Object.keys(grpdGoods).forEach((goods_description) => {
                            const goodsGrp = grpdGoods[goods_description];
                            blsForBol.push({
                                bol_no: bol_no,
                                type: "MC1G",
                                items: bolGrp,
                            });
                        });
                    } else {
                        console.log("Case 4: multiple ctns, multiple goods, 1 bol");
                        blsForBol.push({
                            bol_no: bol_no,
                            type: "MCMG",
                            items: bolGrp,
                        });
                    }
                }
            }
        }
        console.log("\n")
        // const grpdCtns = groupBy(bolGrp, "container_no");
        // Object.keys(grpdCtns).forEach((container_no) => {
        //     const ctnGrp = grpdCtns[container_no];
        //     console.log(bolGrp.length, ctnGrp.length, "Container Group for BOL:", bol_no, "Container No:", container_no);
        //     // console.log("Container Group for BOL:", bol_no, "Container No:", container_no, ctnGrp.length);
        // })


        // console.log("Container Groups for BOL:", bol_no, Object.length);
        // const grpdGoods = groupBy(bolGrp, "goods_description");

        // console.log("Container Groups for BOL:", bol_no, grpdGoods);

        // console.log("BOL Group:", bol_no, bolGrp);
        // blsForBol.forEach((bl: any) => {
        //     bl.bol_no = bol_no; // Ensure bol_no is set for each BL
        // });
    });

    const bol_segments: Bol_segment[] = [];

    blsForBol.forEach((bolItem: any, blIndex: number) => {
        const bol_segment: any = {
            Bol_id: {
                Bol_reference: bolItem['bol_no'],
                Line_number: blIndex,
                Bol_nature: 23,
                Bol_type_code: "BL",
                Master_bol_ref_number: bolItem['master_bol_ref_number'] || "",
                Unique_carrier_reference: ""
            },
            Load_unload_place: {
                Port_of_origin_code: bolItem.items[0]['country_of_origin'],             // Country of Origin 
                Original_port_of_loading_code: bolItem.items[0]['original_port_of_loading'], // Original Port of Loading    
                Place_of_delivery_code: bolItem.items[0]['place_of_delivery'],           // Place of Delivery
                Place_of_ultimate_destination_code: bolItem.items[0]['place_of_receipt'], // Place of Receipt 
                Place_of_loading_code: bolItem.items[0]['port_of_loading'],             // Port of Loading      
                Place_of_unloading_code: bolItem.items[0]['place_of_discharge'],          // Place of Discharge
            },
            Traders_segment: {
                Exporter: {
                    Exporter_code: "",
                    Exporter_name: bolItem.items[0]['shipper_name']?.replaceAll("&", "&amp;"),
                    Exporter_address: bolItem.items[0]['shipper_address']
                },
                FreightForwarder: {
                    FFName: "",
                    FFId: bolItem.items[0]['freight_forwarder'] || ""
                },
                Notify: {
                    Notify_code: "",
                    Notify_name: bolItem.items[0]['notify_name']?.replaceAll("&", "&amp;"),
                    Notify_address: bolItem.items[0]['notify_address']
                },
                Consignee: {
                    Consignee_code: bolItem.items[0]['consignee_code'],
                    Consignee_name: bolItem.items[0]['consignee_name']?.replaceAll("&", "&amp;"),
                    Consignee_address: bolItem.items[0]['consignee_address']
                }
            },
            ctn_segment: [] as any,
            Goods_segment: [] as any,
            Value_segment: {}
        }
        if (bolItem.type === "0CMG") {
            bolItem.items.forEach((item: any) => {
                packageCount += item['no_of_packages'] * 1;
                grossMass += item['goods_gross_weight'] * 1;

                bol_segment.Goods_segment.push({
                    Quantity: item['quantity'],
                    Quantity_type_code: item['quantity_type'],
                    Number_of_packages: item['no_of_packages'],
                    Package_type_code: item['package_type_code'],
                    Gross_mass: item['goods_gross_weight'],
                    Shipping_marks: item['shipping_marks'],
                    Goods_description: item['goods_description']?.replaceAll("&", "&amp;"),
                    // Container_item_references: {
                    //     Ctn_item_reference: ""
                    // },
                    Num_of_ctn_for_this_bol: 0 // check on this
                })
            })
        }

        if (bolItem.type === "1C1G") {
            bolItem.items.forEach((item: any) => {
                packageCount += item['no_of_packages'] * 1;
                grossMass += item['goods_gross_weight'] * 1;

                bol_segment.ctn_segment.push({
                    Ctn_reference: item['container_no'],
                    Number_of_packages: item['container_no_of_packages'],
                    Package_type: item['package_type'],
                    Type_of_container: item['container_type'],
                    Empty_Full: "1/1",
                    Marks1: item['seal_no'],
                    Marks2: "",
                    Marks3: "",
                    Sealing_Party: "",
                    Empty_weight: 0,
                    Goods_Weight: item['container_gross_weight']
                });
                bol_segment.Goods_segment.push({
                    Number_of_packages: item['no_of_packages'],
                    Package_type_code: item['package_type_code'],
                    Gross_mass: item['goods_gross_weight'],
                    Shipping_marks: item['shipping_marks'],
                    Goods_description: item['goods_description']?.replaceAll("&", "&amp;"),
                    Container_item_references: {
                        Ctn_item_reference: item['container_no']
                    },
                    Num_of_ctn_for_this_bol: 1 // check on this
                })
            })
        }

        if (bolItem.type === "1CMG") {
            packageCount += bolItem.items[0]['container_no_of_packages'] * 1;
            grossMass += bolItem.items[0]['container_gross_weight'] * 1;

            bol_segment.ctn_segment.push({
                Ctn_reference: bolItem.items[0]['container_no'],
                Number_of_packages: bolItem.items[0]['container_no_of_packages'],
                Package_type: bolItem.items[0]['package_type'],
                Type_of_container: bolItem.items[0]['container_type'],
                Empty_Full: "1/1",
                Marks1: bolItem.items[0]['seal_no'],
                Marks2: "",
                Marks3: "",
                Sealing_Party: "",
                Empty_weight: 0,
                Goods_Weight: bolItem.items[0]['container_gross_weight']
            })

            bolItem.items.forEach((item: any) => {
                bol_segment.Goods_segment.push({
                    Number_of_packages: item['no_of_packages'],
                    Package_type_code: item['package_type_code'],
                    Gross_mass: item['goods_gross_weight'],
                    Shipping_marks: item['shipping_marks'],
                    Goods_description: item['goods_description']?.replaceAll("&", "&amp;"),
                    Container_item_references: {
                        Ctn_item_reference: bolItem.items[0]['container_no']
                    },
                    Num_of_ctn_for_this_bol: 1 // check on this
                })
            })
        }

        if (bolItem.type === "MC1G") {
            bolItem.items.forEach((item: any) => {
                packageCount += bolItem.items[0]['container_no_of_packages'] * 1;
                grossMass += bolItem.items[0]['container_gross_weight'] * 1;

                bol_segment.ctn_segment.push({
                    Ctn_reference: item['container_no'],
                    Number_of_packages: item['container_no_of_packages'],
                    Package_type: item['package_type'],
                    Type_of_container: item['container_type'],
                    Empty_Full: "1/1",
                    Marks1: item['seal_no'],
                    Marks2: "",
                    Marks3: "",
                    Sealing_Party: "",
                    Empty_weight: 0,
                    Goods_Weight: item['container_gross_weight']
                })
            })

            bol_segment.Goods_segment.push({
                Number_of_packages: bolItem.items[0]['no_of_packages'],
                Package_type_code: bolItem.items[0]['package_type_code'],
                Gross_mass: bolItem.items[0]['goods_gross_weight'],
                Shipping_marks: bolItem.items[0]['shipping_marks'],
                Goods_description: bolItem.items[0]['goods_description']?.replaceAll("&", "&amp;"),
                Num_of_ctn_for_this_bol: bolItem.items.length // check on this
            })
        }

        if (bolItem.type === "MCMG") {

            const grpdCtns = groupBy(bolItem.items, "container_no");


            Object.keys(grpdCtns).forEach((container_no) => {
                const ctnGrp = grpdCtns[container_no];

                packageCount += ctnGrp[0]['container_no_of_packages'] * 1;
                grossMass += ctnGrp[0]['container_gross_weight'] * 1;

                bol_segment.ctn_segment.push({
                    Ctn_reference: container_no,
                    Number_of_packages: ctnGrp[0]['container_no_of_packages'],
                    Package_type: ctnGrp[0]['package_type'],
                    Type_of_container: ctnGrp[0]['container_type'],
                    Empty_Full: "1/1",
                    Marks1: ctnGrp[0]['seal_no'],
                    Marks2: "",
                    Marks3: "",
                    Sealing_Party: "",
                    Empty_weight: 0,
                    Goods_Weight: ctnGrp[0]['container_gross_weight']
                })

                if (ctnGrp.length === 1) {
                    bol_segment.Goods_segment.push({
                        Number_of_packages: ctnGrp[0]['no_of_packages'],
                        Package_type_code: ctnGrp[0]['package_type_code'],
                        Gross_mass: ctnGrp[0]['goods_gross_weight'],
                        Shipping_marks: ctnGrp[0]['shipping_marks'],
                        Goods_description: ctnGrp[0]['goods_description']?.replaceAll("&", "&amp;"),
                        Container_item_references: {
                            Ctn_item_reference: container_no
                        },
                        Num_of_ctn_for_this_bol: 1
                    })

                } else {
                    // If there are multiple goods in the same container, we need to handle them separately
                    ctnGrp.forEach((item: any) => {
                        bol_segment.Goods_segment.push({
                            Number_of_packages: item['no_of_packages'],
                            Package_type_code: item['package_type_code'],
                            Gross_mass: item['goods_gross_weight'],
                            Shipping_marks: item['shipping_marks'],
                            Goods_description: item['goods_description']?.replaceAll("&", "&amp;"),
                            Container_item_references: {
                                Ctn_item_reference: container_no
                            },
                            Num_of_ctn_for_this_bol: 1
                        })
                    })
                }
            })

            // bolItem.items.forEach((item: any) => {
            //     packageCount += bolItem.items[0]['container_no_of_packages'] * 1;
            //     grossMass += bolItem.items[0]['container_gross_weight'] * 1;

            //     bol_segment.ctn_segment.push({
            //         Ctn_reference: item['container_no'],
            //         Number_of_packages: item['container_no_of_packages'],
            //         Package_type: item['package_type'],
            //         Type_of_container: item['container_type'],
            //         Empty_Full: "1/1",
            //         Marks1: item['seal_no'],
            //         Marks2: "",
            //         Marks3: "",
            //         Sealing_Party: "",
            //         Empty_weight: 0,
            //         Goods_Weight: item['container_gross_weight']
            //     })
            // })

            // bol_segment.Goods_segment.push({
            //     Number_of_packages: bolItem.items[0]['no_of_packages'],
            //     Package_type_code: bolItem.items[0]['package_type_code'],
            //     Gross_mass: bolItem.items[0]['goods_gross_weight'],
            //     Shipping_marks: bolItem.items[0]['shipping_marks'],
            //     Goods_description: bolItem.items[0]['goods_description']?.replaceAll("&", "&amp;"),
            //     Num_of_ctn_for_this_bol: bolItem.items.length // check on this
            // })
        }

        bol_segments.push(bol_segment)
    })

    return { bol_segments, packageCount, grossMass };
}

