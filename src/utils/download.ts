import request from "request";

export function downloadDataToBuffer(downloadUrl: string) {
    return new Promise<Buffer>((resolve, reject) => {
        request(downloadUrl, { encoding: null }, async (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }
            if (!response || response.statusCode !== 200) {
                reject("Invalid response: " + downloadUrl);
                return;
            }
            resolve(body);
        });
    });
}
