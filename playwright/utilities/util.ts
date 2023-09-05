export const sleepProcess = async (argDurationSecond: number) => {
    return new Promise((resolve) => {setTimeout(resolve, argDurationSecond || 1000); });
}

export const prepareDateFormat = (argData: Date, argFormatedDate?: boolean) => {
    try {
        let result = "";
        if (!argFormatedDate) {
            result = `${argData.getDate()}-${((Number(argData.getMonth())) + 1).toString()}-${argData.getFullYear()}`
            + `_${argData.getHours()}h${argData.getMinutes()}m${argData.getSeconds()}s`;
        } else {
            result = `${argData.getDate()}/${((Number(argData.getMonth())) + 1).toString()}/${argData.getFullYear()}`;
        }
        return result;
    } catch (ex) {
        console.log(`erro in utilities/util.ts - prepareDateFormat \n\n ${ex}`);
    }
};

export const systemLog = (argData: any, argColor?: string) => {
    try {
        const dte = new Date().toISOString();
        if (argData[0] && typeof(argData) !== "string") {
            argData.forEach( (element) => {
                let tempElement = element;
                if ( typeof(tempElement) === "string" ) { tempElement = tempElement; }
                process.stdout.write(`[${dte}][${process.env.npm_package_name}][INFO]:: ${tempElement}\n`);
            });
        }
        if (typeof(argData) === "string") {
            const logDta = `[${dte}][${process.env.npm_package_name}][INFO]:: ${argData}\n`;
            // print log in red when error
            let messageColor = "";
            let endClr = "\x1b[0m";
            argColor ? messageColor = argColor : endClr = "";
            process.stdout.write(messageColor + logDta + endClr);
        }
        if (typeof(argData) === "object" && !argData[0]) {
            const listOfProperties = Object.getOwnPropertyNames(argData);
            listOfProperties.forEach((el) => {
                process.stdout.write(`[${dte}][${process.env.npm_package_name}][INFO]:: ${el} : ${argData[el]}\n`);
            });
        }
    } catch (ex) {
        throw new Error(`erro in utilities/util.ts - systemLog \n\n ${ex}`);
    }
};
/**
 * 
 * @param argParamName - process argv name to check and return value
 * @returns
 */
export const getProcessValue = (argParamName): string => {
    let result: string = ``;
    process.argv.forEach(element => {
        if(element.includes(argParamName)) {
            result = element.split(`=`)[1];
        }
    });
    return result;
}