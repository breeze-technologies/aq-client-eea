import * as iconvLite from "iconv-lite";

export function convertIsoBufferToUtf8String(input: Buffer) {
    const output = iconvLite.decode(input, "ISO-8859-1");
    return output.toString();
}
