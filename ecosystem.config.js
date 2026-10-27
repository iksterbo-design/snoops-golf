module.exports = {
  apps: [
    {
      name: "ai-golf-coach",
      script: "node_modules/.bin/next",
      args: "start -H 0.0.0.0 -p 3000",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
