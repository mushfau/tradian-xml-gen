import { Bol_segment } from "./bol-segment"
import { General_segment } from "./general-segment"

export type Awmds = {
    General_segment: General_segment
    Bol_segment: Bol_segment[]
}