module.exports = {
    apps : [{
        name: "api",
        script: "./bin/www",
        env: {
            NODE_ENV: "prod",
        },
        env_local: {
            NODE_ENV: "local",
        },
        exec_mode: "cluster",
        instances: 2,
    }]
};
