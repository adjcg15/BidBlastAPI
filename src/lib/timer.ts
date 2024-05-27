class Timer {
    public static startAuctionsClosingListener() {
        const EXECUTION_INTERVAL = 1000 * 60 * 5;

        setInterval(() => {
            console.log("Hola mundo");
        }, EXECUTION_INTERVAL);
    }
}

export default Timer;