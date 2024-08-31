module.exports = {
  apps: [
    {
      name: 'nestjs-demo-app',
      script: 'dist/src/main.js',
      instances: '4',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
