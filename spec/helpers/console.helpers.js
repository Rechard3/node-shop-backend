

module.exports = {

    clearConsole(loggers = ["log", "warn","error", "info"]){
        const res = {};
        loggers.forEach(logger=>{
            res[logger] = console[logger].bind(console);
            console[logger] = () => null;
        });
        return {
            log: res["log"],
            warn: res["warn"],
            error: res["error"],
            info: res["info"]
        };
    }
}