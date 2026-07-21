module.exports = {
  apps: [
    {
      name: 'localcent-api',
      cwd: './backend',
      script: './venv/bin/python',
      args: 'manage.py runserver 0.0.0.0:8000',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
      }
    },
    {
      name: 'localcent-huey',
      cwd: './backend',
      script: './venv/bin/python',
      args: 'manage.py run_huey',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
      }
    },
    {
      name: 'localcent-ui',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
      }
    }
  ]
};
