import { XMLBuilder } from 'fast-xml-parser';
import { General_segment } from './types/general-segment';
import { convertArray, createBolSegment, createGeneralSegment, groupBy } from './utils/helpers';
import excelToJson from 'convert-excel-to-json';
import { Awmds } from './types/awmds';
import { Bol_segment } from './types/bol-segment';

export type XMLType = 'MBL' | 'HBL' | 'ADDMBL' | 'ADDHBL';


export interface Config {

    type: XMLType;
    mainNodeName?: string;
    inputData: any;
    cli?: boolean;

}

const defaultConfig: Partial<Config> = {
    mainNodeName: 'Awmds',
}

export default class Tradian {
    constructor(private config: Config) {
        this.config = { ...defaultConfig, ...config };

        console.log("Starting XML generation process v1.0 ...");
    }

    /**
     * Generates XML from the provided Excel data.
     * @returns {string} The generated XML string.
     */

    // generateXML() {
    //     let inputExcelData: any;
    //     if (this.config.cli) {
    //         inputExcelData = excelToJson({ source: this.config.inputData });
    //     } else {
    //         inputExcelData = this.config.inputData;
    //     }
    //     if (!inputExcelData.Header || !inputExcelData.BLs) {
    //         throw "Invalid sheet names"
    //     }

    //     let xmlDataStr = '';

    //     if (this.config.type === 'MBL' || this.config.type === 'ADDMBL') {
    //         xmlDataStr = "<Master_BL_XML/>"
    //     }
    //     if (this.config.type === 'HBL' || this.config.type === 'ADDHBL') {
    //         xmlDataStr = "<House_BL_XML/>"
    //     }

    //     return `<?xml version="1.0" encoding="utf-8"?>\n${xmlDataStr}`;
    // }
    generateXML() {

        let inputExcelData: any;

        if (this.config.cli) {
            // If running in CLI mode, read from stdin
            inputExcelData = excelToJson({ source: this.config.inputData });
        } else {
            // If running in browser or other environments, use the provided inputData
            inputExcelData = this.config.inputData;
        }
        // Convert the input Excel data to JSON format


        if (!inputExcelData.Header || !inputExcelData.BLs) {
            throw "Invalid sheet names"
        }

        // // if (!validateHeaders(allowedColumns.header, inputExcelData.Header[0])) {
        // //     throw "Invalid Header columns"
        // // }

        // // if (!validateHeaders(allowedColumns.bls, inputExcelData.BLs[0])) {
        // //     throw "Invalid BL columns"
        // // }

        const header = convertArray(inputExcelData.Header)[0];
        const bls = convertArray(inputExcelData.BLs);

        const builderOptions = {
            processEntities: false,
            format: true,
            ignoreAttributes: false,
            arrayNodeName: this.config.mainNodeName,
        };

        // console.log("Bls for BOLs:", blsForBol);
        const bol_segments: any = createBolSegment(bls);
        const general_segment: General_segment = createGeneralSegment(header, bls, bol_segments.packageCount, bol_segments.grossMass);

        const awmds: Awmds[] = [{ General_segment: general_segment, Bol_segment: bol_segments.bol_segments }];
        const builder = new XMLBuilder(builderOptions);
        let xmlDataStr = builder.build(awmds);
        return `<?xml version="1.0" encoding="utf-8"?>\n${xmlDataStr}`;

        // const builderOptions = {
        //     processEntities: false,
        //     format: true,
        //     ignoreAttributes: false,
        //     arrayNodeName: this.config.mainNodeName,
        // };
        // const general_segment: General_segment = createGeneralSegment(header, bls);
        // const bol_segment: Bol_segment[] = createBolSegment(groupBy(bls, "bol_no"));

        // const awmds: Awmds[] = [{ General_segment: general_segment, Bol_segment: bol_segment }];
        // const builder = new XMLBuilder(builderOptions);
        // let xmlDataStr = builder.build(awmds);
        // return `<?xml version="1.0" encoding="utf-8"?>\n${xmlDataStr}`;
        // return "done"
    }
}

export { Tradian, groupBy };